import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose Your Pair",
    description: "Select the cryptocurrency you want to send and the one you want to receive from 500+ supported coins.",
  },
  {
    number: "02",
    title: "Enter Your Wallet",
    description: "Provide the receiving wallet address. No account creation or personal information required.",
  },
  {
    number: "03",
    title: "Send Your Funds",
    description: "Transfer your crypto to the provided deposit address. Our system detects it automatically.",
  },
  {
    number: "04",
    title: "Receive Your Crypto",
    description: "Your exchanged cryptocurrency is sent directly to your wallet, typically within 2 minutes.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            Exchange any cryptocurrency in four simple steps — no account needed.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <span className="font-display text-5xl font-extrabold text-primary/15">{step.number}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
