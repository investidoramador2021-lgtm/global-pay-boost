import { describe, it, expect } from "vitest";
import { pickSupportedLang } from "./EmbedWidget";

describe("pickSupportedLang (browser language auto-detection)", () => {
  it("detects Portuguese from pt-BR", () => {
    expect(pickSupportedLang(["pt-BR", "en-US"])).toBe("pt");
  });

  it("detects Japanese from ja-JP", () => {
    expect(pickSupportedLang(["ja-JP", "en"])).toBe("ja");
  });

  it("detects Hebrew from he-IL", () => {
    expect(pickSupportedLang(["he-IL", "en-US"])).toBe("he");
  });

  it("detects Persian (fa) and Urdu (ur) RTL locales", () => {
    expect(pickSupportedLang(["fa-IR"])).toBe("fa");
    expect(pickSupportedLang(["ur-PK"])).toBe("ur");
  });

  it("falls back to English when no candidate matches", () => {
    expect(pickSupportedLang(["zh-CN", "ko-KR", "it"])).toBe("en");
  });

  it("falls back to English when list is empty", () => {
    expect(pickSupportedLang([])).toBe("en");
  });

  it("skips empty / null entries and picks the first supported one", () => {
    expect(pickSupportedLang(["", null, undefined, "tr-TR", "en"])).toBe("tr");
  });

  it("prefers earlier candidates (browser preference order)", () => {
    expect(pickSupportedLang(["fr-FR", "es-ES", "en-US"])).toBe("fr");
  });

  it("is case-insensitive", () => {
    expect(pickSupportedLang(["PT-br"])).toBe("pt");
    expect(pickSupportedLang(["HE"])).toBe("he");
  });
});
