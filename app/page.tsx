'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateSimilarity } from './utils/phonetic';

// Language options
const LANGUAGES = [
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'en_UK', name: 'English (UK)' },
  { code: 'en_US', name: 'English (US)' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'es_ES', name: 'Spanish (Spain)' },
  { code: 'es_MX', name: 'Spanish (Mexico)' },
  { code: 'fa', name: 'Persian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr_FR', name: 'French (France)' },
  { code: 'fr_QC', name: 'French (Quebec)' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jam', name: 'Jamaican Creole' },
  { code: 'km', name: 'Khmer' },
  { code: 'ko', name: 'Korean' },
  { code: 'ma', name: 'Malay' },
  { code: 'nb', name: 'Norwegian Bokmål' },
  { code: 'nl', name: 'Dutch' },
  { code: 'or', name: 'Odia' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)' },
  { code: 'ro', name: 'Romanian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'sw', name: 'Swahili' },
  { code: 'tts', name: 'Isan' },
  { code: 'vi_C', name: 'Vietnamese (Central)' },
  { code: 'vi_N', name: 'Vietnamese (Northern)' },
  { code: 'vi_S', name: 'Vietnamese (Southern)' },
  { code: 'yue', name: 'Cantonese' },
  { code: 'zh_hans', name: 'Mandarin (Simplified)' },
  { code: 'zh_hant', name: 'Mandarin (Traditional)' }
];

// Language-specific examples
const LANGUAGE_EXAMPLES: Record<string, string[]> = {
  'ar': ['كتاب', 'ماء', 'شمس'],
  'de': ['Haus', 'Buch', 'Wasser'],
  'en_UK': ['phone', 'knight', 'through'],
  'en_US': ['phone', 'knight', 'through'],
  'eo': ['domo', 'libro', 'akvo'],
  'es_ES': ['casa', 'agua', 'libro'],
  'es_MX': ['casa', 'agua', 'libro'],
  'fa': ['آب', 'کتاب', 'خورشید'],
  'fi': ['talo', 'kirja', 'vesi'],
  'fr_FR': ['maison', 'livre', 'eau'],
  'fr_QC': ['maison', 'livre', 'eau'],
  'is': ['hús', 'bók', 'vatn'],
  'ja': ['本', '水', '家'],
  'jam': ['house', 'book', 'wata'],
  'km': ['ផ្ទះ', 'សៀវភៅ', 'ទឹក'],
  'ko': ['집', '책', '물'],
  'ma': ['rumah', 'buku', 'air'],
  'nb': ['hus', 'bok', 'vann'],
  'nl': ['huis', 'boek', 'water'],
  'or': ['ଘର', 'ପୁସ୍ତକ', 'ପାଣି'],
  'pl': ['dom', 'książka', 'woda'],
  'pt_BR': ['casa', 'livro', 'água'],
  'ro': ['casă', 'carte', 'apă'],
  'sv': ['hus', 'bok', 'vatten'],
  'sw': ['nyumba', 'kitabu', 'maji'],
  'tts': ['บ้าน', 'หนังสือ', 'น้ำ'],
  'vi_C': ['nhà', 'sách', 'nước'],
  'vi_N': ['nhà', 'sách', 'nước'],
  'vi_S': ['nhà', 'sách', 'nước'],
  'yue': ['屋', '書', '水'],
  'zh_hans': ['房子', '书', '水'],
  'zh_hant': ['房子', '書', '水']
};


type DictionaryEntry = {
  word: string;
  ipa: string;
};

type SearchResult = DictionaryEntry & {
  similarity: number;
  queryIPA: string;
};

export default function PhoneticWordFinder() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState('en_US');
  const [dictionary, setDictionary] = useState<DictionaryEntry[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPerformedInitialSearch, setHasPerformedInitialSearch] = useState(false);
  const hasSyncedFromUrlRef = useRef(false);
  const prevLanguageRef = useRef<string | null>(null);

  // Initialize from query params (only once)
  useEffect(() => {
    if (hasSyncedFromUrlRef.current) return;

    const q = searchParams.get('q');
    const lang = searchParams.get('lang');

    if (lang) {
      setLanguage(lang);
    }
    if (q) {
      setSearchQuery(q);
    }

    setIsInitialized(true);
    hasSyncedFromUrlRef.current = true;
  }, [searchParams]);

  // Perform search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setError('Please enter a word or IPA notation');
      return;
    }

    if (!dictionary || dictionary.length === 0) {
      setError('Dictionary not loaded. Please wait.');
      return;
    }

    setError('');
    setResults([]); // Clear previous results
    setLoading(true);

    setTimeout(() => {
      let queryIPA = query;

      const isIPAInput = /^[\/\[]/.test(query) || /[ɑæɔəɛɪʊʌɜθðʃʒŋɹ]/.test(query);

      if (!isIPAInput) {
        const found = dictionary.find((item: DictionaryEntry) =>
          item.word.toLowerCase() === query.toLowerCase()
        );
        if (found) {
          queryIPA = found.ipa;
        } else {
          setError(`Could not find pronunciation for "${query}". Try IPA notation.`);
          setLoading(false);
          return;
        }
      }

      const searchResults = dictionary
        .map((item: DictionaryEntry) => ({
          ...item,
          similarity: calculateSimilarity(queryIPA, item.ipa),
          queryIPA
        }))
        .filter((item: SearchResult) => item.similarity > 30)
        .sort((a: SearchResult, b: SearchResult) => b.similarity - a.similarity)
        .slice(0, 50);

      setResults(searchResults);
      setLoading(false);
    }, 100);
  }, [dictionary]);

  // Update URL when state changes (but not during initialization)
  useEffect(() => {
    if (!hasSyncedFromUrlRef.current) return;

    const currentParams = new URLSearchParams(window.location.search);
    const currentQ = currentParams.get('q') || '';
    const currentLang = currentParams.get('lang') || 'en_US';

    // Only update if something actually changed from what's in the URL
    if (searchQuery === currentQ && language === currentLang) return;

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    if (language && language !== 'en_US') {
      params.set('lang', language);
    } else if (language === 'en_US' && currentLang !== 'en_US') {
      // If switching back to default, remove lang param
      if (searchQuery) {
        params.set('q', searchQuery);
      }
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    // Only update if URL actually changed
    const currentUrl = window.location.pathname + (window.location.search || '');
    if (newUrl !== currentUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchQuery, language]);

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      setLoading(true);
      setStatus('Loading pronunciation dictionary...');
      setError('');

      try {
        const url = `https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/${language}.txt`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to load dictionary');

        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());

        const dict = lines.map(line => {
          const [word, ipa] = line.split('\t');
          return { word: word.trim(), ipa: ipa ? ipa.trim() : '' };
        }).filter(item => item.word && item.ipa);

        setDictionary(dict);
        setStatus(`Loaded ${dict.length.toLocaleString()} words`);
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Unable to load pronunciation dictionary. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadDictionary();
  }, [language]);

  // Perform search when dictionary loads and we have a query from URL
  useEffect(() => {
    if (!isInitialized || !dictionary || dictionary.length === 0 || hasPerformedInitialSearch) return;

    const q = searchParams.get('q');
    if (q && q.trim()) {
      performSearch(q);
      setHasPerformedInitialSearch(true);
    }
  }, [dictionary, isInitialized, searchParams, hasPerformedInitialSearch, performSearch]);

  // Rerun search when language changes (if we have a query)
  useEffect(() => {
    // Skip on initial mount
    if (prevLanguageRef.current === null) {
      prevLanguageRef.current = language;
      return;
    }

    // Only rerun if language actually changed and we have a query and dictionary
    if (prevLanguageRef.current !== language && dictionary && dictionary.length > 0 && searchQuery.trim()) {
      performSearch(searchQuery);
    }

    prevLanguageRef.current = language;
  }, [language, dictionary, searchQuery, performSearch]);

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-8 py-12 md:py-24 flex-1">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-5xl md:text-7xl font-light mb-2 text-white/60">
            Words that sound like...
          </h1>
          <p className="text-lg font-light text-white">
            Find words that sound like a given word across languages
          </p>
        </header>

        {/* Language selector */}
        <nav className="mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className="bg-transparent text-white px-4 py-2 border border-gray-400 rounded hover:border-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-primary">
                {lang.name}
              </option>
            ))}
          </select>
        </nav>

        {/* Search bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter a word or IPA notation..."
              disabled={loading}
              className="flex-1 bg-transparent border border-gray-400 rounded text-white px-4 py-2 focus:outline-none focus:border-white focus:ring-1 focus:ring-white disabled:opacity-50 placeholder-gray-400 transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-transparent border border-gray-400 rounded text-gray-400 hover:text-white hover:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

          {status && (
            <p className="text-gray-400 text-sm mb-2">
              {status}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm">Try:</span>
            {(LANGUAGE_EXAMPLES[language] || LANGUAGE_EXAMPLES['en_US']).map((example) => (
              <button
                key={example}
                onClick={() => {
                  setSearchQuery(example);
                  performSearch(example);
                }}
                disabled={loading}
                className="px-3 py-1 bg-gray-400/10 border border-gray-400/30 rounded-full text-sm text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-400/20 focus:outline-none focus:ring-1 focus:ring-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-gray-400 border-t-white rounded-full animate-spin mb-4 opacity-30"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <article className="w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400/30">
              <h2 className="text-2xl text-white/60">
                Results for <span className="font-mono text-white/90">{results[0].queryIPA}</span>
              </h2>
              <span className="px-3 py-1 bg-gray-400/20 text-gray-400 text-sm rounded-full">
                {results.length} matches
              </span>
            </div>

            <div className="space-y-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 hover:bg-white/5 rounded transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-lg mb-1 text-white/90">
                      {result.word}
                    </div>
                    <div className="font-mono text-sm text-white/70">
                      {result.ipa}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-400/20 text-gray-400 text-sm rounded-full">
                    {result.similarity}%
                  </span>
                </div>
              ))}
            </div>
          </article>
        )}

        {/* No results */}
        {!loading && results.length === 0 && !error && searchQuery && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No similar words found. Try a different query.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full flex gap-2 justify-center items-center text-center py-4 text-base text-white/80">
        <p>See on {' '}
          <a href="https://github.com/jasopolis/words-that-sound-like" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors" >GitHub</a>
        </p>
        <p> {'|'}</p>
        <p>
          Data from {' '}
          <a
            href="https://github.com/open-dict-data/ipa-dict"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            open-dict-data/ipa-dict
          </a>
        </p>
      </footer>
    </div>
  );
}
