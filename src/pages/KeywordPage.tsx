import { useLocation } from "react-router-dom";
import { findKeywordByUrl } from "@/lib/seo-keywords";
import KeywordLanding from "@/components/KeywordLanding";
import NotFound from "@/pages/NotFound";

const KeywordPage = () => {
  const { pathname } = useLocation();
  const data = findKeywordByUrl(pathname);

  if (!data) return <NotFound />;

  return <KeywordLanding data={data} />;
};

export default KeywordPage;
