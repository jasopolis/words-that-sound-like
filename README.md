# Words That Sound Like

A simple lookup tool for words that sound (phonetically) like a given word. 

## Similarity scores

Scoring is relatively simple, based on IPA string distance but taking into account similar syllables:

- Sounds in the same category (like /i/ and /ɪ/) get a small penalty (0.3)
- Related sounds (like /p/ and /b/, or /s/ and /z/) get a medium penalty (0.6)
- Completely different sounds get full penalty (1.0)

Categories are set by:

- Vowels grouped by height/backness (high front, mid back, etc.)
- Consonants by manner (stops, fricatives, nasals, liquids)
- Voicing pairs (p/b, t/d, k/g, f/v, s/z, etc.)

Note: I am not a linguist and this definitely works less well for non-Western languages (extended IPA support would be a logical next step). Definitely accepting any suggestions!

## Getting Started

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
npm run build
```

## Data Source

Pronunciation data and wordlists from [open-dict-data/ipa-dict](https://github.com/open-dict-data/ipa-dict).
