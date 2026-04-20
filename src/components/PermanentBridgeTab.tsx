import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, Check, Search, ArrowLeft, Download, CheckCircle2, Link2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import DestinationAddressInput, { tickerToAddressType } from "@/components/DestinationAddressInput";
import {
  createFixedAddress,
  type Currency,
  type FixedAddressResult,
} from "@/lib/changenow";
import { getAggregatedCurrencies } from "@/lib/liquidity-aggregator";
import { useToast } from "@/hooks/use-toast";

const POPULAR_TICKERS = ["btc", "eth", "usdt", "usdttrc20", "sol", "xrp", "bnb", "ltc", "usdc", "trx"];

const DISPLAY_TICKER_MAP: Record<string, string> = {
  usdterc20: "USDT", usdttrc20: "USDT", usdtbsc: "USDT", usdtsol: "USDT",
  usdtmatic: "USDT", usdtarc20: "USDT", usdtarb: "USDT", usdtop: "USDT",
  usdtton: "USDT", usdtcelo: "USDT", usdtapt: "USDT", usdtassethub: "USDT",
  usdcsol: "USDC", usdcmatic: "USDC", usdcbsc: "USDC", usdcarc20: "USDC",
  usdcop: "USDC", usdcarb: "USDC", usdcbase: "USDC", usdccelo: "USDC",
  usdcsui: "USDC", usdcapt: "USDC", usdcmon: "USDC", usdczksync: "USDC",
  usdcalgo: "USDC", ethbsc: "ETH", etharb: "ETH", ethop: "ETH",
  ethbase: "ETH", ethlna: "ETH", ethmanta: "ETH", bnbbsc: "BNB",
};

function displayTicker(c: { ticker: string }): string {
  return DISPLAY_TICKER_MAP[c.ticker.toLowerCase()] || c.ticker.toUpperCase();
}

const NETWORK_FRIENDLY_NAME: Record<string, string> = {
  "TRC20": "Tron", "ERC20": "Ethereum", "Binance Smart Chain": "BNB Chain",
  "SOL": "Solana", "Polygon": "Polygon", "AVAX C-CHAIN": "Avalanche",
  "Arbitrum One": "Arbitrum", "Optimism": "Optimism", "Base": "Base",
  "TON": "TON", "CELO": "Celo", "Aptos": "Aptos", "Sui": "Sui",
};

function networkLabel(c: { ticker: string; name: string }): string | null {
  const match = c.name.match(/\(([^)]+)\)/);
  if (match) return NETWORK_FRIENDLY_NAME[match[1]] || match[1];
  if (DISPLAY_TICKER_MAP[c.ticker.toLowerCase()]) {
    const raw = c.ticker.toLowerCase();
    const base = DISPLAY_TICKER_MAP[raw].toLowerCase();
    const suffix = raw.replace(base, "");
    return suffix ? suffix.toUpperCase() : null;
  }
  return null;
}

type BridgeStep = "form" | "result";

const PermanentBridgeTab = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [destAddress, setDestAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [currLoading, setCurrLoading] = useState(true);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [step, setStep] = useState<BridgeStep>("form");
  const [result, setResult] = useState<FixedAddressResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const searchFromRef = useRef<HTMLInputElement>(null);
  const searchToRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAggregatedCurrencies()
      .then((list) => {
        const active = list.filter((c: Currency) => !c.isFiat);
        setCurrencies(active);
        const btc = active.find((c: Currency) => c.ticker === "btc");
        const eth = active.find((c: Currency) => c.ticker === "eth");
        if (btc) setFromCurrency(btc);
        if (eth) setToCurrency(eth);
      })
      .catch(() => {})
      .finally(() => setCurrLoading(false));
  }, []);

  const filterCurrencies = useCallback(
    (query: string) => {
      if (!query) return currencies;
      const q = query.toLowerCase();
      return currencies.filter(
        (c) =>
          c.ticker.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          displayTicker(c).toLowerCase().includes(q)
      );
    },
    [currencies]
  );

  const sortedFrom = filterCurrencies(searchFrom);
  const sortedTo = filterCurrencies(searchTo);

  const handleGenerate = async () => {
    if (!fromCurrency || !toCurrency || !destAddress.trim()) return;
    setLoading(true);
    try {
      const res = await createFixedAddress({
        from: fromCurrency.ticker,
        to: toCurrency.ticker,
        address: destAddress.trim(),
      });
      setResult(res);
      setStep("result");
    } catch (err: unknown) {
      toast({
        title: t("bridge.errorTitle"),
        description: err instanceof Error ? err.message : t("bridge.errorGeneric"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadPdf = async () => {
    if (!result || !fromCurrency || !toCurrency) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MRC Global Pay", pageW / 2, 25, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(t("bridge.receiptTitle"), pageW / 2, 33, { align: "center" });

    doc.setDrawColor(200);
    doc.line(20, 38, pageW - 20, 38);

    // Body
    let y = 50;
    const lineH = 10;
    const labelX = 25;
    const valueX = 85;

    const addRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(label, labelX, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, valueX, y);
      y += lineH;
    };

    addRow(t("bridge.pdfPair"), `${displayTicker(fromCurrency)} → ${displayTicker(toCurrency)}`);
    addRow(t("bridge.pdfDepositAddress"), result.payinAddress);
    addRow(t("bridge.pdfDestWallet"), destAddress);
    addRow(t("bridge.pdfBridgeId"), result.id);
    if (result.payinExtraId) {
      addRow(t("bridge.pdfExtraId"), result.payinExtraId);
    }

    y += 5;
    doc.line(20, y, pageW - 20, y);
    y += 10;

    // Footer notice
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const footerLines = doc.splitTextToSize(t("bridge.pdfFooter"), pageW - 50);
    doc.text(footerLines, pageW / 2, y, { align: "center" });

    // Date
    y += footerLines.length * 5 + 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC`, pageW / 2, y, { align: "center" });

    doc.save(`MRC-Bridge-${result.id.slice(0, 8)}.pdf`);
    setPdfGenerated(true);
    setTimeout(() => setPdfGenerated(false), 3000);
  };

  const canGenerate = fromCurrency && toCurrency && destAddress.trim().length > 5;

  // Currency picker
  const CurrencyPicker = ({
    show,
    onClose,
    search,
    setSearch,
    list,
    onSelect,
    inputRef,
  }: {
    show: boolean;
    onClose: () => void;
    search: string;
    setSearch: (s: string) => void;
    list: Currency[];
    onSelect: (c: Currency) => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    useEffect(() => {
      if (show) setTimeout(() => inputRef.current?.focus(), 100);
    }, [show, inputRef]);

    if (!show) return null;

    const popular = currencies.filter((c) => POPULAR_TICKERS.includes(c.ticker.toLowerCase()));

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("widget.searchCrypto")}
            className="pl-9"
          />
        </div>
        {!search && popular.length > 0 && (
          <div className="mb-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("widget.popular")}</p>
            <div className="flex flex-wrap gap-1">
              {popular.map((c) => (
                <button
                  key={c.ticker}
                  onClick={() => { onSelect(c); onClose(); setSearch(""); }}
                  className="flex items-center gap-1 rounded-full border border-border bg-accent px-2 py-1 text-xs font-semibold text-foreground hover:bg-primary/10 transition-colors"
                >
                  {c.image && <img src={c.image} alt="" className="h-4 w-4 rounded-full" loading="lazy" />}
                  {displayTicker(c)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="max-h-52 space-y-0.5 overflow-y-auto">
          {list.slice(0, 80).map((c) => {
            const net = networkLabel(c);
            return (
              <button
                key={c.ticker}
                onClick={() => { onSelect(c); onClose(); setSearch(""); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-accent transition-colors"
              >
                {c.image && <img src={c.image} alt="" className="h-5 w-5 rounded-full" loading="lazy" />}
                <span className="font-display text-sm font-semibold text-foreground">{displayTicker(c)}</span>
                {net && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{net}</span>}
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">{c.name}</span>
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => { onClose(); setSearch(""); }}>
          {t("widget.cancel")}
        </Button>
      </motion.div>
    );
  };

  if (currLoading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground animate-pulse">{t("widget.loadingCurrencies")}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Trust signals */}
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-body text-xs text-muted-foreground">{t("bridge.trustNotice")}</span>
      </div>

      <AnimatePresence mode="wait">
        {step === "form" && !showFromPicker && !showToPicker && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* From currency */}
            <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("bridge.fromCurrency")}
            </label>
            <button
              onClick={() => setShowFromPicker(true)}
              className="mb-4 flex w-full items-center gap-2.5 rounded-xl border border-border bg-accent p-3 hover:bg-accent/80 transition-colors"
            >
              {fromCurrency?.image && <img src={fromCurrency.image} alt="" className="h-6 w-6 rounded-full" />}
              <span className="font-display text-lg font-bold text-foreground">{fromCurrency ? displayTicker(fromCurrency) : t("widget.select")}</span>
              <span className="ml-auto text-xs text-muted-foreground">{fromCurrency?.name}</span>
            </button>

            {/* To currency */}
            <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("bridge.toCurrency")}
            </label>
            <button
              onClick={() => setShowToPicker(true)}
              className="mb-4 flex w-full items-center gap-2.5 rounded-xl border border-border bg-accent p-3 hover:bg-accent/80 transition-colors"
            >
              {toCurrency?.image && <img src={toCurrency.image} alt="" className="h-6 w-6 rounded-full" />}
              <span className="font-display text-lg font-bold text-foreground">{toCurrency ? displayTicker(toCurrency) : t("widget.select")}</span>
              <span className="ml-auto text-xs text-muted-foreground">{toCurrency?.name}</span>
            </button>

            {/* Destination wallet */}
            <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("bridge.destWallet")}
            </label>
            <DestinationAddressInput
              value={destAddress}
              onChange={setDestAddress}
              currencyTicker={toCurrency?.ticker || ""}
              expectedNetworkType={tickerToAddressType(toCurrency?.ticker || "")}
              className="mb-4"
            />

            {/* No-storage notice */}
            <p className="mb-4 text-center font-body text-[10px] text-muted-foreground">
              {t("bridge.noStorageNotice")}
            </p>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="w-full gap-2 rounded-xl py-6 font-display text-base font-bold"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Link2 className="h-5 w-5" />
              )}
              {loading ? t("bridge.generating") : t("bridge.generateBtn")}
            </Button>
          </motion.div>
        )}

        {showFromPicker && (
          <CurrencyPicker
            show={showFromPicker}
            onClose={() => setShowFromPicker(false)}
            search={searchFrom}
            setSearch={setSearchFrom}
            list={sortedFrom}
            onSelect={setFromCurrency}
            inputRef={searchFromRef as React.RefObject<HTMLInputElement>}
          />
        )}

        {showToPicker && (
          <CurrencyPicker
            show={showToPicker}
            onClose={() => setShowToPicker(false)}
            search={searchTo}
            setSearch={setSearchTo}
            list={sortedTo}
            onSelect={setToCurrency}
            inputRef={searchToRef as React.RefObject<HTMLInputElement>}
          />
        )}

        {step === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Success header */}
            <div className="mb-4 flex items-center gap-2 text-trust">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-display text-sm font-bold">{t("bridge.addressCreated")}</span>
            </div>

            {/* Pair label */}
            <div className="mb-3 flex items-center gap-2">
              {fromCurrency?.image && <img src={fromCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
              <span className="font-display text-sm font-bold text-foreground">{displayTicker(fromCurrency!)}</span>
              <span className="text-muted-foreground">→</span>
              {toCurrency?.image && <img src={toCurrency.image} alt="" className="h-5 w-5 rounded-full" />}
              <span className="font-display text-sm font-bold text-foreground">{displayTicker(toCurrency!)}</span>
            </div>

            {/* Deposit address */}
            <label className="mb-1 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("bridge.depositAddress")}
            </label>
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
              <code className="flex-1 break-all font-mono text-sm font-bold text-foreground">{result.payinAddress}</code>
              <button onClick={() => handleCopy(result.payinAddress)} className="shrink-0 rounded-lg p-2 hover:bg-accent transition-colors">
                {copied ? <Check className="h-4 w-4 text-trust" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>

            {result.payinExtraId && (
              <>
                <label className="mb-1 block font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("widget.extraIdMemo")}
                </label>
                <div className="mb-3 rounded-xl border border-border bg-accent p-3">
                  <code className="break-all font-mono text-sm text-foreground">{result.payinExtraId}</code>
                </div>
              </>
            )}

            {/* QR code */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl border border-border bg-background p-4">
                <QRCodeSVG value={result.payinAddress} size={180} level="H" />
              </div>
            </div>

            {/* Bridge ID */}
            <div className="mb-3 rounded-xl border border-border bg-accent p-3">
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{t("bridge.bridgeId")}</p>
              <p className="font-mono text-xs text-foreground break-all">{result.id}</p>
            </div>

            {/* Destination */}
            <div className="mb-4 rounded-xl border border-border bg-accent p-3">
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{t("bridge.destWallet")}</p>
              <p className="font-mono text-xs text-foreground break-all">{destAddress}</p>
            </div>

            {/* Download PDF */}
            <Button
              onClick={handleDownloadPdf}
              variant="outline"
              className="mb-3 w-full gap-2 rounded-xl py-5 font-display text-sm font-bold"
            >
              {pdfGenerated ? (
                <CheckCircle2 className="h-4 w-4 text-trust" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {pdfGenerated ? t("bridge.pdfDownloaded") : t("bridge.downloadReceipt")}
            </Button>

            {/* Privacy notice */}
            <p className="mb-4 text-center font-body text-[10px] text-muted-foreground">
              {t("bridge.noStorageNotice")}
            </p>

            {/* Start over */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => { setStep("form"); setResult(null); setDestAddress(""); }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("bridge.newBridge")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PermanentBridgeTab;
