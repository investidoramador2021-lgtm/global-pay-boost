import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, CheckCircle, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { getArticleBySlug, getOtherArticles } from "@/lib/authority-hub-data";
import { usePageUrl } from "@/hooks/use-page-url";

/** Long-form content for each article, keyed by slug */
const articleContent: Record<
  string,
  {
    understanding: string;
    partnerEcosystem: string;
    whyNonCustodial: string;
    faqItems: { q: string; a: string }[];
  }
> = {
  "why-non-custodial-is-safer": {
    understanding:
      "A non-custodial exchange never takes possession of your private keys or holds your funds in a centralized wallet. When you initiate a swap on MRC GlobalPay, your assets move directly from your wallet to the recipient wallet via ChangeNOW's institutional routing layer. At no point does MRC GlobalPay have the ability to freeze, seize, or access your cryptocurrency. This architecture eliminates the single biggest risk in crypto: exchange hacks. In 2024–2025 alone, custodial exchanges lost over $2.1 billion to breaches. Non-custodial platforms like MRC GlobalPay had zero losses because there is nothing to steal.",
    partnerEcosystem:
      "MRC GlobalPay routes all swaps through ChangeNOW, a leading non-custodial aggregator with 500+ integrated liquidity sources. Every transaction is secured by Fireblocks' Multi-Party Computation (MPC) technology — the same infrastructure used by Fidelity Digital Assets and BNY Mellon. Fireblocks' MPC eliminates single points of failure by splitting signing keys across multiple secure enclaves. No single server, employee, or process can access a complete private key.",
    whyNonCustodial:
      "Regulators worldwide are increasingly scrutinizing custodial exchanges. The SEC, ESMA, and FINTRAC have all signaled that non-custodial models reduce systemic risk. By 2026, over 40% of retail crypto volume is projected to flow through non-custodial channels. MRC GlobalPay is ahead of this curve — operating as a registered Canadian MSB while maintaining a fully non-custodial architecture. This means full regulatory compliance without compromising user sovereignty.",
    faqItems: [
      {
        q: "Does MRC GlobalPay ever hold my crypto?",
        a: "No. MRC GlobalPay is 100% non-custodial. Your assets move directly via ChangeNOW's infrastructure. We never have access to your private keys or funds.",
      },
      {
        q: "What happens if MRC GlobalPay goes offline?",
        a: "Your funds are never at risk because we never hold them. Any in-progress swaps are handled by ChangeNOW's infrastructure, which operates independently.",
      },
      {
        q: "Is non-custodial legal in Canada?",
        a: "Yes. MRC GlobalPay is a registered Money Services Business (MSB) with FINTRAC. Non-custodial exchanges are fully compliant under Canadian AML/CTF regulations.",
      },
    ],
  },
  "canadian-fintrac-msb": {
    understanding:
      "A Money Services Business (MSB) registration with FINTRAC (Financial Transactions and Reports Analysis Centre of Canada) is the highest standard of regulatory compliance for crypto businesses operating in Canada. MRC GlobalPay holds this registration, meaning we comply with all Canadian Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) obligations. This includes suspicious transaction reporting, record-keeping, and ongoing compliance program maintenance. Unlike unregistered offshore exchanges, our MSB status provides legal accountability and user protection under Canadian federal law.",
    partnerEcosystem:
      "Our compliance framework is reinforced by our technology partners. ChangeNOW provides AML screening on every transaction using industry-standard blockchain analytics. Fireblocks adds an additional security layer with SOC 2 Type II certified infrastructure. Together, this partner ecosystem ensures that every swap processed through MRC GlobalPay meets or exceeds regulatory requirements — without requiring users to surrender personal data for standard transactions.",
    whyNonCustodial:
      "Traditional custodial exchanges require mandatory identity verification because they hold user funds — creating a honeypot of personal data and assets. MRC GlobalPay's non-custodial model means we process swaps without ever holding assets, reducing the regulatory burden while maintaining full FINTRAC compliance. This is the future of compliant crypto: regulatory accountability without invasive data collection. Our automated risk-prevention system only flags transactions that meet specific high-risk thresholds, keeping the experience frictionless for 99%+ of users.",
    faqItems: [
      {
        q: "What is an MSB registration?",
        a: "A Money Services Business (MSB) registration with FINTRAC is a Canadian federal license for businesses that deal in virtual currencies. It requires ongoing AML compliance, transaction reporting, and regular audits.",
      },
      {
        q: "Does MRC GlobalPay require account registration?",
        a: "No. MRC GlobalPay is registration-free for most users. Our non-custodial architecture and automated risk-prevention system ensure compliance without blanket identity verification. Only transactions flagged as high-risk may require standard verification.",
      },
      {
        q: "How does this protect me as a user?",
        a: "MSB registration means MRC GlobalPay is legally accountable under Canadian law. Unlike unregistered offshore platforms, we can't disappear with user funds (we never hold them) and we're subject to regular regulatory oversight.",
      },
    ],
  },
  "our-liquidity-partners": {
    understanding:
      "MRC GlobalPay doesn't operate its own liquidity pools. Instead, we aggregate liquidity from 500+ sources through our partnership with ChangeNOW — one of the largest non-custodial exchange aggregators in the world. This means you always get the best available rate across dozens of DEXs, CEXs, and liquidity providers. Every swap is secured end-to-end by Fireblocks' institutional-grade MPC (Multi-Party Computation) technology, which protects transaction signing without any single point of failure.",
    partnerEcosystem:
      "ChangeNOW processes over $5 billion in monthly volume across 500+ cryptocurrency pairs. Their aggregation engine scans rates from Binance, Kraken, Uniswap, and dozens of other sources in real-time to find the optimal route for your swap. Fireblocks secures this entire flow with MPC wallets — the same technology trusted by 1,800+ institutional clients including Revolut, Galaxy Digital, and BlockFi. Fireblocks has processed over $6 trillion in digital assets with zero security incidents.",
    whyNonCustodial:
      "By partnering with ChangeNOW rather than operating custodial liquidity pools, MRC GlobalPay eliminates the risk of impermanent loss, pool exploits, and smart contract vulnerabilities that have cost DeFi users billions. Your swap is executed atomically: you send your assets, and you receive your target token. No staking, no wrapping, no pool tokens. Just a clean, direct swap secured by institutional-grade infrastructure.",
    faqItems: [
      {
        q: "Who provides the liquidity for MRC GlobalPay swaps?",
        a: "Liquidity is aggregated from 500+ sources through ChangeNOW, including major exchanges like Binance and Kraken, plus dozens of DEX protocols. This ensures the best available rate for every swap.",
      },
      {
        q: "What is Fireblocks MPC technology?",
        a: "Multi-Party Computation (MPC) splits private keys across multiple secure servers so no single machine ever holds a complete key. This eliminates single points of failure and is the gold standard for institutional crypto security.",
      },
      {
        q: "Has Fireblocks ever been hacked?",
        a: "No. Fireblocks has processed over $6 trillion in digital assets with zero security incidents. They hold SOC 2 Type II certification and are trusted by 1,800+ institutional clients worldwide.",
      },
    ],
  },
  "swap-without-registration": {
    understanding:
      "MRC GlobalPay is built on a zero-account architecture. You don't need to create an account, verify your email, upload an ID, or provide any personal information to swap crypto. Simply select your tokens, enter an amount above $0.30, paste your destination wallet address, and confirm. The entire process takes under 60 seconds. This isn't a loophole — it's by design. Our non-custodial model means we never hold your funds, so there's no regulatory requirement for blanket identity verification on standard transactions.",
    partnerEcosystem:
      "ChangeNOW's infrastructure processes your swap without creating any user accounts on their end either. The transaction is identified solely by a unique swap ID — not by your name, email, or IP address. Fireblocks secures the transaction signing process using MPC technology that doesn't require user identity. Combined with MRC GlobalPay's Canadian MSB registration, this creates a fully compliant, fully private swap experience.",
    whyNonCustodial:
      "Custodial exchanges require mandatory identity verification because they hold your money — legally, they must know who you are. Non-custodial platforms like MRC GlobalPay process instant swaps without ever holding assets, which means the regulatory framework is fundamentally different. We maintain full FINTRAC compliance through automated risk monitoring, not through collecting your personal data. This is the privacy-preserving model that regulators are increasingly endorsing as the standard for 2026 and beyond.",
    faqItems: [
      {
        q: "Why doesn't MRC GlobalPay require registration?",
        a: "Because we're non-custodial — we never hold your funds. Mandatory verification requirements exist primarily for custodial services that hold user assets. Our automated risk-prevention system ensures AML compliance without blanket identity collection.",
      },
      {
        q: "Is it legal to swap crypto without an account?",
        a: "Yes. MRC GlobalPay is a registered Canadian MSB operating in full compliance with FINTRAC regulations. Non-custodial, registration-free swaps are legal and explicitly permitted under Canadian law.",
      },
      {
        q: "What data does MRC GlobalPay store?",
        a: "We store minimal transaction data (swap ID, amounts, wallet addresses) required for compliance. We do not store names, emails, phone numbers, IP addresses, or any personal identification information.",
      },
    ],
  },
  "tracking-your-micro-swap": {
    understanding:
      "Every swap processed through MRC GlobalPay — even micro-swaps as small as $0.30 — is fully verifiable on the blockchain. When you initiate a swap, you receive a unique transaction ID that you can use to track your transaction in real-time. This on-chain transparency means you never have to trust MRC GlobalPay with your funds or hope that a support ticket gets answered. The blockchain itself is your receipt, your tracking system, and your proof of settlement.",
    partnerEcosystem:
      "ChangeNOW provides real-time swap status updates through their API, which MRC GlobalPay surfaces in the user interface. You can see exactly when your deposit is detected, when the swap is being processed, and when your target token is sent to your wallet. Fireblocks' transaction monitoring adds an additional layer of visibility, with institutional-grade audit trails for every swap. This dual-layer tracking system ensures complete transparency from initiation to settlement.",
    whyNonCustodial:
      "On-chain verification is only possible with non-custodial swaps. When you use a custodial exchange, your 'balance' is just a number in their database — there's no blockchain transaction until you withdraw. With MRC GlobalPay, every swap creates a real, verifiable blockchain transaction. This means you can independently confirm that your funds arrived, verify the exchange rate you received, and prove the transaction occurred — all without trusting any centralized party.",
    faqItems: [
      {
        q: "How do I track my MRC GlobalPay swap?",
        a: "After initiating a swap, you receive a unique swap ID. Use this ID on the MRC GlobalPay status page to see real-time updates. You can also verify the transaction directly on the blockchain using the transaction hash provided.",
      },
      {
        q: "Can I verify micro-swaps on-chain?",
        a: "Yes. Even swaps as small as $0.30 create verifiable on-chain transactions. You can use any blockchain explorer (e.g., Etherscan, Solscan) to independently verify your swap.",
      },
      {
        q: "What if my swap doesn't arrive?",
        a: "Every swap is tracked in real-time. If there's a delay (usually due to network congestion), the status page will show the current state. ChangeNOW's support team monitors all transactions and can assist with any issues within minutes.",
      },
    ],
  },
};

const LearnArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug ?? "");
  const pageUrl = usePageUrl(`/learn/${slug}`);

  if (!article) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Article Not Found</h1>
            <p className="mt-2 font-body text-muted-foreground">This article doesn't exist yet.</p>
            <Link to="/learn" className="mt-4 inline-block text-primary hover:underline">
              Browse all articles →
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { topic, category, key_fact, trust_signal } = article;
  const content = articleContent[slug ?? ""];
  const others = getOtherArticles(slug ?? "");

  const faqItems = content?.faqItems ?? [];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${topic}: Secure Micro-Swaps at MRC GlobalPay`,
      description: `${key_fact}. ${trust_signal}. Learn how MRC GlobalPay protects your assets.`,
      url: pageUrl,
      datePublished: "2026-03-01",
      dateModified: "2026-04-06",
      author: {
        "@type": "Organization",
        name: "MRC GlobalPay",
        url: "https://mrcglobalpay.com",
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
        { "@type": "ListItem", position: 2, name: "Trust Hub", item: "https://mrcglobalpay.com/learn" },
        { "@type": "ListItem", position: 3, name: topic, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${topic} — MRC GlobalPay`,
      url: pageUrl,
      about: {
        "@type": "Organization",
        name: "MRC GlobalPay",
        url: "https://mrcglobalpay.com",
        knowsAbout: [
          "Non-Custodial Cryptocurrency Swaps",
          "FINTRAC Compliance",
          "Crypto Dust Conversion",
        ],
      },
    },
  ];

  const metaDesc = `${key_fact}. ${trust_signal}. Non-custodial, FINTRAC-registered MSB.`;

  return (
    <>
      <Helmet>
        <title>{`${topic} — Secure Micro-Swaps | MRC GlobalPay (2026)`}</title>
        <meta name="description" content={metaDesc.length > 160 ? metaDesc.slice(0, 157) + "..." : metaDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${topic} — MRC GlobalPay`} />
        <meta property="og:description" content={`${key_fact}. ${trust_signal}.`} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd.map((ld, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
        ))}
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        <nav className="border-b border-border bg-muted/20 py-3" aria-label="Breadcrumb">
          <div className="container mx-auto max-w-5xl px-4">
            <ol className="flex items-center gap-2 font-body text-xs text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li>/</li>
              <li><Link to="/learn" className="hover:text-foreground">Trust Hub</Link></li>
              <li>/</li>
              <li className="font-medium text-foreground">{topic}</li>
            </ol>
          </div>
        </nav>

        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              {category}
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {topic}: Secure Micro-Swaps at <span className="text-primary">MRC GlobalPay</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {key_fact}. {trust_signal}.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-primary/5 py-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="rounded-xl border border-primary/20 bg-card p-6">
              <h2 className="sr-only">Key Takeaways</h2>
              <div className="flex flex-col gap-3 font-body text-sm sm:flex-row sm:items-center sm:justify-center sm:gap-8">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Shield className="h-4 w-4 text-primary" /> MRC GlobalPay does <strong className="ml-1">not</strong> store user private keys.
                </span>
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" /> Registered Canadian MSB.
                </span>
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Lock className="h-4 w-4 text-primary" /> Zero-custody risk.
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
            <article className="space-y-12">
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Understanding {topic}
                </h2>
                <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">
                  {content?.understanding ?? `${key_fact}. ${trust_signal}. MRC GlobalPay is a registered Canadian MSB providing non-custodial swaps from $0.30.`}
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Asset Protection: The Partner Ecosystem (ChangeNOW & Fireblocks)
                </h2>
                <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">
                  {content?.partnerEcosystem ?? "MRC GlobalPay routes all swaps through ChangeNOW's institutional-grade aggregation engine, secured by Fireblocks Multi-Party Computation (MPC) technology. This dual-layer infrastructure ensures your assets are protected by the same security standards used by major financial institutions."}
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Why Non-Custodial is the 2026 Industry Standard
                </h2>
                <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">
                  {content?.whyNonCustodial ?? "Non-custodial exchanges eliminate the single largest attack vector in cryptocurrency: centralized fund storage. MRC GlobalPay never holds your crypto, meaning there's nothing to hack, freeze, or lose."}
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Compliance & Security FAQ
                </h2>
                <div className="mt-6 space-y-6">
                  {faqItems.map((faq, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground">{faq.q}</h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-muted/30 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground">Related Resources</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/compare"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Compare Exchanges <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/solutions"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Swap Solutions <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/transparency-security"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Transparency & Security <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground/70">
                    Trust Signals
                  </h3>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="font-body text-sm text-foreground">FINTRAC Registered MSB</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="font-body text-sm text-foreground">Non-Custodial Architecture</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="font-body text-sm text-foreground">Partnered with ChangeNOW</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="font-body text-sm text-foreground">Secured by Fireblocks MPC</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="/#exchange"
                  className="block rounded-xl bg-primary px-6 py-3.5 text-center font-display text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Swap Now — From $0.30
                </a>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground/70">
                    More from Trust Hub
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {others.map((a) => (
                      <li key={a.slug}>
                        <Link
                          to={`/learn/${a.slug}`}
                          className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {a.topic} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default LearnArticle;
