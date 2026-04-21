import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialShare from "@/components/blog/SocialShare";
import StickyShareRail from "@/components/blog/StickyShareRail";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import heroAsset from "@/assets/whitepaper-nicehash-mining-3d.png";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

// Algorithm groupings — algo names + tickers stay universal; only "note" is translated.
const ALGO_GROUPS = [
  { algo: "SHA-256", assets: ["BTC", "BCH", "BSV"], noteKey: "noteSha" },
  { algo: "Scrypt", assets: ["LTC", "DOGE"], noteKey: "noteScrypt" },
  { algo: "Etchash / Ethash", assets: ["ETC", "ETHW"], noteKey: "noteEtchash" },
  { algo: "kHeavyHash", assets: ["KAS"], noteKey: "noteKaspa" },
  { algo: "Autolykos2", assets: ["ERG"], noteKey: "noteErgo" },
  { algo: "BeamHashIII", assets: ["BEAM"], noteKey: "noteBeam" },
  { algo: "ZHash / Equihash 144,5", assets: ["ZEC", "FLUX", "BTG"], noteKey: "noteEquihash" },
  { algo: "RandomX", assets: ["XMR"], noteKey: "noteRandomx" },
  { algo: "Octopus", assets: ["CFX"], noteKey: "noteOctopus" },
  { algo: "KawPow", assets: ["RVN"], noteKey: "noteKawpow" },
  { algo: "FishHash", assets: ["IRON"], noteKey: "noteFishhash" },
  { algo: "Karlsenhash / Pyrinhash", assets: ["KLS", "PYI"], noteKey: "noteKarlsen" },
  { algo: "Verthash", assets: ["VTC"], noteKey: "noteVerthash" },
  { algo: "Nexapow", assets: ["NEXA"], noteKey: "noteNexa" },
  { algo: "Alephium (Blake3)", assets: ["ALPH"], noteKey: "noteAlephium" },
];

const PAYOUT_TARGETS = [
  { ticker: "BTC", reasonKey: "payoutBtc" },
  { ticker: "ETH", reasonKey: "payoutEth" },
  { ticker: "USDT", reasonKey: "payoutUsdt" },
  { ticker: "USDC", reasonKey: "payoutUsdc" },
  { ticker: "SOL", reasonKey: "payoutSol" },
  { ticker: "XMR", reasonKey: "payoutXmr" },
  { ticker: "PAXG", reasonKey: "payoutPaxg" },
];

const NicehashMiningWhitepaper = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/whitepapers/nicehash-mining-payout-strategy");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const homeCta = langPath(lang, "/") + "#exchange";
  const lendCta = langPath(lang, "/lend");
  const transparencyCta = langPath(lang, "/transparency-security");
  const compareCta = langPath(lang, "/compare");
  const liquidityCta = langPath(lang, "/liquidity-expansion");
  const sovereignCta = langPath(lang, "/sovereign-settlement");

  const wp = (key: string) => t(`nicehashWp.${key}`);

  const edgeCards = ["edgePricing", "edgeMsb", "edgeNoAccount", "edgeRouting", "edgePrivacy", "edgeEarn"] as const;
  const steps = ["step1", "step2", "step3", "step4", "step5"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{wp("metaTitle")}</title>
        <meta name="description" content={wp("metaDesc")} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:title" content={wp("metaTitle")} />
        <meta property="og:description" content={wp("metaDesc")} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MRC Global Pay" />
        <meta property="og:image" content={`https://mrcglobalpay.com${heroAsset}`} />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={wp("metaTitle")} />
        <meta name="twitter:description" content={wp("metaDesc")} />
        <meta name="twitter:image" content={`https://mrcglobalpay.com${heroAsset}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: wp("metaTitle"),
            description: wp("metaDesc"),
            url: canonicalUrl,
            image: `https://mrcglobalpay.com${heroAsset}`,
            datePublished: "2026-04-21",
            dateModified: "2026-04-21",
            author: { "@type": "Organization", name: "MRC Global Pay" },
            publisher: { "@type": "FinancialService", name: "MRC Global Pay", url: "https://mrcglobalpay.com" },
            about: { "@type": "Thing", name: "Cryptocurrency Mining Payouts" },
          })}
        </script>
      </Helmet>

      <StickyShareRail url={canonicalUrl} title={wp("metaTitle")} />
      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* HERO */}
        <section className="relative py-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, hsl(142 76% 36% / 0.10) 0%, transparent 70%)" }}
          />
          <div className="container mx-auto max-w-6xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {wp("badge")}
              </span>
            </motion.div>

            <motion.h1
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mx-auto max-w-4xl text-center font-display text-[clamp(1.85rem,4vw,3.25rem)] font-black leading-[1.1] tracking-tight text-foreground"
            >
              {wp("heroTitle")}
            </motion.h1>

            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
              className="mx-auto mt-5 max-w-3xl text-center text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed text-muted-foreground"
            >
              {wp("heroSub")}
            </motion.p>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mt-10 flex justify-center">
              <img
                src={heroAsset}
                alt={wp("heroAlt")}
                width={1024}
                height={1024}
                className="w-full max-w-xl rounded-2xl border border-emerald-500/15 shadow-[0_0_60px_rgba(16,185,129,0.15)]"
              />
            </motion.div>
          </div>
        </section>

        {/* SECTION I */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("s1Tag")}</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">{wp("s1Title")}</h2>
              <div className="mt-5 space-y-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground">
                <p>{wp("s1P1")}</p>
                <p>{wp("s1P2")}</p>
                <ul className="ms-5 list-disc space-y-2">
                  <li>{wp("s1Bullet1")}</li>
                  <li>{wp("s1Bullet2")}</li>
                  <li>{wp("s1Bullet3")}</li>
                </ul>
                <p>{wp("s1P3")}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION II — Asset matrix */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-5xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("s2Tag")}</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">{wp("s2Title")}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {wp("s2Sub")}{" "}
                <Link to={homeCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("s2WidgetLink")}</Link>
                {wp("s2SubEnd")}
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mt-10 overflow-x-auto rounded-xl border border-emerald-500/15 bg-background/40 backdrop-blur-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="px-4 py-3 text-start font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("colAlgo")}</th>
                    <th className="px-4 py-3 text-start font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("colAssets")}</th>
                    <th className="px-4 py-3 text-start font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("colNotes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ALGO_GROUPS.map((row) => (
                    <tr key={row.algo} className="border-b border-border/40 transition-colors hover:bg-emerald-500/5">
                      <td className="px-4 py-3 font-semibold text-foreground">{row.algo}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{row.assets.join(" · ")}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{wp(row.noteKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {wp("s2Footer")}{" "}
              <Link to={liquidityCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("s2LiquidityLink")}</Link>.
            </p>
          </div>
        </section>

        {/* SECTION III — Why MRC */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("s3Tag")}</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">{wp("s3Title")}</h2>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {edgeCards.map((k, i) => (
                <motion.div
                  key={k}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="rounded-xl border border-emerald-500/15 bg-background/60 p-5 backdrop-blur-sm"
                >
                  <h3 className="text-sm font-bold text-foreground">{wp(`${k}Title`)}</h3>
                  {k === "edgeEarn" ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {wp("edgeEarnPre")}{" "}
                      <Link to={lendCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("edgeEarnLink")}</Link>{" "}
                      {wp("edgeEarnPost")}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{wp(`${k}Desc`)}</p>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{wp("compareLabel")}</strong>{" "}
              {wp("comparePre")}{" "}
              <Link to={compareCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("compareLink")}</Link>{" "}
              {wp("comparePost")}
            </div>
          </div>
        </section>

        {/* SECTION IV — Payout strategies */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("s4Tag")}</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">{wp("s4Title")}</h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground">{wp("s4Sub")}</p>
            </motion.div>

            <div className="mt-10 space-y-3">
              {PAYOUT_TARGETS.map((row, i) => (
                <motion.div
                  key={row.ticker}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="flex items-start gap-4 rounded-xl border border-emerald-500/15 bg-background/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 font-mono text-sm font-bold text-emerald-400">
                    {row.ticker}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{wp(row.reasonKey)}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm font-bold text-foreground">{wp("ruleTitle")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {wp("rulePre")}{" "}
                <Link to={lendCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("ruleLink")}</Link>{" "}
                {wp("rulePost")}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION V — Walkthrough */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("s5Tag")}</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">{wp("s5Title")}</h2>
            </motion.div>

            <ol className="mt-8 space-y-5">
              {steps.map((k, i) => (
                <motion.li
                  key={k}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="flex gap-4 rounded-xl border border-emerald-500/15 bg-background/60 p-4 backdrop-blur-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{wp(k)}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* SECTION VI — Trust */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">{wp("s6Tag")}</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">{wp("s6Title")}</h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground">
                {wp("s6Pre")}{" "}
                <Link to={transparencyCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("s6TransparencyLink")}</Link>{" "}
                {wp("s6Mid")}{" "}
                <Link to={sovereignCta} className="text-emerald-400 underline-offset-4 hover:underline">{wp("s6SovereignLink")}</Link>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-5 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                ⛏️ {wp("ctaBadge")}
              </span>
            </motion.div>

            <motion.h3
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mt-6 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-foreground"
            >
              {wp("ctaTitle")}
            </motion.h3>

            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
              className="mt-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground"
            >
              {wp("ctaDesc")}
            </motion.p>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={homeCta}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
              >
                {wp("ctaPrimary")}
              </Link>
              <Link
                to={lendCta}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-8 py-3.5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:border-emerald-500/40"
              >
                {wp("ctaSecondary")}
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 pb-16">
          <SocialShare url={canonicalUrl} title={wp("metaTitle")} description={wp("metaDesc")} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NicehashMiningWhitepaper;
