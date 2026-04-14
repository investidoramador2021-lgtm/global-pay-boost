import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Shield, TrendingUp, Droplets, Lock } from "lucide-react";
import HreflangTags from "@/components/HreflangTags";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" as const },
  }),
};

const AuthoritySidebar = () => (
  <aside className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-5 sticky top-24">
    <div className="flex items-center gap-2 text-primary">
      <Shield className="h-5 w-5" />
      <span className="text-sm font-semibold tracking-wide uppercase">Regulatory Authority</span>
    </div>
    <div className="space-y-3 text-sm text-muted-foreground">
      <div>
        <p className="font-medium text-foreground">MRC Pay International Corp.</p>
        <p>Registered Money Services Business</p>
        <p className="text-primary font-mono text-xs mt-1">MSB ID: C100000015</p>
      </div>
      <hr className="border-border/40" />
      <div className="flex items-start gap-2">
        <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Headquarters</p>
          <p>116 Albert St, Suite 200</p>
          <p>Ottawa, ON K1P 5G3, Canada</p>
        </div>
      </div>
      <hr className="border-border/40" />
      <div>
        <p className="font-medium text-foreground">Compliance Framework</p>
        <p>FINTRAC · PCMLTFA · KYC/AML</p>
      </div>
    </div>
  </aside>
);

const WhitepaperYield = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/blog/whitepapers/digital-yield");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lendLink = langPath(lang, "/lend");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Digital Asset Yield Engine — MRC GlobalPay Whitepaper</title>
        <meta name="description" content="Is the MRC Earn yield guaranteed? Explore institutional-grade interest accrual through Peer-to-Institutional lending with 150% over-collateralization and daily compounding." />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: "The Digital Asset Yield Engine",
            headline: "Institutional-Grade Interest Accrual and Risk Management",
            description: "MRC GlobalPay Earn protocol delivers daily compounding interest via Peer-to-Institutional lending pools with 150% over-collateralization.",
            url: canonicalUrl,
            datePublished: "2026-04-14",
            identifier: "MRC-WP-EARN-2026",
            author: { "@type": "Organization", name: "MRC GlobalPay" },
            publisher: { "@type": "FinancialService", name: "MRC GlobalPay", url: "https://mrcglobalpay.com" },
          })}
        </script>
      </Helmet>
      <HreflangTags path="/blog/whitepapers/digital-yield" />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          <motion.div className="flex flex-col items-center text-center gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-xs tracking-widest uppercase px-4 py-1.5 border-primary/30 text-primary">
                Whitepaper · MRC-WP-EARN-2026
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight text-foreground font-serif">
              The Digital Asset Yield Engine
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Institutional-Grade Interest Accrual and Risk Management
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_300px] gap-10">
            {/* Main Content */}
            <div className="space-y-12">
              {/* Executive Summary */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground font-serif">Executive Summary</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The MRC GlobalPay 'Earn' protocol is a high-fidelity yield generation engine designed for stablecoin
                  and digital asset optimization. This document explores the mechanics of daily compound interest,
                  over-collateralized lending pools, and the security protocols that protect principal capital while
                  delivering consistent returns.
                </p>
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <FileText className="h-4 w-4" /> Download PDF (Coming Soon)
                </Button>
              </motion.div>

              {/* Section 1 — Yield Mechanics */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
                className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold text-foreground font-serif">
                  Is the MRC Earn yield guaranteed?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Unlike inflationary staking models, MRC yield is generated through <strong className="text-foreground">Peer-to-Institutional (P2I)</strong> lending.
                  All deposited assets are lent to verified institutional borrowers at a minimum of 150% over-collateralization.
                  While yield rates reflect real market demand and are not "guaranteed" in the traditional sense,
                  the over-collateralization model provides structural protection for depositors' principal.
                </p>
              </motion.div>

              {/* Section 2 — Math Model */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
                className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground font-serif">Mathematical Model of Accrual</h2>
                <p className="text-muted-foreground">
                  MRC utilizes a daily compounding interest model to maximize APY for the end-user:
                </p>
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="bg-muted/50 rounded-lg p-6 text-center overflow-x-auto">
                    <div className="text-lg md:text-2xl font-mono text-foreground leading-relaxed">
                      A = P × (1 + r/365)<sup>365t</sup>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <span className="font-mono font-semibold text-primary">A</span>
                      <span className="text-muted-foreground ml-2">Final balance</span>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <span className="font-mono font-semibold text-primary">P</span>
                      <span className="text-muted-foreground ml-2">Principal deposited</span>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <span className="font-mono font-semibold text-primary">r</span>
                      <span className="text-muted-foreground ml-2">Annual interest rate</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Section 3 — Security */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
                className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground font-serif">Security and Withdrawal Liquidity</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Droplets, title: "Instant Liquidity", desc: "MRC maintains a 20% liquidity reserve to ensure immediate withdrawal capability at any time." },
                    { icon: Lock, title: "Source-Back Protocol", desc: "For fraud prevention, all withdrawals are programmatically restricted to the original source wallet address, verified during the initial deposit." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={lendLink}>
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Access Earn Platform
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <AuthoritySidebar />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default WhitepaperYield;
