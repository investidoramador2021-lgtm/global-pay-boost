import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import HreflangTags from "@/components/HreflangTags";
import { COMPETITORS } from "@/lib/competitor-data";
import { usePageUrl } from "@/hooks/use-page-url";
import { getLangFromPath, langPath } from "@/i18n";

const CompareDirectory = () => {
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const pageUrl = usePageUrl("/compare");

  const filtered = useMemo(() => {
    if (!query.trim()) return COMPETITORS;
    const q = query.toLowerCase();
    return COMPETITORS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.includes(q)
    );
  }, [query]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "MRC Global Pay vs All Competitors — 2026 Comparison Directory",
    description: "Compare MRC Global Pay against 50+ crypto exchanges. Side-by-side feature comparisons, fees, minimums, and more.",
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: COMPETITORS.length,
      itemListElement: COMPETITORS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `MRC Global Pay vs ${c.name}`,
        url: `https://mrcglobalpay.com/compare/mrc-vs-${c.slug}`,
      })),
    },
  };

  return (
    <>
      <HreflangTags />
      <Helmet>
        <title>MRC Global Pay vs 50+ Exchanges | 2026 Comparison</title>
        <meta name="description" content="Compare MRC Global Pay against 50+ crypto exchanges. Side-by-side feature comparisons covering fees, minimums, verification policies, speed, and more." />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="MRC Global Pay vs 50+ Exchanges | 2026 Comparison" />
        <meta property="og:description" content="Side-by-side comparisons against ChangeNOW, Binance, Coinbase, and 47 more exchanges." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              50+ Comparisons
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              MRC Global Pay vs Every Exchange
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              See exactly how we compare against every major crypto exchange, DEX, and bridge protocol. Feature-by-feature, no bias.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exchanges..."
                  className="w-full rounded-lg border border-border bg-card px-10 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
              All Exchange Comparisons
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((c) => (
                <a
                  key={c.slug}
                  href={`/compare/mrc-vs-${c.slug}`}
                  title={`Compare MRC Global Pay vs ${c.name} — fees, minimums, speed`}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary">
                    MRC vs {c.name}
                  </h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Min: ${c.min_swap_usd} · {c.kyc_policy} · {c.avg_speed}
                  </p>
                  <p className="mt-2 font-body text-xs text-primary">
                    {c.mrc_advantage}
                  </p>
                </a>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center font-body text-muted-foreground">No exchanges found matching "{query}".</p>
            )}
          </div>
        </section>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default CompareDirectory;
