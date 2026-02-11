import { parseDictionaryLine, splitIpaVariants } from '../dictionary';

describe('splitIpaVariants', () => {
  it('returns a single IPA variant as-is (trimmed)', () => {
    expect(splitIpaVariants(' /hɛˈloʊ/ ')).toEqual(['/hɛˈloʊ/']);
  });

  it('splits multiple comma-separated variants', () => {
    expect(splitIpaVariants('/tɝˈeɪsə/, /tɝˈisə/')).toEqual(['/tɝˈeɪsə/', '/tɝˈisə/']);
    expect(splitIpaVariants('/θiˈætɹɪkəˌɫi/, /θiˈætɹɪkɫi/')).toEqual([
      '/θiˈætɹɪkəˌɫi/',
      '/θiˈætɹɪkɫi/',
    ]);
  });

  it('drops empty segments', () => {
    expect(splitIpaVariants('/a/, , /b/')).toEqual(['/a/', '/b/']);
  });

  it('returns [] for empty input', () => {
    expect(splitIpaVariants('')).toEqual([]);
    expect(splitIpaVariants('   ')).toEqual([]);
  });
});

describe('parseDictionaryLine', () => {
  it('parses word + multiple pronunciations from raw line', () => {
    const parsed = parseDictionaryLine('teresa\t/tɝˈeɪsə/, /tɝˈisə/');
    expect(parsed).toEqual({
      word: 'teresa',
      ipas: ['/tɝˈeɪsə/', '/tɝˈisə/'],
    });
  });

  it('returns null if line has no tab separator', () => {
    expect(parseDictionaryLine('not_a_valid_line')).toBeNull();
  });

  it('returns null if word is empty', () => {
    expect(parseDictionaryLine('\t/abc/')).toBeNull();
  });

  it('returns null if IPA field is empty (or only empty variants)', () => {
    expect(parseDictionaryLine('hello\t')).toBeNull();
    expect(parseDictionaryLine('hello\t ,  , ')).toBeNull();
  });
});

