import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import {
  Layers,
  ShieldCheck,
  Building2,
  Search,
  ChevronDown,
  ArrowRight,
  Cpu,
  Lock,
  Globe,
  Zap,
  FileCheck,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TARGET_ASSETS = ["USDT", "USDC", "BTC", "ETH", "SOL", "DAI"];

/* ---------- JSON-LD ---------- */
const buildJsonLd = (url: string) => ({
  financialService: {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "MRC GlobalPay Dust Consolidation",
    url,
    description:
      "Institutional-grade crypto dust recovery. Consolidate fragmented cross-chain remnants into unified stablecoin assets through a FINTRAC-registered, non-custodial sweep engine.",
    provider: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "100 Metcalfe Street",
        addressLocality: "Ottawa",
        addressRegion: "ON",
        postalCode: "K1P 5M1",
        addressCountry: "CA",
      },
    },
    areaServed: { "@type": "Place", name: "Worldwide" },
    serviceType: "Crypto Dust Consolidation",
    priceRange: "$0.30+",
  },
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is crypto dust?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Crypto dust refers to tiny token balances — often worth less than $1 — that remain in wallets after trades. These fragments are typically too small to send or swap on most exchanges due to minimum thresholds and network fees.",
        },
      },
      {
        "@type": "Question",
        name: "How to sweep crypto dust safely?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MRC GlobalPay's stateless sweep engine consolidates dust balances starting at $0.30 with no registration, no custody, and no IP logging. Simply select your dust token, enter the amount, and swap to a stablecoin like USDT or USDC in under 60 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is dust consolidation non-custodial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MRC GlobalPay never takes custody of your funds. Every dust sweep is a direct wallet-to-wallet atomic swap processed through a FINTRAC-registered Money Services Business (MSB M23225638) with zero intermediary holding.",
        },
      },
    ],
  },
});

/* ---------- Bento Cards ---------- */
interface BentoCard {
  icon: React.ElementType;
  title: string;
  body: string;
  span?: "wide";
}

const bentoCards: BentoCard[] = [
  {
    icon: Layers,
    title: "Stateless Consolidation",
    body: "Our sweep engine bypasses session limits by deriving deterministic deposit addresses from BIP-44 master paths. Multiple tiny balances across chains are aggregated into a single settlement output — no database persistence, no TTL expiry, no address-reuse risk.",
    span: "wide",
  },
  {
    icon: Lock,
    title: "Privacy Sovereignty",
    body: "Dusting attacks exploit transparent on-chain analytics to de-anonymize wallet clusters. Our shielded routing decouples the sweep transaction from your primary wallet identity — no IP logging, no session cookies, no wallet fingerprinting.",
  },
  {
    icon: Building2,
    title: "Institutional Off-Ramp",
    body: "Direct integration with Canadian MSB settlement rails (FINTRAC M23225638) enables immediate fiat conversion for consolidated dust. Audit-ready PDF receipts with cryptographic signatures accompany every settlement.",
  },
  {
    icon: Cpu,
    title: "Cross-Chain Atomic Sweeps",
    body: "Hash-time-locked contracts guarantee atomic execution across 50+ blockchains. Either all legs of the dust consolidation complete, or the entire transaction reverts — eliminating partial-fill risk on micro-balances.",
    span: "wide",
  },
  {
    icon: Globe,
    title: "190+ Jurisdictions Supported",
    body: "Localized in 13 languages with full RTL mirroring. Dust recovery is accessible to users in every timezone, with hreflang-tagged pages ensuring correct search engine targeting for regional queries.",
  },
  {
    icon: Zap,
    title: "Sub-60s Settlement",
    body: "Median dust sweep finality of 23 seconds. Pre-staged liquidity pools and parallel mempool monitoring ensure even $0.30 micro-swaps execute at institutional speed.",
  },
];

/* ---------- FAQ ---------- */
const faqs = [
  {
    q: "What is crypto dust?",
    a: "Crypto dust refers to tiny token balances — often worth less than $1 — that remain in wallets after trades. These fragments are typically too small to send or swap on most exchanges due to minimum thresholds and network fees. MRC GlobalPay processes swaps starting at just $0.30, making dust recovery viable.",
  },
  {
    q: "How do I sweep crypto dust safely?",
    a: "Select your dust token from 500+ supported assets, enter the micro-balance amount, choose a target stablecoin (USDT, USDC, etc.), and execute the swap. No registration, no KYC for qualifying amounts, and settlement in under 60 seconds.",
  },
  {
    q: "Is dust consolidation non-custodial?",
    a: "Yes. MRC GlobalPay never takes custody of user funds. Every sweep is a direct wallet-to-wallet atomic swap routed through 700+ liquidity sources. Our FINTRAC-registered MSB status ensures regulatory compliance without custodial exposure.",
  },
  {
    q: "Can I consolidate dust from multiple blockchains?",
    a: "Yes. Our cross-chain liquidity mesh supports 50+ blockchains. You can sweep dust from Ethereum, Solana, BNB Chain, Polygon, Avalanche, and dozens more into a single unified stablecoin balance.",
  },
  {
    q: "What are the fees for dust sweeping?",
    a: "MRC GlobalPay charges zero hidden fees. The rate you see includes our transparent service margin. Network fees (gas) are the user's responsibility and vary by blockchain congestion.",
  },
];

/* ========== Component ========== */
const CryptoDustSolutions = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const canonicalUrl = usePageUrl("/crypto-dust-solutions");
  const [targetAsset, setTargetAsset] = useState("USDT");
  const [walletInput, setWalletInput] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const jsonLd = buildJsonLd(canonicalUrl);

  const sweepUrl = langPath(lang, "/") + `?from=eth&to=${targetAsset.toLowerCase()}&amount=0.30#exchange-widget`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Institutional Crypto Dust Consolidation — Recover Lost Liquidity | MRC GlobalPay</title>
        <meta
          name="description"
          content="Consolidate fragmented cross-chain crypto dust into unified stablecoin assets. Non-custodial, FINTRAC-registered MSB. Swaps from $0.30. No registration required."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta property="og:title" content="Crypto Dust Recovery — Institutional Consolidation | MRC GlobalPay" />
        <meta property="og:description" content="Recover and reclaim lost crypto liquidity. Sweep micro-balances across 50+ chains into stablecoins. Non-custodial. $0.30 minimum." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <script type="application/ld+json">{JSON.stringify(jsonLd.financialService)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLd.faq)}</script>
      </Helmet>

      <SiteHeader />

      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden border-b border-border/30 py-16 sm:py-24">
          {/* Deep purple radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(272_80%_30%/0.15),transparent)]" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Stateless &amp; Non-Custodial
              </span>

              <h1 className="mt-6 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Institutional Crypto Dust Consolidation
              </h1>
              <p className="mt-1 font-display text-lg font-bold text-primary sm:text-xl">
                Recover and Reclaim Lost Liquidity
              </p>
              <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                Consolidate fragmented cross-chain remnants into unified stablecoin assets through
                MRC GlobalPay's stateless sweep engine. FINTRAC-registered MSB. No registration required.
              </p>
            </div>

            {/* ===== LIQUIDITY ESTIMATOR CARD ===== */}
            <div className="mx-auto mt-12 max-w-xl">
              <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm sm:p-8">
                <h2 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                  <Search className="h-4 w-4 text-primary" />
                  Liquidity Estimator
                </h2>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Enter a public wallet address and select your target consolidation asset.
                </p>

                {/* Wallet input */}
                <div className="mt-5">
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Public Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x... or bc1... or sol..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Target asset selector */}
                <div className="mt-4">
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Target Consolidation Asset
                  </label>
                  <div className="relative">
                    <select
                      value={targetAsset}
                      onChange={(e) => setTargetAsset(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-semibold text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    >
                      {TARGET_ASSETS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* CTA */}
                <Button
                  className="mt-6 w-full shadow-neon transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                  size="lg"
                  asChild
                >
                  <Link to={sweepUrl}>
                    Initiate Global Sweep
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <p className="mt-3 text-center font-body text-[11px] text-muted-foreground/60">
                  Deep-links to MRC GlobalPay swap engine with small-balance optimization.
                  Non-custodial. No data stored.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BENTO GRID ===== */}
        <section className="border-t border-border/30 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
                <Cpu className="h-3.5 w-3.5" />
                Technical Specifications
              </span>
              <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Why Institutional Dust Recovery Matters
              </h2>
              <p className="mt-3 font-body text-sm text-muted-foreground sm:text-base">
                Fragmented micro-balances across chains represent billions in locked liquidity.
                Our stateless architecture unlocks it without custodial risk.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bentoCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)] ${
                      card.span === "wide" ? "sm:col-span-2 lg:col-span-2" : ""
                    }`}
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity duration-500 group-hover:bg-primary/10" />
                    <div className="relative z-10">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                        <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                        {card.title}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                        {card.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CROSS-LINKS ===== */}
        <section className="border-t border-border/20 bg-muted/20 py-10">
          <div className="container mx-auto grid max-w-4xl gap-4 px-4 sm:grid-cols-3">
            {[
              { label: "Dust Calculator", path: "/tools/crypto-dust-calculator", icon: Search },
              { label: "Dust Guide", path: "/resources/crypto-dust-guide", icon: FileCheck },
              { label: "Dust Swap Comparison", path: "/dust-swap-comparison", icon: Network },
            ].map((link) => (
              <Link
                key={link.path}
                to={langPath(lang, link.path)}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-4 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <link.icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground">{link.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="border-t border-border/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="text-center font-display text-2xl font-black text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-sm font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-border/30 px-5 py-4">
                      <p className="font-body text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </div>
  );
};

export default CryptoDustSolutions;
