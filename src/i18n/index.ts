import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import es from "./locales/es.json";

export const supportedLanguages = ["en", "pt", "es"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<SupportedLanguage, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

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

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, pt: { translation: pt }, es: { translation: es } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
