import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getLangFromPath, langPath } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Layers, Coins } from "lucide-react";

/**
 * Crawler-friendly hub page that surfaces every active swap pair and asset.
 * Provides Google a single page from which it can discover all programmatic
 * /exchange/{from}-to-{to} URLs in one crawl, replacing the prior random sampling.
 */
export default function ExchangeDirectory() {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (p: string) => langPath(lang, p);
  const [filter, setFilter] = useState("");

  const { data: assets } = useQuery({
    queryKey: ["directory-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exchange_assets")
        .select("ticker, name, network, image_url, is_featured, tier")
        .eq("is_active", true)
        .order("tier", { ascending: true })
        .order("ticker", { ascending: true });
      const seen = new Set<string>();
      return (data || []).filter((a) => {
        const key = a.ticker.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: pairs } = useQuery({
    queryKey: ["directory-pairs"],
    queryFn: async () => {
      // Fetch in chunks of 1000 (Supabase default cap) to surface every pair.
      const all: Array<{ from_ticker: string; to_ticker: string }> = [];
      let offset = 0;
      const chunk = 1000;
      // Hard cap at 5000 rows to avoid pathological renders
      for (let i = 0; i < 5; i++) {
        const { data, error } = await supabase
          .from("pairs")
          .select("from_ticker, to_ticker")
          .eq("is_valid", true)
          .order("from_ticker", { ascending: true })
          .order("to_ticker", { ascending: true })
          .range(offset, offset + chunk - 1);
        if (error || !data || data.length === 0) break;
        all.push(...data);
        if (data.length < chunk) break;
        offset += chunk;
      }
      return all;
    },
    staleTime: 1000 * 60 * 60,
  });

  const totalPairs = pairs?.length || 0;
  const totalAssets = assets?.length || 0;

  const filteredPairs = useMemo(() => {
    if (!pairs) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return pairs;
    return pairs.filter(
      (p) =>
        p.from_ticker.toLowerCase().includes(q) ||
        p.to_ticker.toLowerCase().includes(q),
    );
  }, [pairs, filter]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.ticker.toLowerCase().includes(q) ||
        (a.name || "").toLowerCase().includes(q),
    );
  }, [assets, filter]);

  const canonicalUrl = "https://mrcglobalpay.com/directory";
  const title = `Exchange Directory — All ${totalPairs.toLocaleString()} Crypto Swap Pairs | MRC GlobalPay`;
  const description = `Browse every supported crypto swap pair on MRC GlobalPay. ${totalAssets}+ assets, ${totalPairs.toLocaleString()} live pairs. Canadian MSB-registered (C100000015), no account required.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
          { "@type": "ListItem", position: 2, name: "Exchange Directory", item: canonicalUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonicalUrl,
        isPartOf: { "@type": "WebSite", name: "MRC GlobalPay", url: "https://mrcglobalpay.com" },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <MsbTrustBar />

      <main className="bg-background pb-20 lg:pb-0">
        <section className="border-b border-border py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <li>
                    <a href={lp("/")} className="transition-colors hover:text-foreground">
                      Home
                    </a>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-foreground">Exchange Directory</li>
                </ol>
              </nav>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Exchange Directory
              </h1>
              <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
                Browse every supported swap pair and asset on MRC GlobalPay. {totalAssets > 0 && (
                  <>
                    <strong className="text-foreground">{totalAssets}+ assets</strong> ·{" "}
                    <strong className="text-foreground">{totalPairs.toLocaleString()} live pairs</strong>.
                  </>
                )}
              </p>

              <div className="mt-6 flex max-w-md items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  inputMode="search"
                  placeholder="Filter by ticker (e.g. btc, sol, usdt)..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border-0 bg-transparent p-0 font-mono text-sm focus-visible:ring-0"
                  aria-label="Filter pairs and assets by ticker"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Assets section */}
        <section className="border-b border-border py-10" aria-labelledby="assets-heading">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 id="assets-heading" className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Supported Assets
                </h2>
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                  {filteredAssets.length}
                </span>
              </div>

              <nav aria-label="All supported crypto assets" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {filteredAssets.map((a) => {
                  const ticker = a.ticker.toLowerCase();
                  return (
                    <Link
                      key={ticker}
                      to={lp(`/exchange/${ticker}-to-usdt`)}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent"
                      title={`Swap ${a.name || ticker.toUpperCase()} to USDT`}
                    >
                      {a.image_url && (
                        <img src={a.image_url} alt="" className="h-5 w-5 rounded-full" loading="lazy" />
                      )}
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold uppercase text-foreground">{ticker.toUpperCase()}</div>
                        {a.name && (
                          <div className="truncate font-body text-[10px] text-muted-foreground">{a.name}</div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </section>

        {/* Pairs section */}
        <section className="py-10" aria-labelledby="pairs-heading">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 id="pairs-heading" className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  All Swap Pairs
                </h2>
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                  {filteredPairs.length.toLocaleString()}
                </span>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                Every link below is a real, live swap route. Click any pair to load the swap widget pre-configured for that route.
              </p>

              <nav
                aria-label="All supported crypto swap pairs"
                className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredPairs.map((p) => {
                  const from = p.from_ticker.toLowerCase();
                  const to = p.to_ticker.toLowerCase();
                  return (
                    <a
                      key={`${from}-${to}`}
                      href={lp(`/exchange/${from}-to-${to}`)}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2 font-mono text-xs transition-colors hover:border-primary/40 hover:bg-accent"
                      title={`Swap ${from.toUpperCase()} to ${to.toUpperCase()} instantly`}
                    >
                      <span className="font-bold uppercase text-foreground">
                        {from.toUpperCase()}
                        <ArrowRight className="mx-1.5 inline h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        {to.toUpperCase()}
                      </span>
                    </a>
                  );
                })}
              </nav>

              {filteredPairs.length === 0 && (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  No pairs match "{filter}". Try a different ticker.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
