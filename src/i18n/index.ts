import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ja from "./locales/ja.json";
import fa from "./locales/fa.json";
import ur from "./locales/ur.json";
import he from "./locales/he.json";
import af from "./locales/af.json";
import hi from "./locales/hi.json";
import vi from "./locales/vi.json";
import tr from "./locales/tr.json";
import uk from "./locales/uk.json";

export const supportedLanguages = [
  "en", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export interface LanguageMeta {
  english: string;
  native: string;
  dir?: "rtl" | "ltr";
}

export const languageMeta: Record<SupportedLanguage, LanguageMeta> = {
  en: { english: "English", native: "English" },
  es: { english: "Spanish", native: "Español" },
  pt: { english: "Portuguese", native: "Português" },
  fr: { english: "French", native: "Français" },
  ja: { english: "Japanese", native: "日本語" },
  fa: { english: "Persian", native: "فارسی", dir: "rtl" },
  ur: { english: "Urdu", native: "اردو", dir: "rtl" },
  he: { english: "Hebrew", native: "עברית", dir: "rtl" },
  af: { english: "Afrikaans", native: "Afrikaans" },
  hi: { english: "Hindi", native: "हिन्दी" },
  vi: { english: "Vietnamese", native: "Tiếng Việt" },
  tr: { english: "Turkish", native: "Türkçe" },
  uk: { english: "Ukrainian", native: "Українська" },
};

// Keep the old export for backward compat
export const languageLabels: Record<SupportedLanguage, string> = Object.fromEntries(
  supportedLanguages.map((l) => [l, languageMeta[l].native])
) as Record<SupportedLanguage, string>;

/** Extract lang code from a pathname like /pt/blog → "pt", /blog → "en" */
export function getLangFromPath(pathname: string): SupportedLanguage {
  const seg = pathname.split("/")[1];
  if (supportedLanguages.includes(seg as SupportedLanguage) && seg !== "en") {
    return seg as SupportedLanguage;
  }
  return "en";
}

/** Strip the language prefix from a path: /pt/blog → /blog, /blog → /blog */
export function stripLangPrefix(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (supportedLanguages.includes(seg as SupportedLanguage) && seg !== "en") {
    const rest = pathname.slice(seg.length + 1);
    return rest || "/";
  }
  return pathname;
}

/** Prepend lang prefix: ("pt", "/blog") → "/pt/blog"; ("en", "/blog") → "/blog" */
export function langPath(lang: SupportedLanguage, path: string): string {
  if (lang === "en") return path;
  return `/${lang}${path === "/" ? "" : path}`;
}

const savedLang = (typeof window !== "undefined" && localStorage.getItem("user-lang")) || "en";
const initialLang = supportedLanguages.includes(savedLang as SupportedLanguage)
  ? savedLang
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
    ja: { translation: ja },
    fa: { translation: fa },
    ur: { translation: ur },
    he: { translation: he },
    af: { translation: af },
    hi: { translation: hi },
    vi: { translation: vi },
    tr: { translation: tr },
    uk: { translation: uk },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
