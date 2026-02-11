const WIKTIONARY_SUBDOMAIN_BY_LANGUAGE: Record<string, string> = {
  ar: "ar",
  de: "de",
  en_UK: "en",
  en_US: "en",
  eo: "eo",
  es_ES: "es",
  es_MX: "es",
  fa: "fa",
  fi: "fi",
  fr_FR: "fr",
  fr_QC: "fr",
  is: "is",
  ja: "ja",
  km: "km",
  ko: "ko",
  // The app uses open-dict-data's "ma" for Malay; Wiktionary uses "ms".
  ma: "ms",
  // Norwegian Wiktionary for Norwegian Bokmål ("nb")
  nb: "no",
  nl: "nl",
  or: "or",
  pl: "pl",
  pt_BR: "pt",
  ro: "ro",
  sv: "sv",
  sw: "sw",
  vi_C: "vi",
  vi_N: "vi",
  vi_S: "vi",
  zh_hans: "zh",
  zh_hant: "zh",
  // Chinese Wikitionary for Cantonese ("yue")
  yue: "zh",
  // Remaining languages (jam, tts) are not supported by Wiktionary
};

export function getWiktionarySubdomain(languageCode: string): string | null {
  return WIKTIONARY_SUBDOMAIN_BY_LANGUAGE[languageCode] ?? null;
}

export function getWiktionaryUrl(
  word: string,
  languageCode: string,
): string | null {
  const subdomain = getWiktionarySubdomain(languageCode);
  if (!subdomain) return null;
  const title = encodeURIComponent(word.trim().replaceAll(" ", "_"));
  return `https://${subdomain}.wiktionary.org/wiki/${title}`;
}
