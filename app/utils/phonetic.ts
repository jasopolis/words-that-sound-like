// Phonetic feature groups
export const PHONETIC_GROUPS = {
  highFrontVowels: ["i", "ɪ", "y", "ʏ"],
  midFrontVowels: ["e", "ɛ", "ø", "œ"],
  lowFrontVowels: ["æ", "a"],
  highBackVowels: ["u", "ʊ", "ɯ", "ɤ"],
  midBackVowels: ["o", "ɔ", "ʌ"],
  lowBackVowels: ["ɑ", "ɒ"],
  centralVowels: ["ə", "ɜ", "ɝ", "ɐ"],
  diphthongs: ["aɪ", "aʊ", "ɔɪ", "eɪ", "oʊ", "ɛɪ"],
  voicelessStops: ["p", "t", "k", "ʔ"],
  voicedStops: ["b", "d", "ɡ", "g"],
  voicelessFricatives: ["f", "θ", "s", "ʃ", "h", "x", "ç"],
  voicedFricatives: ["v", "ð", "z", "ʒ", "ɣ"],
  affricates: ["tʃ", "dʒ", "ts", "dz"],
  nasals: ["m", "n", "ŋ", "ɲ"],
  liquids: ["l", "ɹ", "r", "ɾ", "ʀ", "ɭ"],
  glides: ["w", "j", "ɥ"],
};

// Build reverse lookup
const phoneToGroups: Record<string, string[]> = {};
for (const [groupName, phones] of Object.entries(PHONETIC_GROUPS)) {
  for (const phone of phones) {
    if (!phoneToGroups[phone]) phoneToGroups[phone] = [];
    phoneToGroups[phone].push(groupName);
  }
}

// Phonetic distance calculation
export function phoneticDistance(phone1: string, phone2: string): number {
  if (phone1 === phone2) return 0;

  const groups1 = phoneToGroups[phone1] || [];
  const groups2 = phoneToGroups[phone2] || [];

  const sharedGroups = groups1.filter((g: string) => groups2.includes(g));
  if (sharedGroups.length > 0) return 0.3;

  const relatedPairs = [
    ["voicelessStops", "voicedStops"],
    ["voicelessFricatives", "voicedFricatives"],
    ["highFrontVowels", "midFrontVowels"],
    ["highBackVowels", "midBackVowels"],
    ["midFrontVowels", "lowFrontVowels"],
    ["midBackVowels", "lowBackVowels"],
    ["nasals", "liquids"],
    ["liquids", "glides"],
  ];

  for (const [cat1, cat2] of relatedPairs) {
    if (
      (groups1.includes(cat1) && groups2.includes(cat2)) ||
      (groups1.includes(cat2) && groups2.includes(cat1))
    ) {
      return 0.6;
    }
  }

  return 1.0;
}

// Phonetically-aware Levenshtein distance
export function phoneticLevenshteinDistance(
  s1: string[],
  s2: string[],
): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = phoneticDistance(s1[i - 1], s2[j - 1]);
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[len1][len2];
}

// Normalize IPA
export function normalizeIPA(ipa: string): string[] {
  let normalized = ipa
    .replace(/[\/\[\]ˈˌːˑ.]/g, "")
    .toLowerCase()
    .trim();

  const phones: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    const twoChar = normalized.substring(i, i + 2);
    if (
      ["aɪ", "aʊ", "ɔɪ", "eɪ", "oʊ", "tʃ", "dʒ", "ts", "dz", "ɛɪ"].includes(
        twoChar,
      )
    ) {
      phones.push(twoChar);
      i += 2;
    } else {
      phones.push(normalized[i]);
      i += 1;
    }
  }

  return phones;
}

// Calculate similarity
export function calculateSimilarity(ipa1: string, ipa2: string): number {
  const phones1 = normalizeIPA(ipa1);
  const phones2 = normalizeIPA(ipa2);

  const maxLen = Math.max(phones1.length, phones2.length);
  if (maxLen === 0) return 100;

  const distance = phoneticLevenshteinDistance(phones1, phones2);
  const similarity = Math.max(0, ((maxLen - distance) / maxLen) * 100);
  return Math.round(similarity);
}
