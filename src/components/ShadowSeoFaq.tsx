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
