import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supportedLanguages, getLangFromPath, stripLangPrefix, langPath } from "@/i18n";

const BASE_URL = "https://mrcglobalpay.com";

/**
 * Injects hreflang <link> tags for all supported languages + x-default,
 * and sets the <html lang="..."> attribute based on the current URL prefix.
 */
const HreflangTags = () => {
  const { pathname } = useLocation();
  const currentLang = getLangFromPath(pathname);
  const barePath = stripLangPrefix(pathname);

  return (
    <Helmet>
      <html lang={currentLang} />
      {supportedLanguages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${BASE_URL}${langPath(lang, barePath)}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${BASE_URL}${barePath}`}
      />
    </Helmet>
  );
};

export default HreflangTags;
