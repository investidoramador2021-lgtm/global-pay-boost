import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Copy, Check, Code2, Zap, Link2, Palette } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const SIZES = [
  { label: "Small", w: 320, h: 420 },
  { label: "Medium", w: 400, h: 440 },
  { label: "Large", w: 480, h: 460 },
];

const GetWidget = () => {
  const [size, setSize] = useState(0); // Default to Small on initial render
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
        <meta name="description" content="Add a free crypto swap widget to your website. One-line embed code, glassmorphism dark UI, supports 500+ tokens. Dust-friendly swaps from $0.30." />
        <link rel="canonical" href="https://mrcglobalpay.com/get-widget" />
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
              Add Crypto Swaps to <span className="text-primary">Your Website</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Embed a professional crypto swap widget in seconds. One line of code, zero backend, supports 500+ tokens with swaps from $0.30.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              { icon: Code2, title: "One-Line Install", desc: "Copy a single iframe tag. No npm, no build step, no dependencies." },
              { icon: Palette, title: "Glassmorphism UI", desc: "Dark-mode widget with frosted glass effects. Looks premium on any site." },
              { icon: Link2, title: "Backlink Included", desc: "A subtle 'Powered by MRC GlobalPay' link boosts your SEO authority." },
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
        <section className="relative z-10 mx-auto px-4 py-12 bg-background">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Preview & Get Your Code</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Static Widget Mockup */}
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
                <div
                  className="w-full rounded-2xl border border-white/[0.12] p-5 mx-auto"
                  style={{
                    maxWidth: w,
                    background: "linear-gradient(135deg, rgba(20,22,36,0.92) 0%, rgba(14,16,28,0.96) 100%)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Crypto Swap</span>
                    </div>
                    <span className="text-[10px] text-white/30">Dust-friendly • From $0.30</span>
                  </div>
                  {/* From */}
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 mb-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">You Send</label>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 border border-white/[0.08]">
                        ₿ BTC <span className="text-white/30 text-xs">▾</span>
                      </span>
                      <span className="text-lg font-semibold text-white/20">0.00</span>
                    </div>
                  </div>
                  {/* Swap arrow */}
                  <div className="flex justify-center -my-1 relative z-10">
                    <div className="rounded-full bg-white/[0.06] border border-white/[0.1] p-1.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M5 10l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                  {/* To */}
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 mt-2 mb-4">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">You Get</label>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/90 border border-white/[0.08]">
                        ₮ USDT <span className="text-white/30 text-xs">▾</span>
                      </span>
                      <span className="text-lg font-semibold text-white/30">—</span>
                    </div>
                  </div>
                  {/* CTA */}
                  <div
                    className="w-full rounded-xl py-3 text-center text-sm font-bold uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, hsl(160 100% 45%) 0%, hsl(200 100% 45%) 100%)", color: "#0a0c14", boxShadow: "0 4px 16px rgba(0,200,150,0.3)" }}
                  >
                    Swap Now →
                  </div>
                  {/* Powered by */}
                  <div className="mt-3 text-center">
                    <span className="text-[10px] text-white/30">Powered by <span className="font-semibold">MRC GlobalPay</span></span>
                  </div>
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
                    Adjust the <code className="rounded bg-muted px-1 py-0.5 text-foreground/80">width</code> and <code className="rounded bg-muted px-1 py-0.5 text-foreground/80">height</code> attributes to fit your layout. The widget is fully responsive within its container.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
};

export default GetWidget;
