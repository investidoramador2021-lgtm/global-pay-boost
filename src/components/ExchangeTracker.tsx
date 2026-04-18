import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw, ArrowRightLeft, Clock, CheckCircle2, XCircle,
  AlertTriangle, Search, ChevronLeft, ChevronRight, Eye, Copy, ExternalLink,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

/* ── Types ── */
interface SwapRow {
  id: string;
  transaction_id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  recipient_address: string;
  payin_address: string;
  created_at: string;
  provider?: string | null;
}

interface LiveStatus {
  status: string;
  amountSend: number | null;
  amountReceive: number | null;
  payinHash: string | null;
  payoutHash: string | null;
  payinAddress: string;
  payoutAddress: string;
}

interface EnrichedSwap extends SwapRow {
  live?: LiveStatus;
  liveLoading?: boolean;
}

/* ── Status visuals ── */
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
  const [swaps, setSwaps] = useState<EnrichedSwap[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<EnrichedSwap | null>(null);
  const { toast } = useToast();
  const fetchIdRef = useRef(0);

  /* ── Load swaps from our own database ── */
  const fetchSwaps = useCallback(async (newPage = 0) => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    try {
      let query = supabase
        .from("swap_transactions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(newPage * PAGE_SIZE, (newPage + 1) * PAGE_SIZE - 1);

      // Date filter
      if (dateRange !== "all") {
        const now = new Date();
        let from: Date;
        if (dateRange === "today") from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        else if (dateRange === "7d") { from = new Date(now); from.setDate(from.getDate() - 7); }
        else { from = new Date(now); from.setDate(from.getDate() - 30); }
        query = query.gte("created_at", from.toISOString());
      }

      const { data, count, error } = await query;
      if (id !== fetchIdRef.current) return; // stale
      if (error) throw error;

      const rows: EnrichedSwap[] = (data || []) as EnrichedSwap[];
      setSwaps(rows);
      setTotal(count || 0);
      setPage(newPage);

      // Auto-fetch live statuses
      fetchLiveStatuses(rows);
    } catch (err: any) {
      if (id === fetchIdRef.current) {
        toast({ title: "Database Error", description: err.message, variant: "destructive" });
      }
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [dateRange, toast]);

  /* ── Fetch live status from ChangeNOW for each tx ── */
  const fetchLiveStatuses = useCallback(async (rows: EnrichedSwap[]) => {
    if (rows.length === 0) return;
    setStatusLoading(true);

    // Process in batches of 5 to avoid hammering the API
    const BATCH = 5;
    const updated = rows.map((r) => ({ ...r, liveLoading: true }));
    setSwaps([...updated]);

    // Skip only obviously synthetic ids (E2E probes, empty). Everything else is
    // attempted against the correct provider edge function ('cn' = ChangeNOW,
    // 'le' = LetsExchange). Failures resolve the row with no live data so the
    // badge stops spinning instead of getting stuck on "Loading…".
    const isSynthetic = (id: string) => !id || /^E2E_/i.test(id) || id.length < 6;

    for (let i = 0; i < updated.length; i += BATCH) {
      const batch = updated.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (row) => {
          const id = (row.transaction_id || "").trim();
          if (isSynthetic(id)) return { txId: id, data: null as any };
          const provider = (row.provider || "cn").toLowerCase();
          const fnName = provider === "le" ? "letsexchange" : "changenow";
          const { data, error } = await supabase.functions.invoke(fnName, {
            method: "POST",
            body: { _get: true, action: "tx-status", id },
          });
          if (error) return { txId: id, data: null as any };
          return { txId: id, data };
        })
      );

      results.forEach((r, k) => {
        const row = batch[k];
        const idx = updated.findIndex((s) => s.id === row.id);
        if (idx === -1) return;
        if (r.status === "fulfilled" && r.value.data && !r.value.data.error) {
          updated[idx] = {
            ...updated[idx],
            liveLoading: false,
            live: {
              status: r.value.data.status,
              amountSend: r.value.data.amountSend,
              amountReceive: r.value.data.amountReceive,
              payinHash: r.value.data.payinHash,
              payoutHash: r.value.data.payoutHash,
              payinAddress: r.value.data.payinAddress,
              payoutAddress: r.value.data.payoutAddress,
            },
          };
        } else {
          // Mark resolved-without-data so the badge stops spinning.
          updated[idx] = { ...updated[idx], liveLoading: false };
        }
      });

      // Update incrementally so user sees results coming in
      setSwaps([...updated]);
    }

    setStatusLoading(false);
  }, []);

  useEffect(() => {
    fetchSwaps(0);
  }, [fetchSwaps]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let list = swaps;

    // Status filter (uses live status)
    if (statusFilter !== "all") {
      const activeStatuses = statusFilter === "waiting"
        ? ["new", "waiting", "confirming", "exchanging", "sending"]
        : [statusFilter];
      list = list.filter((s) => s.live && activeStatuses.includes(s.live.status));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.transaction_id?.toLowerCase().includes(q) ||
          s.from_currency?.toLowerCase().includes(q) ||
          s.to_currency?.toLowerCase().includes(q) ||
          s.recipient_address?.toLowerCase().includes(q) ||
          s.payin_address?.toLowerCase().includes(q) ||
          s.live?.payinHash?.toLowerCase().includes(q) ||
          s.live?.payoutHash?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [swaps, statusFilter, searchQuery]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const withStatus = swaps.filter((s) => s.live);
    const finished = withStatus.filter((s) => s.live!.status === "finished").length;
    const failed = withStatus.filter((s) => s.live!.status === "failed").length;
    const active = withStatus.filter((s) =>
      ["waiting", "new", "confirming", "exchanging", "sending"].includes(s.live!.status)
    ).length;
    return { total: swaps.length, finished, failed, active };
  }, [swaps]);

  /* ── Helpers ── */
  const statusBadge = (sw?: EnrichedSwap) => {
    if (sw?.live) {
      const s = STATUS_MAP[sw.live.status] || { label: sw.live.status, color: "text-muted-foreground", icon: null };
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
          {s.icon}
          {s.label}
        </span>
      );
    }
    if (sw?.liveLoading) {
      return <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Loading…</span>;
    }
    return <span className="text-xs text-muted-foreground">Unknown</span>;
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatAmount = (amount: number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return "—";
    return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 8 })} ${currency.toUpperCase()}`;
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: text.slice(0, 30) + "…" });
  };

  const hasMore = total > (page + 1) * PAGE_SIZE;

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
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold text-foreground">{stats.active}</p>
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

      {/* Main Table */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" /> Exchange Monitor
            {statusLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
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
              onClick={() => fetchSwaps(page)}
              disabled={loading}
              className="gap-2 h-10 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-1.5">
              {(["today", "7d", "30d", "all"] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange(range)}
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

          {/* Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>TX ID</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading exchanges…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No exchanges found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sw) => (
                    <TableRow key={sw.id} className="group cursor-pointer" onClick={() => setDetail(sw)}>
                      <TableCell>{statusBadge(sw)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(sw.created_at)}</TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {formatAmount(sw.live?.amountSend ?? sw.amount, sw.from_currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {formatAmount(sw.live?.amountReceive, sw.to_currency)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sw.live?.amountReceive
                          ? formatAmount(sw.live.amountReceive, sw.to_currency)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {sw.transaction_id?.slice(0, 12)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {(page > 0 || hasMore) && (
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => fetchSwaps(page - 1)} disabled={page === 0 || loading} className="gap-1 text-xs">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="ghost" size="sm" onClick={() => fetchSwaps(page + 1)} disabled={!hasMore || loading} className="gap-1 text-xs">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              Exchange Details {detail?.live && statusBadge(detail)}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">TX ID</p>
                  <button onClick={() => copyText(detail.transaction_id)} className="font-mono text-xs text-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    {detail.transaction_id} <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-xs text-foreground">{formatDate(detail.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sent</p>
                  <p className="font-medium">{formatAmount(detail.live?.amountSend ?? detail.amount, detail.from_currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Received</p>
                  <p className="font-medium">{formatAmount(detail.live?.amountReceive, detail.to_currency)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Deposit Address</p>
                <button onClick={() => copyText(detail.live?.payinAddress || detail.payin_address)} className="font-mono text-[11px] text-foreground break-all flex items-center gap-1 hover:text-primary transition-colors">
                  {detail.live?.payinAddress || detail.payin_address || "—"} <Copy className="w-3 h-3 shrink-0" />
                </button>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Recipient Address</p>
                <button onClick={() => copyText(detail.recipient_address)} className="font-mono text-[11px] text-foreground break-all flex items-center gap-1 hover:text-primary transition-colors">
                  {detail.recipient_address} <Copy className="w-3 h-3 shrink-0" />
                </button>
              </div>

              {detail.live?.payinHash && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deposit TX Hash</p>
                  <p className="font-mono text-[11px] text-foreground break-all">{detail.live.payinHash}</p>
                </div>
              )}

              {detail.live?.payoutHash && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payout TX Hash</p>
                  <p className="font-mono text-[11px] text-foreground break-all">{detail.live.payoutHash}</p>
                </div>
              )}

              <a
                href={`https://changenow.io/exchange/txs/${detail.transaction_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on ChangeNOW
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExchangeTracker;
