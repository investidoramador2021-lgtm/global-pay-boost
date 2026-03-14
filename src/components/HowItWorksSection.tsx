const steps = [
  {
    number: "01",
    title: "Pick Your Pair",
    description: "Select from 500+ crypto assets. Our engine finds the best rate across all liquidity sources instantly.",
  },
  {
    number: "02",
    title: "Enter Your Wallet",
    description: "Provide the receiving address. No account, no signup, no personal data required.",
  },
  {
    number: "03",
    title: "Send Funds",
    description: "Transfer crypto to the deposit address. Our system detects it the moment it hits the mempool.",
  },
  {
    number: "04",
    title: "Receive in Seconds",
    description: "Your swapped crypto lands in your wallet — typically under 60 seconds from confirmation.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Four Steps. Under 60 Seconds.
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            No delays, no friction. Just instant settlement.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <span className="font-display text-5xl font-extrabold text-primary/20">{step.number}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
