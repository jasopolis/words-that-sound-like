import {
    calculateSimilarity,
    normalizeIPA,
    phoneticDistance,
    phoneticLevenshteinDistance,
} from '../phonetic';

describe('phoneticDistance', () => {
  it('should return 0 for identical phones', () => {
    expect(phoneticDistance('p', 'p')).toBe(0);
    expect(phoneticDistance('a', 'a')).toBe(0);
  });

  it('should return 0.3 for phones in the same group', () => {
    // Both are voiceless stops
    expect(phoneticDistance('p', 't')).toBe(0.3);
    // Both are high front vowels
    expect(phoneticDistance('i', 'ɪ')).toBe(0.3);
  });

  it('should return 0.6 for related phones', () => {
    // p is voiceless stop, b is voiced stop (related pair)
    expect(phoneticDistance('p', 'b')).toBe(0.6);
    // f is voiceless fricative, v is voiced fricative (related pair)
    expect(phoneticDistance('f', 'v')).toBe(0.6);
  });

  it('should return 1.0 for unrelated phones', () => {
    // p (stop) and a (vowel) are unrelated
    expect(phoneticDistance('p', 'a')).toBe(1.0);
  });
});

describe('normalizeIPA', () => {
  it('should remove IPA delimiters and stress marks', () => {
    expect(normalizeIPA('/ˈhɛloʊ/')).toEqual(['h', 'ɛ', 'l', 'oʊ']);
    expect(normalizeIPA('[ˈhɛloʊ]')).toEqual(['h', 'ɛ', 'l', 'oʊ']);
  });

  it('should handle two-character phones correctly', () => {
    expect(normalizeIPA('aɪ')).toEqual(['aɪ']);
    expect(normalizeIPA('tʃ')).toEqual(['tʃ']);
    expect(normalizeIPA('dʒ')).toEqual(['dʒ']);
  });

  it('should handle mixed single and two-character phones', () => {
    expect(normalizeIPA('haɪ')).toEqual(['h', 'aɪ']);
    expect(normalizeIPA('tʃaɪ')).toEqual(['tʃ', 'aɪ']);
  });

  it('should convert to lowercase', () => {
    expect(normalizeIPA('HELLO')).toEqual(['h', 'e', 'l', 'l', 'o']);
  });

  it('should handle empty strings', () => {
    expect(normalizeIPA('')).toEqual([]);
    expect(normalizeIPA('   ')).toEqual([]);
  });
});

describe('phoneticLevenshteinDistance', () => {
  it('should return 0 for identical sequences', () => {
    expect(phoneticLevenshteinDistance(['p', 'a'], ['p', 'a'])).toBe(0);
  });

  it('should calculate distance for different sequences', () => {
    expect(phoneticLevenshteinDistance(['p'], ['b'])).toBe(0.6);
    expect(phoneticLevenshteinDistance(['p', 'a'], ['b', 'a'])).toBe(0.6);
  });

  it('should handle insertion', () => {
    expect(phoneticLevenshteinDistance(['p'], ['p', 'a'])).toBe(1);
  });

  it('should handle deletion', () => {
    expect(phoneticLevenshteinDistance(['p', 'a'], ['p'])).toBe(1);
  });

  it('should handle empty sequences', () => {
    expect(phoneticLevenshteinDistance([], [])).toBe(0);
    expect(phoneticLevenshteinDistance(['p'], [])).toBe(1);
    expect(phoneticLevenshteinDistance([], ['p'])).toBe(1);
  });
});

describe('calculateSimilarity', () => {
  it('should return 100 for identical IPA strings', () => {
    expect(calculateSimilarity('pa', 'pa')).toBe(100);
    expect(calculateSimilarity('/ˈhɛloʊ/', '/ˈhɛloʊ/')).toBe(100);
  });

  it('should return 100 for empty strings', () => {
    expect(calculateSimilarity('', '')).toBe(100);
  });

  it('should calculate similarity for similar sounds', () => {
    // p and b are related (0.6 distance), so similarity should be high
    const result = calculateSimilarity('pa', 'ba');
    expect(result).toBeGreaterThan(50);
  });

  it('should handle IPA notation with delimiters', () => {
    const result = calculateSimilarity('/ˈhɛloʊ/', '/ˈhɛloʊ/');
    expect(result).toBe(100);
  });

  it('should return lower similarity for very different sounds', () => {
    const result = calculateSimilarity('pa', 'ki');
    expect(result).toBeLessThan(100);
  });

  it('should handle different length sequences', () => {
    const result = calculateSimilarity('pa', 'pat');
    expect(result).toBeLessThan(100);
    expect(result).toBeGreaterThan(0);
  });
});
