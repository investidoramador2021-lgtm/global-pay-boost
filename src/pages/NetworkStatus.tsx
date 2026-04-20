import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface NetworkCheck {
  name: string;
  ticker: string;
  status: "operational" | "degraded" | "down" | "checking";
  latencyMs: number | null;
  lastChecked: string | null;
  blockHeight?: string | null;
}

const NETWORKS: { name: string; ticker: string; from: string; to: string }[] = [
  { name: "Bitcoin", ticker: "BTC", from: "btc", to: "eth" },
  { name: "Ethereum", ticker: "ETH", from: "eth", to: "btc" },
  { name: "Solana", ticker: "SOL", from: "sol", to: "btc" },
];

const StatusIcon = ({ status }: { status: NetworkCheck["status"] }) => {
  switch (status) {
    case "operational":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "down":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />;
  }
};

const statusLabel = (s: NetworkCheck["status"]) => {
  switch (s) {
    case "operational": return "Operational";
    case "degraded": return "Degraded";
    case "down": return "Down";
    default: return "Checking…";
  }
};

const statusColor = (s: NetworkCheck["status"]) => {
  switch (s) {
    case "operational": return "bg-green-500/10 text-green-600 border-green-500/30";
    case "degraded": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
    case "down": return "bg-red-500/10 text-red-600 border-red-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const NetworkStatus = () => {
  const [networks, setNetworks] = useState<NetworkCheck[]>(
    NETWORKS.map((n) => ({ name: n.name, ticker: n.ticker, status: "checking", latencyMs: null, lastChecked: null }))
  );
  const [refreshing, setRefreshing] = useState(false);

  const checkNetworks = async () => {
    setRefreshing(true);
    const updated = await Promise.all(
      NETWORKS.map(async (net) => {
        const start = performance.now();
        try {
          const { data, error } = await supabase.functions.invoke("changenow", {
            method: "POST",
            body: { _get: true, action: "min-amount", from: net.from, to: net.to, fixedRate: "false" },
          });
          const latency = Math.round(performance.now() - start);
          if (error || !data || data.error) {
            return { name: net.name, ticker: net.ticker, status: "degraded" as const, latencyMs: latency, lastChecked: new Date().toISOString() };
          }
          return {
            name: net.name,
            ticker: net.ticker,
            status: latency > 5000 ? "degraded" as const : "operational" as const,
            latencyMs: latency,
            lastChecked: new Date().toISOString(),
          };
        } catch {
          return { name: net.name, ticker: net.ticker, status: "down" as const, latencyMs: null, lastChecked: new Date().toISOString() };
        }
      })
    );
    setNetworks(updated);
    setRefreshing(false);
  };

  useEffect(() => {
    checkNetworks();
    const interval = setInterval(checkNetworks, 60000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = networks.every((n) => n.status === "operational");
  const anyDown = networks.some((n) => n.status === "down");

  const overallStatus = networks[0].status === "checking"
    ? "Checking systems…"
    : allOperational
      ? "All Systems Operational"
      : anyDown
        ? "Partial Outage Detected"
        : "Degraded Performance";

  const overallColor = networks[0].status === "checking"
    ? "text-muted-foreground"
    : allOperational
      ? "text-green-500"
      : anyDown
        ? "text-red-500"
        : "text-yellow-500";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Network Status — MRC Global Pay",
    description: "Live operational status of Bitcoin, Ethereum, and Solana networks on MRC Global Pay. Real-time uptime monitoring for non-custodial swaps.",
    url: "https://mrcglobalpay.com/status",
    isPartOf: { "@type": "WebSite", name: "MRC Global Pay", url: "https://mrcglobalpay.com" },
    publisher: {
      "@type": "Organization",
      name: "MRC Global Pay",
      url: "https://mrcglobalpay.com",
      description: "Registered Canadian MSB (FINTRAC C100000015) providing non-custodial cryptocurrency exchange services.",
      knowsAbout: ["Bitcoin", "Ethereum", "Solana", "Blockchain Infrastructure"],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
        { "@type": "ListItem", position: 2, name: "Network Status", item: "https://mrcglobalpay.com/status" },
      ],
    },
    dateModified: new Date().toISOString().split("T")[0],
  };

  return (
    <>
      <Helmet>
        <title>Network Status — Live BTC, ETH &amp; SOL Uptime | MRC Global Pay</title>
        <meta name="description" content="Live operational status of Bitcoin, Ethereum, and Solana swap networks on MRC Global Pay. Real-time latency, auto-refresh, congestion alerts. FINTRAC MSB-registered." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://mrcglobalpay.com/status" />
        <meta property="og:title" content="Network Status — Live BTC, ETH & SOL Uptime | MRC Global Pay" />
        <meta property="og:description" content="Real-time operational status of Bitcoin, Ethereum, and Solana swap networks. Latency monitoring with auto-refresh." />
        <meta property="og:url" content="https://mrcglobalpay.com/status" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MRC Global Pay" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Network Status — MRC Global Pay" />
        <meta name="twitter:description" content="Live uptime monitoring for BTC, ETH, and SOL swap networks." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-background">
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">Network Status</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <Activity className="mr-1 h-3 w-3" /> Live Status
            </Badge>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-3">Network Status</h1>
            <p className={`text-lg font-semibold ${overallColor}`}>{overallStatus}</p>
            <p className="text-xs text-muted-foreground mt-1">Auto-refreshes every 60 seconds</p>
          </div>

          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={checkNetworks} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {networks.map((net) => (
              <div key={net.ticker} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <StatusIcon status={net.status} />
                  <div>
                    <h2 className="font-semibold text-foreground">{net.name} ({net.ticker})</h2>
                    <p className="text-xs text-muted-foreground">
                      {net.lastChecked ? `Checked ${new Date(net.lastChecked).toLocaleTimeString()}` : "Pending…"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {net.latencyMs !== null && (
                    <span className="text-xs text-muted-foreground font-mono">{net.latencyMs}ms</span>
                  )}
                  <Badge variant="outline" className={`text-[10px] ${statusColor(net.status)}`}>
                    {statusLabel(net.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Swap service status */}
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-3">Swap Engine</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={allOperational ? "operational" : "degraded"} />
                <div>
                  <p className="text-sm font-medium text-foreground">Multi-Provider Liquidity Aggregator</p>
                  <p className="text-xs text-muted-foreground">Non-custodial execution with automatic failover across 4 networks</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusColor(allOperational ? "operational" : "degraded")}`}>
                {allOperational ? "Operational" : "Check Logs"}
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="text-sm font-semibold text-primary mb-2">How We Monitor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Status checks are performed by pinging our liquidity provider's rate endpoints for each network in real time.
              A response under 5 seconds indicates <strong className="text-foreground">Operational</strong> status.
              Responses above 5 seconds are flagged as <strong className="text-foreground">Degraded</strong>.
              Failed requests indicate a potential <strong className="text-foreground">Outage</strong>.
            </p>
          </div>

          {/* Links */}
          <nav className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Related</h3>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              <li><Link to="/developers" className="text-primary hover:underline">API Documentation →</Link></li>
              <li><Link to="/transparency-security" className="text-primary hover:underline">Trust & Transparency →</Link></li>
              <li><Link to="/" className="text-primary hover:underline">Swap Now →</Link></li>
              <li><Link to="/developer" className="text-primary hover:underline">Widget Integration →</Link></li>
            </ul>
          </nav>
        </div>
      </main>
      <MsbTrustBar />
      <SiteFooter />
    </>
  );
};

export default NetworkStatus;
