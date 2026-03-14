import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrencies, getEstimate, getMinAmount, type Currency } from "@/lib/changenow";
import { useToast } from "@/hooks/use-toast";

const POPULAR_TICKERS = ["btc", "eth", "usdt", "sol", "xrp", "doge", "bnb", "ltc", "usdc", "trx"];

const ExchangeWidget = () => {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [sendAmount, setSendAmount] = useState("1");
  const [estimatedAmount, setEstimatedAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load currencies
  useEffect(() => {
    setLoading(true);
    getCurrencies()
      .then((data) => {
        if (Array.isArray(data)) {
          setCurrencies(data);
          const btc = data.find((c) => c.ticker === "btc");
          const eth = data.find((c) => c.ticker === "eth");
          setFromCurrency(btc || data[0]);
          setToCurrency(eth || data[1]);
        }
      })
      .catch((err) => {
        toast({ title: "Error loading currencies", description: err.message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  // Get estimate when params change
  const fetchEstimate = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !sendAmount || parseFloat(sendAmount) <= 0) {
      setEstimatedAmount("");
      return;
    }
    setEstimating(true);
    try {
      const [est, min] = await Promise.all([
        getEstimate(fromCurrency.ticker, toCurrency.ticker, sendAmount),
        getMinAmount(fromCurrency.ticker, toCurrency.ticker),
      ]);
      setEstimatedAmount(est.estimatedAmount?.toString() || "—");
      setMinAmount(min.minAmount || 0);
    } catch {
      setEstimatedAmount("—");
    } finally {
      setEstimating(false);
    }
  }, [fromCurrency, toCurrency, sendAmount]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchEstimate, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchEstimate]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const filteredCurrencies = currencies.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.ticker.includes(q) || c.name.toLowerCase().includes(q);
  });

  const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
    const aPopular = POPULAR_TICKERS.indexOf(a.ticker);
    const bPopular = POPULAR_TICKERS.indexOf(b.ticker);
    if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
    if (aPopular !== -1) return -1;
    if (bPopular !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const belowMin = parseFloat(sendAmount) > 0 && minAmount > 0 && parseFloat(sendAmount) < minAmount;

  const CurrencyPicker = ({
    show,
    onSelect,
    onClose,
    exclude,
  }: {
    show: boolean;
    onSelect: (c: Currency) => void;
    onClose: () => void;
    exclude?: string;
  }) => {
    if (!show) return null;
    return (
      <div className="absolute inset-0 z-10 flex flex-col rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Search currency..."
            className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => { onClose(); setSearchQuery(""); }} className="font-body text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 280 }}>
          {sortedCurrencies
            .filter((c) => c.ticker !== exclude)
            .map((c) => (
              <button
                key={`${c.ticker}-${c.network}`}
                onClick={() => { onSelect(c); onClose(); setSearchQuery(""); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                {c.image && <img src={c.image} alt={c.name} className="h-6 w-6 rounded-full" />}
                <div>
                  <span className="font-display text-sm font-semibold uppercase text-foreground">{c.ticker}</span>
                  <span className="ml-2 font-body text-xs text-muted-foreground">{c.name}</span>
                </div>
                {c.network && c.network !== c.ticker && (
                  <span className="ml-auto rounded bg-accent px-1.5 py-0.5 font-body text-[10px] uppercase text-muted-foreground">
                    {c.network}
                  </span>
                )}
              </button>
            ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-card shadow-elevated">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      id="exchange-widget"
      className="relative rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8"
    >
      <h2 className="mb-6 font-display text-lg font-semibold text-foreground">Quick Exchange</h2>

      {/* You Send */}
      <div className="relative">
        <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
          You Send
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
          <Input
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className="flex-1 border-none bg-transparent p-0 font-display text-2xl font-bold text-foreground shadow-none focus-visible:ring-0"
            min={0}
            step="any"
          />
          <button
            onClick={() => setShowFromPicker(true)}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 transition-colors hover:bg-primary/20"
          >
            {fromCurrency?.image && <img src={fromCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
            <span className="font-display text-sm font-semibold uppercase text-primary">
              {fromCurrency?.ticker || "Select"}
            </span>
          </button>
        </div>
        {belowMin && (
          <p className="mt-1 font-body text-xs text-destructive">
            Minimum amount: {minAmount} {fromCurrency?.ticker?.toUpperCase()}
          </p>
        )}
        <CurrencyPicker
          show={showFromPicker}
          onSelect={setFromCurrency}
          onClose={() => setShowFromPicker(false)}
          exclude={toCurrency?.ticker}
        />
      </div>

      {/* Swap Button */}
      <div className="my-3 flex justify-center">
        <button
          onClick={handleSwap}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:bg-accent"
          aria-label="Swap currencies"
        >
          <ArrowDownUp className="h-4 w-4" />
        </button>
      </div>

      {/* You Get */}
      <div className="relative">
        <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
          You Get (estimated)
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-accent p-4">
          <span className="flex-1 font-display text-2xl font-bold text-foreground">
            {estimating ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              `≈ ${estimatedAmount || "—"}`
            )}
          </span>
          <button
            onClick={() => setShowToPicker(true)}
            className="flex items-center gap-2 rounded-lg bg-trust/10 px-3 py-1.5 transition-colors hover:bg-trust/20"
          >
            {toCurrency?.image && <img src={toCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
            <span className="font-display text-sm font-semibold uppercase text-trust">
              {toCurrency?.ticker || "Select"}
            </span>
          </button>
        </div>
        <CurrencyPicker
          show={showToPicker}
          onSelect={setToCurrency}
          onClose={() => setShowToPicker(false)}
          exclude={fromCurrency?.ticker}
        />
      </div>

      <Button
        className="mt-6 w-full bg-trust text-trust-foreground hover:bg-trust/90"
        size="lg"
        disabled={!estimatedAmount || estimatedAmount === "—" || belowMin}
      >
        Exchange Now
      </Button>

      <p className="mt-3 text-center font-body text-xs text-muted-foreground">
        No hidden fees · No registration required · Powered by ChangeNow
      </p>
    </motion.div>
  );
};

export default ExchangeWidget;
