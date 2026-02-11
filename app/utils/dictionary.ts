export type DictionaryEntry = {
  word: string;
  ipas: string[];
};

export function splitIpaVariants(ipaField: string): string[] {
  // Raw data can contain multiple pronunciations like:
  //   /tɝˈeɪsə/, /tɝˈisə/
  // We keep each variant as its own IPA string so the phonetic
  // matcher doesn't treat commas/spaces as phonemes.
  return ipaField
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseDictionaryLine(line: string): DictionaryEntry | null {
  const tabIndex = line.indexOf('\t');
  if (tabIndex === -1) return null;

  const word = line.slice(0, tabIndex).trim();
  const ipaField = line.slice(tabIndex + 1).trim();
  const ipas = splitIpaVariants(ipaField);

  if (!word || ipas.length === 0) return null;
  return { word, ipas };
}

