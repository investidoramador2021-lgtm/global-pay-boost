import { ClipboardList, Send, Wallet } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Input Details",
    description: "Select your trading pair and enter the recipient wallet address. No sign-up needed.",
  },
  {
    number: "02",
    icon: Send,
    title: "Send Deposit",
    description: "Transfer your funds to the secure, one-time generated deposit address.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Automatic Settlement",
    description: "Once your deposit is confirmed, coins are automatically sent to your wallet.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-background py-14 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Three simple steps. No delays, no friction.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-3 lg:gap-10">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-display text-3xl font-extrabold text-primary/20 sm:text-4xl">{step.number}</span>
              <h3 className="mt-1 font-display text-base font-semibold text-foreground sm:mt-2 sm:text-lg">{step.title}</h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground sm:mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
