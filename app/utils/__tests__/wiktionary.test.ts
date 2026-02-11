import { getWiktionarySubdomain, getWiktionaryUrl } from "../wiktionary";

describe("getWiktionarySubdomain", () => {
  it("maps app language codes to Wiktionary editions", () => {
    expect(getWiktionarySubdomain("en_US")).toBe("en");
    expect(getWiktionarySubdomain("en_UK")).toBe("en");
    expect(getWiktionarySubdomain("pt_BR")).toBe("pt");
    expect(getWiktionarySubdomain("fr_QC")).toBe("fr");
    expect(getWiktionarySubdomain("zh_hant")).toBe("zh");
    expect(getWiktionarySubdomain("ma")).toBe("ms");
  });

  it("returns null for unsupported language codes", () => {
    expect(getWiktionarySubdomain("does_not_exist")).toBeNull();
  });
});

describe("getWiktionaryUrl", () => {
  it("builds a Wiktionary URL and encodes spaces", () => {
    expect(getWiktionaryUrl("ice cream", "en_US")).toBe(
      "https://en.wiktionary.org/wiki/ice_cream",
    );
  });

  it("URI-encodes non-ASCII words", () => {
    expect(getWiktionaryUrl("水", "ja")).toBe(
      "https://ja.wiktionary.org/wiki/%E6%B0%B4",
    );
  });

  it("returns null for unsupported language codes", () => {
    expect(getWiktionaryUrl("word", "does_not_exist")).toBeNull();
  });
});
