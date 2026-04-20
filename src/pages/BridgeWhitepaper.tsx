import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialShare from "@/components/blog/SocialShare";
import StickyShareRail from "@/components/blog/StickyShareRail";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import { useLocation } from "react-router-dom";
import bridgeAsset from "@/assets/whitepaper-bridge-3d.png";
import logoVisa from "@/assets/logo-visa.png";
import logoMastercard from "@/assets/logo-mastercard.png";
import logoPix from "@/assets/logo-pix.png";
import logoSepa from "@/assets/logo-sepa.png";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const BridgeWhitepaper = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/permanent-bridge/whitepaper");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const bridgeCta = langPath(lang, "/permanent-bridge") + "?tab=bridge";

  const wp = (key: string) => t(`whitepaper.${key}`);

  const techSteps = [
    { key: "tech1", label: wp("tech1Label"), pos: "top-[8%] start-[2%]" },
    { key: "tech2", label: wp("tech2Label"), pos: "top-[32%] end-[0%]" },
    { key: "tech3", label: wp("tech3Label"), pos: "bottom-[28%] start-[4%]" },
    { key: "tech4", label: wp("tech4Label"), pos: "bottom-[4%] end-[2%]" },
  ];

  const useCases = [
    { icon: "⛏️", title: wp("miningTitle"), desc: wp("miningDesc") },
    { icon: "🏢", title: wp("corpTitle"), desc: wp("corpDesc") },
    { icon: "💎", title: wp("hnwiTitle"), desc: wp("hnwiDesc") },
  ];

  const logos = [
    { src: logoVisa, alt: "Visa" },
    { src: logoMastercard, alt: "Mastercard" },
    { src: logoPix, alt: "PIX" },
    { src: logoSepa, alt: "SEPA" },
  ];

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
        <meta property="og:image" content={`https://mrcglobalpay.com${bridgeAsset}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={wp("metaTitle")} />
        <meta name="twitter:description" content={wp("metaDesc")} />
        <meta name="twitter:image" content={`https://mrcglobalpay.com${bridgeAsset}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "name": wp("metaTitle"),
            "headline": wp("heroTitle"),
            "description": wp("metaDesc"),
            "url": canonicalUrl,
            "image": `https://mrcglobalpay.com${bridgeAsset}`,
            "author": { "@type": "Organization", "name": "MRC Global Pay" },
            "publisher": {
              "@type": "FinancialService",
              "name": "MRC Global Pay",
              "url": "https://mrcglobalpay.com",
            },
          })}
        </script>
      </Helmet>

      <StickyShareRail url={canonicalUrl} title={wp("metaTitle")} />

      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* ── HERO ── */}
        <section className="relative py-16 md:py-24 lg:py-32">
          {/* gold ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 40%, hsl(42 100% 55% / 0.07) 0%, transparent 70%)",
            }}
          />

          <div className="container mx-auto max-w-6xl px-4">
            {/* Badge */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="mb-6 flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {wp("badge")}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="mx-auto max-w-4xl text-center font-display text-[clamp(1.75rem,4vw,3.25rem)] font-black leading-[1.1] tracking-tight text-foreground"
            >
              {wp("heroTitle")}
            </motion.h1>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="mx-auto mt-5 max-w-2xl text-center text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed text-muted-foreground"
            >
              {wp("heroSub")}
            </motion.p>
          </div>
        </section>

        {/* ── SCHEMATIC: 3D Bridge + Floating Labels ── */}
        <section className="relative py-12 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="relative mx-auto aspect-[16/9] max-w-4xl">
              {/* Circuit lines (SVG) */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 800 450"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* top-left to bridge */}
                <line x1="60" y1="60" x2="300" y2="180" stroke="#D4AF37" strokeWidth="1" opacity="0.35" />
                {/* top-right to bridge */}
                <line x1="740" y1="160" x2="520" y2="200" stroke="#D4AF37" strokeWidth="1" opacity="0.35" />
                {/* bottom-left to bridge */}
                <line x1="80" y1="320" x2="280" y2="260" stroke="#D4AF37" strokeWidth="1" opacity="0.35" />
                {/* bottom-right to bridge */}
                <line x1="720" y1="400" x2="500" y2="280" stroke="#D4AF37" strokeWidth="1" opacity="0.35" />
                {/* pulse dots */}
                {[
                  { cx: 60, cy: 60 }, { cx: 740, cy: 160 },
                  { cx: 80, cy: 320 }, { cx: 720, cy: 400 },
                ].map((p, i) => (
                  <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#D4AF37" opacity="0.6">
                    <animate attributeName="r" values="3;6;3" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </svg>

              {/* 3D Bridge Image */}
              <motion.img
                src={bridgeAsset}
                alt="Permanent Bridge Architecture"
                width={1024}
                height={1024}
                className="relative mx-auto w-[70%] drop-shadow-[0_0_60px_rgba(212,175,55,0.25)]"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              />

              {/* Floating tech labels */}
              {techSteps.map((step, i) => (
                <motion.div
                  key={step.key}
                  className={`absolute ${step.pos} max-w-[180px] rounded-lg border border-amber-500/20 bg-background/80 px-3 py-2 backdrop-blur-md`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 3}
                  variants={fadeUp}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    0{i + 1}
                  </span>
                  <p className="mt-0.5 text-[clamp(0.7rem,1.2vw,0.82rem)] font-semibold leading-snug text-foreground">
                    {step.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 1: The Problem ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                {wp("s1Tag")}
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                {wp("s1Title")}
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.1rem)] leading-relaxed text-muted-foreground">
                {wp("s1Body")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 2: The Solution ── */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                {wp("s2Tag")}
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                {wp("s2Title")}
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.1rem)] leading-relaxed text-muted-foreground">
                {wp("s2Body")}
              </p>
            </motion.div>

            {/* Value props */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {(["vp1", "vp2", "vp3"] as const).map((k, i) => (
                <motion.div
                  key={k}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="rounded-xl border border-amber-500/15 bg-background/60 p-5 backdrop-blur-sm"
                >
                  <h3 className="text-sm font-bold text-foreground">{wp(`${k}Title`)}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{wp(`${k}Desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Technical Deep Dive ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                {wp("s3Tag")}
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                {wp("s3Title")}
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.1rem)] leading-relaxed text-muted-foreground">
                {wp("s3Body")}
              </p>
            </motion.div>

            {/* Technical workflow steps */}
            <div className="mt-10 space-y-6">
              {(["tw1", "tw2", "tw3", "tw4"] as const).map((k, i) => (
                <motion.div
                  key={k}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="flex gap-4 items-start"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-400">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{wp(`${k}Title`)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{wp(`${k}Desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Use Cases ── */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                {wp("s4Tag")}
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                {wp("s4Title")}
              </h2>
            </motion.div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {useCases.map((uc, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="rounded-xl border border-amber-500/15 bg-background/60 p-6 backdrop-blur-sm"
                >
                  <span className="text-2xl">{uc.icon}</span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">{uc.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{uc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BAR + CTA ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            {/* Stateless badge */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/5 px-5 py-2 text-xs font-semibold text-amber-300 backdrop-blur-md">
                🔒 {wp("statelessBadge")}
              </span>
            </motion.div>

            {/* Logo bar */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="mt-8 flex items-center justify-center gap-6"
            >
              {logos.map((l) => (
                <img
                  key={l.alt}
                  src={l.src}
                  alt={l.alt}
                  className="h-6 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0 dark:brightness-0 dark:invert dark:hover:brightness-100 dark:hover:invert-0"
                  loading="lazy"
                />
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mt-10">
              <Link
                to={bridgeCta}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/90 to-amber-600/90 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(212,175,55,0.3)] backdrop-blur-md transition-all hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] hover:scale-[1.02]"
              >
                {wp("cta")}
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

export default BridgeWhitepaper;
