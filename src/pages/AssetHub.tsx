import { useParams, useLocation, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { getLangFromPath, langPath } from "@/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import TokenIcon from "@/components/TokenIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Shield, Zap, Globe, HelpCircle, Network as NetworkIcon, CheckCircle2 } from "lucide-react";

const BASE_URL = "https://mrcglobalpay.com";
const SUPPORTED_LANGS = ["", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"];

const NETWORK_LABELS: Record<string, string> = {
  eth: "ERC-20 (Ethereum)",
  bsc: "BEP-20 (BNB Smart Chain)",
  trx: "TRC-20 (TRON)",
  sol: "Solana (SPL)",
  matic: "Polygon (PoS)",
  avaxc: "Avalanche C-Chain",
  arbitrum: "Arbitrum One",
  optimism: "Optimism",
  base: "Base",
  ton: "TON",
  algo: "Algorand",
  ron: "Ronin",
  apt: "Aptos",
  near: "NEAR",
  zksync: "zkSync Era",
};

interface Asset {
  id: string;
  ticker: string;
  name: string;
  network: string;
  image_url: string;
  is_stable: boolean;
  has_external_id: boolean;
  supports_fixed_rate: boolean;
}

interface PairRow {
  to_ticker: string;
}

const fetchAsset = async (ticker: string): Promise<Asset | null> => {
  const { data } = await supabase
    .from("exchange_assets")
    .select("id, ticker, name, network, image_url, is_stable, has_external_id, supports_fixed_rate")
    .eq("is_active", true)
    .ilike("ticker", ticker)
    .order("tier", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as Asset) || null;
};

const fetchPairs = async (ticker: string): Promise<PairRow[]> => {
  const { data } = await supabase
    .from("pairs")
    .select("to_ticker")
    .eq("from_ticker", ticker.toLowerCase())
    .eq("is_valid", true)
    .limit(60);
  return (data as PairRow[]) || [];
};

const POPULAR_QUOTES = ["btc", "eth", "usdt", "usdc", "sol", "bnb", "xrp"];

export default function AssetHub() {
  const { ticker = "" } = useParams<{ ticker: string }>();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const tickerLower = ticker.toLowerCase();

  const { data: asset, isLoading } = useQuery({
    queryKey: ["asset-hub", tickerLower],
    queryFn: () => fetchAsset(tickerLower),
    staleTime: 60 * 60 * 1000,
  });

  const { data: pairs } = useQuery({
    queryKey: ["asset-hub-pairs", tickerLower],
    queryFn: () => fetchPairs(tickerLower),
    enabled: !!asset,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!asset) {
    return <Navigate to={langPath(lang, "/")} replace />;
  }

  const tickerUp = asset.ticker.toUpperCase();
  const networkLabel = asset.network ? (NETWORK_LABELS[asset.network] || asset.network.toUpperCase()) : "Native chain";

  // Build the unique-quote list: API pairs + popular fallbacks (de-duplicated, exclude self)
  const apiQuotes = (pairs || []).map((p) => p.to_ticker.toLowerCase());
  const merged = Array.from(new Set([...apiQuotes, ...POPULAR_QUOTES])).filter((q) => q !== tickerLower).slice(0, 24);

  const pageUrl = `${BASE_URL}${pathname}`;
  const title = `Buy & Swap ${asset.name} (${tickerUp}) — Instant ${tickerUp} Exchange | MRC GlobalPay`;
  const description = `Swap ${asset.name} (${tickerUp}) instantly across 700+ liquidity venues. ${networkLabel}. No registration, $0.30 minimum, settlement in under 60 seconds. Aggregated rates, transparent fees.`;

  // JSON-LD: BreadcrumbList + FAQPage + Product (asset)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Assets", item: `${BASE_URL}/assets` },
          { "@type": "ListItem", position: 3, name: `${asset.name} (${tickerUp})`, item: pageUrl },
        ],
      },
      {
        "@type": "Product",
        name: `${asset.name} (${tickerUp})`,
        description,
        category: "Cryptocurrency",
        brand: { "@type": "Brand", name: asset.name },
        ...(asset.image_url ? { image: asset.image_url } : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `How do I swap ${asset.name} (${tickerUp}) on MRC GlobalPay?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Select ${tickerUp} as the source asset in the exchange widget, paste your destination wallet address, choose your target token, and confirm. Settlement completes in under 60 seconds via aggregated liquidity from 700+ venues. No account or KYC needed for crypto-to-crypto swaps under regulatory thresholds.`,
            },
          },
          {
            "@type": "Question",
            name: `Which network does ${tickerUp} use on MRC GlobalPay?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${asset.name} is supported on ${networkLabel}. Always confirm the network on both your sending wallet and the destination address before broadcasting — sending the wrong network results in permanent loss.`,
            },
          },
          {
            "@type": "Question",
            name: `What is the minimum ${tickerUp} swap amount?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `MRC GlobalPay supports micro-swaps from $0.30 USD equivalent in ${tickerUp}, making it ideal for converting wallet dust or testing the platform before larger transactions.`,
            },
          },
          {
            "@type": "Question",
            name: `Is swapping ${tickerUp} on MRC GlobalPay safe?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes. MRC GlobalPay is a registered Canadian Money Services Business (FINTRAC #C100000015). Swaps are non-custodial — your private keys never leave your wallet — and every order is routed through audited liquidity partners with on-chain settlement.`,
            },
          },
          {
            "@type": "Question",
            name: `How long does a ${tickerUp} swap take?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Most ${tickerUp} swaps settle in under 60 seconds once the deposit transaction receives the required network confirmations. The aggregator continuously rebalances against the fastest venue at execution time.`,
            },
          },
        ],
      },
    ],
  };

  // Hreflang alternates so all 13 languages indexed bidirectionally
  const altUrl = (langCode: string) => {
    const prefix = langCode ? `/${langCode}` : "";
    return `${BASE_URL}${prefix}/asset/${tickerLower}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${BASE_URL}/asset/${tickerLower}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        {asset.image_url && <meta property="og:image" content={asset.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        {SUPPORTED_LANGS.map((l) => (
          <link key={l || "en"} rel="alternate" hrefLang={l || "en"} href={altUrl(l)} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={altUrl("")} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <MsbTrustBar />

      {/* Hero */}
      <section className="border-b border-border bg-card/30 py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to={langPath(lang, "/")} className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{asset.name} ({tickerUp})</span>
          </nav>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <TokenIcon ticker={tickerLower} src={asset.image_url || undefined} className="h-16 w-16" />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                Buy & Swap {asset.name} ({tickerUp})
              </h1>
              <p className="mt-3 max-w-3xl font-body text-base text-muted-foreground sm:text-lg">
                Instant on-chain {tickerUp} swaps aggregated across 700+ liquidity venues. No registration. $0.30 minimum. Settlement in under 60 seconds.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  <NetworkIcon className="h-3 w-3" /> {networkLabel}
                </span>
                {asset.is_stable && (
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">Stablecoin</span>
                )}
                {asset.supports_fixed_rate && (
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">Fixed-rate available</span>
                )}
                {asset.has_external_id && (
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">Memo / Tag required</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={langPath(lang, `/?from=${tickerLower}#exchange`)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
            >
              Swap from {tickerUp} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={langPath(lang, `/?to=${tickerLower}#exchange`)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-semibold text-foreground hover:bg-muted"
            >
              Buy {tickerUp} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pair grid */}
      <section className="py-12" aria-labelledby="pairs-heading">
        <div className="container mx-auto px-4">
          <h2 id="pairs-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Popular {tickerUp} trading pairs
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every pair below is live and routed through the cheapest venue at execution. Click to open the swap widget pre-filled.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {merged.map((quote) => (
              <Link
                key={quote}
                to={langPath(lang, `/exchange/${tickerLower}-to-${quote}`)}
                className="group flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/60 hover:bg-muted"
              >
                <span>{tickerUp} → {quote.toUpperCase()}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Network details */}
      <section className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            {asset.name} network details
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-primary"><Globe className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Network</span></div>
              <p className="mt-2 font-display text-lg font-bold text-foreground">{networkLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">Confirm both wallets share this network before sending.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-primary"><Zap className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Settlement</span></div>
              <p className="mt-2 font-display text-lg font-bold text-foreground">Under 60 seconds</p>
              <p className="mt-1 text-xs text-muted-foreground">Median end-to-end execution after deposit confirmation.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-primary"><Shield className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Custody</span></div>
              <p className="mt-2 font-display text-lg font-bold text-foreground">Non-custodial</p>
              <p className="mt-1 text-xs text-muted-foreground">Your private keys never leave your wallet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14" aria-labelledby="faq-heading">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-primary">
              Frequently Asked Questions
            </span>
          </div>
          <h2 id="faq-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            What people ask about {asset.name} ({tickerUp})
          </h2>

          <Accordion type="single" collapsible className="mt-6 space-y-2">
            {(jsonLd["@graph"][2] as any).mainEntity.map((qa: any, i: number) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card px-4"
              >
                <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline">
                  {qa.name}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm leading-relaxed text-muted-foreground">
                  {qa.acceptedAnswer.text}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust callout */}
      <section className="border-t border-border bg-card/30 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 sm:flex-row sm:items-center">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Registered Canadian MSB (FINTRAC #C100000015).</strong>{" "}
              MRC GlobalPay aggregates rates from 700+ venues to give you the best execution on every {tickerUp} swap — no spread markup, no hidden withdrawal fees.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
