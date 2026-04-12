import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw, FileText, Clock, CheckCircle2, XCircle, Search,
  ChevronLeft, ChevronRight, Eye, Copy, Trash2, Send, Ban,
  DollarSign, AlertTriangle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

/* ── Status visuals ── */
const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "text-amber-400", icon: <Clock className="w-3.5 h-3.5" /> },
  sent: { label: "Sent", color: "text-blue-400", icon: <Send className="w-3.5 h-3.5" /> },
  paying: { label: "Paying", color: "text-blue-400", icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
  confirming: { label: "Confirming", color: "text-blue-400", icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
  settled: { label: "Settled", color: "text-primary", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled", color: "text-destructive", icon: <XCircle className="w-3.5 h-3.5" /> },
  expired: { label: "Expired", color: "text-muted-foreground", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const PAGE_SIZE = 50;

const obfuscateEmail = (email: string) => {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
};

const InvoiceManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "cancel" | "delete" | "resend"; invoice: Invoice } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const fetchIdRef = useRef(0);

  /* ── Load invoices ── */
  const fetchInvoices = useCallback(async (newPage = 0) => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(newPage * PAGE_SIZE, (newPage + 1) * PAGE_SIZE - 1);

      if (dateRange !== "all") {
        const now = new Date();
        let from: Date;
        if (dateRange === "today") from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        else if (dateRange === "7d") { from = new Date(now); from.setDate(from.getDate() - 7); }
        else { from = new Date(now); from.setDate(from.getDate() - 30); }
        query = query.gte("created_at", from.toISOString());
      }

      const { data, count, error } = await query;
      if (id !== fetchIdRef.current) return;
      if (error) throw error;

      setInvoices((data || []) as Invoice[]);
      setTotal(count || 0);
      setPage(newPage);
    } catch (err: any) {
      if (id === fetchIdRef.current) {
        toast({ title: "Database Error", description: err.message, variant: "destructive" });
      }
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    fetchInvoices(0);
  }, [fetchInvoices]);

  /* ── Realtime subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel("admin-invoices")
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setInvoices((prev) => [payload.new as Invoice, ...prev]);
          setTotal((t) => t + 1);
        } else if (payload.eventType === "UPDATE") {
          setInvoices((prev) => prev.map((inv) => inv.id === (payload.new as Invoice).id ? payload.new as Invoice : inv));
          if (detail?.id === (payload.new as Invoice).id) setDetail(payload.new as Invoice);
        } else if (payload.eventType === "DELETE") {
          setInvoices((prev) => prev.filter((inv) => inv.id !== (payload.old as any).id));
          setTotal((t) => Math.max(0, t - 1));
          if (detail?.id === (payload.old as any).id) setDetail(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [detail?.id]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let list = invoices;
    if (statusFilter !== "all") {
      list = list.filter((inv) => inv.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.invoice_id?.toLowerCase().includes(q) ||
          inv.payer_name?.toLowerCase().includes(q) ||
          inv.requester_name?.toLowerCase().includes(q) ||
          inv.crypto_ticker?.toLowerCase().includes(q) ||
          inv.wallet_address?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, statusFilter, searchQuery]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const pending = invoices.filter((i) => i.status === "pending").length;
    const settled = invoices.filter((i) => i.status === "settled").length;
    const cancelled = invoices.filter((i) => i.status === "cancelled").length;
    const totalFees = invoices
      .filter((i) => i.status === "settled")
      .reduce((s, i) => s + Number(i.service_fee_amount), 0);
    return { total: invoices.length, pending, settled, cancelled, totalFees };
  }, [invoices]);

  /* ── Actions ── */
  const handleCancel = async (invoice: Invoice) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "cancelled", updated_at: new Date().toISOString() } as any)
        .eq("id", invoice.id);
      if (error) throw error;
      toast({ title: "Invoice Cancelled", description: `${invoice.invoice_id} has been voided.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", invoice.id);
      if (error) throw error;
      toast({ title: "Invoice Deleted", description: `${invoice.invoice_id} removed.` });
      if (detail?.id === invoice.id) setDetail(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleResend = async (invoice: Invoice) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          template_name: "invoice-to-payer",
          to: invoice.payer_email,
          subject: `Invoice ${invoice.invoice_id} from ${invoice.requester_name}`,
          template_data: {
            payerName: invoice.payer_name,
            requesterName: invoice.requester_name,
            fiatAmount: invoice.fiat_amount,
            fiatCurrency: invoice.fiat_currency,
            cryptoAmount: invoice.crypto_amount,
            cryptoTicker: invoice.crypto_ticker,
            serviceFeePercent: invoice.service_fee_percent,
            serviceFeeAmount: invoice.service_fee_amount,
            netCryptoAmount: invoice.net_crypto_amount,
            invoiceId: invoice.invoice_id,
            token: invoice.token,
            walletAddress: invoice.wallet_address,
            language: invoice.language,
          },
        },
      });
      if (error) throw error;
      toast({ title: "Email Resent", description: `Invoice re-sent to ${obfuscateEmail(invoice.payer_email)}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const copyTrackingLink = (token: string) => {
    const url = `${window.location.origin}/status/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "Tracking link copied to clipboard." });
  };

  /* ── Helpers ── */
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

  const hasMore = total > (page + 1) * PAGE_SIZE;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Settled</p>
              <p className="text-xl font-bold text-foreground">{stats.settled}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-xl font-bold text-foreground">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Fee Revenue</p>
              <p className="text-xl font-bold text-foreground">{stats.totalFees.toFixed(8)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" /> Invoice Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Invoice ID, name, or wallet…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchInvoices(page)}
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
              {["all", "pending", "sent", "settled", "cancelled", "expired"].map((s) => (
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
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading invoices…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.id} className="group cursor-pointer" onClick={() => setDetail(inv)}>
                      <TableCell>{statusBadge(inv.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(inv.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{inv.invoice_id}</TableCell>
                      <TableCell className="text-sm">{inv.payer_name}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {Number(inv.crypto_amount).toFixed(8)} {inv.crypto_ticker.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right text-xs text-amber-400">
                        -{Number(inv.service_fee_amount).toFixed(8)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-primary">
                        {Number(inv.net_crypto_amount).toFixed(8)}
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
                <Button variant="ghost" size="sm" onClick={() => fetchInvoices(page - 1)} disabled={page === 0 || loading} className="gap-1 text-xs">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button variant="ghost" size="sm" onClick={() => fetchInvoices(page + 1)} disabled={!hasMore || loading} className="gap-1 text-xs">
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
              Invoice Details {detail && statusBadge(detail.status)}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Invoice ID</p>
                  <p className="font-mono text-xs text-foreground">{detail.invoice_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-xs text-foreground">{formatDate(detail.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payer</p>
                  <p className="text-sm font-medium">{detail.payer_name}</p>
                  <p className="text-xs text-muted-foreground">{obfuscateEmail(detail.payer_email)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Requester</p>
                  <p className="text-sm font-medium">{detail.requester_name}</p>
                  <p className="text-xs text-muted-foreground">{obfuscateEmail(detail.requester_email)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-background/30 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="font-medium">{Number(detail.fiat_amount).toLocaleString()} {detail.fiat_currency} → {Number(detail.crypto_amount).toFixed(8)} {detail.crypto_ticker.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Service Fee ({detail.service_fee_percent}%)</span>
                  <span className="text-amber-400">-{Number(detail.service_fee_amount).toFixed(8)} {detail.crypto_ticker.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-2">
                  <span className="text-xs font-medium">Receiver Gets</span>
                  <span className="text-primary font-bold">{Number(detail.net_crypto_amount).toFixed(8)} {detail.crypto_ticker.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(detail.wallet_address); toast({ title: "Copied" }); }}
                  className="font-mono text-[11px] text-foreground break-all flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {detail.wallet_address} <Copy className="w-3 h-3 shrink-0" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rate Locked</p>
                  <p className="text-xs">{formatDate(detail.rate_locked_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expires</p>
                  <p className="text-xs">{formatDate(detail.expires_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                <Button size="sm" variant="outline" onClick={() => copyTrackingLink(detail.token)} className="gap-1.5 text-xs">
                  <Copy className="w-3.5 h-3.5" /> Copy Tracking Link
                </Button>
                {detail.status !== "cancelled" && detail.status !== "settled" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setConfirmAction({ type: "resend", invoice: detail })} className="gap-1.5 text-xs">
                      <Send className="w-3.5 h-3.5" /> Resend Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmAction({ type: "cancel", invoice: detail })} className="gap-1.5 text-xs text-amber-400 hover:text-amber-300">
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </>
                )}
                <Button size="sm" variant="destructive" onClick={() => setConfirmAction({ type: "delete", invoice: detail })} className="gap-1.5 text-xs">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => !actionLoading && setConfirmAction(null)}>
        <DialogContent className="max-w-sm bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              {confirmAction?.type === "cancel" && "Cancel Invoice"}
              {confirmAction?.type === "delete" && "Delete Invoice"}
              {confirmAction?.type === "resend" && "Resend Invoice Email"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmAction?.type === "cancel" && `This will void invoice ${confirmAction.invoice.invoice_id} and kill the payment link. This cannot be undone.`}
            {confirmAction?.type === "delete" && `This will permanently delete invoice ${confirmAction.invoice.invoice_id}. This cannot be undone.`}
            {confirmAction?.type === "resend" && `Re-send the invoice email for ${confirmAction.invoice.invoice_id} to ${obfuscateEmail(confirmAction.invoice.payer_email)}?`}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)} disabled={actionLoading}>
              Go Back
            </Button>
            <Button
              variant={confirmAction?.type === "delete" ? "destructive" : "default"}
              size="sm"
              disabled={actionLoading}
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "cancel") handleCancel(confirmAction.invoice);
                else if (confirmAction.type === "delete") handleDelete(confirmAction.invoice);
                else if (confirmAction.type === "resend") handleResend(confirmAction.invoice);
              }}
            >
              {actionLoading ? "Processing…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManager;
