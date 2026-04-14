import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, TrendingUp, Wallet, Clock, AlertTriangle, ArrowRight, Percent, DollarSign, Lock, Search } from "lucide-react";
import CollateralSelector from "@/components/CollateralSelector";
import { COLLATERAL_ASSETS, LTV_BY_RISK, type CollateralAsset } from "@/lib/coinrabbit-assets";
import { EARN_ASSETS, EARN_ASSETS_UNIQUE_KEY } from "@/lib/coinrabbit-earn-assets";

/* ------------------------------------------------------------------ */
/*  API helper                                                         */
/* ------------------------------------------------------------------ */
async function coinrabbitApi(endpoint: string, method = "GET", body?: unknown) {
  const { data, error } = await supabase.functions.invoke("coinrabbit", {
    body: { endpoint, method, body },
  });
  if (error) throw new Error(error.message);
  return data;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
/* (Earn data now comes from coinrabbit-earn-assets.ts) */

/* ------------------------------------------------------------------ */
/*  Loan Calculator                                                    */
/* ------------------------------------------------------------------ */
function LoanCalculator() {
  const [selectedAsset, setSelectedAsset] = useState<CollateralAsset>(COLLATERAL_ASSETS[0]);
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  const riskConfig = LTV_BY_RISK[selectedAsset.riskTier];
  const ltvOptions = riskConfig.ltvOptions;

  const [selectedLtv, setSelectedLtv] = useState(ltvOptions[1] ?? ltvOptions[0]);

  // Reset LTV when asset risk tier changes
  useEffect(() => {
    const opts = LTV_BY_RISK[selectedAsset.riskTier].ltvOptions;
    if (!opts.includes(selectedLtv as any)) {
      setSelectedLtv(opts[1] ?? opts[0]);
    }
  }, [selectedAsset.riskTier]);

  const borrowable = Math.floor(amount * (selectedLtv / 100));
  const liquidationPrice = amount > 0 ? ((borrowable / amount) * 100).toFixed(2) : "0";
  const riskLabel = selectedLtv <= 50 ? "Low risk" : selectedLtv <= 70 ? "Medium risk" : "High risk";
  const riskColor = selectedLtv <= 50 ? "text-emerald-400" : selectedLtv <= 70 ? "text-[#D4AF37]" : "text-red-400";

  const handleOpenLoan = async () => {
    setLoading(true);
    try {
      await coinrabbitApi("/loans/open", "POST", {
        collateral_currency: selectedAsset.ticker.toLowerCase(),
        collateral_amount: amount,
        ltv: selectedLtv,
        loan_currency: "usdt",
      });
      toast.success("Loan request submitted! Check the tracking tab for status.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to open loan";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#D4AF37]/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <DollarSign className="h-5 w-5 text-[#D4AF37]" />
          Loan Calculator
        </CardTitle>
        <CardDescription>Select collateral and LTV to see your borrowing power.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collateral selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Collateral Asset</label>
          <CollateralSelector
            value={selectedAsset.ticker}
            onChange={setSelectedAsset}
          />
        </div>

        {/* Amount slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collateral (USD)</span>
            <span className="font-mono text-[#D4AF37]">${amount.toLocaleString()}</span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={25}
            max={50000}
            step={50}
            className="[&_[role=slider]]:border-[#D4AF37] [&_[role=slider]]:bg-[#D4AF37]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$25</span>
            <span>$50,000</span>
          </div>
        </div>

        {/* LTV selector – dynamic based on asset risk tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            LTV Ratio
            <span className="ml-2 text-xs text-[#D4AF37]">({riskConfig.baseRate}% APR)</span>
          </label>
          <div className={`grid gap-2 ${ltvOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {ltvOptions.map((ltv) => {
              const label = ltv <= 50 ? "Conservative" : ltv <= 70 ? "Standard" : ltv <= 80 ? "Moderate" : "Aggressive";
              return (
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
                  <div className="text-xs text-muted-foreground">{label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-lg border border-[#D4AF37]/20 bg-background/50 p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">You can borrow</span>
            <span className="text-lg font-bold text-[#D4AF37]">${borrowable.toLocaleString()} USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Liquidation Price</span>
            <span className={`text-sm font-mono ${riskColor}`}>${liquidationPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <Badge variant="outline" className={`${riskColor} border-current`}>
              {riskLabel}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Interest Rate</span>
            <span className="text-sm font-mono text-[#D4AF37]">{riskConfig.baseRate}% APR</span>
          </div>
        </div>

        <Button
          onClick={handleOpenLoan}
          disabled={loading}
          className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 font-semibold"
        >
          {loading ? "Submitting…" : "Open Loan"} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Yield Dashboard                                                    */
/* ------------------------------------------------------------------ */
function YieldDashboard() {
  const [selectedKey, setSelectedKey] = useState(EARN_ASSETS_UNIQUE_KEY(EARN_ASSETS[0]));
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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

  const handleDeposit = async () => {
    if (numAmount < selected.minUsd) {
      toast.error(`Minimum deposit is $${selected.minUsd}`);
      return;
    }
    setLoading(true);
    try {
      await coinrabbitApi("/earn/deposit", "POST", {
        currency: selected.ticker.toLowerCase(),
        amount: numAmount,
      });
      toast.success("Deposit submitted! Your yield starts accruing immediately.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Deposit failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search 50+ earn assets…"
          className="pl-10 border-[#D4AF37]/30"
        />
      </div>

      {/* Asset grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((asset) => {
          const key = EARN_ASSETS_UNIQUE_KEY(asset);
          return (
            <Card
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`cursor-pointer transition-all border ${
                selectedKey === key
                  ? "border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/30"
                  : "border-border hover:border-[#D4AF37]/40"
              }`}
            >
              <CardContent className="p-3 space-y-1.5">
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
                <div className="text-[10px] text-muted-foreground">APY · {asset.daily}% daily</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">No earn assets match your search.</p>
      )}

      {/* Deposit form */}
      <Card className="border-[#D4AF37]/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
            Start Earning on {selected.ticker}
            <span className="text-xs font-normal text-muted-foreground">({selected.network})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Deposit Amount (USD)</label>
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
                <span className="text-muted-foreground">Daily Earnings</span>
                <span className="font-mono text-emerald-400">+${dailyEarning.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Annual Earnings</span>
                <span className="font-mono text-[#D4AF37]">+${annualEarning.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleDeposit}
            disabled={loading || numAmount < selected.minUsd}
            className="w-full bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90 font-semibold"
          >
            {loading ? "Submitting…" : "Deposit & Earn"} <Wallet className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Transaction Tracker                                                */
/* ------------------------------------------------------------------ */
const STEPS = [
  { label: "Waiting for Deposit", icon: Clock, description: "Send collateral to the provided address" },
  { label: "Confirming", icon: Shield, description: "Blockchain confirmations in progress" },
  { label: "Active", icon: TrendingUp, description: "Your position is live" },
];

function TransactionTracker() {
  const [txId, setTxId] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [polling, setPolling] = useState(false);
  const [txData, setTxData] = useState<Record<string, unknown> | null>(null);

  const checkStatus = useCallback(async () => {
    if (!txId.trim()) return;
    try {
      const data = await coinrabbitApi(`/loans/list?id=${encodeURIComponent(txId)}`);
      setTxData(data);
      // Map status to step
      const status = String(data?.status || data?.loan_status || "").toLowerCase();
      if (status.includes("active") || status.includes("completed")) setCurrentStep(2);
      else if (status.includes("confirm") || status.includes("processing")) setCurrentStep(1);
      else setCurrentStep(0);
    } catch {
      toast.error("Could not fetch transaction status.");
    }
  }, [txId]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [polling, checkStatus]);

  const handleTrack = () => {
    if (!txId.trim()) {
      toast.error("Enter a transaction ID");
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
          Track Transaction
        </CardTitle>
        <CardDescription>Enter your loan or earn transaction ID to track progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Transaction ID"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            className="border-[#D4AF37]/30 font-mono"
          />
          <Button onClick={handleTrack} className="bg-[#D4AF37] text-background hover:bg-[#D4AF37]/90">
            Track
          </Button>
        </div>

        {/* Stepper */}
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
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");
  const defaultTab = tabParam === "earn" ? "earn" : tabParam === "track" ? "track" : "borrow";

  return (
    <>
      <Helmet>
        <title>Crypto Lending & Earn | Borrow USDT Against BTC/ETH/SOL | MRC GlobalPay</title>
        <meta
          name="description"
          content="Borrow stablecoins against your crypto or earn yield on BTC, ETH, and USDT. No KYC required. Powered by MRC GlobalPay — Registered Canadian MSB."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mrcglobalpay.com/lend" />
      </Helmet>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
            <Badge variant="outline" className="mb-4 border-[#D4AF37]/40 text-[#D4AF37]">
              <Lock className="mr-1 h-3 w-3" /> MSB Regulated · Non-Custodial
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Crypto <span className="text-[#D4AF37]">Lending</span> &{" "}
              <span className="text-[#D4AF37]">Earn</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Borrow stablecoins against your crypto holdings or earn competitive yield — all without selling your assets.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-muted/50">
              <TabsTrigger value="borrow" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-background">
                <DollarSign className="mr-1 h-4 w-4" /> Borrow
              </TabsTrigger>
              <TabsTrigger value="earn" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-background">
                <Percent className="mr-1 h-4 w-4" /> Earn
              </TabsTrigger>
              <TabsTrigger value="track" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-background">
                <Clock className="mr-1 h-4 w-4" /> Track
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
                <strong className="text-foreground">Compliance Disclaimer:</strong> As a registered Canadian
                Money Services Business (MSB — Registration No.{" "}
                <span className="font-mono text-[#D4AF37]">C100000015</span>), all lending operations
                conducted through MRC GlobalPay follow federal Anti-Money Laundering (AML) and
                Anti-Terrorist Financing (ATF) guidelines. Cryptocurrency lending involves risk. Collateral
                may be liquidated if asset prices drop below the liquidation threshold. This is not financial
                advice.
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
