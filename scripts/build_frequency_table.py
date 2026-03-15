#!/usr/bin/env python3
"""
Build a word_frequencies table in the bundled arabic-dictionary.db.

Reads the CAMeL DA (Dialectal Arabic) frequency TSV and matches entries
against dictionary FORM / LEMMA_SEARCH columns to assign a frequency
score to each dictionary word.

Usage:
    python scripts/build_frequency_table.py [--tsv /path/to/DA_freq_lists.tsv]

The script expects arabic-dictionary.db at src-tauri/resources/arabic-dictionary.db
relative to the project root.
"""

import argparse
import csv
import os
import re
import sqlite3
import sys
import math

# ---------------------------------------------------------------------------
# Arabic normalizer (mirrors src/utils/arabicNormalizer.ts)
# ---------------------------------------------------------------------------

DIACRITICS_RE = re.compile(r'[\u064B-\u065F\u0670]')

ALIF_MAP = str.maketrans({
    '\u0623': '\u0627',  # أ → ا
    '\u0625': '\u0627',  # إ → ا
    '\u0622': '\u0627',  # آ → ا
    '\u0671': '\u0627',  # ٱ → ا
    '\u0649': '\u064A',  # ى → ي
    '\u0629': '\u0647',  # ة → ه
})


def normalize_arabic(text: str) -> str:
    """Strip diacritics and normalise common Arabic letter variants."""
    if not text:
        return ''
    text = DIACRITICS_RE.sub('', text)
    text = text.translate(ALIF_MAP)
    return text


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Build word_frequencies table')
    parser.add_argument(
        '--tsv',
        default='/tmp/DA_freq_lists.tsv',
        help='Path to DA_freq_lists.tsv (default: /tmp/DA_freq_lists.tsv)',
    )
    parser.add_argument(
        '--db',
        default=None,
        help='Path to arabic-dictionary.db (auto-detected from project root)',
    )
    args = parser.parse_args()

    # Resolve DB path
    if args.db:
        db_path = args.db
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        db_path = os.path.join(project_root, 'src-tauri', 'resources', 'arabic-dictionary.db')

    if not os.path.exists(db_path):
        print(f'ERROR: Database not found at {db_path}', file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(args.tsv):
        print(f'ERROR: TSV file not found at {args.tsv}', file=sys.stderr)
        print('Download it from: https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists/releases/download/v1.0/DA_freq_lists.tsv.zip')
        sys.exit(1)

    # -----------------------------------------------------------------------
    # Step 1: Load frequency data into a dict keyed by normalized form
    # -----------------------------------------------------------------------
    print(f'Loading frequency data from {args.tsv} ...')
    freq_map: dict[str, int] = {}
    line_count = 0

    with open(args.tsv, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split('\t')
            if len(parts) != 2:
                continue
            word_raw, freq_str = parts
            try:
                freq = int(freq_str)
            except ValueError:
                continue

            norm = normalize_arabic(word_raw)
            # Keep the highest frequency if there are duplicates after normalisation
            if norm not in freq_map or freq > freq_map[norm]:
                freq_map[norm] = freq

            line_count += 1
            if line_count % 1_000_000 == 0:
                print(f'  ... loaded {line_count:,} lines')

    print(f'  Loaded {line_count:,} lines → {len(freq_map):,} unique normalised forms')

    # -----------------------------------------------------------------------
    # Step 2: Read dictionary words and match frequencies
    # -----------------------------------------------------------------------
    print(f'Opening database at {db_path} ...')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute('SELECT ID, FORM, LEMMA_SEARCH FROM data')
    rows = cur.fetchall()
    print(f'  Dictionary has {len(rows):,} entries')

    matches: list[tuple[int, int]] = []  # (word_id, frequency)

    for word_id, form, lemma_search in rows:
        # Normalise the FORM and LEMMA_SEARCH columns
        norm_form = normalize_arabic(form or '')
        norm_lemma = normalize_arabic(lemma_search or '')

        # For multi-word forms (e.g. "فِش خَوَاص"), match only the full
        # normalised form — never fall back to LEMMA_SEARCH, because it
        # is typically the lemma of the first word and produces false
        # high-frequency hits (e.g. LEMMA_SEARCH="في" for an idiom).
        freq = freq_map.get(norm_form, 0)

        # LEMMA_SEARCH fallback only for single-word forms
        if freq == 0 and ' ' not in norm_form:
            freq = freq_map.get(norm_lemma, 0)

        if freq > 0:
            matches.append((int(word_id), freq))

    print(f'  Matched {len(matches):,} / {len(rows):,} dictionary entries with frequency data')

    # -----------------------------------------------------------------------
    # Step 3: Compute percentile ranks (0–100)
    # -----------------------------------------------------------------------
    if matches:
        # Sort by frequency ascending for percentile assignment
        sorted_freqs = sorted(set(f for _, f in matches))
        freq_to_rank: dict[int, int] = {}
        n = len(sorted_freqs)
        for i, f in enumerate(sorted_freqs):
            # Percentile: 0 = least common, 100 = most common
            freq_to_rank[f] = round((i / max(n - 1, 1)) * 100)

        ranked = [(wid, freq, freq_to_rank[freq]) for wid, freq in matches]
    else:
        ranked = []

    # -----------------------------------------------------------------------
    # Step 4: Write to database
    # -----------------------------------------------------------------------
    print('Creating word_frequencies table ...')
    cur.execute('DROP TABLE IF EXISTS word_frequencies')
    cur.execute('''
        CREATE TABLE word_frequencies (
            word_id   INTEGER PRIMARY KEY,
            frequency INTEGER NOT NULL,
            freq_rank INTEGER NOT NULL DEFAULT 0
        )
    ''')

    cur.executemany(
        'INSERT INTO word_frequencies (word_id, frequency, freq_rank) VALUES (?, ?, ?)',
        ranked,
    )

    conn.commit()

    # Verify
    cur.execute('SELECT COUNT(*) FROM word_frequencies')
    count = cur.fetchone()[0]
    cur.execute('SELECT AVG(freq_rank) FROM word_frequencies')
    avg_rank = cur.fetchone()[0]
    cur.execute('SELECT MIN(frequency), MAX(frequency) FROM word_frequencies')
    min_freq, max_freq = cur.fetchone()

    print(f'\nDone! word_frequencies table:')
    print(f'  Rows:      {count:,}')
    print(f'  Avg rank:  {avg_rank:.1f}')
    print(f'  Freq range: {min_freq:,} – {max_freq:,}')

    # Show a few examples
    print('\nTop 10 most frequent words:')
    cur.execute('''
        SELECT wf.word_id, d.FORM, d.GLOSS, wf.frequency, wf.freq_rank
        FROM word_frequencies wf
        JOIN data d ON d.ID = wf.word_id
        ORDER BY wf.frequency DESC
        LIMIT 10
    ''')
    for row in cur.fetchall():
        print(f'  ID={row[0]:5d}  {row[1]:20s}  {row[2]:30s}  freq={row[3]:>12,}  rank={row[4]}')

    conn.close()
    print('\nFrequency table built successfully.')


if __name__ == '__main__':
    main()
