import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Zap, ArrowRight, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import ExchangeWidget from "@/components/ExchangeWidget";
import { getSolutionBySlug, getRandomSolutions, SWAP_SOLUTIONS } from "@/lib/swap-solutions-data";
import { usePageUrl } from "@/hooks/use-page-url";

const SolutionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const solutionSlug = slug?.replace("how-to-swap-", "") ?? "";
  const solution = getSolutionBySlug(solutionSlug);
  const pageUrl = usePageUrl(`/solutions/${slug}`);

  if (!solution) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Solution Not Found</h1>
            <p className="mt-2 font-body text-muted-foreground">This swap guide doesn't exist yet.</p>
            <Link to="/solutions" className="mt-4 inline-block text-primary hover:underline">Browse all solutions →</Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { from_token, to_token, use_case, network_advantage } = solution;
  const others = getRandomSolutions(solutionSlug, 4);

  const faqItems = [
    {
      q: `What is the minimum amount to swap ${from_token} to ${to_token}?`,
      a: `MRC GlobalPay processes ${from_token} to ${to_token} swaps from just $0.30 — the industry's lowest minimum. Most competitors require $5–$50 minimum deposits, locking out small balances.`,
    },
    {
      q: `Do I need to register to swap ${from_token} to ${to_token}?`,
      a: `No. MRC GlobalPay is completely registration-free. No email, no ID, no account creation. Just select ${from_token} → ${to_token}, enter your amount, paste your wallet, and confirm.`,
    },
    {
      q: `How long does a ${from_token} to ${to_token} swap take?`,
      a: `Most ${from_token} to ${to_token} swaps settle in under 60 seconds. Speed depends on network confirmation times, but our aggregated liquidity ensures the fastest available route.`,
    },
    {
      q: `Is it safe to swap ${from_token} to ${to_token} on MRC GlobalPay?`,
      a: `Yes. MRC GlobalPay is a Canadian Registered Money Services Business (MSB) under FINTRAC. All swaps are non-custodial and secured via Fireblocks infrastructure. We never hold your funds.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to Swap ${from_token} to ${to_token} with No Minimum Deposit`,
      description: `Step-by-step guide to swap ${from_token} to ${to_token} from just $0.30. ${network_advantage}.`,
      url: pageUrl,
      totalTime: "PT1M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0.30" },
      tool: [{ "@type": "HowToTool", name: "MRC GlobalPay Exchange" }],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: `Select ${from_token} → ${to_token}`,
          text: `Open MRC GlobalPay and choose ${from_token} as your "Send" token and ${to_token} as your "Receive" token.`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Enter Any Amount Above $0.30",
          text: `Type the amount of ${from_token} you want to swap. Any amount worth $0.30 or more is accepted.`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Paste Wallet & Confirm",
          text: `Enter your destination ${to_token} wallet address and confirm the swap. Settlement completes in under 60 seconds.`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com/" },
        { "@type": "ListItem", position: 2, name: "Solutions", item: "https://mrcglobalpay.com/solutions" },
        { "@type": "ListItem", position: 3, name: `${from_token} to ${to_token}`, item: pageUrl },
      ],
    },
  ];

  const relatedCompareSlug = from_token.toLowerCase() === "btc" ? "binance" : from_token.toLowerCase() === "eth" ? "uniswap" : "changenow";

  return (
    <>
      <Helmet>
        <title>{`How to Swap ${from_token} to ${to_token} — No Minimum (2026 Guide)`}</title>
        <meta name="description" content={`Swap ${from_token} to ${to_token} from just $0.30. ${network_advantage}. Registration-free, non-custodial, under 60 seconds.`} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`Swap ${from_token} to ${to_token} — No Minimum Deposit (2026)`} />
        <meta property="og:description" content={`${network_advantage}. From $0.30, registration-free.`} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd.map((ld, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
        ))}
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="border-b border-border bg-muted/20 py-3" aria-label="Breadcrumb">
          <div className="container mx-auto max-w-5xl px-4">
            <ol className="flex items-center gap-2 font-body text-xs text-muted-foreground">
              <li><a href="/" className="hover:text-foreground">Home</a></li>
              <li>/</li>
              <li><a href="/solutions" className="hover:text-foreground">Solutions</a></li>
              <li>/</li>
              <li className="font-medium text-foreground">{from_token} to {to_token}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              {use_case} · 2026 Guide
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              How to Swap {from_token} to {to_token} with No Minimum Deposit (2026 Guide)
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {network_advantage}. Swap from just $0.30 — no registration, no account, under 60 seconds.
            </p>
          </div>
        </section>

        {/* Content + Trust Sidebar */}
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-20 lg:flex lg:gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Section 1 */}
            <section className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                The {from_token} Micro-Swap Challenge
              </h2>
              <div className="space-y-4 font-body leading-relaxed text-muted-foreground">
                <p>
                  Millions of wallets hold small {from_token} balances — remnants of past trades, airdrops, or
                  mining rewards. These <strong className="text-foreground">micro-balances</strong> are effectively
                  trapped: most exchanges enforce minimums of $5–$50, making {from_token} dust impossible to convert.
                </p>
                <p>
                  For {use_case.toLowerCase()} users, this is a critical pain point. Your {from_token} sits idle while
                  market conditions change, and consolidation fees on most platforms exceed the balance itself.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Why {from_token} Swaps are Usually Blocked under $10
              </h2>
              <div className="space-y-4 font-body leading-relaxed text-muted-foreground">
                <p>
                  Traditional exchanges set high minimums because processing micro-transactions isn't profitable
                  at their fee structures. Network fees, slippage, and operational costs make sub-$10 swaps
                  a loss for most platforms.
                </p>
                <p>
                  MRC GlobalPay solves this with <strong className="text-primary">aggregated liquidity</strong> and
                  optimized routing. We process {from_token} → {to_token} swaps from just{" "}
                  <strong className="text-primary">$0.30</strong> by batching micro-transactions across
                  multiple liquidity pools. Our edge: <strong className="text-foreground">{network_advantage}</strong>.
                </p>
                <p>
                  <a href={`/compare/mrc-vs-${relatedCompareSlug}`} className="text-primary hover:underline" title={`Compare MRC GlobalPay vs ${relatedCompareSlug}`}>
                    See how we compare to other exchanges →
                  </a>
                </p>
              </div>
            </section>

            {/* Section 3: How-to */}
            <section className="mb-12">
              <h2 className="mb-8 font-display text-2xl font-bold text-foreground sm:text-3xl">
                3-Step Guide to Swap {from_token} to {to_token}
              </h2>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: `Select ${from_token} → ${to_token}`,
                    desc: `Open MRC GlobalPay and choose ${from_token} as your "Send" token and ${to_token} as your "Receive" token. We support 6,000+ assets across all major chains.`,
                  },
                  {
                    step: "2",
                    title: "Enter Any Amount Above $0.30",
                    desc: `Type the amount of ${from_token} you want to swap. There's no upper limit and no minimum above $0.30. Our engine finds the best rate across aggregated liquidity pools.`,
                  },
                  {
                    step: "3",
                    title: "Paste Your Wallet & Confirm",
                    desc: `Enter your destination ${to_token} wallet address and confirm. Settlement completes in under 60 seconds. No account, no email, no registration required.`,
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                      <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Live Widget */}
            <section className="mb-12 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="mb-4 text-center font-display text-lg font-bold text-foreground">
                Swap {from_token} to {to_token} Now
              </h3>
              <ExchangeWidget />
            </section>

            {/* Section 4: FAQ */}
            <section>
              <h2 className="mb-8 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqItems.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-border bg-card p-5">
                    <summary className="cursor-pointer font-display text-sm font-bold text-foreground group-open:mb-3">
                      {f.q}
                    </summary>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Trust Sidebar (desktop) */}
          <aside className="mt-12 lg:mt-0 lg:w-64 lg:shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="font-display text-sm font-bold text-foreground">Canadian Registered MSB</span>
                </div>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">
                  Licensed &amp; compliant under FINTRAC. Your swaps are processed through a regulated money services business.
                </p>
                <a href="/transparency-security" className="mt-2 inline-block font-body text-xs text-primary hover:underline" title="View MRC GlobalPay compliance details">
                  View compliance details →
                </a>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <span className="font-display text-sm font-bold text-foreground">Fireblocks Secured</span>
                </div>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">
                  Enterprise-grade MPC custody infrastructure. Non-custodial — we never hold your private keys.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground/70 mb-3">Quick Stats</h4>
                <ul className="space-y-2 font-body text-xs text-muted-foreground">
                  <li className="flex justify-between"><span>Minimum Swap</span><span className="font-bold text-primary">$0.30</span></li>
                  <li className="flex justify-between"><span>Assets</span><span className="font-bold text-foreground">500+</span></li>
                  <li className="flex justify-between"><span>Avg Speed</span><span className="font-bold text-foreground">&lt; 60s</span></li>
                  <li className="flex justify-between"><span>Registration</span><span className="font-bold text-foreground">None</span></li>
                </ul>
              </div>

              <a
                href="/"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                title={`Swap ${from_token} to ${to_token} now on MRC GlobalPay`}
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                Swap Now — From $0.30
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>

        {/* Browse Others */}
        <section className="border-t border-border bg-muted/20 py-12">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-6 text-center font-display text-xl font-bold text-foreground">
              More Swap Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <a
                  key={o.slug}
                  href={`/solutions/how-to-swap-${o.slug}`}
                  title={`How to swap ${o.from_token} to ${o.to_token} with no minimum`}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {o.from_token} → {o.to_token}
                  </h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    {o.use_case} · From ${o.min_amount_usd}
                  </p>
                </a>
              ))}
            </div>
            <p className="mt-6 text-center">
              <a href="/solutions" className="font-body text-sm text-primary hover:underline">
                View all {SWAP_SOLUTIONS.length} swap guides →
              </a>
            </p>
          </div>
        </section>

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-sm lg:hidden">
          <a
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-display text-sm font-bold text-primary-foreground"
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Swap {from_token} → {to_token} Now
          </a>
        </div>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default SolutionPage;
