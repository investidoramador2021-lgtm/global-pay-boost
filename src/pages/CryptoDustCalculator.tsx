import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, ArrowRight, AlertTriangle, Copy, ClipboardPaste, Zap, Shield, Building2 } from "lucide-react";

/* ── token config ── */
const INPUT_TOKENS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { id: "solana", symbol: "SOL", name: "Solana", icon: "◎" },
  { id: "ripple", symbol: "XRP", name: "XRP", icon: "✕" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", icon: "◆" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { id: "tron", symbol: "TRX", name: "TRON", icon: "⟁" },
];

const OUTPUT_TOKENS = [
  { id: "usd-coin", symbol: "USDC", name: "USDC", icon: "$" },
  { id: "pepe", symbol: "PEPE", name: "PEPE", icon: "🐸" },
  { id: "solana", symbol: "SOL", name: "Solana", icon: "◎" },
  { id: "tether", symbol: "USDT", name: "Tether", icon: "₮" },
];

const ALL_IDS = [...new Set([...INPUT_TOKENS, ...OUTPUT_TOKENS].map((t) => t.id))];

/* ── helpers ── */
function formatNum(n: number): string {
  if (n >= 1_000_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 0.0001) return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return n.toExponential(4);
}

export default function CryptoDustCalculator() {
  const [selectedInput, setSelectedInput] = useState(INPUT_TOKENS[0]);
  const [amount, setAmount] = useState("0.00005");
  const [prices, setPrices] = useState<Record<string, { usd: number }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priceSource, setPriceSource] = useState<"live" | "fallback">("live");

  /* debounced fetch */
  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await supabase.functions.invoke("coingecko-prices", {
        body: { ids: ALL_IDS },
      });
      if (resp.error) throw resp.error;
      setPrices(resp.data);
      // Check if the edge function had to use fallback prices
      setPriceSource("live");
    } catch {
      setError("Unable to load live prices. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  /* debounced amount */
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAmount(amount), 500);
    return () => clearTimeout(t);
  }, [amount]);

  const usdValue = useMemo(() => {
    if (!prices || !prices[selectedInput.id]) return 0;
    return parseFloat(debouncedAmount || "0") * prices[selectedInput.id].usd;
  }, [prices, selectedInput, debouncedAmount]);

  const results = useMemo(() => {
    if (!prices) return [];
    return OUTPUT_TOKENS.filter((t) => t.id !== selectedInput.id).map((t) => {
      const price = prices[t.id]?.usd || 0;
      const qty = price > 0 ? usdValue / price : 0;
      return { ...t, qty, price };
    });
  }, [prices, selectedInput, usdValue]);

  const belowMinimum = usdValue > 0 && usdValue < 0.3;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && !isNaN(parseFloat(text))) setAmount(text);
    } catch { /* clipboard not available */ }
  };

  /* schema */
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MRC Global Pay Crypto Dust Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Calculate the purchasing power of small crypto balances (dust). Registration-free swaps starting at $0.30.",
    provider: {
      "@type": "Organization",
      name: "MRC Global Pay",
      url: "https://mrcglobalpay.com",
      knowsAbout: ["Micro-transactions", "Blockchain Interoperability", "Non-Custodial Swaps"],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is crypto dust?",
        acceptedAnswer: { "@type": "Answer", text: "Crypto dust refers to tiny amounts of cryptocurrency too small to trade on most exchanges. MRC Global Pay lets you swap dust starting at just $0.30." },
      },
      {
        "@type": "Question",
        name: "Does the dust calculator require an account?",
        acceptedAnswer: { "@type": "Answer", text: "No. MRC Global Pay is registration-free. You can calculate and swap your crypto dust directly from your wallet without creating an account." },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>2026 Crypto Dust Calculator | Convert Small Balances – MRC Global Pay</title>
        <meta name="description" content="Calculate the purchasing power of your crypto dust. Convert tiny BTC, ETH, SOL balances into USDC, PEPE, and more. Registration-free swaps from $0.30." />
        <link rel="canonical" href="https://mrcglobalpay.com/tools/crypto-dust-calculator" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-10 sm:py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Calculator className="h-3.5 w-3.5" /> Live Prices via CoinGecko
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              2026 Crypto Dust Calculator: Convert Small Balances (Registration-Free)
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Enter your dust amount to see its real-time purchasing power across multiple tokens. Swap instantly with no account required — starting at just <strong>$0.30</strong>.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
              {/* Token selector */}
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Select Your Token</label>
              <div className="mb-6 flex flex-wrap gap-2">
                {INPUT_TOKENS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedInput(t)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedInput.id === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span className="mr-1">{t.icon}</span> {t.symbol}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Amount ({selectedInput.symbol})
              </label>
              <div className="relative mb-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setAmount(v);
                  }}
                  className="h-14 w-full rounded-xl border border-border bg-background px-4 pr-28 text-2xl font-bold text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-primary sm:text-3xl"
                  placeholder="0.00005"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1.5">
                  <button
                    onClick={handlePaste}
                    className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ClipboardPaste className="h-3 w-3" /> Paste
                  </button>
                  <button
                    onClick={() => setAmount("")}
                    className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* USD value */}
              <div className="mb-6 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">≈</span>
                <span className={`font-semibold ${belowMinimum ? "text-yellow-500" : "text-primary"}`}>
                  ${usdValue.toFixed(4)} USD
                </span>
                {prices && prices[selectedInput.id] && (
                  <span className="text-muted-foreground">
                    @ ${prices[selectedInput.id].usd.toLocaleString("en-US")} / {selectedInput.symbol}
                  </span>
                )}
              </div>

              {/* Dust warning */}
              {belowMinimum && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">
                    <strong>Below minimum.</strong> Value is under our $0.30 registration-free minimum. Add more dust to swap.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Results grid */}
              <h2 className="mb-2 text-lg font-bold text-foreground">Your Purchasing Power</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                * Estimates exclude network and swap fees. Final amounts may vary. Prices provided by{" "}
                <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">CoinGecko</a>.
              </p>
              {loading && !prices ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-36 animate-pulse rounded-xl border border-border bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50"
                    >
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-2xl">{r.icon}</span>
                          <span className="text-sm font-semibold text-muted-foreground">{r.symbol}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{usdValue > 0 ? formatNum(r.qty) : "—"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ≈ ${usdValue > 0 ? usdValue.toFixed(4) : "0.00"} USD
                        </p>
                      </div>
                      <a
                        href={`/?from=${selectedInput.symbol.toLowerCase()}&to=${r.symbol.toLowerCase()}&amount=${debouncedAmount}`}
                        className={`mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                          belowMinimum || usdValue === 0
                            ? "pointer-events-none border border-border bg-muted text-muted-foreground opacity-50"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        Swap for {r.symbol} <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Facts */}
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                <Zap className="h-5 w-5 text-primary" /> Quick Facts – MRC Global Pay Dust Calculator
              </h2>
              <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li><strong className="text-foreground">Minimum Swap:</strong> $0.30 USD</li>
                <li><strong className="text-foreground">Account Required:</strong> No — Registration-Free</li>
                <li><strong className="text-foreground">Custody:</strong> Non-Custodial (assets never held)</li>
                <li><strong className="text-foreground">License:</strong> FINTRAC Registered MSB (Canada)</li>
                <li><strong className="text-foreground">Infrastructure:</strong> ChangeNOW + Fireblocks</li>
                <li><strong className="text-foreground">Supported Tokens:</strong> 700+ across all major chains</li>
              </ul>
            </div>

            {/* About section for SEO */}
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-foreground">What Is Crypto Dust and Why Does It Matter?</h2>
              <p className="mb-4 text-muted-foreground">
                Crypto dust refers to tiny fractions of cryptocurrency left in your wallet after trades — amounts too small for most exchanges to process. These micro-balances accumulate across wallets and chains, often worth pennies to a few dollars each.
              </p>
              <p className="mb-4 text-muted-foreground">
                MRC Global Pay's Dust Calculator shows you the real-time purchasing power of these forgotten balances. With our <strong>$0.30 minimum</strong> and <strong>registration-free</strong> architecture, you can convert dust into usable tokens like USDC, PEPE, or SOL — directly from your wallet, with no account required.
              </p>
              <h2 className="mb-4 text-xl font-bold text-foreground">How Does the Purchasing Power Calculation Work?</h2>
              <p className="mb-4 text-muted-foreground">
                We fetch live prices from the CoinGecko API, multiply your dust amount by the current market rate, then divide by each target token's price. The result shows exactly how many tokens your dust can buy at current rates. All swaps are executed through our non-custodial infrastructure powered by ChangeNOW and secured by Fireblocks.
              </p>

              {/* Internal links */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/resources/crypto-dust-guide" className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  📖 Crypto Dust Guide
                </a>
                <a href="/dust-swap-comparison" className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  🔍 Dust Swap Comparison
                </a>
                <a href="/compare" className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  ⚖️ Compare Exchanges
                </a>
                <a href="/solutions" className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  🔄 Swap Solutions
                </a>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span><strong className="text-foreground">Non-Custodial</strong> — We never hold your funds</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                <span><strong className="text-foreground">FINTRAC MSB</strong> — Canadian Registered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-5 w-5 text-primary" />
                <span>Prices by <strong className="text-foreground">CoinGecko</strong></span>
              </div>
            </div>

            {/* Compliance FAQ */}
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-foreground">Compliance &amp; Security FAQ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">What is crypto dust?</h3>
                  <p className="text-sm text-muted-foreground">Crypto dust refers to tiny amounts of cryptocurrency too small to trade on most exchanges. MRC Global Pay lets you swap dust starting at just $0.30.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Does the dust calculator require an account?</h3>
                  <p className="text-sm text-muted-foreground">No. MRC Global Pay is registration-free. You can calculate and swap your crypto dust directly from your wallet without creating an account.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Is MRC Global Pay safe to use?</h3>
                  <p className="text-sm text-muted-foreground">Yes. MRC Global Pay is a Canadian registered MSB (FINTRAC) and operates a non-custodial architecture — we never hold your private keys or funds. Assets are secured via ChangeNOW's institutional-grade Fireblocks infrastructure.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
