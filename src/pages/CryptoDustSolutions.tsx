import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath as lp } from "@/i18n";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import DustBentoQuickAccess from "@/components/DustBentoQuickAccess";
import {
  ShieldCheck,
  Search,
  ChevronDown,
  ArrowRight,
  Cpu,
  Lock,
  Building2,
  Globe,
  Zap,
  Layers,
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
    name: "MRC GlobalPay Institutional Dust Consolidation",
    url,
    description:
      "Institutional-grade crypto dust recovery and stateless liquidity consolidation. Consolidate fragmented cross-chain remnants into unified stablecoin assets through a FINTRAC-registered, non-custodial sweep engine.",
    provider: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
      address: {
        "@type": "PostalAddress",
         streetAddress: "116 Albert Street, Suite 300",
         addressLocality: "Ottawa",
         addressRegion: "ON",
         postalCode: "K1P 5G3",
        addressCountry: "CA",
      },
    },
    areaServed: { "@type": "Place", name: "Worldwide" },
    serviceType: "Crypto Dust Consolidation",
    priceRange: "$0.30+",
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1200", bestRating: "5" },
  },
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How to sweep crypto dust safely?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MRC GlobalPay's stateless sweep engine consolidates dust balances starting at $0.30 with no registration, no custody, and no IP logging. Select your dust token, enter the amount, and swap to a stablecoin like USDT or USDC in under 60 seconds through a FINTRAC-registered MSB.",
        },
      },
      {
        "@type": "Question",
        name: "Is MRC GlobalPay regulated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MRC GlobalPay is a FINTRAC-registered Money Services Business (MSB C100000015) headquartered at 100 Metcalfe Street, Ottawa, Ontario, Canada. All operations comply with Canadian AML/CTF regulations while maintaining non-custodial settlement architecture.",
        },
      },
      {
        "@type": "Question",
        name: "What are the benefits of stateless dust recovery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stateless recovery eliminates session persistence, address-reuse risk, and TTL expiry failures. Deterministic deposit addresses are derived from BIP-44 master paths, enabling high-frequency remnant processing without database overhead. This architecture supports atomic sweeps across 50+ blockchains with sub-60-second finality.",
        },
      },
      {
        "@type": "Question",
        name: "What is crypto dust?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Crypto dust refers to tiny token balances — often worth less than $1 — that remain in wallets after trades. These fragments are typically too small to send or swap on most exchanges due to minimum thresholds and network fees. MRC GlobalPay processes swaps starting at just $0.30, making institutional-scale dust recovery viable.",
        },
      },
    ],
  },
});

/* ---------- Bento Spec Cards ---------- */
interface SpecCard {
  icon: React.ElementType;
  title: string;
  body: string;
  span?: "wide";
}

const specCards: SpecCard[] = [
  { icon: Layers, title: "Stateless Consolidation", body: "Deterministic deposit addresses derived from BIP-44 master paths bypass session limits and TTL expiry. Multiple tiny balances across chains aggregate into a single settlement output — no database persistence, no address-reuse risk.", span: "wide" },
  { icon: Lock, title: "Privacy Sovereignty", body: "Shielded routing decouples the sweep transaction from your primary wallet identity. No IP logging, no session cookies, no wallet fingerprinting — preventing dusting attack de-anonymization." },
  { icon: Building2, title: "Institutional Off-Ramp", body: "Direct integration with Canadian MSB settlement rails (FINTRAC C100000015) enables immediate fiat conversion. Audit-ready PDF receipts with cryptographic signatures accompany every settlement." },
  { icon: Cpu, title: "Cross-Chain Atomic Sweeps", body: "Hash-time-locked contracts guarantee atomic execution across 50+ blockchains. Either all legs of the dust consolidation complete, or the entire transaction reverts — eliminating partial-fill risk.", span: "wide" },
  { icon: Globe, title: "190+ Jurisdictions", body: "Localized in 13 languages with full RTL mirroring for Hebrew, Persian, and Urdu. Hreflang-tagged pages ensure correct search engine targeting for regional queries." },
  { icon: Zap, title: "Sub-60s Settlement", body: "Median dust sweep finality of 23 seconds. Pre-staged liquidity pools and parallel mempool monitoring ensure $0.30 micro-swaps execute at institutional speed." },
];

/* ---------- FAQ ---------- */
const faqs = [
  { q: "How to sweep crypto dust safely?", a: "Select your dust token from 6,000+ supported assets, enter the micro-balance amount, choose a target stablecoin (USDT, USDC, etc.), and execute the swap through our non-custodial settlement engine. No registration required for qualifying amounts, with settlement in under 60 seconds via a FINTRAC-registered Money Services Business." },
  { q: "Is MRC GlobalPay regulated?", a: "Yes. MRC GlobalPay operates as a FINTRAC-registered Money Services Business (MSB C100000015) headquartered at 100 Metcalfe Street, Ottawa, Ontario, Canada K1P 5M1. Our regulatory status ensures full compliance with Canadian Anti-Money Laundering and Counter-Terrorist Financing (AML/CTF) regulations while maintaining a non-custodial architecture that never takes possession of user funds." },
  { q: "What are the benefits of stateless dust recovery?", a: "Stateless architecture eliminates session persistence overhead, address-reuse risk, and TTL expiry failures. By deriving deterministic deposit addresses from BIP-44 master paths, our sweep engine processes high-frequency remnant consolidation without database state. This enables atomic sweeps across 50+ blockchains with sub-60-second finality and zero intermediary holding." },
  { q: "What is crypto dust and why does it matter?", a: "Crypto dust refers to tiny token balances — often worth less than $1 — that remain in wallets after trades. Across the global crypto economy, billions of dollars in aggregate value are locked in these micro-fragments. MRC GlobalPay's institutional consolidation engine processes swaps starting at just $0.30, making dust recovery viable for both retail users and institutional portfolio managers." },
  { q: "Can I consolidate dust from multiple blockchains simultaneously?", a: "Yes. Our cross-chain liquidity mesh supports 50+ blockchains including Ethereum, Solana, BNB Chain, Polygon, Avalanche, Arbitrum, Optimism, Base, and dozens more. Each sweep utilizes hash-time-locked contracts (HTLCs) to guarantee atomic execution — either all legs complete, or the entire transaction reverts." },
];

/* ========== Component ========== */
const CryptoDustSolutions = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const canonicalUrl = usePageUrl("/crypto-dust-solutions");
  const langPathFn = (path: string) => lp(lang, path);
  const [targetAsset, setTargetAsset] = useState("USDT");
  const [walletInput, setWalletInput] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const jsonLd = buildJsonLd(canonicalUrl);
  const sweepUrl = langPathFn("/") + `?from=eth&to=${targetAsset.toLowerCase()}&amount=0.30#exchange-widget`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Institutional Crypto Dust Solutions & Stateless Liquidity Recovery | MRC GlobalPay</title>
        <meta name="description" content="Institutional crypto dust consolidation: recover fragmented cross-chain remnants into unified stablecoins via a FINTRAC-registered, non-custodial sweep engine. From $0.30." />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta property="og:title" content="Institutional Crypto Dust Solutions — Stateless Liquidity Recovery | MRC GlobalPay" />
        <meta property="og:description" content="Recover and reclaim lost crypto liquidity. Consolidate micro-balances across 50+ chains into stablecoins. Non-custodial. FINTRAC-registered. $0.30 minimum." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <script type="application/ld+json">{JSON.stringify(jsonLd.financialService)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLd.faq)}</script>
      </Helmet>

      <SiteHeader />

      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden border-b border-border/30 py-16 sm:py-24">
          {/* Gold radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.08),transparent)]" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-[#D4AF37]">
                <ShieldCheck className="h-3.5 w-3.5" />
                FINTRAC-Registered MSB C100000015
              </span>

              <h1 className="mt-6 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Institutional Crypto Dust Solutions &amp; Stateless Liquidity Recovery
              </h1>
              <p className="mt-2 font-display text-lg font-bold text-[#D4AF37] sm:text-xl">
                Recover and Reclaim Lost Cross-Chain Liquidity
              </p>
              <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                Consolidate fragmented cross-chain remnants into unified stablecoin assets through
                MRC GlobalPay's{" "}
                <Link to={langPathFn("/permanent-bridge")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                  stateless mapping infrastructure
                </Link>
                . FINTRAC-registered MSB. No registration required. Swaps from $0.30.
              </p>
            </div>

            {/* ===== DUST RECOVERY SIMULATOR ===== */}
            <div className="mx-auto mt-12 max-w-xl">
              <div className="rounded-2xl border border-[#D4AF37]/20 bg-card/60 p-6 backdrop-blur-sm sm:p-8">
                <h2 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                  <Search className="h-4 w-4 text-[#D4AF37]" />
                  Dust Recovery Simulator
                </h2>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Enter a public wallet address and select your target consolidation asset to analyze fragmented liquidity.
                </p>

                <div className="mt-5">
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Public Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x... or bc1... or sol..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/20"
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Target Consolidation Asset
                  </label>
                  <div className="relative">
                    <select
                      value={targetAsset}
                      onChange={(e) => setTargetAsset(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-semibold text-foreground focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/20"
                    >
                      {TARGET_ASSETS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  className="mt-6 w-full bg-[#D4AF37] text-background shadow-[0_0_20px_-6px_rgba(212,175,55,0.4)] transition-transform duration-200 hover:bg-[#D4AF37]/90 hover:scale-[1.02] active:scale-95"
                  size="lg"
                  asChild
                >
                  <Link to={sweepUrl}>
                    Analyze Fragmented Liquidity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <p className="mt-3 text-center font-body text-[11px] text-muted-foreground/60">
                  Deep-links to the{" "}
                  <Link to={langPathFn("/")} className="underline decoration-muted-foreground/30 underline-offset-2">
                    non-custodial stablecoin settlement
                  </Link>{" "}
                  engine with small-balance optimization. No data stored.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ARTICLE BODY ===== */}
        <article className="border-t border-border/30 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-12">

              {/* --- Section 1 --- */}
              <section>
                <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  The Challenge of Fragmented Digital Assets: Why Institutional Wallets Accumulate Dust
                </h2>
                <div className="mt-6 space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>
                    Across the global cryptocurrency ecosystem, an estimated <strong className="text-foreground">$2.7 billion</strong> in aggregate value remains locked in micro-fragments — tiny token balances too small to transact on conventional exchanges. These remnants, commonly referred to as "crypto dust," accumulate through the natural mechanics of blockchain settlement: UTXO fragmentation on Bitcoin-derived chains, gas fee rounding on EVM networks, and minimum balance requirements on account-based ledgers like{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-sol-to-usdt")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Solana's sub-lamport architecture
                    </Link>.
                  </p>
                  <p>
                    For institutional portfolio managers, this fragmentation represents more than aesthetic clutter. Each dust balance occupies an indexable state entry on its respective blockchain, consuming storage resources and creating phantom exposure in portfolio accounting systems. A fund managing positions across{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-btc-to-usdc")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Bitcoin
                    </Link>,{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-eth-to-sol")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Ethereum
                    </Link>,{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-sol-to-usdt")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Solana
                    </Link>, and BNB Chain may accumulate hundreds of dust entries per quarter — each one a potential audit friction point and a vector for{" "}
                    <Link to={langPathFn("/resources/crypto-dust-guide")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      wallet dusting attacks
                    </Link>.
                  </p>
                  <p>
                    The economics are structurally unfavorable: on Ethereum mainnet, a standard ERC-20 transfer costs approximately $0.50–$3.00 in gas fees depending on network congestion. When the dust balance itself is worth $0.12, the cost of recovery exceeds the value recovered — creating a permanent capital leak. This dynamic is amplified on Layer-2 networks like Arbitrum, Optimism, and Base, where lower fees encourage higher transaction frequency and proportionally more micro-remnants.
                  </p>
                  <p>
                    UTXO-based blockchains introduce additional complexity. Each Bitcoin transaction produces change outputs, and over time, wallets accumulate dozens of sub-economic UTXOs. Consolidating these requires a multi-input transaction where each additional input increases the byte-weight and thus the fee. Without specialized tooling, institutional treasuries face a compounding fragmentation problem where the cost of cleanup grows faster than the dust itself.
                  </p>
                  <p>
                    MRC GlobalPay's{" "}
                    <Link to={langPathFn("/tools/crypto-dust-calculator")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      dust recovery calculator
                    </Link>{" "}
                    addresses this by processing swaps from as low as <strong className="text-foreground">$0.30</strong> — an order of magnitude below the minimum thresholds imposed by centralized exchanges like Binance ($10), Coinbase ($2), and Kraken ($5). This threshold advantage transforms previously irrecoverable fragments into actionable liquidity.
                  </p>
                </div>
              </section>

              {/* --- Section 2 --- */}
              <section>
                <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Our Solution: The Stateless Sweep Consolidation Engine
                </h2>
                <div className="mt-6 space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>
                    The MRC GlobalPay consolidation engine operates on a <strong className="text-foreground">stateless architecture</strong> — a deliberate design decision that eliminates the session persistence, database overhead, and TTL (Time-to-Live) expiry failures that plague conventional exchange platforms. Where centralized services maintain server-side session state for each user interaction, our engine derives{" "}
                    <strong className="text-foreground">deterministic deposit addresses</strong> from BIP-44 hierarchical master paths, enabling each consolidation request to be self-contained and atomically independent.
                  </p>
                  <p>
                    This architectural choice produces three critical advantages for institutional dust recovery:
                  </p>
                  <div className="rounded-xl border border-border/40 bg-card/40 p-5 font-mono text-sm">
                    <p className="font-bold text-foreground">1. Zero Address-Reuse Risk</p>
                    <p className="mt-1 text-muted-foreground">Each sweep generates a unique, cryptographically derived deposit address. Unlike platforms that recycle deposit addresses across sessions, our deterministic derivation ensures that no two consolidation events share an address — eliminating the correlation vectors exploited in blockchain forensics.</p>
                    <p className="mt-4 font-bold text-foreground">2. No TTL Expiry Failures</p>
                    <p className="mt-1 text-muted-foreground">Traditional exchanges assign temporary deposit addresses with 15–60 minute expiry windows. Funds sent after expiry are lost or require manual support intervention. Our stateless model has no expiry — the deterministic address remains valid indefinitely, and the{" "}
                      <Link to={langPathFn("/permanent-bridge")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                        permanent bridge infrastructure
                      </Link>{" "}
                      ensures settlement completes regardless of timing.
                    </p>
                    <p className="mt-4 font-bold text-foreground">3. High-Frequency Remnant Processing</p>
                    <p className="mt-1 text-muted-foreground">Without database state to manage, the engine processes concurrent sweeps without lock contention or queue serialization. This enables institutional users to execute hundreds of parallel dust consolidation operations across{" "}
                      <Link to={langPathFn("/dust-swap-comparison")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                        50+ supported blockchains
                      </Link>{" "}
                      with sub-60-second median finality.
                    </p>
                  </div>
                  <p>
                    The technical decoupling extends to our liquidity sourcing. Rather than maintaining proprietary order books — which create custodial exposure and regulatory complexity — MRC GlobalPay aggregates across{" "}
                    <strong className="text-foreground">700+ liquidity sources</strong> including decentralized exchanges (Uniswap, Raydium, PancakeSwap), cross-chain bridges, and institutional OTC desks. Each{" "}
                    <Link to={langPathFn("/")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      non-custodial stablecoin settlement
                    </Link>{" "}
                    is routed through the optimal path based on real-time slippage analysis, ensuring that even $0.30 micro-balances receive best-execution pricing.
                  </p>
                  <p>
                    For{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-btc-to-usdc")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Bitcoin-to-USDC consolidation
                    </Link>, the engine implements a specialized UTXO batching algorithm that aggregates multiple sub-economic inputs into a single high-value output, amortizing the per-input fee across the entire consolidation batch. This technique reduces the effective per-dust-entry cost by up to <strong className="text-foreground">87%</strong> compared to individual sweep transactions.
                  </p>
                </div>
              </section>

              {/* --- Section 3 --- */}
              <section>
                <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Security &amp; Sovereignty: Protecting Against Wallet Dusting Attacks
                </h2>
                <div className="mt-6 space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>
                    Wallet dusting attacks represent one of the most sophisticated threat vectors in modern blockchain forensics. Attackers distribute tiny amounts of cryptocurrency — often fractions of a cent — to thousands of wallet addresses simultaneously. When recipients unknowingly include these dust inputs in subsequent transactions, the attacker can correlate the dust UTXO with the recipient's primary holdings, effectively de-anonymizing wallet clusters and mapping financial relationships.
                  </p>
                  <p>
                    The MRC GlobalPay{" "}
                    <Link to={langPathFn("/private-transfer")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      shielded settlement architecture
                    </Link>{" "}
                    provides a structural defense against dusting attacks by <strong className="text-foreground">decoupling the sweep transaction from the primary wallet identity</strong>. When a user initiates a dust consolidation through our engine, the process follows a privacy-preserving pipeline:
                  </p>
                  <div className="rounded-xl border border-border/40 bg-card/40 p-5 font-mono text-sm space-y-3">
                    <p><strong className="text-[#D4AF37]">Step 1:</strong> <span className="text-foreground">Isolation.</span> <span className="text-muted-foreground">The dust balance is sent to a deterministic deposit address that has no on-chain association with the user's primary wallet. This breaks the graph-analytic link that dusting attacks exploit.</span></p>
                    <p><strong className="text-[#D4AF37]">Step 2:</strong> <span className="text-foreground">Aggregation.</span> <span className="text-muted-foreground">Multiple incoming dust deposits are pooled through our non-custodial liquidity mesh, further obfuscating the origin-destination mapping.</span></p>
                    <p><strong className="text-[#D4AF37]">Step 3:</strong> <span className="text-foreground">Settlement.</span> <span className="text-muted-foreground">The consolidated output is delivered to the user's designated receiving address as a clean, single-origin transaction — free of the tainted dust UTXOs that enable forensic correlation.</span></p>
                  </div>
                  <p>
                    This three-stage pipeline operates without IP logging, session cookies, or{" "}
                    <Link to={langPathFn("/private-transfer/whitepaper")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      wallet fingerprinting
                    </Link>. The stateless design means there is no server-side record of which wallet addresses participated in a given consolidation batch — providing{" "}
                    <strong className="text-foreground">sovereign privacy</strong> that centralized exchanges fundamentally cannot offer due to their KYC/AML data retention obligations.
                  </p>
                  <p>
                    For institutional clients managing multi-signature treasury wallets, the privacy benefits compound: each dust sweep is indistinguishable from any other atomic swap on the network, preventing competitors from using blockchain analytics to reverse-engineer fund allocation strategies or treasury rebalancing patterns.
                  </p>
                  <p>
                    Our{" "}
                    <Link to={langPathFn("/resources/crypto-dust-guide")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      institutional dust guide
                    </Link>{" "}
                    provides detailed technical documentation on implementing dusting attack defense at scale, including recommended consolidation frequencies and UTXO management best practices for{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-btc-to-usdc")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Bitcoin treasury operations
                    </Link>.
                  </p>
                </div>
              </section>

              {/* --- Section 4 --- */}
              <section>
                <h2 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Global Compliance &amp; Settlement Rails
                </h2>
                <div className="mt-6 space-y-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>
                    MRC GlobalPay operates as a <strong className="text-foreground">FINTRAC-registered Money Services Business</strong> (MSB Registration Number C100000015), headquartered at 100 Metcalfe Street, Ottawa, Ontario, Canada K1P 5M1. This regulatory standing provides institutional clients with a level of counterparty assurance that unregistered DeFi protocols and offshore exchanges cannot match.
                  </p>
                  <p>
                    The Canadian MSB framework imposes rigorous obligations including ongoing transaction monitoring, suspicious transaction reporting (STR), large value transaction reporting (LVTR), and comprehensive record-keeping requirements. MRC GlobalPay fulfills these obligations through automated compliance infrastructure while maintaining a{" "}
                    <strong className="text-foreground">non-custodial settlement model</strong> — a critical distinction that separates our platform from custodial exchanges that must hold and safeguard client assets.
                  </p>
                  <p>
                    For dust consolidation specifically, the regulatory advantage manifests in settlement rail integration. Consolidated dust balances can be routed through Canadian banking infrastructure for fiat conversion, providing institutional clients with a compliant off-ramp for recovered liquidity. Each settlement is accompanied by an audit-ready PDF receipt with cryptographic signatures, creating a verifiable chain of custody from the original dust balance through to fiat settlement.
                  </p>
                  <p>
                    The platform serves <strong className="text-foreground">190+ jurisdictions</strong> with localized interfaces in 13 languages, including full{" "}
                    <Link to={langPathFn("/permanent-bridge/whitepaper")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Right-to-Left mirroring
                    </Link>{" "}
                    for Hebrew, Persian, and Urdu. Regional compliance considerations are addressed through geofencing and jurisdiction-specific transaction limits, ensuring that dust consolidation services remain available globally while respecting local regulatory frameworks.
                  </p>
                  <p>
                    Cross-chain settlement integrates with major on-ramp networks including{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-xrp-to-usdt")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      XRP for cross-border remittance corridors
                    </Link>,{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-sol-to-usdt")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Solana for high-frequency settlement
                    </Link>, and{" "}
                    <Link to={langPathFn("/solutions/how-to-swap-eth-to-sol")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      Ethereum-to-Solana bridging
                    </Link>{" "}
                    for DeFi position management. Each pathway is optimized for micro-balance throughput, with the{" "}
                    <Link to={langPathFn("/tools/crypto-dust-calculator")} className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
                      dust recovery calculator
                    </Link>{" "}
                    providing real-time conversion estimates before commitment.
                  </p>
                  <p>
                    Operational security is reinforced by our Ottawa-based infrastructure, benefiting from Canada's mature data protection framework (PIPEDA), political stability, and robust telecommunications backbone. Unlike operators in offshore jurisdictions, our physical presence in a G7 capital provides institutional clients with recourse through Canadian courts — a meaningful differentiator for fiduciaries with governance obligations.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </article>

        {/* ===== BENTO SPEC GRID ===== */}
        <section className="border-t border-border/30 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
                <Cpu className="h-3.5 w-3.5" />
                Technical Specifications
              </span>
              <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Architecture Overview
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`group relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#D4AF37]/40 hover:bg-card/60 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.12)] ${
                      card.span === "wide" ? "sm:col-span-2 lg:col-span-2" : ""
                    }`}
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#D4AF37]/5 blur-2xl transition-opacity duration-500 group-hover:bg-[#D4AF37]/10" />
                    <div className="relative z-10">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                        <Icon className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-foreground">{card.title}</h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== BENTO QUICK-ACCESS UTILITY ===== */}
        <DustBentoQuickAccess langPath={langPathFn} />

        {/* ===== FAQ ===== */}
        <section className="border-t border-border/30 py-16 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="text-center font-display text-2xl font-black text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-[#D4AF37]/20 bg-card/40 backdrop-blur-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-sm font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
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
