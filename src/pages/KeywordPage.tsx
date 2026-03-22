import { useLocation, Navigate } from "react-router-dom";
import { findKeywordByUrl } from "@/lib/seo-keywords";
import KeywordLanding from "@/components/KeywordLanding";

const KeywordPage = () => {
  const { pathname } = useLocation();
  const data = findKeywordByUrl(pathname);

  if (!data) return <Navigate to="/404" replace />;

  return <KeywordLanding data={data} />;
};

export default KeywordPage;
