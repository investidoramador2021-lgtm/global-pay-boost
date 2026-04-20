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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Shield, AlertTriangle, DollarSign } from "lucide-react";
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

const WhitepaperLoans = () => {
  const { t } = useTranslation();
  const canonicalUrl = usePageUrl("/blog/whitepapers/crypto-loans");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lendLink = langPath(lang, "/lend");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Crypto-Collateralized Liquidity Solutions — MRC Global Pay Whitepaper</title>
        <meta name="description" content="How do crypto-collateralized loans work in Canada? MRC Global Pay's non-custodial lending framework optimizes capital efficiency under FINTRAC MSB regulation." />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:title" content="Crypto-Collateralized Liquidity Solutions — MRC Global Pay Whitepaper" />
        <meta property="og:description" content="MRC Global Pay's non-custodial lending framework: capital efficiency under FINTRAC MSB regulation." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MRC Global Pay" />
        <meta property="og:image" content="https://mrcglobalpay.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crypto-Collateralized Liquidity Solutions — MRC Global Pay" />
        <meta name="twitter:description" content="Non-custodial lending under FINTRAC MSB regulation." />
        <meta name="twitter:image" content="https://mrcglobalpay.com/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: "Crypto-Collateralized Liquidity Solutions",
            headline: "Optimizing Capital Efficiency through Non-Custodial Lending Frameworks",
            description: "MRC Global Pay's lending protocol enables liquidity access without divestment of digital assets through decentralized collateral management and Canadian MSB oversight.",
            url: canonicalUrl,
            image: "https://mrcglobalpay.com/og-image.jpg",
            datePublished: "2026-04-14",
            identifier: "MRC-WP-LOAN-2026",
            author: { "@type": "Organization", name: "MRC Global Pay" },
            publisher: { "@type": "FinancialService", name: "MRC Global Pay", url: "https://mrcglobalpay.com" },
          })}
        </script>
      </Helmet>
      <HreflangTags />
      <StickyShareRail url={canonicalUrl} title="Crypto-Collateralized Liquidity Solutions — MRC Global Pay Whitepaper" />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          <motion.div className="flex flex-col items-center text-center gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="text-xs tracking-widest uppercase px-4 py-1.5 border-primary/30 text-primary">
                Whitepaper · MRC-WP-LOAN-2026
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight text-foreground font-serif">
              Crypto-Collateralized Liquidity Solutions
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Optimizing Capital Efficiency through Non-Custodial Lending Frameworks
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
                  This paper outlines the methodology of MRC Global Pay's lending protocol, which enables liquidity access
                  without the divestment of digital assets. By utilizing a decentralized collateral management system integrated
                  with Canadian MSB regulatory oversight, MRC provides a secure alternative to traditional liquidation, mitigating
                  tax exposure and maintaining market upside.
                </p>
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <FileText className="h-4 w-4" /> Download PDF (Coming Soon)
                </Button>
              </motion.div>

              {/* Section 1 */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
                className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold text-foreground font-serif">
                  How do crypto-collateralized loans work in Canada?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional asset liquidation triggers immediate capital gains tax events and eliminates potential future
                  appreciation. MRC Global Pay solves this via a Loan-to-Value (LTV) driven credit facility. Users deposit
                  crypto collateral and receive stablecoin liquidity without selling — preserving their position and
                  deferring taxable events.
                </p>
              </motion.div>

              {/* Section 2 — Architecture */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
                className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground font-serif">Technical Architecture</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Shield, title: "Collateral Custody", desc: "Assets are managed via non-custodial smart contracts. MRC Global Pay does not maintain private key access, ensuring insolvency protection for the user." },
                    { icon: AlertTriangle, title: "Margin Maintenance", desc: "Three-tier risk notification system — Green (Safe), Yellow (Warning at 75% LTV), Red (Liquidation threshold at 85% LTV)." },
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

                {/* LTV Formula */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" /> LTV Dynamics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Automated risk monitoring utilizes the following formula:
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 text-center overflow-x-auto">
                    <div className="text-lg md:text-xl font-mono text-foreground">
                      LTV = ( Principal<sub>stablecoin</sub> ÷ Market Value<sub>collateral</sub> ) × 100
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Where LTV is expressed as a percentage. A lower LTV indicates a safer position with greater collateral coverage.
                  </p>
                </div>
              </motion.div>

              {/* Section 3 — Compliance */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
                className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold text-foreground font-serif">Regulatory Compliance</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Operating under FINTRAC guidelines in Canada, MRC Global Pay implements rigorous KYC/AML protocols,
                  ensuring that all liquidity provided meets international banking standards for transparency and provenance.
                  As a <span className="font-semibold text-primary">Registered Canadian MSB (C100000015)</span>,
                  the platform maintains full regulatory accountability while delivering non-custodial settlement.
                </p>
              </motion.div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={lendLink}>
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Access Loan Platform
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

      <section className="container mx-auto max-w-3xl px-4 pb-16">
        <SocialShare
          url={canonicalUrl}
          title="Crypto-Collateralized Liquidity Solutions — MRC Global Pay Whitepaper"
          description="MRC Global Pay's non-custodial lending framework optimizes capital efficiency under FINTRAC MSB regulation."
        />
      </section>

      <SiteFooter />
    </div>
  );
};

export default WhitepaperLoans;
