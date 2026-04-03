import { Helmet } from "react-helmet-async";
import { Zap } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";

const guideJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "MRC GlobalPay Crypto Dust Swap Service",
  description:
    "Convert unspendable crypto dust into usable assets. $0.30 minimum. No registration required. Non-custodial, 500+ tokens supported.",
  url: "https://mrcglobalpay.com/resources/crypto-dust-guide",
  brand: {
    "@type": "Brand",
    name: "MRC GlobalPay",
  },
  offers: {
    "@type": "Offer",
    price: "0.30",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
    url: "https://mrcglobalpay.com/resources/crypto-dust-guide",
    description: "Crypto dust swaps starting at $0.30 minimum. No registration required.",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Swap Crypto Dust for Under $1",
  description:
    "Step-by-step guide to converting small, unspendable crypto balances into usable tokens using MRC GlobalPay.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Select your dust token",
      text: "Open MRC GlobalPay and choose the token you want to swap from the list of 500+ supported assets.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Enter the amount",
      text: "Enter any amount — swaps start as low as $0.30. No minimums enforced.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Paste your destination wallet",
      text: "Enter the wallet address where you want to receive the swapped tokens.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Send and receive",
      text: "Send the deposit to the generated address. Your swapped tokens arrive in under 60 seconds.",
    },
  ],
  tool: {
    "@type": "HowToTool",
    name: "MRC GlobalPay Exchange Widget",
  },
  totalTime: "PT2M",
};

const CryptoDustGuide = () => {
  return (
    <>
      <Helmet>
        <title>Crypto Dust Swap Guide — $0.30 Minimum, No Registration Required | MRC GlobalPay</title>
        <meta
          name="description"
          content="The complete 2026 guide to swapping crypto dust. $0.30 minimum, no registration required. Convert unspendable wallet balances with 500+ tokens supported."
        />
        <link rel="canonical" href="https://mrcglobalpay.com/resources/crypto-dust-guide" />
        <meta property="og:title" content="Crypto Dust Swap Guide — $0.30 Minimum, No Registration Required | MRC GlobalPay" />
        <meta
          property="og:description"
          content="Convert unspendable crypto dust into usable assets. $0.30 minimum, no registration required. 500+ tokens supported."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://mrcglobalpay.com/resources/crypto-dust-guide" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Crypto Dust Swap Guide — $0.30 Minimum, No Registration Required" />
        <meta name="twitter:description" content="Convert unspendable crypto dust. $0.30 minimum, no registration required. 500+ tokens supported." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <script type="application/ld+json">{JSON.stringify(guideJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        <article className="container mx-auto max-w-3xl px-4 py-12 sm:py-20">
          <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Crypto Dust Guide</span>
          </nav>

          {/* At a Glance Block */}
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary mb-2">
              <Zap className="mr-1 inline h-3.5 w-3.5" />
              At a Glance
            </p>
            <p className="font-body text-base leading-relaxed text-foreground">
              The most efficient way to swap crypto dust is using a non-custodial aggregator like MRC GlobalPay that supports transactions as low as $0.30 — no account, no minimums, and 500+ tokens supported.
            </p>
            <ul className="mt-3 space-y-1 font-body text-sm text-foreground/80">
              <li className="flex items-center gap-2"><span className="text-primary">•</span> Minimum swap: $0.30</li>
              <li className="flex items-center gap-2"><span className="text-primary">•</span> No registration required</li>
              <li className="flex items-center gap-2"><span className="text-primary">•</span> 500+ tokens across 6+ chains</li>
            </ul>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
            The Complete 2026 Guide to Swapping Crypto Dust &amp; Small Balances
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Millions of crypto wallets contain tiny, <strong>unspendable wallet balances</strong> —
            fractions of tokens too small for traditional exchanges to process. This guide explains
            exactly how to recover that value using the leading <strong>no minimum crypto exchange</strong>.
          </p>

          <hr className="my-10 border-border" />

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              What Is Crypto Dust?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Crypto dust refers to tiny amounts of cryptocurrency left in your wallet after trades
              or transfers — often worth less than $1. These <strong>unspendable wallet balances</strong> sit
              idle because most exchanges enforce minimum swap thresholds of $10 or more.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Dust accumulates across every chain: leftover SOL from an NFT mint, residual ETH from
              a failed gas estimate, or fractional BTC from a mining payout. Over time, even a single
              wallet can hold dozens of dust positions across multiple tokens.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Why Most Exchanges Have $10+ Minimums
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Traditional crypto exchanges batch orders through centralized order books that require
              minimum trade sizes to remain profitable. The overhead of matching, settling, and
              recording a $0.50 trade on a CEX is the same as a $5,000 trade — making micro-swaps
              economically unviable for their model.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              The Metamask Dust Fix Problem
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MetaMask users frequently search for a <strong>Metamask dust fix</strong> — a way to clear
              out residual token balances that can't be swapped on Uniswap or other DEXs due to gas
              costs exceeding the value of the tokens. The result: wallets cluttered with worthless
              remnants and no clear path to consolidation.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              Why Low Fee Micro-Swaps Matter
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              A true <strong>low fee micro-swap</strong> platform must solve two problems simultaneously:
              remove minimum thresholds <em>and</em> keep fees proportional. If a swap costs $3 in fees
              on a $0.50 trade, the minimum is effectively $3 regardless of what the UI says.
              MRC GlobalPay aggregates liquidity from top-tier providers to keep fees competitive
              even on the smallest trades.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              How MRC GlobalPay Processes Swaps from $0.30
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our non-custodial engine connects directly to protocol-level liquidity pools —
              bypassing the order-book overhead that forces other platforms to set high minimums.
              This architecture enables genuine <strong>crypto dust swaps</strong> starting at $0.30.
            </p>

            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              Step-by-Step: Convert Your Unspendable Wallet Balance
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground leading-relaxed">
              <li>
                <strong>Select your dust token</strong> — Choose from 500+ supported assets including
                BTC, ETH, SOL, and low-cap tokens.
              </li>
              <li>
                <strong>Enter any amount</strong> — Swaps start as low as $0.30. There is no enforced minimum.
              </li>
              <li>
                <strong>Paste your destination wallet</strong> — Enter the address where you want to
                receive the swapped tokens.
              </li>
              <li>
                <strong>Send and receive</strong> — Deposit to the generated address. Your swapped
                tokens arrive in under 60 seconds.
              </li>
            </ol>
          </section>

          {/* 2026 Network Dust Thresholds Table */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              2026 Network Dust Thresholds
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every blockchain has a practical minimum transaction size determined by network fees and UTXO/account model constraints. Here's how they compare to our $0.30 swap floor:
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left font-display font-semibold text-foreground">Network</th>
                    <th className="px-4 py-3 text-center font-display font-semibold text-foreground">Dust Threshold</th>
                    <th className="px-4 py-3 text-center font-display font-semibold text-foreground">Avg Fee (2026)</th>
                    <th className="px-4 py-3 text-center font-display font-semibold text-primary">MRC Min Swap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { network: "Bitcoin (BTC)", dust: "546 sats (~$0.55)", fee: "$0.80–$3.00", mrc: "$0.30" },
                    { network: "Ethereum (ETH)", dust: "No protocol min", fee: "$0.50–$8.00", mrc: "$0.30" },
                    { network: "Solana (SOL)", dust: "0.00089 SOL (~$0.15)", fee: "$0.001", mrc: "$0.30" },
                    { network: "Fractal Bitcoin", dust: "546 sats (~$0.55)", fee: "$0.05–$0.20", mrc: "$0.30" },
                    { network: "BNB Chain", dust: "No protocol min", fee: "$0.03–$0.10", mrc: "$0.30" },
                    { network: "Polygon (POL)", dust: "No protocol min", fee: "$0.001–$0.01", mrc: "$0.30" },
                  ].map((row) => (
                    <tr key={row.network} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{row.network}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.dust}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.fee}</td>
                      <td className="px-4 py-3 text-center font-semibold text-primary">{row.mrc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Data as of March 2026. Dust thresholds and fees vary by network congestion.</p>
          </section>

          {/* Section 4 - Supported Chains */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Supported Chains &amp; Tokens for Dust Swaps
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MRC GlobalPay supports over 500 assets across all major chains — including Ethereum,
              Solana, BNB Chain, Avalanche, Polygon, Arbitrum, Optimism, and Fractal Bitcoin.
              Whether you're consolidating ETH dust or recovering forgotten SOL, we've got you covered.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 mt-6">
              {[
                "Bitcoin (BTC) dust → USDT",
                "Ethereum (ETH) dust → SOL",
                "Solana (SOL) dust → USDC",
                "Polygon (MATIC) dust → ETH",
                "Arbitrum (ARB) dust → BTC",
                "Fractal Bitcoin (FB) → SOL",
              ].map((pair) => (
                <div
                  key={pair}
                  className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground"
                >
                  {pair}
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Frequently Asked Questions About Crypto Dust
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Is there a minimum for crypto swaps on MRC GlobalPay?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  No. We are a <strong>no minimum crypto exchange</strong> that processes swaps as
                  low as $0.30, depending on the coin pair.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Can I fix my Metamask dust without high gas fees?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes. Our <strong>Metamask dust fix</strong> approach routes swaps through aggregated
                  liquidity — not on-chain DEX contracts — avoiding the gas overhead that makes small
                  swaps impractical on Uniswap or PancakeSwap.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  What makes a low fee micro-swap platform different?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  A genuine <strong>low fee micro-swap</strong> platform keeps fees proportional to
                  the trade size. We achieve this by aggregating liquidity from multiple providers,
                  ensuring competitive rates even on sub-dollar trades.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Ready to Clear Your Crypto Dust?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start swapping from $0.30 — no account, no minimums, no delays.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Swapping Now
            </Link>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
};

export default CryptoDustGuide;
