import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLangFromPath, languageMeta } from "@/i18n";
import HreflangTags from "@/components/HreflangTags";

/**
 * Syncs the i18n language with the URL path prefix on every navigation.
 * Sets dir="rtl"/"ltr" and lang on <html>, adds/removes .rtl class on <body>.
 * Injects hreflang tags for every page.
 */
const LangLayout = () => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    const lang = getLangFromPath(pathname);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    const meta = languageMeta[lang];
    const dir = meta.dir ?? "ltr";

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    if (dir === "rtl") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [pathname, i18n]);

  return (
    <>
      <HreflangTags />
      <Outlet />
    </>
  );
};

export default LangLayout;
