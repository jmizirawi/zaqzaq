import { describe, it, expect } from 'vitest';
import { normalizeArabic, sqlNormalizeExpr } from '../src/utils/arabicNormalizer';

describe('normalizeArabic', () => {
  // --- Alif variants ---
  it('normalizes Alif with Hamza above (أ → ا)', () => {
    expect(normalizeArabic('أكل')).toBe('اكل');
  });

  it('normalizes Alif with Hamza below (إ → ا)', () => {
    expect(normalizeArabic('إسلام')).toBe('اسلام');
  });

  it('normalizes Alif with Madda (آ → ا)', () => {
    expect(normalizeArabic('آخر')).toBe('اخر');
  });

  it('normalizes Alif Wasla (ٱ → ا)', () => {
    expect(normalizeArabic('ٱلكتاب')).toBe('الكتاب');
  });

  it('normalizes multiple Alif variants in one word', () => {
    expect(normalizeArabic('أإآٱ')).toBe('اااا');
  });

  // --- Yeh / Alif Maqsura ---
  it('normalizes Alif Maqsura (ى → ي)', () => {
    expect(normalizeArabic('على')).toBe('علي');
  });

  it('normalizes Alif Maqsura at word end', () => {
    expect(normalizeArabic('مستشفى')).toBe('مستشفي');
  });

  // --- Teh Marbuta ---
  it('normalizes Teh Marbuta (ة → ه)', () => {
    expect(normalizeArabic('مدرسة')).toBe('مدرسه');
  });

  it('normalizes Teh Marbuta in the middle of text', () => {
    expect(normalizeArabic('جامعة القاهرة')).toBe('جامعه القاهره');
  });

  // --- Diacritics ---
  it('strips fatḥa', () => {
    expect(normalizeArabic('كَتَبَ')).toBe('كتب');
  });

  it('strips kasra', () => {
    expect(normalizeArabic('بِسْمِ')).toBe('بسم');
  });

  it('strips ḍamma', () => {
    expect(normalizeArabic('كُتُب')).toBe('كتب');
  });

  it('strips shadda', () => {
    expect(normalizeArabic('محمّد')).toBe('محمد');
  });

  it('strips sukūn', () => {
    expect(normalizeArabic('مِنْ')).toBe('من');
  });

  it('strips tanwīn (fatḥatan, kasratan, ḍammatan)', () => {
    expect(normalizeArabic('كتاباً')).toBe('كتابا');
    expect(normalizeArabic('كتابٍ')).toBe('كتاب');
    expect(normalizeArabic('كتابٌ')).toBe('كتاب');
  });

  it('strips superscript Alif (dagger alif)', () => {
    expect(normalizeArabic('هٰذا')).toBe('هذا');
  });

  // --- Combined ---
  it('handles combined normalization (diacritics + letter variants)', () => {
    expect(normalizeArabic('أُسْتَاذَة')).toBe('استاذه');
  });

  // --- Passthrough ---
  it('passes through English text unchanged', () => {
    expect(normalizeArabic('hello world')).toBe('hello world');
  });

  it('passes through mixed Arabic-English text', () => {
    expect(normalizeArabic('hello أهلاً')).toBe('hello اهلا');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeArabic('')).toBe('');
  });
});

describe('sqlNormalizeExpr', () => {
  it('wraps a column name in nested REPLACE calls', () => {
    const expr = sqlNormalizeExpr('FORM');
    expect(expr).toContain('REPLACE');
    expect(expr).toContain('FORM');
    // Should normalize all 6 character mappings
    expect(expr).toContain("'أ'");
    expect(expr).toContain("'إ'");
    expect(expr).toContain("'آ'");
    expect(expr).toContain("'ٱ'");
    expect(expr).toContain("'ى'");
    expect(expr).toContain("'ة'");
  });
});
