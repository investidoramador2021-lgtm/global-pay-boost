import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import { shadowFaqs } from "@/components/ShadowSeoFaq";

const faqs = [
  {
    q: "What is the minimum amount I can swap?",
    a: "We support micro-swaps starting as low as $0.30 to $0.60, depending on the coin pair. This makes us the ideal tool for clearing out 'crypto dust' that other exchanges won't touch.",
  },
  {
    q: "Do I need to create an account or provide ID?",
    a: "No. We offer a completely accountless experience. You can swap wallet-to-wallet instantly without any onboarding or registration.",
  },
  {
    q: "Is the exchange rate guaranteed?",
    a: "Yes. When you select our Fixed Rate option, the amount you see is exactly what you get. We protect you from price volatility during the transaction.",
  },
  {
    q: "Which tokens are supported for dust swaps?",
    a: "We support over 500+ assets, including BTC, ETH, SOL, and dozens of low-cap tokens. If it's in your wallet, you can likely swap it here.",
  },
  {
    q: "How long does a micro-swap take?",
    a: "Most exchanges settle in under 60 seconds with our 2026 liquidity rails. Our pre-funded vaults and direct-to-protocol routing eliminate the standard 3–6 confirmation wait times.",
  },
  {
    q: "What are the fees?",
    a: "Our fees are built into the exchange rate displayed — there are no hidden charges. You always see the exact amount you'll receive before confirming the swap.",
  },
  {
    q: "What if my exchange is stuck or delayed?",
    a: "Contact our 24/7 support team with your transaction ID. Most delays are caused by blockchain congestion and resolve within minutes. We monitor every transaction to ensure completion.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

const FAQSection = () => {
  return (
    <section id="faq" className="bg-background py-14 sm:py-20 lg:py-28">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Everything you need to know about instant crypto swaps with MRC GlobalPay.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-4 shadow-card sm:px-6"
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
