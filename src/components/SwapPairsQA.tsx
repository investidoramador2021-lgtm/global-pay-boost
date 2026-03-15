import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const swapPairs = [
  {
    pair: "BTC to USDT",
    q: "How long does a BTC to USDT swap take on MRC GlobalPay?",
    a: "Our liquidity rails execute BTC to USDT swaps instantly, typically settling in under 1 minute. Bitcoin network confirmations are the only variable — we start processing the moment the first confirmation arrives.",
  },
  {
    pair: "ETH to SOL",
    q: "Can I swap ETH to SOL without creating an account?",
    a: "Yes. MRC GlobalPay requires zero registration. Enter your SOL wallet address, send your ETH to our deposit address, and receive SOL in your wallet within 45-90 seconds on average.",
  },
  {
    pair: "USDT to BTC",
    q: "What exchange rate do I get for USDT to BTC swaps?",
    a: "We aggregate rates from multiple top-tier liquidity providers in real-time to guarantee you the best available market rate. The rate you see before confirming is the rate you get — zero hidden spreads.",
  },
  {
    pair: "SOL to USDC",
    q: "Is there a minimum amount for SOL to USDC swaps?",
    a: "Minimum amounts are dynamically set based on network fees and are displayed before you confirm. For SOL to USDC, the minimum is typically very low — often under $5 equivalent.",
  },
  {
    pair: "XRP to ETH",
    q: "How does MRC GlobalPay handle XRP to ETH cross-chain swaps?",
    a: "Our automated settlement engine handles cross-chain routing seamlessly. You send XRP, our system locks the rate, executes the conversion, and delivers ETH to your wallet — all in one flow, typically under 2 minutes.",
  },
  {
    pair: "DOGE to BTC",
    q: "Are DOGE to BTC swaps available 24/7?",
    a: "Absolutely. MRC GlobalPay operates 24/7/365 with no downtime. DOGE to BTC swaps run on fully automated liquidity rails, so you can swap at any time — weekends, holidays, any hour.",
  },
  {
    pair: "BNB to ETH",
    q: "What are the fees for BNB to ETH swaps?",
    a: "Our fees are fully transparent and baked into the displayed rate. There are no hidden charges, no withdrawal fees, and no surprises. The amount shown is the exact amount you will receive.",
  },
  {
    pair: "LTC to USDT",
    q: "How secure are LTC to USDT swaps on MRC GlobalPay?",
    a: "Every swap is encrypted end-to-end. We never custody your funds — crypto flows directly between your wallet and our liquidity partners. No accounts, no stored data, no attack surface.",
  },
];

const SwapPairsQA = () => {
  return (
    <section id="swap-pairs" className="bg-accent py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Instant Swap Pairs — <span className="text-gradient-neon">Your Questions Answered</span>
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Real answers about real swap pairs. Speed, fees, and settlement — all covered.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            {swapPairs.map((item, i) => (
              <AccordionItem
                key={i}
                value={`pair-${i}`}
                className="rounded-xl border border-border bg-card px-4 shadow-card sm:px-6"
                itemScope
                itemType="https://schema.org/Question"
              >
                <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline">
                  <span itemProp="name">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent
                  className="font-body text-sm leading-relaxed text-muted-foreground"
                  itemScope
                  itemType="https://schema.org/Answer"
                  itemProp="acceptedAnswer"
                >
                  <span itemProp="text">{item.a}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default SwapPairsQA;
