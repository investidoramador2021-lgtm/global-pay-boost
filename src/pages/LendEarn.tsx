import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, TrendingUp, Wallet, Clock, AlertTriangle, ArrowRight, Percent, DollarSign, Lock, Search, Copy, CheckCircle, Loader2, X } from "lucide-react";
import CollateralSelector from "@/components/CollateralSelector";
import { COLLATERAL_ASSETS, LTV_BY_RISK, type CollateralAsset } from "@/lib/coinrabbit-assets";
import { EARN_ASSETS, EARN_ASSETS_UNIQUE_KEY } from "@/lib/coinrabbit-earn-assets";
import HreflangTags from "@/components/HreflangTags";

/* ------------------------------------------------------------------ */
/*  Locale-aware number formatter                                      */
/* ------------------------------------------------------------------ */
function useLocaleFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.language === "fa" ? "fa-IR" : i18n.language === "ur" ? "ur-PK" : i18n.language === "he" ? "he-IL" : i18n.language;
  return useMemo(() => ({
    usd: (v: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v),
    num: (v: number, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(v),
    pct: (v: number, digits = 2) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: digits }).format(v / 100),
  }), [locale]);
}

/* ------------------------------------------------------------------ */
/*  API helper                                                         */
/* ------------------------------------------------------------------ */
async function coinrabbitApi(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("coinrabbit", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message);
  return data;
}

/* ------------------------------------------------------------------ */
/*  Deposit Modal – white-labeled, no redirect                         */
/* ------------------------------------------------------------------ */
interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  sendAddress: string;
  amount: string;
  currency: string;
  txId: string;
  type: "loan" | "earn";
}

function DepositModal({ open, onClose, sendAddress, amount, currency, txId, type }: DepositModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"waiting" | "confirming" | "success">("waiting");
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const copyAddress = () => {
    navigator.clipboard.writeText(sendAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status polling
  useEffect(() => {
    if (!open || !txId) return;
    const poll = async () => {
      try {
        const data = await coinrabbitApi(type === "loan" ? "loan-status" : "earn-status", { id: txId });
        const s = String(data?.status || "").toLowerCase();
        if (s.includes("active") || s.includes("completed") || s.includes("success")) {
          setStatus("success");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (s.includes("confirm") || s.includes("processing")) {
          setStatus("confirming");
        }
      } catch { /* silent */ }
    };
    poll();
    pollRef.current = setInterval(poll, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, txId, type]);

  const statusConfig = {
    waiting: { icon: Clock, label: t("lend.modal.waiting", "Waiting for deposit…"), color: "text-[#D4AF37]" },
    confirming: { icon: Loader2, label: t("lend.modal.confirming", "Confirming on-chain…"), color: "text-[#D4AF37]" },
    success: { icon: CheckCircle, label: t("lend.modal.success", "Deposit confirmed!"), color: "text-emerald-400" },
  };
  const StatusIcon = statusConfig[status].icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-[#D4AF37]/20 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="h-5 w-5 text-[#D4AF37]" />
            {type === "loan" ? t("lend.modal.titleLoan", "Send Collateral") : t("lend.modal.titleEarn", "Send Deposit")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-[#D4AF37]/20 bg-white p-4">
              <QRCodeSVG value={sendAddress} size={180} level="H" />
            </div>
          </div>

          {/* Amount */}
          <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t("lend.modal.sendExactly", "Send exactly")}</div>
            <div className="text-2xl font-bold text-[#D4AF37] font-mono">{amount} {currency.toUpperCase()}</div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("lend.modal.toAddress", "To this address")}</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-3">
              <code className="flex-1 text-xs text-foreground break-all font-mono">{sendAddress}</code>
              <Button size="icon" variant="ghost" onClick={copyAddress} className="shrink-0 h-8 w-8">
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
            <StatusIcon className={`h-5 w-5 ${statusConfig[status].color} ${status === "confirming" ? "animate-spin" : status === "waiting" ? "animate-pulse" : ""}`} />
            <span className={`text-sm font-medium ${statusConfig[status].color}`}>{statusConfig[status].label}</span>
          </div>

          {/* MSB Compliance */}
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            {t("lend.modal.compliance", "MRC GlobalPay · MSB Registration C100000015 · FINTRAC Regulated")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Loan Calculator                                                    */
/* ------------------------------------------------------------------ */
function LoanCalculator() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const [selectedAsset, setSelectedAsset] = useState<CollateralAsset>(COLLATERAL_ASSETS[0]);
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  // Deposit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [depositInfo, setDepositInfo] = useState({ sendAddress: "", amount: "", currency: "", txId: "" });

  const riskConfig = LTV_BY_RISK[selectedAsset.riskTier];
  const ltvOptions = riskConfig.ltvOptions;
  const [selectedLtv, setSelectedLtv] = useState(ltvOptions[1] ?? ltvOptions[0]);

  useEffect(() => {
    const opts = LTV_BY_RISK[selectedAsset.riskTier].ltvOptions;
    if (!opts.includes(selectedLtv as any)) {
      setSelectedLtv(opts[1] ?? opts[0]);
    }
  }, [selectedAsset.riskTier]);

  const borrowable = Math.floor(amount * (selectedLtv / 100));
  const liquidationPrice = amount > 0 ? ((borrowable / amount) * 100).toFixed(2) : "0";
  const riskLabel = selectedLtv <= 50 ? t("lend.riskLow") : selectedLtv <= 70 ? t("lend.riskMedium") : t("lend.riskHigh");
  const riskColor = selectedLtv <= 50 ? "text-emerald-400" : selectedLtv <= 70 ? "text-[#D4AF37]" : "text-red-400";

  const ltvLabels: Record<string, string> = {
    "50": t("lend.conservative"),
    "70": t("lend.standard"),
    "80": t("lend.moderate"),
    "90": t("lend.aggressive"),
  };

  const handleOpenLoan = async () => {
    setLoading(true);
    try {
      const data = await coinrabbitApi("create-loan", {
        collateral_currency: selectedAsset.ticker.toLowerCase(),
        collateral_amount: amount,
        ltv: selectedLtv,
        loan_currency: "usdt",
      });

      // Extract send_address from API response
      const sendAddress = data?.send_address || data?.deposit_address || data?.address || "";
      const sendAmount = String(data?.collateral_amount || data?.amount || amount);
      const txId = data?.id || data?.loan_id || "";

      if (sendAddress) {
        setDepositInfo({
          sendAddress,
          amount: sendAmount,
          currency: selectedAsset.ticker,
          txId,
        });
        setModalOpen(true);
      } else {
        toast.success(t("lend.loanSuccess"));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to open loan";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-[#D4AF37]/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-[#D4AF37]" />
            {t("lend.loanCalcTitle")}
          </CardTitle>
          <CardDescription>{t("lend.loanCalcDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("lend.collateralAsset")}</label>
            <CollateralSelector value={selectedAsset.ticker} onChange={setSelectedAsset} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("lend.collateralUsd")}</span>
              <span className="font-mono text-[#D4AF37]">{fmt.usd(amount)}</span>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(v) => setAmount(v[0])}
              min={25}
              max={50000}
              step={50}
              className="[&_[role=slider]]:border-[#D4AF37] [&_[role=slider]]:bg-[#D4AF37]"
              dir="ltr"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$25</span>
              <span>$50,000</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("lend.ltvRatio")}
              <span className="ms-2 text-xs text-[#D4AF37]">({riskConfig.baseRate}% APR)</span>
            </label>
            <div className={`grid gap-2 ${ltvOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {ltvOptions.map((ltv) => (
                <button
                  key={ltv}
                  onClick={() => setSelectedLtv(ltv)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    selectedLtv === ltv
                      ? "border-[#D4AF37] bg-[#D4AF37]/10"
                      : "border-border hover:border-[#D4AF37]/40"
                  }`}
                >
                  <div className={`text-lg font-bold ${ltv <= 50 ? "text-emerald-400" : ltv <= 70 ? "text-[#D4AF37]" : "text-red-400"}`}>{ltv}%</div>
                  <div className="text-xs text-muted-foreground">{ltvLabels[String(ltv)] ?? t("lend.standard")}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.youCanBorrow")}</span>
              <span className="text-lg font-bold text-[#D4AF37]">{fmt.usd(borrowable)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.liquidationPrice")}</span>
              <span className={`text-sm font-mono ${riskColor}`}>${liquidationPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.riskLevel")}</span>
              <Badge variant="outline" className={`${riskColor} border-current`}>
                {riskLabel}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.interestRate")}</span>
              <span className="text-sm font-mono text-[#D4AF37]">{riskConfig.baseRate}% APR</span>
            </div>
          </div>

          <Button
            onClick={handleOpenLoan}
            disabled={loading}
            className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
            {loading ? t("lend.submitting") : t("lend.openLoan")} <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <DepositModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sendAddress={depositInfo.sendAddress}
        amount={depositInfo.amount}
        currency={depositInfo.currency}
        txId={depositInfo.txId}
        type="loan"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Yield Dashboard                                                    */
/* ------------------------------------------------------------------ */
function YieldDashboard() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const [selectedKey, setSelectedKey] = useState(EARN_ASSETS_UNIQUE_KEY(EARN_ASSETS[0]));
  const [depositAmount, setDepositAmount] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);

  // Deposit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [depositInfo, setDepositInfo] = useState({ sendAddress: "", amount: "", currency: "", txId: "" });

  const selected = useMemo(
    () => EARN_ASSETS.find((a) => EARN_ASSETS_UNIQUE_KEY(a) === selectedKey) ?? EARN_ASSETS[0],
    [selectedKey],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return EARN_ASSETS;
    const q = search.toLowerCase();
    return EARN_ASSETS.filter(
      (a) => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.network.toLowerCase().includes(q),
    );
  }, [search]);

  const numAmount = parseFloat(depositAmount) || 0;
  const dailyEarning = numAmount * (selected.daily / 100);
  const annualEarning = numAmount * (selected.apy / 100);

  const selectAndScroll = (key: string) => {
    setSelectedKey(key);
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const handleDeposit = async () => {
    if (numAmount < selected.minUsd) {
      toast.error(t("lend.minDeposit", { min: selected.minUsd }));
      return;
    }
    setLoading(true);
    try {
      const data = await coinrabbitApi("create-earn", {
        currency: selected.ticker.toLowerCase(),
        amount: numAmount,
      });

      const sendAddress = data?.send_address || data?.deposit_address || data?.address || "";
      const sendAmount = String(data?.amount || numAmount);
      const txId = data?.id || data?.earn_id || "";

      if (sendAddress) {
        setDepositInfo({
          sendAddress,
          amount: sendAmount,
          currency: selected.ticker,
          txId,
        });
        setModalOpen(true);
      } else {
        toast.success(t("lend.earnSuccess", "Earn deposit initiated!"));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start earning";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("lend.searchEarnAssets")}
            className="ps-10 border-[#D4AF37]/30"
          />
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((asset) => {
            const key = EARN_ASSETS_UNIQUE_KEY(asset);
            return (
              <Card
                key={key}
                onClick={() => selectAndScroll(key)}
                className={`cursor-pointer transition-all border ${
                  selectedKey === key
                    ? "border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/30"
                    : "border-border hover:border-[#D4AF37]/40"
                }`}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={asset.icon}
                      alt={asset.ticker}
                      className="h-7 w-7 rounded-full"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{asset.ticker}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{asset.network}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#D4AF37]">{asset.apy}%</div>
                  <div className="text-[10px] text-muted-foreground">APY · {asset.daily}% {t("lend.daily")}</div>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); selectAndScroll(key); }}
                    className="w-full mt-1 bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 text-xs font-semibold"
                  >
                    {t("lend.earnNow")} <ArrowRight className="ms-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">{t("lend.noEarnAssets")}</p>
        )}

        <div ref={calcRef}>
          <Card className="border-[#D4AF37]/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                {t("lend.startEarningOn")} {selected.ticker}
                <span className="text-xs font-normal text-muted-foreground">({selected.network})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t("lend.depositAmountUsd")}</label>
                <Input
                  type="number"
                  placeholder={`Min $${selected.minUsd}`}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="border-[#D4AF37]/30 font-mono"
                />
              </div>

              {numAmount > 0 && (
                <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("lend.dailyEarnings")}</span>
                    <span className="font-mono text-emerald-400">+{fmt.usd(dailyEarning)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("lend.annualEarnings")}</span>
                    <span className="font-mono text-[#D4AF37]">+{fmt.usd(annualEarning)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleDeposit}
                disabled={loading || numAmount <= 0}
                className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 font-semibold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {t("lend.startEarning")} {selected.ticker} <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <DepositModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sendAddress={depositInfo.sendAddress}
        amount={depositInfo.amount}
        currency={depositInfo.currency}
        txId={depositInfo.txId}
        type="earn"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Transaction Tracker                                                */
/* ------------------------------------------------------------------ */
function TransactionTracker() {
  const { t } = useTranslation();
  const [txId, setTxId] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [polling, setPolling] = useState(false);
  const [txData, setTxData] = useState<Record<string, unknown> | null>(null);

  const STEPS = useMemo(() => [
    { label: t("lend.stepWaiting"), icon: Clock, description: t("lend.stepWaitingDesc") },
    { label: t("lend.stepConfirming"), icon: Shield, description: t("lend.stepConfirmingDesc") },
    { label: t("lend.stepActive"), icon: TrendingUp, description: t("lend.stepActiveDesc") },
  ], [t]);

  const checkStatus = useCallback(async () => {
    if (!txId.trim()) return;
    try {
      const data = await coinrabbitApi("loan-status", { id: txId });
      setTxData(data);
      const status = String(data?.status || data?.loan_status || "").toLowerCase();
      if (status.includes("active") || status.includes("completed")) setCurrentStep(2);
      else if (status.includes("confirm") || status.includes("processing")) setCurrentStep(1);
      else setCurrentStep(0);
    } catch {
      toast.error(t("lend.trackError"));
    }
  }, [txId, t]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [polling, checkStatus]);

  const handleTrack = () => {
    if (!txId.trim()) {
      toast.error(t("lend.enterTxId"));
      return;
    }
    setPolling(true);
    checkStatus();
  };

  return (
    <Card className="border-[#D4AF37]/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-[#D4AF37]" />
          {t("lend.trackTitle")}
        </CardTitle>
        <CardDescription>{t("lend.trackDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder={t("lend.transactionId")}
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            className="border-[#D4AF37]/30 font-mono"
          />
          <Button onClick={handleTrack} className="bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90">
            {t("lend.trackBtn")}
          </Button>
        </div>

        {currentStep >= 0 && (
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <div key={step.label} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isDone
                          ? "border-emerald-400 bg-emerald-400/20"
                          : isActive
                          ? "border-[#D4AF37] bg-[#D4AF37]/20 animate-pulse"
                          : "border-border bg-background"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isDone ? "text-emerald-400" : isActive ? "text-[#D4AF37]" : "text-muted-foreground"}`} />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-8 w-0.5 ${isDone ? "bg-emerald-400" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pt-2">
                    <div className={`font-medium ${isActive ? "text-[#D4AF37]" : isDone ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {txData && (
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
              {JSON.stringify(txData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function LendEarn() {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");
  const defaultTab = tabParam === "earn" ? "earn" : tabParam === "track" ? "track" : "borrow";

  return (
    <>
      <Helmet>
        <title>{t("lend.metaTitle")}</title>
        <meta name="description" content={t("lend.metaDesc")} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <HreflangTags />
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
            <Badge variant="outline" className="mb-4 border-[#D4AF37]/40 text-[#D4AF37]">
              <Lock className="me-1 h-3 w-3" /> {t("lend.heroBadge")}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("lend.heroTitle")} <span className="text-[#D4AF37]">{t("lend.heroLending")}</span> {t("lend.heroAnd")}{" "}
              <span className="text-[#D4AF37]">{t("lend.heroEarn")}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("lend.heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-muted/50">
              <TabsTrigger value="borrow" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-background">
                <DollarSign className="me-1 h-4 w-4" /> {t("lend.tabBorrow")}
              </TabsTrigger>
              <TabsTrigger value="earn" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-background">
                <Percent className="me-1 h-4 w-4" /> {t("lend.tabEarn")}
              </TabsTrigger>
              <TabsTrigger value="track" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-background">
                <Clock className="me-1 h-4 w-4" /> {t("lend.tabTrack")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="borrow" className="max-w-xl mx-auto">
              <LoanCalculator />
            </TabsContent>

            <TabsContent value="earn">
              <YieldDashboard />
            </TabsContent>

            <TabsContent value="track" className="max-w-xl mx-auto">
              <TransactionTracker />
            </TabsContent>
          </Tabs>
        </section>

        {/* Compliance Disclaimer */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex items-start gap-3 rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4AF37]" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{t("lend.complianceTitle")}</strong>{" "}
                {t("lend.complianceText")}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
