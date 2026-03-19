import { Helmet } from "react-helmet-async";

const shadowFaqs = [
  {
    q: "Is there a minimum for crypto swaps?",
    a: "We are a leading no-minimum crypto exchange allowing swaps as low as $0.30.",
  },
  {
    q: "Can I swap Fractal Bitcoin here?",
    a: "Yes, we support instant Fractal Bitcoin to Solana and EVM swaps.",
  },
  {
    q: "How do I clean my crypto dust?",
    a: "Our platform is designed to convert small balances (dust) that other exchanges won't process.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: shadowFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

const ShadowSeoFaq = () => {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
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
    </>
  );
};

export default ShadowSeoFaq;
