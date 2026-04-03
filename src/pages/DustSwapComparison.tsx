import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShadowSeoFaq from "@/components/ShadowSeoFaq";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const comparisonJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "MRC GlobalPay Micro-Swap Service",
  description:
    "No-minimum crypto exchange with $0.30 minimum swap. No registration required. Non-custodial, instant settlement, 500+ assets.",
  url: "https://mrcglobalpay.com/dust-swap-comparison",
  brand: {
    "@type": "Brand",
    name: "MRC GlobalPay",
  },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0.30",
    highPrice: "1000000",
    priceCurrency: "USD",
    offerCount: "500",
    availability: "https://schema.org/InStock",
    url: "https://mrcglobalpay.com/dust-swap-comparison",
    description: "Crypto dust swaps starting at $0.30 minimum. No registration required.",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1200",
    bestRating: "5",
  },
};

type Feature = {
  label: string;
  mrc: boolean | string;
  changenow: boolean | string;
  simpleswap: boolean | string;
  changelly: boolean | string;
};

const features: Feature[] = [
  { label: "Minimum Swap Amount", mrc: "$0.30", changenow: "$2.00", simpleswap: "$10.00", changelly: "$10.00" },
  { label: "No Account Required", mrc: true, changenow: true, simpleswap: true, changelly: false },
  { label: "Fractal BTC Support", mrc: true, changenow: false, simpleswap: false, changelly: false },
  { label: "Crypto Dust Conversion", mrc: true, changenow: false, simpleswap: false, changelly: false },
  { label: "Non-Custodial Swaps", mrc: true, changenow: true, simpleswap: true, changelly: true },
  { label: "500+ Supported Assets", mrc: true, changenow: true, simpleswap: false, changelly: true },
  { label: "Fiat On-Ramp", mrc: true, changenow: true, simpleswap: false, changelly: true },
  { label: "Micro-Swap Optimization", mrc: true, changenow: false, simpleswap: false, changelly: false },
  { label: "Canadian MSB Registered", mrc: true, changenow: false, simpleswap: false, changelly: false },
];

const Cell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") {
    return <span className="font-body text-sm font-semibold text-foreground">{value}</span>;
  }
  return value ? (
    <CheckCircle className="mx-auto h-5 w-5 text-green-500" aria-label="Supported" />
  ) : (
    <XCircle className="mx-auto h-5 w-5 text-muted-foreground/40" aria-label="Not supported" />
  );
};

const DustSwapComparison = () => {
  return (
    <>
      <Helmet>
        <title>$0.30 Minimum Crypto Swap Comparison | No Registration Required | MRC GlobalPay</title>
        <meta
          name="description"
          content="Compare MRC GlobalPay's $0.30 minimum dust swaps vs ChangeNOW, SimpleSwap, and Changelly. No registration required. The best no-minimum crypto exchange in 2026."
        />
        <link rel="canonical" href="https://mrcglobalpay.com/dust-swap-comparison" />
        <meta property="og:title" content="$0.30 Minimum Crypto Swap Comparison | No Registration Required | MRC GlobalPay" />
        <meta
          property="og:description"
          content="$0.30 minimum dust swaps vs $10+ minimums on major exchanges. No registration required. Feature-by-feature comparison."
        />
        <meta property="og:url" content="https://mrcglobalpay.com/dust-swap-comparison" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="$0.30 Minimum Crypto Swap Comparison | No Registration Required" />
        <meta name="twitter:description" content="$0.30 minimum dust swaps vs $10+ minimums. No registration required. Best no-minimum crypto exchange." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22f69f45-cf65-4871-9af4-b68ab4027213/id-preview-243bf129--23f851ec-c820-43c7-bbe2-d2e830f7c268.lovable.app-1773521796493.png" />
        <script type="application/ld+json">{JSON.stringify(comparisonJsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              2026 Comparison
            </span>
            {/* Atomic Answer Block */}
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-5 text-left">
              <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary mb-2">Quick Answer</p>
              <p className="font-body text-base leading-relaxed text-foreground">
                MRC GlobalPay is the only non-custodial exchange supporting crypto dust swaps from $0.30 with Fractal Bitcoin support. Competitors enforce $10+ minimums, locking out small balances entirely.
              </p>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Micro-Swap Comparison: Who Actually Supports Dust?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              Most exchanges reject swaps under $10. MRC GlobalPay processes crypto dust as low as
              $0.30—no account, no delays, no minimums that lock out small balances.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
              Feature-by-Feature Breakdown
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-display text-sm font-semibold text-foreground">
                      Feature
                    </TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-primary">
                      MRC GlobalPay
                    </TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-foreground">
                      ChangeNOW
                    </TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-foreground">
                      SimpleSwap
                    </TableHead>
                    <TableHead className="text-center font-display text-sm font-semibold text-foreground">
                      Changelly
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((f) => (
                    <TableRow key={f.label}>
                      <TableCell className="font-body text-sm font-medium text-foreground">
                        {f.label}
                      </TableCell>
                      <TableCell className="text-center">
                        <Cell value={f.mrc} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Cell value={f.changenow} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Cell value={f.simpleswap} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Cell value={f.changelly} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-center font-body text-xs text-muted-foreground">
              Data verified March 2026. Competitor minimums may vary by asset pair.
            </p>
          </div>
        </section>

        {/* Why Dust Matters */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Why Crypto Dust Conversion Matters in 2026
            </h2>
            <div className="space-y-4 font-body leading-relaxed text-muted-foreground">
              <p>
                Millions of crypto wallets contain small, "unspendable" balances—often called{" "}
                <strong className="text-foreground">crypto dust</strong>. These are leftover
                fractions from trades, airdrops, or mining payouts that fall below the minimum swap
                threshold of most exchanges.
              </p>
              <h3 className="font-display text-lg font-bold text-foreground">
                The $10 Minimum Problem
              </h3>
              <p>
                Major non-custodial exchanges like SimpleSwap and Changelly enforce minimums of $10
                or more per swap. If you hold $3 worth of an obscure ERC-20 token, it's effectively
                locked in your wallet—worthless and inaccessible.
              </p>
              <h3 className="font-display text-lg font-bold text-foreground">
                How MRC GlobalPay Solves It
              </h3>
              <p>
                Our liquidity aggregation engine is optimized for micro-swaps. By routing through
                specialized liquidity pools and absorbing the fixed-cost overhead, we process swaps
                as low as <strong className="text-foreground">$0.30</strong>. No account creation, no
                delays—just paste your destination address and swap.
              </p>
              <h3 className="font-display text-lg font-bold text-foreground">
                Fractal Bitcoin: A Unique Advantage
              </h3>
              <p>
                MRC GlobalPay is one of the only platforms supporting{" "}
                <strong className="text-foreground">Fractal Bitcoin (fBTC)</strong> swaps. Convert
                Fractal BTC to Solana, Ethereum, or any of 500+ assets instantly through our
                non-custodial engine.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <ShadowSeoFaq />
    </>
  );
};

export default DustSwapComparison;
