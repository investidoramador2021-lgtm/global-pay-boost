import { Landmark, ShieldCheck, Layers, Coins, Zap, Handshake } from "lucide-react";

const benefits = [
  {
    icon: Landmark,
    title: "Canadian MSB & PSP Authorized",
    description:
      "Registered with FINTRAC (#C100000015) and authorized by the Bank of Canada as a Payment Service Provider.",
  },
  {
    icon: ShieldCheck,
    title: "Fully Non-Custodial",
    description:
      "We never hold your funds. Swaps move directly wallet-to-wallet — you stay in control end-to-end.",
  },
  {
    icon: Layers,
    title: "6,000+ Assets & Tokenized Stocks",
    description:
      "Swap across 6,000+ cryptocurrencies, trending AI tokens, and tokenized equities (xStocks) from one widget.",
  },
  {
    icon: Coins,
    title: "Micro-Swaps from $0.30",
    description:
      "Built for crypto dust and small trades. Convert leftover balances that other exchanges reject.",
  },
  {
    icon: Zap,
    title: "Instant Wallet-to-Wallet",
    description:
      "Most swaps settle in under 60 seconds with a transparent 0.5% inclusive fee — no hidden charges.",
  },
  {
    icon: Handshake,
    title: "0.1%–0.4% Lifetime Affiliate",
    description:
      "Promoters earn lifetime commissions on every referred swap, paid in BTC. Built for serious affiliate partners.",
  },
];

const WhyChooseSection = () => (
  <section className="bg-background py-12 sm:py-16 lg:py-20">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
          Why MRC Global Pay
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Why Traders Choose <span className="text-gradient-neon">MRC Global Pay</span>
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
          Built for both casual swappers and serious affiliate partners — backed by Canadian regulatory infrastructure.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated sm:p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground sm:text-lg">{title}</h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center font-body text-sm text-muted-foreground sm:text-base">
        Join the growing number of users swapping instantly with{" "}
        <span className="font-semibold text-foreground">Canadian-regulated security</span>.
      </p>
    </div>
  </section>
);

export default WhyChooseSection;
