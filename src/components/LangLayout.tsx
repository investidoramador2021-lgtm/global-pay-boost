import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLangFromPath } from "@/i18n";

/**
 * Syncs the i18n language with the URL path prefix on every navigation.
 * Wraps all routes so child components always have the correct language.
 */
const LangLayout = () => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    const lang = getLangFromPath(pathname);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [pathname, i18n]);

  return <Outlet />;
};

export default LangLayout;
