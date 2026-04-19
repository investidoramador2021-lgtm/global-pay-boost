import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { SWAP_SOLUTIONS } from "@/lib/swap-solutions-data";
import { usePageUrl } from "@/hooks/use-page-url";

const SolutionsDirectory = () => {
  const [query, setQuery] = useState("");
  const pageUrl = usePageUrl("/solutions");

  const filtered = useMemo(() => {
    if (!query.trim()) return SWAP_SOLUTIONS;
    const q = query.toLowerCase();
    return SWAP_SOLUTIONS.filter(
      (s) =>
        s.from_token.toLowerCase().includes(q) ||
        s.to_token.toLowerCase().includes(q) ||
        s.use_case.toLowerCase().includes(q) ||
        s.slug.includes(q)
    );
  }, [query]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Micro-Swap Solution Vault — All Crypto Swap Guides (2026)",
    description:
      "Browse 16+ step-by-step guides to swap crypto with no minimum deposit. BTC, ETH, SOL, DOGE, SHIB and more from $0.30.",
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SWAP_SOLUTIONS.length,
      itemListElement: SWAP_SOLUTIONS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `How to Swap ${s.from_token} to ${s.to_token}`,
        url: `https://mrcglobalpay.com/solutions/how-to-swap-${s.slug}`,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>Micro-Swap Solutions | Swap Any Crypto from $0.30 (2026)</title>
        <meta
          name="description"
          content="Browse 16+ step-by-step guides for swapping crypto with no minimum deposit. BTC, ETH, SOL, DOGE, SHIB, PEPE and 6,000+ more — all from $0.30, registration-free."
        />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Micro-Swap Solutions | Swap Any Crypto from $0.30" />
        <meta property="og:description" content="Step-by-step swap guides for 16+ token pairs. No registration, from $0.30." />
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
              {SWAP_SOLUTIONS.length}+ Guides
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Micro-Swap Solution Vault
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              Step-by-step guides for every popular swap pair. No minimum deposit barriers — swap from $0.30, registration-free.
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tokens (BTC, ETH, DOGE...)"
                  className="w-full rounded-lg border border-border bg-card px-10 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Search swap solutions"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
              All Swap Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s) => (
                <a
                  key={s.slug}
                  href={`/solutions/how-to-swap-${s.slug}`}
                  title={`How to swap ${s.from_token} to ${s.to_token} with no minimum deposit`}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-display text-xs font-bold text-primary">
                      {s.from_token}
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-display text-xs font-bold text-primary">
                      {s.to_token}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-foreground group-hover:text-primary">
                    {s.from_token} to {s.to_token} Guide
                  </h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    {s.use_case} · From ${s.min_amount_usd}
                  </p>
                  <p className="mt-2 font-body text-xs text-primary">{s.network_advantage}</p>
                </a>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center font-body text-muted-foreground">
                No solutions found matching "{query}".
              </p>
            )}
          </div>
        </section>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default SolutionsDirectory;
