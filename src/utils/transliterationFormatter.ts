
/**
 * Formats CAPHI transliteration strings into user-friendly characters.
 */
export function formatTransliteration(text: string): string {
    if (!text) return '';

    // Mapping of CAPHI characters/sequences to display characters (IPA or standard).
    const map: Record<string, string> = {
        // Consonants
        'b': 'b', // b - ب
        'f.': 'f̣', // f. - ف (emphatic)
        'f': 'f', // f - ف
        'v': 'v', // v - ف (loanwords)
        't.': 'ṭ', // t. - ط (emphatic t)
        't': 't', // t - ت
        'd.': 'ḍ', // d. - ض (emphatic d)
        'd': 'd', // d - د
        'th': 'ṯ', // th - ث
        'dh.': 'ẓ', // dh. - ظ (emphatic dh)
        'dh': 'ḏ', // dh - ذ
        's.': 'ṣ', // s. - ص (emphatic s)
        's': 's', // s - س
        'z.': 'ẓ', // z. - ظ/ض (emphatic z)
        'z': 'z', // z - ز
        'sh': 'š', // sh - ش
        'J': 'j',
        'j': 'j', // j - ج (Levantine/North African j)
        'ts': 'ts', // ts - تس
        'dz': 'dz', // dz - دز
        'tsh': 'tš', // tsh - تش (ch)
        'dj': 'j', // dj - ج (Standard j)
        'k': 'k', // k - ك
        'g': 'ɡ', // g - ج (Egyptian g)
        'gy': 'ɡ̲y̲', // gy - ج
        'q': 'q', // q - ق
        'qh': 'ɢ', // qh - ق
        'kh': 'x', // kh - خ
        'gh': 'ġ', // gh - غ
        '7': 'ḥ', // 7 - ح
        '3': '3', // 3 - ع
        '2': '’', // 2 - ء (glottal stop)
        'h': 'h', // h - ه
        'm.': 'ṃ', // m. - م (emphatic)
        'm': 'm', // m - م
        'n': 'n', // n - ن
        'r.': 'ṛ', // r. - ر (emphatic)
        'r': 'r', // r - ر
        'l.': 'ḷ', // l. - ل (emphatic)
        'l': 'l', // l - ل
        'w': 'w', // w - و
        'y': 'y', // y - ي
        'p': 'p', // p - ب (loanwords)

        // Vowels
        'aa': 'ā', // Long a
        'ii': 'ī', // Long i
        'uu': 'ū', // Long u
        'ee': 'ē', // Long e
        'oo': 'ō', // Long o
        'a': 'a', // Short a
        'i': 'i', // Short i
        'u': 'u', // Short u
        'e': 'e', // Short e
        'o': 'o', // Short o (inferred, common in CAPHI contexts)
        'a.': 'a',
        'aa.': 'ā',

        // Complex/Database-specific tokens
        ',': ',',
        '2||g': '’/g',
        '7,': 'ħ',
        'D': 'ḍ',
        'D.': 'ḍ',
        'D||Z': 'ḍ/ẓ',
        'D||d.': 'ḍ',
        'K': 'k',
        'K||g': 'k/g',
        'Q': 'q',
        'S': 'ṣ',
        'T': 'ṭ',
        'Z': 'ẓ',
        'Z.': 'ẓ',
        'Z||D': 'ẓ/ḍ',
        'g||k': 'g/k',
        'g||k||q': 'g/k/q',
        'k||2': 'k/’',
        'k||g': 'k/g',
        'qII2': 'q/’',
        'qIIg': 'q/g',
        'qIIk': 'q/k',
        'qIIkIIg': 'q/k/g',
        'qIIk||g': 'q/k/g',
        'q||2': 'q/’',
        'q||2||k': 'q/’/k',
        'q||K': 'q/k',
        'q||g': 'q/g',
        'q||g||k': 'q/g/k',
        'q||k': 'q/k',
        'q||k||2': 'q/k/’',
        'q||k||g': 'q/k/g',
        'q||tsh': 'q/tš',
        's.||z.': 'ṣ/ẓ',
        't.IIt': 'ṭ/t',
        't||t.': 't/ṭ',

        '#': ' ', // en space
        ' ': '', // thin space
    };

    // Split by spaces (capturing the token boundaries) to preserve spacing.
    // '#' is mapped to em space, and normal spaces are mapped to en space.
    return text.split(/(\s+)/).map(token => {
        if (!token) return '';
        //if (/^\s+$/.test(token)) return map[' '] || token;
        if (/^\s+$/.test(token)) return map[' '] !== undefined ? map[' '] : token;
        return map[token] ?? token;
    }).join('');
}
