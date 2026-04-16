import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, ArrowRight, FileText, Shield, Landmark, Zap, ScrollText, DollarSign, TrendingUp, Coins } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { fetchAllPosts, type BlogPost } from "@/lib/blog-data";
import { getLangFromPath, langPath } from "@/i18n";

const WHITEPAPERS = [
  {
    title: "Infrastructure Persistence & Automated Settlement Rails",
    subtitle: "Permanent Bridge Architecture",
    excerpt: "How Stateless Address Persistence and Deterministic Routing transform fragmented liquidity into a permanent financial utility for corporate treasuries and industrial mining.",
    path: "/permanent-bridge/whitepaper",
    icon: Landmark,
    accent: "42 100% 58%",
    category: "Institutional Whitepaper",
    tags: ["Settlement Rails", "Non-Custodial", "Mining Automation", "Corporate Treasury"],
  },
  {
    title: "Decoupling On-Chain Identity: Shielded Settlement Architecture",
    subtitle: "Corporate Privacy Sovereignty",
    excerpt: "How Input Masking, Path Randomization, and Output Normalization protect HNWIs and corporate entities from wallet fingerprinting and heuristic analysis.",
    path: "/private-transfer/whitepaper",
    icon: Shield,
    accent: "272 100% 68%",
    category: "Institutional Whitepaper",
    tags: ["Shielded Routing", "Privacy", "M&A Confidentiality", "Executive Payroll"],
  },
  {
    title: "Q2 2026 Liquidity Expansion: Non-Custodial Cross-Chain Settlement",
    subtitle: "New Asset Integrations",
    excerpt: "USDC on ZkSync Era, USDS (Sky), edgeX (EDGE), and PancakeSwap CAKE on Aptos. Layer-2 powerhouses and next-gen stablecoins reducing transaction friction globally.",
    path: "/liquidity-expansion",
    icon: Zap,
    accent: "190 100% 55%",
    category: "Institutional Whitepaper",
    tags: ["ZkSync", "Aptos", "Layer-2", "Stablecoins"],
  },
  {
    title: "The Sovereign Settlement: Erasing the Friction of Global Commerce",
    subtitle: "Stateless Invoicing Protocol",
    excerpt: "How 168-hour rate locks, inclusive 0.5% pricing, and cross-chain bridge architecture replace correspondent banking with mathematical certainty for global settlement.",
    path: "/sovereign-settlement",
    icon: ScrollText,
    accent: "32 100% 50%",
    category: "Institutional Whitepaper",
    tags: ["Rate Lock", "Inclusive Pricing", "Monero Privacy", "LTC Settlement"],
  },
  {
    title: "Crypto-Collateralized Liquidity Solutions",
    subtitle: "Non-Custodial Lending Frameworks",
    excerpt: "How crypto-collateralized loans work in Canada. LTV-driven credit facilities, non-custodial smart contracts, and three-tier risk management under FINTRAC MSB regulation.",
    path: "/blog/whitepapers/crypto-loans",
    icon: DollarSign,
    accent: "25 100% 55%",
    category: "Institutional Whitepaper",
    tags: ["Crypto Loans", "LTV", "Non-Custodial", "FINTRAC"],
  },
  {
    title: "The Digital Asset Yield Engine",
    subtitle: "Institutional-Grade Interest Accrual",
    excerpt: "Is the MRC Earn yield guaranteed? Peer-to-Institutional lending with 150% over-collateralization, daily compounding interest, and Source-Back withdrawal security.",
    path: "/blog/whitepapers/digital-yield",
    icon: TrendingUp,
    accent: "160 100% 45%",
    category: "Institutional Whitepaper",
    tags: ["Earn Yield", "P2I Lending", "Compound Interest", "Source-Back"],
  },
  {
    title: "PAXG vs. XAUt in 2026: Which Gold-Backed Token Belongs in Your Portfolio?",
    subtitle: "Tokenized Gold Research",
    excerpt: "The institutional guide to tokenized gold. Compare NYDFS regulation vs. Swiss offshore liquidity, on-chain fees, DeFi yield strategies, and physical redemption mechanics.",
    path: "/research/paxg-vs-xaut-2026",
    icon: Coins,
    accent: "45 100% 55%",
    category: "Research",
    tags: ["PAXG", "XAUt", "Tokenized Gold", "DeFi Yield"],
  },
  {
    title: "RaveDAO (RAVE) Research: 6,000% Rally Analysis & Risk Report",
    subtitle: "Web3 Music · High-Risk Token Analysis",
    excerpt: "A deep dive into RaveDAO (RAVE) tokenomics, the April 2026 short squeeze, and critical supply concentration risks. 90% of supply sits in 3 wallets — read before you buy.",
    path: "/research/ravedao-rave-token-analysis-2026",
    icon: TrendingUp,
    accent: "320 90% 60%",
    category: "Research",
    tags: ["RaveDAO", "RAVE Token", "Short Squeeze", "Supply Risk"],
  },
];

const Blog = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);
  const blogUrl = `https://mrcglobalpay.com${lp("/blog")}`;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MRC GlobalPay Blog",
    url: "https://mrcglobalpay.com/blog",
    description: "MRC GlobalPay is your crypto meta aggregator and DEX aggregator hub. Expert swap guides, market analysis, and security insights for 500+ coins.",
    publisher: {
      "@type": "Organization",
      name: "MRC GlobalPay",
      url: "https://mrcglobalpay.com",
    },
  };

  return (
    <>
      <Helmet>
        <title>Crypto Meta Aggregator Blog — Swap Guides & Analysis | MRC GlobalPay</title>
        <meta name="description" content="MRC GlobalPay is your crypto meta aggregator and DEX aggregator hub. Expert swap guides, market analysis, and security insights for 500+ coins." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={blogUrl} />
        <meta property="og:title" content="Crypto Meta Aggregator Blog — Swap Guides & Analysis | MRC GlobalPay" />
        <meta property="og:description" content="MRC GlobalPay is your crypto meta aggregator and DEX aggregator hub. Expert swap guides and market analysis." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={blogUrl} />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crypto Meta Aggregator Blog — Swap Guides & Analysis | MRC GlobalPay" />
        <meta name="twitter:description" content="MRC GlobalPay is your crypto meta aggregator and DEX aggregator hub. Expert swap guides and market analysis." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <link rel="alternate" type="application/rss+xml" title="MRC GlobalPay Blog RSS" href="https://mrcglobalpay.com/rss.xml" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/50 py-12 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Crypto Meta Aggregator <span className="text-primary">Insights</span> & Guides
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-base text-muted-foreground sm:text-lg">
              As a leading crypto meta aggregator and DEX aggregator, MRC GlobalPay compares rates across multiple exchanges in real time. Explore our expert analysis, step-by-step swap guides, and security best practices from our blockchain research team.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-background py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Why Use a Meta Aggregator for Crypto Swaps?</h2>
              <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                A meta aggregator scans dozens of decentralized exchanges (DEXs), centralized platforms, and liquidity pools simultaneously to find you the best available rate for any token pair. Unlike a single DEX aggregator that only routes through one protocol, a crypto meta aggregator like MRC GlobalPay compares quotes from multiple DEX aggregators and instant-swap services at once — ensuring you always get the lowest slippage and tightest spread.
              </p>
              <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                Whether you're converting dust-sized balances starting at $0.30 or executing larger swaps across 500+ cryptocurrencies, our meta aggregator engine handles the complexity so you don't have to. No registration, no minimum limits — just the best rate delivered in under 60 seconds. Browse our guides below to learn advanced swap strategies, security tips, and how to maximize value with a DEX aggregator workflow.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Whitepapers */}
        <section className="border-b border-border py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Institutional Whitepapers</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {WHITEPAPERS.map((wp) => (
                <Link
                  key={wp.path}
                  to={lp(wp.path)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-xl sm:p-8"
                  style={{ borderColor: `hsl(${wp.accent} / 0.25)` }}
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
                    style={{ background: `hsl(${wp.accent})` }}
                  />
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="rounded-full px-3 py-1 font-body text-xs font-semibold"
                      style={{ background: `hsl(${wp.accent} / 0.12)`, color: `hsl(${wp.accent})` }}
                    >
                      {wp.category}
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <wp.icon className="mt-1 h-8 w-8 shrink-0" style={{ color: `hsl(${wp.accent})` }} />
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        {wp.title}
                      </h3>
                      <p className="mt-1 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {wp.subtitle}
                      </p>
                      <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                        {wp.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {wp.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-muted px-2 py-0.5 font-body text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 font-body text-sm font-medium text-primary">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid gap-8 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <div className="mb-3 h-5 w-24 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="mt-3 h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg sm:p-8"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>

                    <h2 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                        <span className="text-border">•</span>
                        <span>{post.author.name}</span>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center gap-1 font-body text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-muted px-2 py-0.5 font-body text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-muted/50 py-12 text-center sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Ready to Swap?</h2>
            <p className="mx-auto mt-3 max-w-lg font-body text-muted-foreground">
              500+ cryptocurrencies. Best rates. Zero registration. Settled in under 60 seconds.
            </p>
            <a
              href="/#exchange"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-105"
            >
              Start Swapping <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};

export default Blog;
