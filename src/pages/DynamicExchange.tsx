import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getLangFromPath, langPath } from "@/i18n";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExchangeWidget from "@/components/ExchangeWidget";
import LiveSwapTicker from "@/components/LiveSwapTicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Cpu, Clock, AlertTriangle, ExternalLink, Zap, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EXPLORER_MAP: Record<string, string> = {
  eth: "https://etherscan.io/token/",
  bsc: "https://bscscan.com/token/",
  trx: "https://tronscan.org/#/contract/",
  sol: "https://solscan.io/token/",
  matic: "https://polygonscan.com/token/",
  avaxc: "https://snowtrace.io/token/",
  arbitrum: "https://arbiscan.io/token/",
  optimism: "https://optimistic.etherscan.io/token/",
  base: "https://basescan.org/token/",
};

const NETWORK_LABELS: Record<string, string> = {
  eth: "ERC-20",
  bsc: "BEP-20",
  trx: "TRC-20",
  sol: "Solana (SPL)",
  matic: "Polygon",
  avaxc: "Avalanche C-Chain",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base: "Base",
  btc: "Bitcoin Native",
  ltc: "Litecoin Native",
  doge: "Dogecoin Native",
  xrp: "XRP Ledger",
  ada: "Cardano",
  dot: "Polkadot",
  ton: "TON",
};

const CONFIRMATIONS: Record<string, number> = {
  btc: 2,
  eth: 12,
  sol: 1,
  trx: 19,
  bnb: 15,
  ltc: 6,
  doge: 40,
  xrp: 1,
  ada: 15,
  dot: 25,
  avaxc: 1,
  matic: 128,
  arbitrum: 1,
  optimism: 1,
  base: 1,
  ton: 1,
};

function getNetworkLabel(network: string): string {
  return NETWORK_LABELS[network.toLowerCase()] || network.toUpperCase();
}

function getExplorerUrl(network: string, contract: string | null): string | null {
  if (!contract) return null;
  const base = EXPLORER_MAP[network.toLowerCase()];
  return base ? `${base}${contract}` : null;
}

export default function DynamicExchange() {
  const { pair } = useParams<{ pair: string }>();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const { t } = useTranslation();
  const lp = (p: string) => langPath(lang, p);

  // Parse "from-to-to"
  const match = pair?.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
  const fromTicker = match?.[1] || "";
  const toTicker = match?.[2] || "";
  const fromLower = fromTicker.toLowerCase();
  const toLower = toTicker.toLowerCase();

  // Fetch asset metadata
  const { data: fromAsset, isLoading: loadingFrom } = useQuery({
    queryKey: ["exchange-asset", fromLower],
    queryFn: async () => {
      if (!fromLower) return null;
      const { data } = await supabase
        .from("exchange_assets")
        .select("*")
        .eq("ticker", fromLower)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!fromLower,
    staleTime: 1000 * 60 * 30,
  });

  const { data: toAsset, isLoading: loadingTo } = useQuery({
    queryKey: ["exchange-asset", toLower],
    queryFn: async () => {
      if (!toLower) return null;
      const { data } = await supabase
        .from("exchange_assets")
        .select("*")
        .eq("ticker", toLower)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!toLower,
    staleTime: 1000 * 60 * 30,
  });

  // Fetch related tier-1 assets for the "Related Pairs" section
  const { data: relatedAssets } = useQuery({
    queryKey: ["exchange-related-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exchange_assets")
        .select("ticker, name, image_url")
        .eq("is_active", true)
        .eq("tier", 1)
        .order("ticker");
      // Deduplicate by ticker
      const seen = new Set<string>();
      return (data || []).filter((a) => {
        const t = a.ticker.toLowerCase();
        if (seen.has(t)) return false;
        seen.add(t);
        return true;
      });
    },
    staleTime: 1000 * 60 * 60,
  });

  // Invalid pair format
  if (!match) return <Navigate to={lp("/")} replace />;

  // If either asset is deprecated/not found, redirect to home (SEO 301 effect via client)
  if (!loadingFrom && !loadingTo && (!fromAsset || !toAsset)) {
    return <Navigate to={lp("/")} replace />;
  }

  const isLoading = loadingFrom || loadingTo;
  const fromName = fromAsset?.name || fromTicker.toUpperCase();
  const toName = toAsset?.name || toTicker.toUpperCase();
  const fromUp = fromTicker.toUpperCase();
  const toUp = toTicker.toUpperCase();

  const title = `Swap ${fromUp} to ${toUp} Instantly | MRC GlobalPay`;
  const description = `Convert ${fromName} to ${toName} in under 60 seconds. No registration, best rates. Canadian MSB-registered.`;
  const canonicalUrl = `https://mrcglobalpay.com/exchange/${fromLower}-to-${toLower}`;

  const fromNetwork = fromAsset?.network || "";
  const toNetwork = toAsset?.network || "";
  const fromContract = fromAsset?.token_contract || null;
  const toContract = toAsset?.token_contract || null;
  const fromConfirmations = CONFIRMATIONS[fromNetwork.toLowerCase()] || CONFIRMATIONS[fromLower] || 12;
  const toConfirmations = CONFIRMATIONS[toNetwork.toLowerCase()] || CONFIRMATIONS[toLower] || 12;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
          { "@type": "ListItem", position: 2, name: "Exchange", item: "https://mrcglobalpay.com/exchange" },
          { "@type": "ListItem", position: 3, name: `${fromUp} to ${toUp}`, item: canonicalUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the minimum ${fromUp} required to swap for ${toUp}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `The minimum swap amount is approximately $0.30 USD equivalent in ${fromUp}. MRC GlobalPay supports micro-swaps starting from crypto dust amounts.`,
            },
          },
          {
            "@type": "Question",
            name: `Does ${toUp} require a Memo or Destination Tag?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: toAsset?.has_external_id
                ? `Yes, ${toName} requires an additional identifier (Memo/Destination Tag). You will be prompted to enter it during the swap process.`
                : `No, ${toName} does not require a Memo or Destination Tag. Simply provide your ${toUp} wallet address.`,
            },
          },
          {
            "@type": "Question",
            name: `Can I swap ${fromUp} to ${toUp} without KYC?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes. MRC GlobalPay is a registered Canadian Money Services Business (MSB #C100000015). We operate fully compliant non-custodial swaps without requiring identity verification for standard transactions.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />
      <main className="min-h-screen bg-[#0B0D10]">
        {/* Hero */}
        <section className="relative py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-1.5 text-xs text-[#8A8F98]">
                  <li><a href={lp("/")} className="hover:text-white transition-colors">Home</a></li>
                  <li>/</li>
                  <li>Exchange</li>
                  <li>/</li>
                  <li className="text-white">{fromUp} → {toUp}</li>
                </ol>
              </nav>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Swap {fromUp} to {toUp} <span className="text-[#00E676]">Instantly</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-[#8A8F98] sm:text-lg">
                Convert {fromName} to {toName} in under 60 seconds. No registration required. Canadian MSB-registered, non-custodial settlement.
              </p>
            </div>
          </div>
        </section>

        {/* Widget Section */}
        <section className="pb-12" id="exchange">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <ExchangeWidget />
            </div>
          </div>
        </section>

        {/* Network Intelligence Cards */}
        {!isLoading && (fromAsset || toAsset) && (
          <section className="py-12 border-t border-[#1E2028]">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-5xl">
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-6">
                  Network Intelligence
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* From Asset Card */}
                  {fromAsset && (
                    <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-5">
                      <div className="flex items-center gap-3 mb-4">
                        {fromAsset.image_url && (
                          <img src={fromAsset.image_url} alt={fromName} className="h-8 w-8 rounded-full" loading="lazy" />
                        )}
                        <div>
                          <h3 className="font-display text-sm font-bold text-white">{fromName} ({fromUp})</h3>
                          <span className="text-xs text-[#8A8F98]">{getNetworkLabel(fromNetwork)}</span>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-start gap-2">
                          <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                          <p className="text-[#C4C8D0]">
                            <strong className="text-white">Network:</strong> {getNetworkLabel(fromNetwork)}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                          <p className="text-[#C4C8D0]">
                            <strong className="text-white">Confirmations:</strong> {fromConfirmations}
                          </p>
                        </div>
                        {fromContract && (
                          <div className="flex items-start gap-2">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                            <p className="text-[#C4C8D0] break-all">
                              <strong className="text-white">Contract:</strong>{" "}
                              {getExplorerUrl(fromNetwork, fromContract) ? (
                                <a href={getExplorerUrl(fromNetwork, fromContract)!} target="_blank" rel="noopener noreferrer" className="text-[#00A3FF] hover:underline inline-flex items-center gap-1">
                                  {fromContract.slice(0, 8)}…{fromContract.slice(-6)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="font-mono text-xs">{fromContract.slice(0, 8)}…{fromContract.slice(-6)}</span>
                              )}
                            </p>
                          </div>
                        )}
                        {fromNetwork && (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                            <p className="text-yellow-400/80 text-xs">
                              This is a <strong>{getNetworkLabel(fromNetwork)}</strong> token. Ensure you send from a compatible wallet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* To Asset Card */}
                  {toAsset && (
                    <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-5">
                      <div className="flex items-center gap-3 mb-4">
                        {toAsset.image_url && (
                          <img src={toAsset.image_url} alt={toName} className="h-8 w-8 rounded-full" loading="lazy" />
                        )}
                        <div>
                          <h3 className="font-display text-sm font-bold text-white">{toName} ({toUp})</h3>
                          <span className="text-xs text-[#8A8F98]">{getNetworkLabel(toNetwork)}</span>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-start gap-2">
                          <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                          <p className="text-[#C4C8D0]">
                            <strong className="text-white">Network:</strong> {getNetworkLabel(toNetwork)}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                          <p className="text-[#C4C8D0]">
                            <strong className="text-white">Confirmations:</strong> {toConfirmations}
                          </p>
                        </div>
                        {toContract && (
                          <div className="flex items-start gap-2">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                            <p className="text-[#C4C8D0] break-all">
                              <strong className="text-white">Contract:</strong>{" "}
                              {getExplorerUrl(toNetwork, toContract) ? (
                                <a href={getExplorerUrl(toNetwork, toContract)!} target="_blank" rel="noopener noreferrer" className="text-[#00A3FF] hover:underline inline-flex items-center gap-1">
                                  {toContract.slice(0, 8)}…{toContract.slice(-6)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="font-mono text-xs">{toContract.slice(0, 8)}…{toContract.slice(-6)}</span>
                              )}
                            </p>
                          </div>
                        )}
                        {toAsset.has_external_id && (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                            <p className="text-yellow-400/80 text-xs">
                              <strong>{toName}</strong> requires a Memo/Destination Tag. You'll be prompted to provide it.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bridge Info */}
                <div className="mt-4 rounded-xl border border-[#2A2D35] bg-[#12141A] p-4 flex items-start gap-3">
                  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#00E676]" />
                  <p className="text-sm text-[#C4C8D0]">
                    <strong className="text-white">Bridge Info:</strong> This swap uses ChangeNOW liquidity rails for sub-60s settlement. Non-custodial, forensic-verified, Canadian MSB-compliant.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic FAQ */}
        <section className="py-12 border-t border-[#1E2028]">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-6">
                {fromUp}/{toUp} — Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="faq-min" className="rounded-xl border border-[#2A2D35] bg-[#12141A] px-5">
                  <AccordionTrigger className="font-display text-sm font-semibold text-white hover:no-underline">
                    What is the minimum {fromUp} required for a {toUp} swap?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#8A8F98]">
                    MRC GlobalPay supports micro-swaps starting from approximately $0.30 USD equivalent in {fromUp}. The exact minimum fluctuates with market prices and is displayed in the swap widget above.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-memo" className="rounded-xl border border-[#2A2D35] bg-[#12141A] px-5">
                  <AccordionTrigger className="font-display text-sm font-semibold text-white hover:no-underline">
                    Does {toUp} require a Memo or Destination Tag?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#8A8F98]">
                    {toAsset?.has_external_id
                      ? `Yes. ${toName} requires an additional identifier (Memo or Destination Tag). You will be prompted to enter it during the swap. Failure to include it may result in lost funds.`
                      : `No. ${toName} does not require a Memo or Destination Tag. Simply provide your ${toUp} wallet address to receive your funds.`}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-kyc" className="rounded-xl border border-[#2A2D35] bg-[#12141A] px-5">
                  <AccordionTrigger className="font-display text-sm font-semibold text-white hover:no-underline">
                    Can I swap {fromUp} to {toUp} without KYC?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#8A8F98]">
                    Yes. MRC GlobalPay is a registered Canadian Money Services Business (MSB Identifier: C100000015), headquartered in Ottawa, Ontario. We provide fully compliant, non-custodial swaps without requiring account creation or identity verification for standard transactions.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Live Swap Ticker — pair-filtered social proof */}
        <LiveSwapTicker />

        {/* CTA */}
        <section className="py-12 border-t border-[#1E2028]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              Ready to swap {fromUp} for {toUp}?
            </h2>
            <p className="mt-2 text-sm text-[#8A8F98]">
              No registration. No KYC. Under 60 seconds.
            </p>
            <a
              href="#exchange"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#00E676] px-6 py-3 font-display text-sm font-bold text-[#0B0D10] transition-all hover:bg-[#00C853]"
            >
              <Zap className="h-4 w-4" /> Swap Now
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
