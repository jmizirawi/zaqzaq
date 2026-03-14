/**
 * Arabic text normalizer for search.
 *
 * Strips diacritics and normalizes common letter variants so that
 * searches are forgiving of different Alif forms, Yeh/Alif-Maqsura
 * interchange, and Teh-Marbuta/Heh interchange.
 */

/** Unicode diacritics range: fatḥa, kasra, ḍamma, shadda, sukūn, tanwīn, etc. */
const DIACRITICS_RE = /[\u064B-\u065F\u0670]/g;

/** Alif variants → bare Alif */
const ALIF_VARIANTS: Record<string, string> = {
  '\u0623': '\u0627', // أ  → ا
  '\u0625': '\u0627', // إ  → ا
  '\u0622': '\u0627', // آ  → ا
  '\u0671': '\u0627', // ٱ  → ا
};

const ALIF_RE = /[\u0623\u0625\u0622\u0671]/g;

/**
 * Normalize Arabic text for search comparison.
 *
 * 1. Strip diacritics (tashkīl)
 * 2. Normalize Alif variants (أ إ آ ٱ → ا)
 * 3. Normalize Alif Maqsura (ى → ي)
 * 4. Normalize Teh Marbuta (ة → ه)
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(DIACRITICS_RE, '')
    .replace(ALIF_RE, (ch) => ALIF_VARIANTS[ch] ?? ch)
    .replace(/\u0649/g, '\u064A') // ى → ي
    .replace(/\u0629/g, '\u0647'); // ة → ه
}

/**
 * Build a SQL expression that applies the same normalization to a column.
 *
 * Generates nested REPLACE() calls matching what `normalizeArabic` does,
 * minus diacritic stripping (the bundled dictionary data is already
 * diacritic-free, so we only need letter‐variant normalization in SQL).
 */
export function sqlNormalizeExpr(column: string): string {
  // Order: Alif variants, Alif Maqsura, Teh Marbuta
  return `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(${column}, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ٱ', 'ا'), 'ى', 'ي'), 'ة', 'ه')`;
}
