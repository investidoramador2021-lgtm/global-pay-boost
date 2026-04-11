import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import vaultAsset from "@/assets/whitepaper-vault-3d.png";
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

const ShieldedWhitepaper = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/private-transfer/whitepaper");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const privateCta = langPath(lang, "/private-transfer");

  const wp = (key: string) => t(`shieldedWp.${key}`);

  const techLabels = [
    { key: "t1", label: wp("tech1Label"), pos: "top-[6%] start-[2%]" },
    { key: "t2", label: wp("tech2Label"), pos: "top-[28%] end-[0%]" },
    { key: "t3", label: wp("tech3Label"), pos: "bottom-[30%] start-[4%]" },
    { key: "t4", label: wp("tech4Label"), pos: "bottom-[6%] end-[2%]" },
  ];

  const useCases = [
    { icon: "🏦", title: wp("maTitle"), desc: wp("maDesc") },
    { icon: "👔", title: wp("payrollTitle"), desc: wp("payrollDesc") },
    { icon: "🔐", title: wp("insulationTitle"), desc: wp("insulationDesc") },
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
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: wp("metaTitle"),
            headline: wp("heroTitle"),
            description: wp("metaDesc"),
            url: canonicalUrl,
            author: { "@type": "Organization", name: "MRC GlobalPay" },
            publisher: {
              "@type": "FinancialService",
              name: "MRC GlobalPay",
              url: "https://mrcglobalpay.com",
            },
          })}
        </script>
      </Helmet>

      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* ── HERO ── */}
        <section className="relative py-16 md:py-24 lg:py-32">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 40%, hsl(270 100% 50% / 0.08) 0%, transparent 70%)",
            }}
          />

          <div className="container mx-auto max-w-6xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="mb-6 flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-400">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                {wp("badge")}
              </span>
            </motion.div>

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

        {/* ── SCHEMATIC: 3D Vault + Floating Labels ── */}
        <section className="relative py-12 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="relative mx-auto aspect-[16/9] max-w-4xl">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 800 450"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
              >
                <line x1="60" y1="50" x2="300" y2="170" stroke="#7000FF" strokeWidth="1" opacity="0.35" />
                <line x1="740" y1="140" x2="520" y2="190" stroke="#7000FF" strokeWidth="1" opacity="0.35" />
                <line x1="80" y1="330" x2="280" y2="260" stroke="#7000FF" strokeWidth="1" opacity="0.35" />
                <line x1="720" y1="400" x2="500" y2="280" stroke="#7000FF" strokeWidth="1" opacity="0.35" />
                {[
                  { cx: 60, cy: 50 }, { cx: 740, cy: 140 },
                  { cx: 80, cy: 330 }, { cx: 720, cy: 400 },
                ].map((p, i) => (
                  <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#7000FF" opacity="0.6">
                    <animate attributeName="r" values="3;6;3" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </svg>

              <motion.img
                src={vaultAsset}
                alt="Shielded Settlement Architecture"
                width={1024}
                height={1024}
                className="relative mx-auto w-[65%] drop-shadow-[0_0_60px_rgba(112,0,255,0.3)]"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ animation: "pulse 4s ease-in-out infinite" }}
              />

              {techLabels.map((step, i) => (
                <motion.div
                  key={step.key}
                  className={`absolute ${step.pos} max-w-[180px] rounded-lg border border-purple-500/20 bg-background/80 px-3 py-2 backdrop-blur-md`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 3}
                  variants={fadeUp}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-purple-400">
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

        {/* ── SECTION 1: The Glass House Liability ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
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

        {/* ── SECTION 2: Mechanics of Decoupling ── */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
                {wp("s2Tag")}
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                {wp("s2Title")}
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.1rem)] leading-relaxed text-muted-foreground">
                {wp("s2Body")}
              </p>
            </motion.div>

            <div className="mt-10 space-y-6">
              {(["ph1", "ph2", "ph3"] as const).map((k, i) => (
                <motion.div
                  key={k}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="flex gap-4 items-start"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 font-mono text-xs font-bold text-purple-400">
                    {["I", "II", "III"][i]}
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

        {/* ── SECTION 3: Sovereignty vs Anonymity ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
                {wp("s3Tag")}
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                {wp("s3Title")}
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.1rem)] leading-relaxed text-muted-foreground">
                {wp("s3Body")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 4: Use Cases ── */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
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
                  className="rounded-xl border border-purple-500/15 bg-background/60 p-6 backdrop-blur-sm"
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
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/5 px-5 py-2 text-xs font-semibold text-purple-300 backdrop-blur-md">
                🔒 {wp("privacyBadge")}
              </span>
            </motion.div>

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

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mt-10">
              <Link
                to={privateCta}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/90 to-purple-700/90 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(112,0,255,0.3)] backdrop-blur-md transition-all hover:shadow-[0_0_50px_rgba(112,0,255,0.5)] hover:scale-[1.02]"
              >
                {wp("cta")}
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ShieldedWhitepaper;
