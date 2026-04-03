import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";

const BASE_URL = "https://mrcglobalpay.com";

/**
 * Returns the full, language-aware canonical URL for the current page.
 * Usage: const pageUrl = usePageUrl("/privacy");
 * On /es/privacy → "https://mrcglobalpay.com/es/privacy"
 * On /privacy → "https://mrcglobalpay.com/privacy"
 */
export const usePageUrl = (path?: string) => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const resolved = path ? langPath(lang, path) : pathname;
  return `${BASE_URL}${resolved}`;
};
