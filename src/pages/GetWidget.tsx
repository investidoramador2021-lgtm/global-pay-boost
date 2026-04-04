import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Copy, Check, Code2, Zap, Palette, Link2, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const SIZES = [
  { label: "Small", w: 320, h: 420 },
  { label: "Medium", w: 400, h: 440 },
  { label: "Large", w: 480, h: 460 },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MRC GlobalPay Crypto Swap Widget",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free embeddable crypto swap widget supporting 500+ tokens with live pricing. One-line iframe installation, glassmorphism dark UI, dust-friendly swaps from $0.30.",
  url: "https://mrcglobalpay.com/get-widget",
  provider: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    url: "https://mrcglobalpay.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I add the MRC GlobalPay swap widget to my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Copy the one-line iframe code from the Get Widget page and paste it into your HTML. No API keys, no sign-up, and no backend required.",
      },
    },
    {
      "@type": "Question",
      name: "Is the crypto swap widget free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the widget is completely free. It includes a small 'Powered by MRC GlobalPay' link at the bottom.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum swap amount supported by the widget?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The widget supports swaps starting from $0.30, making it ideal for converting small crypto dust balances.",
      },
    },
  ],
};

const GetWidget = () => {
  const [size, setSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const { w, h } = SIZES[size];

  const embedCode = `<iframe src="https://mrcglobalpay.com/embed/widget" width="${w}" height="${h}" style="border:none;border-radius:16px;overflow:hidden;" allow="clipboard-write" loading="lazy" title="MRC GlobalPay Crypto Swap Widget"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Free Crypto Swap Widget | Embed on Your Site | MRC GlobalPay</title>
        <meta
          name="description"
          content="Add a free crypto swap widget to your website. One-line embed code, glassmorphism dark UI, supports 500+ tokens. Dust-friendly swaps from $0.30."
        />
        <link rel="canonical" href="https://mrcglobalpay.com/get-widget" />
        <meta property="og:title" content="Free Crypto Swap Widget — Embed on Your Website" />
        <meta
          property="og:description"
          content="One-line iframe embed supporting 500+ tokens with live pricing. Glassmorphism dark UI, dust-friendly from $0.30."
        />
        <meta property="og:url" content="https://mrcglobalpay.com/get-widget" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="MRC GlobalPay" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Free Crypto Swap Widget | MRC GlobalPay" />
        <meta
          name="twitter:description"
          content="Embed a free crypto swap widget on your site. 500+ tokens, live pricing, one line of code."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="container relative mx-auto px-4 py-16 text-center lg:py-24">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Code2 className="h-3.5 w-3.5" />
              Free Embeddable Widget
            </div>
            <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Free Crypto Swap Widget for <span className="text-primary">Your Website</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Embed a professional crypto swap widget in seconds. One line of code, zero backend, supports 500+ tokens with
              dust-friendly swaps from <strong>$0.30</strong>.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Why Embed the MRC GlobalPay Swap Widget?
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              {
                icon: Code2,
                title: "One-Line Install",
                desc: "Copy a single iframe tag. No npm, no build step, no dependencies.",
              },
              {
                icon: Palette,
                title: "Glassmorphism UI",
                desc: "Dark-mode widget with frosted glass effects. Looks premium on any site.",
              },
              {
                icon: Link2,
                title: "Backlink Included",
                desc: "A subtle 'Powered by MRC GlobalPay' link boosts your SEO authority.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Widget Preview + Code */}
        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
              How Do I Get the Embed Code?
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Live Widget Preview */}
              <div className="flex flex-col items-center">
                <div className="mb-4 flex gap-2">
                  {SIZES.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSize(i)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        i === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="w-full flex justify-center">
                  <iframe
                    src="/embed/widget"
                    width={w}
                    height={h}
                    style={{
                      border: "none",
                      borderRadius: 16,
                      overflow: "hidden",
                      maxWidth: "100%",
                    }}
                    allow="clipboard-write"
                    title="MRC GlobalPay Crypto Swap Widget Preview"
                  />
                </div>
              </div>

              {/* Code snippet */}
              <div className="flex flex-col justify-center">
                <h3 className="mb-2 font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Embed Code
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Paste this into your HTML. That's it — no API keys, no sign-up required.
                </p>
                <div className="relative rounded-xl border border-border bg-card">
                  <pre className="overflow-x-auto p-4 pr-20 text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-all">
                    <code>{embedCode}</code>
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">💡 Customize Size</h4>
                  <p className="text-xs text-muted-foreground">
                    Adjust the{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-foreground/80">width</code> and{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-foreground/80">height</code> attributes to fit your
                    layout. The widget is fully responsive within its container.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
              Frequently Asked Questions About the Widget
            </h2>
            <div className="space-y-6">
              {faqJsonLd.mainEntity.map((faq) => (
                <div key={faq.name} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground">{faq.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links / CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
              Explore More MRC GlobalPay Tools
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  to: "/",
                  icon: ArrowRight,
                  label: "Instant Crypto Swaps",
                  desc: "500+ tokens, live rates, from $0.30",
                },
                {
                  to: "/dust-swap-comparison",
                  icon: Zap,
                  label: "Dust Swap Comparison",
                  desc: "See how our minimums beat the competition",
                },
                {
                  to: "/transparency-security",
                  icon: Shield,
                  label: "Transparency & Security",
                  desc: "Canadian MSB registration & compliance",
                },
                {
                  to: "/blog",
                  icon: Code2,
                  label: "Blog & Guides",
                  desc: "Expert crypto swap guides & market analysis",
                },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/50"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};

export default GetWidget;
