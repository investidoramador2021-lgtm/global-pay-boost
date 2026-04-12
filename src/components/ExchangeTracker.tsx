import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, ArrowRightLeft, Clock, CheckCircle2, XCircle, AlertTriangle, Search, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Bitcoin } from "lucide-react";

interface CNExchange {
  id: string;
  status: string;
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  expectedAmountFrom: number | null;
  expectedAmountTo: number | null;
  amountFrom: number | null;
  amountTo: number | null;
  payinAddress: string;
  payoutAddress: string;
  payinHash: string | null;
  payoutHash: string | null;
  createdAt: string;
  updatedAt: string;
  depositReceivedAt: string | null;
  flow: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "text-muted-foreground", icon: <Clock className="w-3.5 h-3.5" /> },
  waiting: { label: "Waiting", color: "text-amber-400", icon: <Clock className="w-3.5 h-3.5" /> },
  confirming: { label: "Confirming", color: "text-blue-400", icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
  exchanging: { label: "Exchanging", color: "text-blue-400", icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  sending: { label: "Sending", color: "text-blue-400", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  finished: { label: "Finished", color: "text-primary", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  failed: { label: "Failed", color: "text-destructive", icon: <XCircle className="w-3.5 h-3.5" /> },
  refunded: { label: "Refunded", color: "text-orange-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  expired: { label: "Expired", color: "text-muted-foreground", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const PAGE_SIZE = 50;

const ExchangeTracker = () => {
  const [exchanges, setExchanges] = useState<CNExchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const { toast } = useToast();

  const getDateFrom = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case "7d": { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString(); }
      case "30d": { const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString(); }
      default: return "";
    }
  }, [dateRange]);

  const fetchExchanges = useCallback(async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        _get: "true",
        action: "list-transactions",
        limit: String(PAGE_SIZE),
        offset: String(newOffset),
      };
      const dateFrom = getDateFrom();
      if (dateFrom) params.dateFrom = dateFrom;
      if (statusFilter !== "all") params.status = statusFilter;

      const { data, error: fnError } = await supabase.functions.invoke("changenow", {
        method: "POST",
        body: params,
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const items = Array.isArray(data) ? data : [];
      setExchanges(items);
      setHasMore(items.length === PAGE_SIZE);
      setOffset(newOffset);
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Exchange Tracker Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [getDateFrom, statusFilter, toast]);

  useEffect(() => {
    fetchExchanges(0);
  }, [fetchExchanges]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return exchanges;
    const q = searchQuery.toLowerCase();
    return exchanges.filter(
      (e) =>
        e.id?.toLowerCase().includes(q) ||
        e.fromCurrency?.toLowerCase().includes(q) ||
        e.toCurrency?.toLowerCase().includes(q) ||
        e.payinAddress?.toLowerCase().includes(q) ||
        e.payoutAddress?.toLowerCase().includes(q) ||
        e.payinHash?.toLowerCase().includes(q) ||
        e.payoutHash?.toLowerCase().includes(q)
    );
  }, [exchanges, searchQuery]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const finished = exchanges.filter((e) => e.status === "finished");
    const failed = exchanges.filter((e) => e.status === "failed");
    const waiting = exchanges.filter((e) => ["waiting", "new", "confirming", "exchanging", "sending"].includes(e.status));
    return { total: exchanges.length, finished: finished.length, failed: failed.length, waiting: waiting.length };
  }, [exchanges]);

  const statusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, color: "text-muted-foreground", icon: null };
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatAmount = (amount: number | null, currency: string) => {
    if (amount === null || amount === undefined) return "—";
    return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 8 })} ${currency.toUpperCase()}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Exchanges</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Finished</p>
              <p className="text-xl font-bold text-foreground">{stats.finished}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Waiting</p>
              <p className="text-xl font-bold text-foreground">{stats.waiting}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-xl font-bold text-foreground">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" /> ChangeNOW Exchange Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top filters row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, address or tx hash…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchExchanges(0)}
              disabled={loading}
              className="gap-2 h-10 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Date range & status tabs */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-1.5">
              {(["today", "7d", "30d", "all"] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setDateRange(range); }}
                  className="text-xs h-8 px-3"
                >
                  {range === "today" ? "Today" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "All Time"}
                </Button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["all", "waiting", "finished", "failed", "refunded"].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                  className="text-xs h-8 px-3 capitalize"
                >
                  {s === "all" ? "All Status" : s}
                </Button>
              ))}
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="font-medium mb-1">API Error</p>
              <p className="text-xs text-destructive/80">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Make sure the <code className="bg-muted px-1 rounded">CHANGENOW_PRIVATE_KEY</code> secret is set to your ChangeNOW affiliate <strong>private</strong> API key (not the standard/public key).
              </p>
            </div>
          )}

          {/* Exchange Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>TX ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading exchanges…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {error ? "Could not load exchanges." : "No exchanges found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ex) => (
                    <TableRow key={ex.id} className="group">
                      <TableCell>{statusBadge(ex.status)}</TableCell>
                      <TableCell className="capitalize text-xs text-muted-foreground">{ex.flow || "Standard"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(ex.createdAt)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatAmount(ex.amountFrom || ex.expectedAmountFrom, ex.fromCurrency)}
                        </div>
                        {ex.fromNetwork && ex.fromNetwork !== ex.fromCurrency && (
                          <span className="text-[10px] text-muted-foreground uppercase">{ex.fromNetwork}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatAmount(ex.amountTo || ex.expectedAmountTo, ex.toCurrency)}
                        </div>
                        {ex.toNetwork && ex.toNetwork !== ex.toCurrency && (
                          <span className="text-[10px] text-muted-foreground uppercase">{ex.toNetwork}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {ex.id?.slice(0, 12)}…
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {(offset > 0 || hasMore) && (
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Showing {offset + 1}–{offset + filtered.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchExchanges(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0 || loading}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchExchanges(offset + PAGE_SIZE)}
                  disabled={!hasMore || loading}
                  className="gap-1 text-xs"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeTracker;
