import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Network } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageUrl } from "@/hooks/use-page-url";
import { getLangFromPath, langPath } from "@/i18n";

const AuroraWhitepaper = () => {
  const canonicalUrl = usePageUrl("/blog/aurora-ecosystem-mrc-globalpay-swap-aurora");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const swapHref = langPath(lang, "/");

  const title = "MRC Global Pay Joins the Aurora Ecosystem: Swap AURORA Tokens Instantly, No Registration Required";
  const metaDescription =
    "MRC Global Pay is now a verified swap partner in the Aurora ecosystem. Swap AURORA native and ERC-20 tokens instantly — no registration, no KYC, 500+ pairs, sub-60-second settlement.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: metaDescription,
    datePublished: "2026-04-20",
    dateModified: "2026-04-20",
    author: { "@type": "Organization", name: "MRC Global Pay" },
    publisher: {
      "@type": "Organization",
      name: "MRC Global Pay",
      logo: { "@type": "ImageObject", url: "https://mrcglobalpay.com/icon-512.png" },
    },
    mainEntityOfPage: canonicalUrl,
    keywords:
      "AURORA token, Aurora network, NEAR Intents, AURORA ERC-20, swap AURORA, NEAR Protocol, cross-chain swap, non-custodial AURORA exchange, Aurora ecosystem partner, MRC Global Pay Aurora",
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Aurora ecosystem?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aurora is a product studio and infrastructure provider within the NEAR Intents ecosystem. It builds cross-chain execution tools that allow any application to accept users, assets, and actions from any chain — without requiring bridging or network switching. NEAR Intents, Aurora's core execution layer, processes approximately $2.5 billion in monthly volume in 2026.",
        },
      },
      {
        "@type": "Question",
        name: "Can I swap AURORA on MRC Global Pay without KYC?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MRC Global Pay is a non-custodial platform and does not require registration or identity verification for standard swap volumes. As a Canadian MSB, the platform is AML/ATF compliant — but this compliance does not translate into mandatory KYC for users conducting regular swaps.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between AURORA native and AURORA ERC-20?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AURORA native refers to the token on Aurora's own network — the EVM-compatible environment built on NEAR Protocol. AURORA ERC-20 is the same token represented on the Ethereum mainnet. MRC Global Pay supports swaps for both versions, including cross-standard swaps between the two without requiring a manual bridge.",
        },
      },
      {
        "@type": "Question",
        name: "What assets can I swap AURORA into on MRC Global Pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MRC Global Pay supports 500+ assets as swap destinations from AURORA — including BTC, ETH, USDT, USDC, SOL, BNB, XRP, XMR, and hundreds of altcoins and tokens across multiple networks. Swap rates are sourced from 20+ liquidity providers for best-execution pricing.",
        },
      },
      {
        "@type": "Question",
        name: "What is NEAR Intents and how does it relate to Aurora?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NEAR Intents is the cross-chain execution protocol developed within the NEAR ecosystem. Aurora operates as the primary product studio and infrastructure provider for NEAR Intents — building the developer tools, widgets, and integration layers that make intent-based execution accessible to third-party applications. Aurora's Intents Widget, launched in February 2026, allows any app to embed cross-chain swap and funding flows without custom backend development.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} | MRC Global Pay</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <Network className="h-4 w-4" />
            Ecosystem Announcement
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> April 20, 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> 6 min read
            </span>
            <span>MRC Global Pay</span>
          </div>
        </header>

        {/* Intro */}
        <p className="mb-10 font-body text-lg leading-8 text-muted-foreground">
          MRC Global Pay is now part of the Aurora ecosystem — bringing our non-custodial, registration-free swap
          infrastructure to one of the most technically advanced cross-chain environments in Web3. Here's what this
          means for AURORA holders, NEAR Intents users, and anyone moving assets across chains without wanting to hand
          over their identity to do it.
        </p>

        {/* Pairing card */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
              MRC
            </div>
            <span className="font-display text-2xl font-light text-muted-foreground">+</span>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(160_100%_45%/0.12)] font-display text-lg font-bold text-[hsl(160_100%_45%)]">
              AUR
            </div>
          </div>
          <p className="text-center font-display text-lg font-semibold text-foreground">
            MRC Global Pay × Aurora Ecosystem
          </p>
          <p className="mt-3 text-center font-body text-sm leading-relaxed text-muted-foreground">
            MRC Global Pay is now listed on the official Aurora ecosystem page as a verified swap and exchange partner —
            supporting AURORA token swaps across its native network and ERC-20 standard, with no registration required.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Swap pairs", value: "500+", note: "Including AURORA native & ERC-20" },
              { label: "NEAR Intents vol.", value: "$2.5B", note: "Monthly, across the network" },
              { label: "Swap time", value: "<60s", note: "No registration, no KYC" },
              { label: "Compliance", value: "MSB", note: "Canadian registered" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-background/50 p-3 text-center">
                <div className="font-display text-xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 font-body text-[11px] font-medium uppercase tracking-wider text-primary">
                  {stat.label}
                </div>
                <div className="mt-1 font-body text-[11px] leading-snug text-muted-foreground">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <article className="space-y-6 font-body text-base leading-8 text-muted-foreground">
          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            What is Aurora — and why does it matter in 2026?
          </h2>
          <p>
            Aurora is not just another EVM chain. It is a product studio and infrastructure layer operating within the
            NEAR Intents ecosystem, building what it calls cross-chain execution products for the multichain internet.
            The distinction is important: Aurora's architecture is designed around intent-based execution — meaning
            users express what they want accomplished (swap this asset, fund this action, move this collateral) and the
            protocol handles the routing, bridging, and execution automatically, across any supported chain.
          </p>
          <p>
            In practical terms: no manual bridging. No "wrong network" errors. No switching wallets between chains. The
            infrastructure handles it. This is the technical premise that has driven NEAR Intents to approximately $2.5
            billion in monthly processing volume in 2026 — used in production by wallets and trading applications across
            the ecosystem.
          </p>
          <p>
            Aurora operates as both a high-performance EVM environment (the Aurora Engine) and a cross-chain execution
            layer. Builders can deploy EVM-compatible applications on NEAR Protocol, gaining Ethereum compatibility,
            sub-second block times, and NEAR's sharding-based scalability — all without traditional L2 infrastructure
            overhead.
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            The NEAR Intents infrastructure underneath Aurora
          </h2>
          <p>
            The deeper story is NEAR's chain abstraction roadmap, which spent 2025 moving from theory to production
            reality. Chain signatures technology reached full generalization, block times dropped to 600ms, and finality
            improved to 1.2 seconds. DEX activity on NEAR more than doubled quarter-over-quarter in early 2025. Aurora
            is the product layer that converts this infrastructure into accessible developer tools — most recently the
            Intents Widget, a plug-and-play integration layer that lets any application embed cross-chain swap and
            funding flows without building custom routing logic.
          </p>
          <p>
            MRC Global Pay joining this ecosystem means our swap infrastructure is now part of this network — listed as a
            verified partner on the Aurora ecosystem page alongside other exchanges, DeFi protocols, and Web3
            infrastructure providers building on the same cross-chain foundation.
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            What MRC Global Pay now supports for Aurora users
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "AURORA native swaps",
                desc: "Swap AURORA on its native network directly — into ETH, USDT, BTC, SOL, or any of 500+ supported assets. No wrapping, no manual bridging steps.",
              },
              {
                title: "AURORA ERC-20 swaps",
                desc: "Swap the ERC-20 version of AURORA on Ethereum — same seamless experience, same zero-registration policy, same sub-60-second execution.",
              },
              {
                title: "Cross-standard swaps",
                desc: "Swap between AURORA native and AURORA ERC-20 directly — without going through a centralized exchange or managing a manual bridge interface.",
              },
              {
                title: "No registration, no KYC",
                desc: "MRC Global Pay is a non-custodial platform. We never hold your assets, never require account creation, and process swaps from any wallet you control.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-2 font-display text-base font-semibold text-foreground">{item.title}</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            How to swap AURORA on MRC Global Pay
          </h2>
          <ol className="space-y-5">
            {[
              {
                step: "1",
                title: "Select your pair",
                desc: "Visit mrcglobalpay.com and choose AURORA as your input or output asset. Select the network version you're working with — native or ERC-20. Choose your destination asset (USDT, ETH, BTC, USDC, and 500+ others).",
              },
              {
                step: "2",
                title: "Enter your receiving address",
                desc: "Provide the wallet address where you want to receive your output asset. No account creation, no email, no identity verification required for standard swap volumes.",
              },
              {
                step: "3",
                title: "Send your AURORA",
                desc: "Send AURORA to the deposit address shown. The swap executes automatically via our aggregated liquidity network — 20+ swap providers routing for best execution and competitive rates.",
              },
              {
                step: "4",
                title: "Receive your funds",
                desc: "The converted asset arrives directly in your wallet — typically within 60 seconds. MRC Global Pay never holds your funds; this is a non-custodial flow from start to finish.",
              },
            ].map((s) => (
              <li key={s.step} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {s.step}
                </div>
                <div>
                  <h3 className="mb-1 font-display text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Why non-custodial matters for an ecosystem like Aurora
          </h2>
          <p>
            Aurora's entire design philosophy is built around removing intermediaries from cross-chain execution.
            Intent-based infrastructure exists precisely because manual bridging, multi-step swaps, and centralized
            custody introduce friction, counterparty risk, and unnecessary data exposure at every stage.
          </p>
          <p>
            MRC Global Pay's non-custodial model aligns with this philosophy directly. When you swap AURORA through MRC
            GlobalPay, you remain in control of your assets throughout the process — there is no custodial wallet, no
            frozen withdrawal queue, no exchange holding your tokens between steps. The swap executes
            peer-to-protocol, with funds moving from your wallet to the destination wallet without passing through an
            MRC-controlled intermediate.
          </p>
          <p>
            As a Canadian MSB (Money Services Business) registered with FINTRAC, MRC Global Pay operates under AML/ATF
            compliance obligations — but without the KYC-for-everything approach taken by most centralized exchanges.
            Compliance and privacy are not mutually exclusive when the platform is built correctly.
          </p>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Aurora and the broader cross-chain landscape in 2026
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 font-display text-base font-semibold text-foreground">
                What Aurora brings to the ecosystem
              </h3>
              <ul className="space-y-2 font-body text-sm leading-relaxed text-muted-foreground">
                <li>• EVM-compatible chains running as NEAR smart contracts</li>
                <li>• Intent-based cross-chain execution — no bridging UX</li>
                <li>• $2.5B+ monthly volume through NEAR Intents</li>
                <li>• 600ms block times, 1.2s finality</li>
                <li>• NEAR chain signatures for multi-chain tx execution</li>
                <li>• Aurora DAO governance over the $AURORA token</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 font-display text-base font-semibold text-foreground">What MRC Global Pay adds</h3>
              <ul className="space-y-2 font-body text-sm leading-relaxed text-muted-foreground">
                <li>• Non-custodial AURORA swaps — native and ERC-20</li>
                <li>• Zero registration — accessible from any wallet globally</li>
                <li>• 500+ output pairs for AURORA holders to exit or rotate</li>
                <li>• Canadian MSB compliance without KYC friction</li>
                <li>• 20+ aggregated liquidity providers for best-rate execution</li>
                <li>• Sub-60s swap settlement, 24/7 availability</li>
              </ul>
            </div>
          </div>
          <p>
            The addition of MRC Global Pay to the Aurora ecosystem reflects a broader trend in 2026: the best cross-chain
            infrastructure becomes significantly more valuable when paired with accessible, compliant on-ramps and
            off-ramps. Aurora's technical architecture solves the execution problem — moving assets across chains
            without friction. MRC Global Pay solves the access problem — converting those assets into anything else a
            user needs, without requiring them to open a CEX account or pass identity verification to do it.
          </p>

          <blockquote className="my-10 rounded-xl border-s-4 border-primary bg-muted/40 p-6">
            <p className="mb-3 font-display text-3xl text-primary">"</p>
            <p className="font-body text-base leading-relaxed text-foreground">
              Joining the Aurora ecosystem is a natural extension of what MRC Global Pay is built to do. Aurora's
              cross-chain infrastructure and NEAR Intents represent exactly the kind of permissionless, execution-first
              architecture that aligns with our non-custodial model. AURORA holders can now access our full swap
              liquidity without any of the registration overhead typical of centralized venues.
            </p>
            <footer className="mt-3 font-body text-sm font-medium text-muted-foreground">— MRC Global Pay Team</footer>
          </blockquote>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">Swap AURORA now</h2>
          <p>
            AURORA is available to swap immediately on MRC Global Pay — both the native network token and the ERC-20
            version on Ethereum. Whether you're rotating profits from an Aurora DeFi position, converting event-based
            AURORA rewards, or simply moving into a different asset class, the swap is available now with no account
            required.
          </p>

          <div className="my-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center sm:p-8">
            <p className="mb-2 font-display text-xl font-bold text-foreground sm:text-2xl">Swap AURORA instantly</p>
            <p className="mb-5 font-body text-sm text-muted-foreground">
              Native & ERC-20 · 500+ pairs · No registration · Canadian MSB registered
            </p>
            <Link
              to={swapHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Swap AURORA <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <h2 className="mt-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "What is the Aurora ecosystem?",
                a: "Aurora is a product studio and infrastructure provider within the NEAR Intents ecosystem. It builds cross-chain execution tools that allow any application to accept users, assets, and actions from any chain — without requiring bridging or network switching. NEAR Intents, Aurora's core execution layer, processes approximately $2.5 billion in monthly volume in 2026.",
              },
              {
                q: "Can I swap AURORA on MRC Global Pay without KYC?",
                a: "Yes. MRC Global Pay is a non-custodial platform and does not require registration or identity verification for standard swap volumes. As a Canadian MSB, the platform is AML/ATF compliant — but this compliance does not translate into mandatory KYC for users conducting regular swaps.",
              },
              {
                q: "What is the difference between AURORA native and AURORA ERC-20?",
                a: "AURORA native refers to the token on Aurora's own network — the EVM-compatible environment built on NEAR Protocol. AURORA ERC-20 is the same token represented on the Ethereum mainnet. MRC Global Pay supports swaps for both versions, including cross-standard swaps between the two without requiring a manual bridge.",
              },
              {
                q: "What assets can I swap AURORA into on MRC Global Pay?",
                a: "MRC Global Pay supports 500+ assets as swap destinations from AURORA — including BTC, ETH, USDT, USDC, SOL, BNB, XRP, XMR, and hundreds of altcoins and tokens across multiple networks. Swap rates are sourced from 20+ liquidity providers for best-execution pricing.",
              },
              {
                q: "What is NEAR Intents and how does it relate to Aurora?",
                a: "NEAR Intents is the cross-chain execution protocol developed within the NEAR ecosystem. Aurora operates as the primary product studio and infrastructure provider for NEAR Intents — building the developer tools, widgets, and integration layers that make intent-based execution accessible to third-party applications. Aurora's Intents Widget, launched in February 2026, allows any app to embed cross-chain swap and funding flows without custom backend development.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-2 font-display text-base font-semibold text-foreground">{item.q}</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AuroraWhitepaper;
