import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import heroAsset from "@/assets/whitepaper-liquidity-3d.png";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const NEW_ASSETS = [
  {
    name: "USDC (ZkSync Era)",
    ticker: "USDC",
    network: "ZkSync Era",
    status: "live" as const,
    value: "Ultra-low fees via Zero-Knowledge Rollups",
    audience: "Dust swappers / High-frequency",
    detail:
      "Leveraging Zero-Knowledge Rollups to provide near-instant settlement with negligible gas fees. Ideal for our $0.30 micro-swap protocol.",
  },
  {
    name: "USDS (Sky Ecosystem)",
    ticker: "USDS",
    network: "Ethereum",
    status: "live" as const,
    value: "Next-gen decentralized stablecoin",
    audience: "Institutional / Safe-haven",
    detail:
      "The evolution of decentralized stablecoins from the Sky ecosystem. Direct, private bridge for USDS without account registration.",
  },
  {
    name: "edgeX (EDGE)",
    ticker: "EDGE",
    network: "Ethereum",
    status: "live" as const,
    value: "High-performance trading liquidity",
    audience: "Active traders",
    detail:
      "High-performance trading liquidity now available for direct exchange on MRC GlobalPay.",
  },
  {
    name: "PancakeSwap (CAKE)",
    ticker: "CAKE",
    network: "Aptos",
    status: "live" as const,
    value: "Cross-chain agility on Aptos",
    audience: "DEX Traders / Yield Farmers",
    detail:
      "Expanding our reach into the Aptos ecosystem, allowing users to move CAKE cross-chain with one click.",
  },
];

const COMING_SOON = [
  {
    name: "WETH (Polygon)",
    ticker: "WETH",
    network: "Polygon",
    value: "Institutional-grade Wrapped Ether on Polygon",
    audience: "Institutional traders",
    detail:
      "Enhancing our Polygon liquidity rails to support institutional-grade Wrapped Ether settlements.",
  },
  {
    name: "Perle (PRL)",
    ticker: "PRL",
    network: "Solana",
    value: "100% private, no-log swaps",
    audience: "Early-adopters / Solana Maxis",
    detail:
      "Bringing the Solana Perle ecosystem into our bridge, offering 100% private, no-log swaps for PRL holders.",
  },
];

const LiquidityWhitepaper = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/liquidity-expansion");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const exchangeLink = langPath(lang, "/");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Q2 2026 Liquidity Expansion — MRC GlobalPay Whitepaper</title>
        <meta
          name="description"
          content="MRC GlobalPay liquidity whitepaper: ZkSync USDC, USDS, EDGE and Aptos CAKE powering non-custodial cross-chain settlement for 900+ assets, $0.30 minimums."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: "Q2 2026 Liquidity Expansion — MRC GlobalPay",
            headline:
              "A New Frontier for Non-Custodial Cross-Chain Settlement",
            description:
              "MRC GlobalPay integrates Layer-2 powerhouses and next-generation stablecoins to reduce transaction friction globally.",
            url: canonicalUrl,
            datePublished: "2026-04-12",
            author: {
              "@type": "Organization",
              name: "MRC GlobalPay",
            },
            publisher: {
              "@type": "FinancialService",
              name: "MRC GlobalPay",
              url: "https://mrcglobalpay.com",
            },
          })}
        </script>
      </Helmet>

      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          <motion.div
            className="flex flex-col items-center text-center gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-xs tracking-widest uppercase px-4 py-1.5 border-primary/30 text-primary">
                Whitepaper — Q2 2026
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
            >
              The Q2 2026 Liquidity Expansion
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl"
            >
              A New Frontier for Non-Custodial Cross-Chain Settlement
            </motion.p>

            <motion.img
              variants={fadeUp}
              custom={3}
              src={heroAsset}
              alt="Liquidity expansion 3D illustration"
              className="w-56 h-56 md:w-72 md:h-72 object-contain mx-auto mt-4"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              MRC GlobalPay continues its mission to provide the world's most
              accessible non-custodial exchange. By integrating Layer-2
              powerhouses and next-generation stablecoins, we are reducing
              transaction friction for users globally. Every new asset
              integration follows our core promise: zero personal data required,
              non-custodial settlement, and swaps starting from $0.30.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Live Assets */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          >
            1. Newly Integrated Assets (Live Now)
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {NEW_ASSETS.map((asset, i) => (
              <motion.div
                key={asset.ticker}
                variants={fadeUp}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-foreground">
                    {asset.name}
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                    LIVE
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{asset.detail}</p>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {asset.network}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {asset.audience}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          >
            2. Strategic Roadmap — Coming Soon
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {COMING_SOON.map((asset, i) => (
              <motion.div
                key={asset.ticker}
                variants={fadeUp}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-xl border border-dashed border-primary/30 bg-card p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-foreground">
                    {asset.name}
                  </h3>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                    COMING SOON
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{asset.detail}</p>
                <Badge variant="secondary" className="text-[10px] w-fit mt-auto">
                  {asset.network}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Summary Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
          >
            Executive Summary
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="overflow-x-auto rounded-xl border border-border bg-card"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-start p-4 font-semibold text-foreground">Asset</th>
                  <th className="text-start p-4 font-semibold text-foreground">Value Proposition</th>
                  <th className="text-start p-4 font-semibold text-foreground">Target Audience</th>
                  <th className="text-start p-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...NEW_ASSETS, ...COMING_SOON.map((a) => ({ ...a, status: "coming" as const }))].map(
                  (a) => (
                    <tr key={a.ticker} className="border-b border-border/50 last:border-0">
                      <td className="p-4 font-medium text-foreground">{a.name}</td>
                      <td className="p-4 text-muted-foreground">{a.value}</td>
                      <td className="p-4 text-muted-foreground">{a.audience}</td>
                      <td className="p-4">
                        {"status" in a && a.status === "live" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            LIVE
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                            COMING SOON
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Technical Execution */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            <h2 className="text-2xl font-semibold text-foreground">
              Technical Execution Protocol
            </h2>

            <h3 className="text-xl font-medium text-foreground mt-8">
              Multilingual SEO and Localization
            </h3>
            <p className="text-muted-foreground">
              All new asset pages are localized across 13 supported languages
              with hreflang tags to prevent duplicate content penalties. The AI
              Concierge proactively explains these tokens in the user's native
              language.
            </p>
            <p className="text-muted-foreground">
              Key keywords: Zero-Data Swap, Non-Custodial Bridge,
              Registration-Free Exchange, ZkSync Era USDC, Aptos CAKE Swap.
            </p>

            <h3 className="text-xl font-medium text-foreground mt-8">
              Internal Linking Strategy
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>Blog articles link to the exchange pre-configured for the new assets.</li>
              <li>
                Tool pages include informational tooltips linking back to this
                whitepaper for institutional trust.
              </li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-8">
              Privacy Reassurance
            </h3>
            <p className="text-muted-foreground">
              Swapping any of these new assets requires zero personal data and
              remains fully non-custodial. MRC GlobalPay is a{" "}
              <span className="font-semibold text-primary">
                Registered Canadian MSB (C100000015)
              </span>
              , FINTRAC compliant.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Start Swapping Today
            </h2>
            <p className="text-muted-foreground">
              All newly integrated assets are live and available for instant,
              non-custodial swaps from $0.30. No registration required.
            </p>
            <Link
              to={exchangeLink}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Open Exchange
            </Link>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default LiquidityWhitepaper;
