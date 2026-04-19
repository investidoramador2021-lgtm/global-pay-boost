import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, Scale, Lock, Eye, FileCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { AUTHORITY_ARTICLES } from "@/lib/authority-hub-data";
import { usePageUrl } from "@/hooks/use-page-url";

const categoryIcon: Record<string, typeof Shield> = {
  Security: Shield,
  Legal: Scale,
  Infrastructure: Lock,
  Privacy: Eye,
  Transparency: FileCheck,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Trust & Transparency Hub — MRC GlobalPay",
  description:
    "Learn how MRC GlobalPay protects your assets with non-custodial architecture, FINTRAC compliance, and institutional-grade security.",
  url: "https://mrcglobalpay.com/learn",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: AUTHORITY_ARTICLES.length,
    itemListElement: AUTHORITY_ARTICLES.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.topic,
      url: `https://mrcglobalpay.com/learn/${a.slug}`,
    })),
  },
  publisher: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
    knowsAbout: [
      "Non-Custodial Cryptocurrency Swaps",
      "FINTRAC Compliance",
      "Crypto Dust Conversion",
      "Micro-Swap Technology",
    ],
  },
};

const LearnDirectory = () => {
  const pageUrl = usePageUrl("/learn");

  return (
    <>
      <Helmet>
        <title>Trust & Transparency Hub | MRC GlobalPay (2026)</title>
        <meta
          name="description"
          content="Learn how MRC GlobalPay protects your crypto: non-custodial swap architecture, FINTRAC MSB registration, Fireblocks-grade security, and zero custody risk across 6,000+ supported assets."
        />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Trust & Transparency Hub | MRC GlobalPay" />
        <meta property="og:description" content="Non-custodial architecture, FINTRAC compliance, and Fireblocks security." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              {AUTHORITY_ARTICLES.length} Articles
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Trust & Transparency <span className="text-primary">Hub</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              How MRC GlobalPay protects your assets with non-custodial architecture, Canadian MSB registration, and institutional-grade security via ChangeNOW & Fireblocks.
            </p>
          </div>
        </section>

        {/* Key Takeaway Block */}
        <section className="border-b border-border bg-primary/5 py-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center font-body text-sm font-semibold text-foreground">
              <span>🔒 MRC GlobalPay does <strong>not</strong> store user private keys.</span>
              <span>🇨🇦 Registered Canadian MSB.</span>
              <span>✅ Zero-custody risk.</span>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {AUTHORITY_ARTICLES.map((article) => {
                const Icon = categoryIcon[article.category] || Shield;
                return (
                  <Link
                    key={article.slug}
                    to={`/learn/${article.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {article.category}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {article.topic}
                    </h2>
                    <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                      {article.key_fact}. {article.trust_signal}.
                    </p>
                    <span className="mt-4 inline-block text-sm font-medium text-primary">
                      Read more →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default LearnDirectory;
