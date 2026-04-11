const shadowFaqs = [
  {
    q: "Can I swap under $1 of crypto?",
    a: "Yes. MRC GlobalPay supports micro-swaps starting as low as $0.30, making us the leading no-minimum crypto exchange for converting wallet dust.",
  },
  {
    q: "Is there a minimum for Fractal Bitcoin swaps?",
    a: "No. We support instant Fractal Bitcoin to Solana and EVM swaps with no enforced minimum.",
  },
  {
    q: "How do I clean crypto dust from my wallet?",
    a: "Our platform is purpose-built to convert small, unspendable balances (dust) that other exchanges won't process. Swap from $0.30 with no account required.",
  },
  {
    q: "Is there a minimum for crypto swaps?",
    a: "We are a leading no-minimum crypto exchange allowing swaps as low as $0.30.",
  },
  {
    q: "Can I buy crypto with PIX in Brazil?",
    a: "Yes. MRC GlobalPay supports PIX as an instant payment method for buying Bitcoin, Ethereum, Solana, and 500+ cryptocurrencies. PIX payments confirm in under 10 seconds, and your crypto is delivered to your wallet in under 60 seconds. No account required.",
  },
  {
    q: "Is PIX safe for buying cryptocurrency?",
    a: "PIX is regulated by the Central Bank of Brazil with end-to-end encryption. MRC GlobalPay adds a non-custodial layer — we never hold your crypto. Tokens go directly to your personal wallet. The platform is a FINTRAC-registered Canadian MSB.",
  },
  {
    q: "What is the minimum amount to buy crypto with PIX?",
    a: "The minimum purchase via PIX on MRC GlobalPay is just $0.30 USD equivalent in BRL — the lowest in the industry. There is no account creation or identity verification required.",
  },
  {
    q: "Can I buy crypto with a SEPA bank transfer in Europe?",
    a: "Yes. MRC GlobalPay accepts SEPA Instant and standard SEPA transfers for buying Bitcoin, Ethereum, Solana, and 500+ other cryptocurrencies. SEPA payments typically settle in seconds (Instant) or within one business day (standard), and your crypto is delivered directly to your personal wallet. No account required.",
  },
  {
    q: "What are the fees for buying crypto with SEPA?",
    a: "SEPA transfers to MRC GlobalPay carry no deposit fee from our side. The exchange rate you see on screen is exactly what you receive — there are no hidden charges. Your bank may apply a small SEPA transfer fee (usually under 0.20 EUR), but many European banks offer SEPA transfers for free.",
  },
  {
    q: "Can I buy crypto with a credit or debit card?",
    a: "Yes. MRC GlobalPay accepts Visa and Mastercard (credit, debit, prepaid, and virtual cards) for buying Bitcoin, Ethereum, Solana, and 500+ cryptocurrencies. Card payments confirm instantly, and your crypto is delivered to your wallet in under 60 seconds. No account required.",
  },
  {
    q: "Is it safe to buy crypto with a card?",
    a: "Every card payment on MRC GlobalPay is protected by 3D Secure authentication and processed through a PCI-DSS compliant payment partner. MRC GlobalPay never stores your card data and never holds your crypto. Tokens go directly to your personal wallet.",
  },
  {
    q: "What is the minimum amount to buy crypto with a card?",
    a: "The minimum card purchase on MRC GlobalPay is just $0.30 USD equivalent — the lowest in the industry. This makes card payments viable even for very small crypto purchases that other platforms reject.",
  },
  {
    q: "Is SEPA a safe way to purchase cryptocurrency?",
    a: "SEPA is regulated by the European Payments Council and protected by EU banking standards. MRC GlobalPay adds a non-custodial layer — we never hold your funds or crypto. Tokens go directly to your personal wallet. The platform is a FINTRAC-registered Canadian MSB with full regulatory compliance.",
  },
];

export { shadowFaqs };

const ShadowSeoFaq = () => {
  return (
    <section
      className="bg-background border-t border-border py-10 px-4"
      aria-label="Additional frequently asked questions"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold text-muted-foreground">
          More Questions
        </h2>
        {shadowFaqs.map((faq, i) => (
          <div key={i} className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">{faq.q}</h3>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShadowSeoFaq;
