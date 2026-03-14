import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is MRC GlobalPay safe to use?",
    a: "Yes. MRC GlobalPay uses end-to-end encryption and partners with ChangeNow, a trusted exchange aggregator processing millions of transactions. Your funds flow directly from your wallet to the exchange — we never hold your crypto.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Our exchange is completely registration-free. Just select your trading pair, enter your receiving wallet address, send your funds, and you're done.",
  },
  {
    q: "How long does an exchange take?",
    a: "Most exchanges settle in under 60 seconds once a blockchain confirmation is received. Bitcoin transactions may take slightly longer due to network congestion.",
  },
  {
    q: "What are the fees?",
    a: "Our fees are built into the exchange rate displayed — there are no hidden charges. You always see the exact amount you'll receive before confirming the swap.",
  },
  {
    q: "Which cryptocurrencies are supported?",
    a: "We support over 500 cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Solana (SOL), USDT, USDC, XRP, Dogecoin, BNB, Litecoin, and many more across all major blockchains.",
  },
  {
    q: "What if my exchange is stuck or delayed?",
    a: "Contact our 24/7 support team with your transaction ID. Most delays are caused by blockchain congestion and resolve within minutes. We monitor every transaction to ensure completion.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            Everything you need to know about instant crypto swaps with MRC GlobalPay.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-6 shadow-card"
              >
                <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
