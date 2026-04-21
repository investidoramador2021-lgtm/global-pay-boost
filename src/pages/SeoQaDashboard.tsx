import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, ExternalLink, FileWarning, Search, XCircle } from "lucide-react";
import { auditAllPages, summarize, type SeoAuditRow, type Severity } from "@/lib/seo-qa";

type FilterMode = "all" | "errors" | "warnings" | "ok";

const severityRank = (row: SeoAuditRow): Severity => {
  if (row.issues.some((i) => i.severity === "error")) return "error";
  if (row.issues.some((i) => i.severity === "warning")) return "warning";
  return "ok";
};

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  if (severity === "error") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> Error
      </Badge>
    );
  }
  if (severity === "warning") {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" /> Warning
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-3 w-3" /> OK
    </Badge>
  );
};

const SeoQaDashboard = () => {
  const allRows = useMemo(() => auditAllPages(), []);
  const stats = useMemo(() => summarize(allRows), [allRows]);

  const [filter, setFilter] = useState<FilterMode>("errors");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows
      .filter((r) => {
        const sev = severityRank(r);
        if (filter === "errors" && sev !== "error") return false;
        if (filter === "warnings" && sev !== "warning") return false;
        if (filter === "ok" && sev !== "ok") return false;
        if (q && !`${r.url} ${r.title} ${r.description} ${r.fixHint}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const order: Record<Severity, number> = { error: 0, warning: 1, ok: 2 };
        return order[severityRank(a)] - order[severityRank(b)];
      });
  }, [allRows, filter, query]);

  const exportCsv = () => {
    const header = ["severity", "url", "source", "title_len", "description_len", "has_h1", "issues", "fix_hint"];
    const lines = [header.join(",")];
    for (const r of allRows) {
      const sev = severityRank(r);
      const issues = r.issues.map((i) => `${i.field}: ${i.message}`).join(" | ");
      lines.push(
        [
          sev,
          r.url,
          r.source,
          r.titleLength,
          r.descriptionLength,
          r.hasH1 ? "yes" : "no",
          issues,
          r.fixHint,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-qa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>SEO QA Dashboard — Internal | MRC Global Pay</title>
        <meta name="description" content="Internal SEO QA dashboard listing pages with too-short titles, descriptions or missing H1 tags, with direct links to fixes." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <h1 className="sr-only">SEO QA Dashboard — Internal Audit</h1>

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <div className="mb-8">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Internal Tool · /admin/seo-qa
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
              SEO QA Dashboard
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
              Audits every keyword landing page and registered static page for missing or
              out-of-range titles, meta descriptions and <code className="rounded bg-muted px-1">&lt;h1&gt;</code> tags.
              Click <strong>View</strong> to open the live page and use the fix hint to locate the source.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total pages" value={stats.total} tone="neutral" />
            <StatCard label="Errors" value={stats.errors} tone="error" />
            <StatCard label="Warnings" value={stats.warnings} tone="warning" />
            <StatCard label="OK" value={stats.ok} tone="ok" />
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search URL, title, hint…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="errors">Errors only</SelectItem>
                  <SelectItem value="warnings">Warnings only</SelectItem>
                  <SelectItem value="ok">OK only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={exportCsv}>
              <FileWarning className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead>URL / Source</TableHead>
                  <TableHead className="hidden md:table-cell">Title</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell w-[80px] text-center">H1</TableHead>
                  <TableHead>Issues / Fix</TableHead>
                  <TableHead className="w-[90px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No pages match the current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const sev = severityRank(r);
                    return (
                      <TableRow key={`${r.source}-${r.url}`}>
                        <TableCell>
                          <SeverityBadge severity={sev} />
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs font-semibold text-foreground break-all">
                            {r.url}
                          </div>
                          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                            {r.source}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[260px]">
                          <div className="truncate font-body text-sm text-foreground" title={r.title}>
                            {r.title || <em className="text-muted-foreground">missing</em>}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {r.titleLength} chars
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[320px]">
                          <div className="line-clamp-2 font-body text-xs text-muted-foreground" title={r.description}>
                            {r.description || <em>missing</em>}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {r.descriptionLength} chars
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          {r.hasH1 ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="mx-auto h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="max-w-[340px]">
                          {r.issues.length === 0 ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">No issues</span>
                          ) : (
                            <ul className="space-y-1">
                              {r.issues.map((i, idx) => (
                                <li key={idx} className="text-xs text-foreground">
                                  <span className={i.severity === "error" ? "text-destructive" : "text-amber-600 dark:text-amber-400"}>
                                    [{i.field}]
                                  </span>{" "}
                                  {i.message}
                                </li>
                              ))}
                            </ul>
                          )}
                          {r.issues.length > 0 && (
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              ↳ {r.fixHint}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={r.url} target="_blank" rel="noopener noreferrer">
                              View <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Title target: 30–60 chars · Description target: 120–160 chars · Every page must have an <code>&lt;h1&gt;</code>.
            Showing {filtered.length} of {allRows.length} pages.
          </p>
        </div>
      </main>
    </>
  );
};

export default SeoQaDashboard;

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "error" | "warning" | "ok";
}) => {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "border-border",
    error: "border-destructive/40 bg-destructive/5",
    warning: "border-amber-500/40 bg-amber-500/5",
    ok: "border-emerald-500/40 bg-emerald-500/5",
  };
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
};
