import { useLocation, Navigate } from "react-router-dom";
import { stripLangPrefix, getLangFromPath, langPath } from "@/i18n";
import { findKeywordByUrl } from "@/lib/seo-keywords";
import KeywordLanding from "@/components/KeywordLanding";

const KeywordPage = () => {
  const { pathname } = useLocation();
  // Strip the language prefix so "/es/swap/usdt-to-trx" → "/swap/usdt-to-trx"
  const barePath = stripLangPrefix(pathname);
  const data = findKeywordByUrl(barePath);
  const lang = getLangFromPath(pathname);

  if (!data) return <Navigate to={langPath(lang, "/")} replace />;

  return <KeywordLanding data={data} />;
};

export default KeywordPage;
