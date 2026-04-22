import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCompetitorBySlug } from "@/lib/competitor-data";
import { getDeepProfile } from "@/lib/competitor-deep";
import { buildAutoProfile } from "@/lib/competitor-deep-auto";
import ComparisonPageTemplate from "@/components/compare/ComparisonPageTemplate";

const ComparePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const rivalSlug = slug?.replace("mrc-vs-", "") ?? "";

  // 1. Hand-curated rich profile for priority competitors.
  const deep = getDeepProfile(rivalSlug);
  if (deep) return <ComparisonPageTemplate profile={deep} />;

  // 2. Auto-generated rich profile for every other listed competitor.
  // Ensures all /compare/mrc-vs-* pages render through the same balanced
  // template (Winner table, pros/cons, Why-MRC, verdict) and benefit from
  // i18n labels in all 13 languages.
  const competitor = getCompetitorBySlug(rivalSlug);
  if (competitor) return <ComparisonPageTemplate profile={buildAutoProfile(competitor)} />;

  // 3. Unknown slug → friendly 404 with link back to the directory.
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Comparison Not Found</h1>
          <p className="mt-2 font-body text-muted-foreground">This exchange is not in our database.</p>
          <Link to="/compare" className="mt-4 inline-block text-primary hover:underline">
            Browse all comparisons →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};

export default ComparePage;
