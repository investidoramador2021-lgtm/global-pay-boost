import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LoanProductGuide, EarnProductGuide } from "@/components/LendEarnGuide";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, TrendingUp, Wallet, Clock, AlertTriangle, ArrowRight, Percent, DollarSign, Lock, Search, Copy, CheckCircle, Loader2, Phone, Mail } from "lucide-react";
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

  if (error) {
    throw new Error(error.message);
  }

  if (data && typeof data === "object" && "message" in data && (data as { result?: boolean }).result === false) {
    const diagnostics = (data as { diagnostics?: { requested_url?: string; request_body?: unknown } }).diagnostics;
    if (diagnostics?.requested_url) {
      console.error("CoinRabbit request failed", {
        url: diagnostics.requested_url,
        requestBody: diagnostics.request_body,
      });
    }
    throw new Error(String((data as { message?: string }).message || "CoinRabbit request failed"));
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Debounce hook                                                      */
/* ------------------------------------------------------------------ */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
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
          <div className="flex justify-center">
            <div className="rounded-xl border border-[#D4AF37]/20 bg-white p-4">
              <QRCodeSVG value={sendAddress} size={180} level="H" />
            </div>
          </div>
          <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t("lend.modal.sendExactly", "Send exactly")}</div>
            <div className="text-2xl font-bold text-[#D4AF37] font-mono">{amount} {currency.toUpperCase()}</div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("lend.modal.toAddress", "To this address")}</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-3">
              <code className="flex-1 text-xs text-foreground break-all font-mono">{sendAddress}</code>
              <Button size="icon" variant="ghost" onClick={copyAddress} className="shrink-0 h-8 w-8">
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
            <StatusIcon className={`h-5 w-5 ${statusConfig[status].color} ${status === "confirming" ? "animate-spin" : status === "waiting" ? "animate-pulse" : ""}`} />
            <span className={`text-sm font-medium ${statusConfig[status].color}`}>{statusConfig[status].label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            {t("lend.modal.compliance", "MRC GlobalPay · MSB Registration C100000015 · FINTRAC Regulated")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Country codes for phone picker                                     */
/* ------------------------------------------------------------------ */
const COUNTRY_CODES = [
  { code: "+1", label: "🇨🇦 CA", country: "Canada", id: "CA" },
  { code: "+1", label: "🇺🇸 US", country: "USA", id: "US" },
  { code: "+55", label: "🇧🇷 BR", country: "Brazil", id: "BR" },
  { code: "+44", label: "🇬🇧 UK", country: "UK", id: "GB" },
  { code: "+33", label: "🇫🇷 FR", country: "France", id: "FR" },
  { code: "+49", label: "🇩🇪 DE", country: "Germany", id: "DE" },
  { code: "+81", label: "🇯🇵 JP", country: "Japan", id: "JP" },
  { code: "+91", label: "🇮🇳 IN", country: "India", id: "IN" },
  { code: "+84", label: "🇻🇳 VN", country: "Vietnam", id: "VN" },
  { code: "+90", label: "🇹🇷 TR", country: "Turkey", id: "TR" },
  { code: "+380", label: "🇺🇦 UA", country: "Ukraine", id: "UA" },
  { code: "+92", label: "🇵🇰 PK", country: "Pakistan", id: "PK" },
  { code: "+972", label: "🇮🇱 IL", country: "Israel", id: "IL" },
  { code: "+98", label: "🇮🇷 IR", country: "Iran", id: "IR" },
  { code: "+27", label: "🇿🇦 ZA", country: "South Africa", id: "ZA" },
  { code: "+351", label: "🇵🇹 PT", country: "Portugal", id: "PT" },
  { code: "+34", label: "🇪🇸 ES", country: "Spain", id: "ES" },
];

/* ------------------------------------------------------------------ */
/*  Contact Confirm Modal – collects email + phone before submission    */
/* ------------------------------------------------------------------ */
interface ContactConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (email: string, phone: string) => void;
  loading: boolean;
  type: "loan" | "earn";
}

function ContactConfirmModal({ open, onClose, onConfirm, loading, type }: ContactConfirmModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("CA");
  const countryCode = COUNTRY_CODES.find(c => c.id === selectedCountryId)?.code || "+1";
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = t("lend.contact.invalidEmail", "Please enter a valid email address");
    }
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    if (!digitsOnly || digitsOnly.length < 7 || digitsOnly.length > 15) {
      newErrors.phone = t("lend.contact.invalidPhone", "Please enter a valid phone number");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const e164Phone = `${countryCode}${digitsOnly}`;
    onConfirm(email.trim(), e164Phone);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-[#D4AF37]/20 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-[#D4AF37]" />
            {type === "loan"
              ? t("lend.contact.titleLoan", "Confirm Loan Details")
              : t("lend.contact.titleEarn", "Confirm Earn Details")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3 w-3 me-1 text-[#D4AF37]" />
              {t("lend.contact.alertsNote", "Required for automated LTV and security alerts provided by our technology partner.")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email" className="flex items-center gap-1.5 text-sm text-foreground">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {t("lend.contact.emailLabel", "Email Address")}
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder={t("lend.contact.emailPlaceholder", "your@email.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="flex items-center gap-1.5 text-sm text-foreground">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {t("lend.contact.phoneLabel", "Phone Number")}
            </Label>
            <div className="flex gap-2">
              <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                <SelectTrigger className="w-[110px] border-border shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="contact-phone"
                type="tel"
                placeholder={t("lend.contact.phonePlaceholder", "123 456 7890")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s\-()]/g, ""))}
                className="border-border flex-1"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
          </div>

          {type === "loan" && (
            <div className="rounded-lg border border-[#D4AF37]/10 bg-[#D4AF37]/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-[#D4AF37]">
                <Shield className="inline h-3 w-3 me-1" />
                {t("lend.contact.proTipTitle", "Pro Tip: Automated Security Alerts")}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("lend.contact.proTipIntro", "All loan positions are continuously monitored by our infrastructure partner's automated risk engine.")}
              </p>
              <div className="space-y-1.5">
                <p className="text-[10px] leading-relaxed">
                  <span className="font-semibold text-yellow-500">{t("lend.contact.yellowZoneTitle", "Yellow Zone (Risk)")}: </span>
                  <span className="text-muted-foreground">{t("lend.contact.yellowZoneDesc", "If your collateral value decreases, the partner's system will automatically trigger instant SMS and email alerts to your registered contact details with instructions to adjust your position.")}</span>
                </p>
                <p className="text-[10px] leading-relaxed">
                  <span className="font-semibold text-red-500">{t("lend.contact.redZoneTitle", "Red Zone (Liquidation)")}: </span>
                  <span className="text-muted-foreground">{t("lend.contact.redZoneDesc", "To protect the lending pool and prevent further losses, the partner's automated engine will execute a liquidation if the value falls below the safety threshold without action.")}</span>
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/70 italic leading-relaxed border-t border-border/30 pt-1.5">
                {t("lend.contact.liabilityNotice", "MRC Global Pay provides the interface for these services; monitoring, alert delivery, and liquidation execution are managed exclusively by our technology partner. We recommend users maintain a healthy LTV buffer during market volatility.")}
              </p>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            {t("lend.contact.compliance", "MRC GlobalPay · MSB Registration C100000015 · Your data is encrypted and only used for transaction alerts.")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("lend.contact.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
            {loading ? t("lend.submitting") : t("lend.contact.confirm", "Confirm & Proceed")}
            <ArrowRight className="h-4 w-4 ms-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Loan Estimate data shape                                           */
/* ------------------------------------------------------------------ */
interface LoanEstimate {
  amount_to: number;
  ltv_percent: number;
  interest_percent: number;
  liquidation_price?: number;
  loan_deposit_min_amount?: number;
}

/* ------------------------------------------------------------------ */
/*  Loan Calculator – wired to /v2/loans/estimate                      */
/* ------------------------------------------------------------------ */
function LoanCalculator() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const [selectedAsset, setSelectedAsset] = useState<CollateralAsset>(COLLATERAL_ASSETS[0]);
  const [amount, setAmount] = useState<number | "">(1000);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<LoanEstimate | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  const debouncedAmount = useDebounce(typeof amount === "number" ? amount : 0, 500);
  const debouncedLtv = useDebounce(selectedLtv, 300);

  // Fetch live estimate from API
  useEffect(() => {
    if (debouncedAmount < 25) return;
    let cancelled = false;
    const fetchEstimate = async () => {
      setEstimating(true);
      try {
        const data = await coinrabbitApi("loan-estimate", {
          collateral_currency: selectedAsset.ticker.toLowerCase(),
          collateral_amount: debouncedAmount,
          ltv: debouncedLtv,
          loan_currency: "usdt",
        });
        if (!cancelled && data && !data.error) {
          setEstimate({
            amount_to: data.amount_to ?? data.loan_amount ?? 0,
            ltv_percent: data.ltv_percent ?? data.ltv ?? debouncedLtv,
            interest_percent: data.interest_percent ?? data.interest_rate ?? riskConfig.baseRate,
            liquidation_price: data.liquidation_price ?? data.liquidation_usd ?? undefined,
            loan_deposit_min_amount: data.loan_deposit_min_amount ?? data.min_amount ?? undefined,
          });
        }
      } catch {
        // API unavailable — keep using static fallback
      } finally {
        if (!cancelled) setEstimating(false);
      }
    };
    fetchEstimate();
    return () => { cancelled = true; };
  }, [selectedAsset.ticker, debouncedAmount, debouncedLtv]);

  // Computed values: prefer live estimate, fallback to static calc
  const numAmount = typeof amount === "number" ? amount : 0;
  const borrowable = estimate?.amount_to ?? Math.floor(numAmount * (selectedLtv / 100));
  const interestRate = estimate?.interest_percent ?? riskConfig.baseRate;
  const maxLtv = estimate?.ltv_percent ?? selectedLtv;
  const liquidationPrice = estimate?.liquidation_price ?? (numAmount > 0 ? (borrowable / numAmount) * 100 : 0);
  const minLoanAmount = estimate?.loan_deposit_min_amount ?? 25;
  const belowMinimum = numAmount > 0 && numAmount < minLoanAmount;

  const riskLabel = selectedLtv <= 50 ? t("lend.riskLow") : selectedLtv <= 70 ? t("lend.riskMedium") : t("lend.riskHigh");
  const riskColor = selectedLtv <= 50 ? "text-emerald-400" : selectedLtv <= 70 ? "text-[#D4AF37]" : "text-red-400";

  const ltvLabels: Record<string, string> = {
    "50": t("lend.conservative"),
    "70": t("lend.standard"),
    "80": t("lend.moderate"),
    "90": t("lend.aggressive"),
  };

  const handleOpenLoan = () => {
    if (numAmount <= 0 || belowMinimum) {
      toast.error(t("lend.belowMinLoan", `Minimum collateral is $${minLoanAmount}`));
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmLoan = async (email: string, phone: string) => {
    setLoading(true);
    try {
      const data = await coinrabbitApi("create-loan", {
        collateral_currency: selectedAsset.ticker.toLowerCase(),
        collateral_amount: parseFloat(numAmount.toFixed(8)),
        ltv: selectedLtv,
        loan_currency: "usdt",
        email,
        phone,
      });
      setConfirmOpen(false);
      const sendAddress = data?.send_address || data?.deposit_address || data?.address || "";
      const sendAmount = String(data?.collateral_amount || data?.amount || numAmount);
      const txId = data?.id || data?.loan_id || "";
      if (sendAddress) {
        setDepositInfo({ sendAddress, amount: sendAmount, currency: selectedAsset.ticker, txId });
        setModalOpen(true);
      } else {
        toast.success(t("lend.loanSuccess"));
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to open loan");
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
            <label className="text-sm font-medium text-muted-foreground">{t("lend.collateralUsd")}</label>
            <div className="relative">
              <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                placeholder={`Min $${minLoanAmount}`}
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  setAmount(v === "" ? "" : Math.max(0, parseFloat(v) || 0));
                }}
                className="ps-9 border-[#D4AF37]/30 font-mono text-lg"
                min={0}
              />
            </div>
            {numAmount > 0 && numAmount < minLoanAmount && (
              <p className="text-xs text-red-400">
                {t("lend.belowMinLoan", `Minimum collateral is $${minLoanAmount}`)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("lend.ltvRatio")}
              <span className="ms-2 text-xs text-[#D4AF37]">
                ({interestRate}% APR)
                {estimating && <Loader2 className="inline-block ms-1 h-3 w-3 animate-spin" />}
              </span>
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

          {/* Live results panel */}
          <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.youCanBorrow")}</span>
              <span className="text-lg font-bold text-[#D4AF37]">
                {estimating ? <Loader2 className="inline h-4 w-4 animate-spin" /> : fmt.usd(borrowable)} USDT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.maxLtv", "Max LTV")}</span>
              <span className="text-sm font-mono text-[#D4AF37]">{maxLtv}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.liquidationPrice")}</span>
              <span className={`text-sm font-mono ${riskColor}`}>${typeof liquidationPrice === "number" ? liquidationPrice.toFixed(2) : liquidationPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.riskLevel")}</span>
              <Badge variant="outline" className={`${riskColor} border-current`}>{riskLabel}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("lend.interestRate")}</span>
              <span className="text-sm font-mono text-[#D4AF37]">{interestRate}% APR</span>
            </div>
            {estimate && (
              <div className="text-[10px] text-emerald-400/70 text-end">
                ✓ {t("lend.liveEstimate", "Live estimate from API")}
              </div>
            )}
          </div>

          <Button
            onClick={handleOpenLoan}
            disabled={loading || belowMinimum || numAmount <= 0}
            className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
            {loading ? t("lend.submitting") : t("lend.openLoan")} <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed italic">
            {t("lend.liabilityShift", "Monitoring and alerts are managed by our infrastructure partner's automated risk engine.")}
          </p>
        </CardContent>
      </Card>

      <ContactConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmLoan}
        loading={loading}
        type="loan"
      />

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
/*  Earn Estimate data shape                                           */
/* ------------------------------------------------------------------ */
interface EarnEstimate {
  annual_percent: number;
  earn_min_amount?: number;
}

/* ------------------------------------------------------------------ */
/*  Yield Dashboard – wired to /v2/earns/estimate                      */
/* ------------------------------------------------------------------ */
function YieldDashboard() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const [selectedKey, setSelectedKey] = useState(EARN_ASSETS_UNIQUE_KEY(EARN_ASSETS[0]));
  const [depositAmount, setDepositAmount] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [earnEstimate, setEarnEstimate] = useState<EarnEstimate | null>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
  const debouncedAmount = useDebounce(numAmount, 500);

  // Fetch live earn estimate
  useEffect(() => {
    if (debouncedAmount <= 0) { setEarnEstimate(null); return; }
    let cancelled = false;
    const fetchEstimate = async () => {
      setEstimating(true);
      try {
        const data = await coinrabbitApi("earn-estimate", {
          currency: selected.ticker.toLowerCase(),
          currencyId: selected.currencyId,
          network: selected.network,
          amount: debouncedAmount,
        });
        if (!cancelled && data && !data.error) {
          setEarnEstimate({
            annual_percent: data.annual_percent ?? data.apy ?? selected.apy,
            earn_min_amount: data.earn_min_amount ?? data.min_amount ?? selected.minUsd,
          });
        }
      } catch {
        // API unavailable — keep static fallback
      } finally {
        if (!cancelled) setEstimating(false);
      }
    };
    fetchEstimate();
    return () => { cancelled = true; };
  }, [selected.ticker, debouncedAmount]);

  // Use live rate or fallback
  const apy = earnEstimate?.annual_percent ?? selected.apy;
  const minEarnAmount = earnEstimate?.earn_min_amount ?? selected.minUsd;
  const belowMinimum = numAmount > 0 && numAmount < minEarnAmount;

  const dailyRate = apy / 365;
  const dailyEarning = numAmount * (dailyRate / 100);
  const weeklyEarning = dailyEarning * 7;
  const monthlyEarning = numAmount * (apy / 12 / 100);
  const annualEarning = numAmount * (apy / 100);

  const selectAndScroll = (key: string) => {
    setSelectedKey(key);
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const handleDeposit = () => {
    if (belowMinimum) {
      toast.error(t("lend.minDeposit", { min: minEarnAmount }));
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmEarn = async (email: string, phone: string) => {
    setLoading(true);
    try {
      const data = await coinrabbitApi("create-earn", {
        currency: selected.ticker.toLowerCase(),
        currencyId: selected.currencyId,
        network: selected.network,
        amount: numAmount,
        email,
        phone,
      });
      setConfirmOpen(false);
      const sendAddress = data?.send_address || data?.deposit_address || data?.address || "";
      const sendAmount = String(data?.amount || numAmount);
      const txId = data?.id || data?.earn_id || "";
      if (sendAddress) {
        setDepositInfo({ sendAddress, amount: sendAmount, currency: selected.ticker, txId });
        setModalOpen(true);
      } else {
        toast.success(t("lend.earnSuccess", "Earn deposit initiated!"));
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to start earning");
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
                {t("lend.earnCalculator", "Earn Calculator")}
                {estimating && <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />}
              </CardTitle>
              <CardDescription>{t("lend.earnCalcDesc", "Select an asset & enter your deposit to see projected returns.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Deposit Asset selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("lend.depositAsset", "Deposit Asset")}</label>
                <select
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="flex h-10 w-full items-center rounded-md border border-[#D4AF37]/30 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {EARN_ASSETS.map((a) => {
                    const k = EARN_ASSETS_UNIQUE_KEY(a);
                    return <option key={k} value={k}>{a.ticker} — {a.name} ({a.network})</option>;
                  })}
                </select>
              </div>

              {/* Your Deposit input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t("lend.yourDeposit", "Your Deposit")}</label>
                <div className="relative">
                  <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={`Min $${minEarnAmount}`}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="ps-9 border-[#D4AF37]/30 font-mono text-lg"
                  />
                </div>
                {belowMinimum && (
                  <p className="text-xs text-red-400">
                    {t("lend.minDeposit", { min: minEarnAmount })}
                  </p>
                )}
              </div>

              {/* Live APY display */}
              <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 text-center space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{selected.ticker} {t("lend.annualYield", "Annual Yield")}</div>
                <div className="text-4xl font-bold text-[#D4AF37]">{apy}% <span className="text-lg font-normal">APY</span></div>
                {earnEstimate && (
                  <span className="text-[10px] text-emerald-400">✓ {t("lend.liveEstimate", "Live rate from API")}</span>
                )}
              </div>

              {/* 1-year projection hero */}
              {numAmount > 0 && (
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 text-center space-y-1">
                  <div className="text-xs text-muted-foreground">{t("lend.inOneYear", "In 1 year you will have")}</div>
                  <div className="text-3xl font-bold text-emerald-400">{fmt.usd(numAmount + annualEarning)}</div>
                  <div className="text-sm text-emerald-400/80">
                    {fmt.usd(numAmount)} + {fmt.usd(annualEarning)} {t("lend.interest", "interest")}
                  </div>
                </div>
              )}

              {/* Earnings Breakdown grid */}
              {numAmount > 0 && (
                <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 overflow-hidden">
                  <div className="bg-[#D4AF37]/5 px-4 py-2 border-b border-[#D4AF37]/10">
                    <h4 className="text-sm font-semibold text-foreground">{t("lend.earningsBreakdown", "Earnings Breakdown")}</h4>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-4 space-y-1 text-center">
                      <div className="text-xs text-muted-foreground">{t("lend.monthlyReward", "Monthly Reward")}</div>
                      <div className="text-lg font-bold text-[#D4AF37] font-mono">{fmt.usd(monthlyEarning)}</div>
                    </div>
                    <div className="p-4 space-y-1 text-center">
                      <div className="text-xs text-muted-foreground">{t("lend.interestAccrual", "Interest Accrual")}</div>
                      <div className="text-lg font-bold text-foreground">{t("lend.daily", "Daily")}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                    <div className="p-4 space-y-1 text-center">
                      <div className="text-xs text-muted-foreground">{t("lend.term", "Term")}</div>
                      <div className="text-lg font-bold text-foreground">{t("lend.unlimited", "Unlimited (Flexible)")}</div>
                    </div>
                    <div className="p-4 space-y-1 text-center">
                      <div className="text-xs text-muted-foreground">{t("lend.annualReturn", "Annual Return")}</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">+{fmt.usd(annualEarning)}</div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleDeposit}
                disabled={loading || numAmount <= 0 || belowMinimum}
                className="w-full h-12 bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 font-semibold text-base"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Percent className="h-4 w-4 me-2" />}
                {t("lend.startEarning", "Start Earning")} <ArrowRight className="h-4 w-4 ms-1" />
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                {t("lend.modal.compliance", "MRC GlobalPay · MSB Registration C100000015 · FINTRAC Regulated")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmEarn}
        loading={loading}
        type="earn"
      />

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
    if (!txId.trim()) { toast.error(t("lend.enterTxId")); return; }
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
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isDone ? "border-emerald-400 bg-emerald-400/20" : isActive ? "border-[#D4AF37] bg-[#D4AF37]/20 animate-pulse" : "border-border bg-background"
                    }`}>
                      <Icon className={`h-5 w-5 ${isDone ? "text-emerald-400" : isActive ? "text-[#D4AF37]" : "text-muted-foreground"}`} />
                    </div>
                    {i < STEPS.length - 1 && <div className={`h-8 w-0.5 ${isDone ? "bg-emerald-400" : "bg-border"}`} />}
                  </div>
                  <div className="pt-2">
                    <div className={`font-medium ${isActive ? "text-[#D4AF37]" : isDone ? "text-emerald-400" : "text-muted-foreground"}`}>{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {txData && (
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <pre className="text-xs text-muted-foreground overflow-auto max-h-32">{JSON.stringify(txData, null, 2)}</pre>
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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What happens if my collateral value drops?", "acceptedAnswer": { "@type": "Answer", "text": "You will receive notifications when your collateral approaches the liquidation threshold. You can top up additional collateral at any time to maintain a healthy LTV ratio." }},
            { "@type": "Question", "name": "Is there a minimum or maximum loan amount?", "acceptedAnswer": { "@type": "Answer", "text": "The minimum loan amount depends on the collateral asset and is shown in the calculator. There is no hard maximum." }},
            { "@type": "Question", "name": "Can I repay my loan early?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. There are no early repayment penalties. You can repay the principal plus accrued interest at any time to unlock your collateral." }},
            { "@type": "Question", "name": "Is there a lock-up period for Earn?", "acceptedAnswer": { "@type": "Answer", "text": "No. MRC GlobalPay Earn is completely flexible. You can withdraw your full principal and all earned interest at any time with no penalties." }},
            { "@type": "Question", "name": "How often is interest paid?", "acceptedAnswer": { "@type": "Answer", "text": "Interest is accrued daily and automatically compounded into your balance." }},
          ]
        })}</script>
      </Helmet>
      <HreflangTags />
      <SiteHeader />

      <main className="min-h-screen bg-background">
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
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("lend.heroSubtitle")}</p>
          </div>
        </section>

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

            <TabsContent value="borrow" className="space-y-12">
              <div className="max-w-xl mx-auto">
                <LoanCalculator />
              </div>
              <div className="max-w-4xl mx-auto">
                <LoanProductGuide />
              </div>
            </TabsContent>
            <TabsContent value="earn" className="space-y-12">
              <YieldDashboard />
              <div className="max-w-4xl mx-auto">
                <EarnProductGuide />
              </div>
            </TabsContent>
            <TabsContent value="track" className="max-w-xl mx-auto">
              <TransactionTracker />
            </TabsContent>
          </Tabs>
        </section>

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
