import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supportedLanguages, getLangFromPath, stripLangPrefix, langPath, type SupportedLanguage } from "@/i18n";

const BASE_URL = "https://mrcglobalpay.com";

/** OpenGraph locale codes (language_TERRITORY) */
const ogLocaleMap: Record<SupportedLanguage, string> = {
  en: "en_US",
  es: "es_ES",
  pt: "pt_BR",
  fr: "fr_FR",
  ja: "ja_JP",
  fa: "fa_IR",
  ur: "ur_PK",
  he: "he_IL",
  af: "af_ZA",
  hi: "hi_IN",
  vi: "vi_VN",
  tr: "tr_TR",
  uk: "uk_UA",
};

/**
 * Injects:
 * - <html lang="...">
 * - hreflang <link> tags for all languages + x-default
 * - Self-referencing canonical <link>
 * - og:url matching canonical (prevents OG/canonical mismatch)
 * - og:locale + og:locale:alternate meta tags
 * - og:site_name
 * - robots directive
 */
const HreflangTags = () => {
  const { pathname } = useLocation();
  const currentLang = getLangFromPath(pathname);
  const barePath = stripLangPrefix(pathname);
  const canonicalUrl = `${BASE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

  return (
    <Helmet>
      <html lang={currentLang} />

      {/* Self-referencing canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* OG URL must always match canonical */}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="MRC GlobalPay" />

      {/* Default robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Hreflang alternates */}
      {supportedLanguages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${BASE_URL}${langPath(lang, barePath)}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${barePath}`} />

      {/* OpenGraph locale */}
      <meta property="og:locale" content={ogLocaleMap[currentLang]} />
      {supportedLanguages
        .filter((l) => l !== currentLang)
        .map((lang) => (
          <meta key={lang} property="og:locale:alternate" content={ogLocaleMap[lang]} />
        ))}
    </Helmet>
  );
};

export default HreflangTags;