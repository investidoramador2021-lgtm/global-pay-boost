import { useParams, useLocation, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getLangFromPath, langPath } from "@/i18n";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ExchangeWidget from "@/components/ExchangeWidget";
import LiveSwapTicker from "@/components/LiveSwapTicker";
import TokenIcon from "@/components/TokenIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Cpu, Clock, AlertTriangle, ExternalLink, Zap, ArrowRight, CheckCircle2, Globe, Lock, Timer, Wallet, BarChart3, HelpCircle, BookOpen } from "lucide-react";

/* ─────────────────── Static data maps ─────────────────── */

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
  eth: "ERC-20 (Ethereum)",
  bsc: "BEP-20 (BNB Smart Chain)",
  trx: "TRC-20 (TRON)",
  sol: "Solana (SPL Token)",
  matic: "Polygon (PoS)",
  avaxc: "Avalanche C-Chain",
  arbitrum: "Arbitrum One (L2)",
  optimism: "Optimism (L2)",
  base: "Base (L2)",
  btc: "Bitcoin Native (UTXO)",
  ltc: "Litecoin Native (UTXO)",
  doge: "Dogecoin Native",
  xrp: "XRP Ledger",
  ada: "Cardano",
  dot: "Polkadot Relay Chain",
  ton: "TON Blockchain",
  atom: "Cosmos Hub",
};

const CONFIRMATIONS: Record<string, number> = {
  btc: 2, eth: 12, sol: 1, trx: 19, bnb: 15, ltc: 6, doge: 40,
  xrp: 1, ada: 15, dot: 25, avaxc: 1, matic: 128, arbitrum: 1,
  optimism: 1, base: 1, ton: 1, atom: 1,
};

const SETTLEMENT_TIMES: Record<string, string> = {
  btc: "10–30 min", eth: "2–5 min", sol: "< 30 sec", trx: "< 1 min",
  bnb: "1–3 min", ltc: "2–10 min", doge: "5–20 min", xrp: "< 10 sec",
  ada: "2–5 min", dot: "1–3 min", avaxc: "< 30 sec", matic: "5–10 min",
  arbitrum: "< 30 sec", optimism: "< 30 sec", base: "< 30 sec", ton: "< 15 sec",
};

const ASSET_DESCRIPTIONS: Record<string, string> = {
  btc: "Bitcoin is the world's first and largest cryptocurrency by market capitalization. It operates on a proof-of-work consensus mechanism and is widely regarded as digital gold — a store of value and hedge against inflation.",
  eth: "Ethereum is the leading smart contract platform, powering thousands of decentralized applications (dApps), DeFi protocols, and NFT marketplaces. Its native token ETH is used for gas fees and staking.",
  sol: "Solana is a high-performance Layer 1 blockchain capable of processing 65,000+ transactions per second. It's known for ultra-low fees (< $0.01) and is popular for DeFi, NFTs, and AI applications.",
  usdt: "Tether (USDT) is the world's largest stablecoin, pegged 1:1 to the US Dollar. It's available on multiple networks including Ethereum, TRON, and Solana, and is widely used for trading and cross-border payments.",
  usdc: "USD Coin (USDC) is a fully-backed, regulated stablecoin issued by Circle. It maintains a 1:1 peg to the US Dollar and is known for its transparency with regular reserve attestations.",
  xrp: "XRP is the native token of the XRP Ledger, designed for fast, low-cost international payments. Transactions settle in 3–5 seconds with fees under $0.01.",
  bnb: "BNB is the native cryptocurrency of the BNB Smart Chain ecosystem. Originally a utility token for the Binance exchange, it's now widely used for DeFi, gaming, and transaction fees.",
  doge: "Dogecoin is a community-driven cryptocurrency that started as a meme but has become one of the most widely-held digital assets. It uses a proof-of-work consensus mechanism similar to Litecoin.",
  ada: "Cardano (ADA) is a third-generation blockchain platform built on peer-reviewed academic research. It uses a proof-of-stake consensus called Ouroboros and focuses on scalability and sustainability.",
  trx: "TRON (TRX) is a blockchain platform focused on content sharing and entertainment. Its network processes over 2,000 transactions per second and is the primary network for USDT transfers.",
  dot: "Polkadot enables cross-chain interoperability through its unique parachain architecture. DOT holders participate in governance and can stake their tokens to secure the network.",
  matic: "Polygon (MATIC) is Ethereum's leading Layer 2 scaling solution, offering faster and cheaper transactions while inheriting Ethereum's security. It supports thousands of dApps.",
  avax: "Avalanche is a high-speed blockchain platform for custom blockchain networks and dApps. It's known for sub-second finality and low transaction costs.",
  link: "Chainlink (LINK) is the industry-standard decentralized oracle network that provides real-world data to smart contracts across multiple blockchains.",
  ltc: "Litecoin is one of the earliest Bitcoin alternatives, offering faster block times (2.5 minutes vs 10 minutes) and lower fees. It's often used as a testbed for Bitcoin improvements.",
  xaut: "Tether Gold (XAUt) is a digital token backed 1:1 by physical gold stored in Swiss vaults. Each token represents one troy ounce of gold on a London Good Delivery bar.",
  paxg: "PAX Gold (PAXG) is a gold-backed cryptocurrency where each token represents one fine troy ounce of a London Good Delivery gold bar, stored in Brink's vaults.",
  dai: "DAI is a decentralized stablecoin maintained by MakerDAO, soft-pegged to the US Dollar through smart contract mechanisms rather than fiat reserves.",
  shib: "Shiba Inu (SHIB) is an Ethereum-based meme token that has evolved into a full ecosystem with its own DEX (ShibaSwap), Layer 2 solution (Shibarium), and metaverse project.",
  ton: "TON (The Open Network) is a fast, scalable blockchain originally designed by Telegram. It supports smart contracts, DeFi, and is deeply integrated with the Telegram messaging platform.",
};

function getNetworkLabel(network: string): string {
  return NETWORK_LABELS[network.toLowerCase()] || network.toUpperCase();
}

function getExplorerUrl(network: string, contract: string | null): string | null {
  if (!contract) return null;
  const base = EXPLORER_MAP[network.toLowerCase()];
  return base ? `${base}${contract}` : null;
}

function getSettlementTime(network: string, ticker: string): string {
  return SETTLEMENT_TIMES[network.toLowerCase()] || SETTLEMENT_TIMES[ticker.toLowerCase()] || "1–5 min";
}

function getAssetDescription(ticker: string): string {
  return ASSET_DESCRIPTIONS[ticker.toLowerCase()] || "";
}

/* ─────────────────── Component ─────────────────── */

export default function DynamicExchange() {
  const { pair } = useParams<{ pair: string }>();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const { t } = useTranslation();
  const lp = (p: string) => langPath(lang, p);

  const match = pair?.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
  const fromTicker = match?.[1] || "";
  const toTicker = match?.[2] || "";
  const fromLower = fromTicker.toLowerCase();
  const toLower = toTicker.toLowerCase();

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

  const { data: relatedAssets } = useQuery({
    queryKey: ["exchange-related-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("exchange_assets")
        .select("ticker, name, image_url")
        .eq("is_active", true)
        .eq("tier", 1)
        .order("ticker");
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

  if (!match) return <Navigate to={lp("/")} replace />;
  if (!loadingFrom && !loadingTo && (!fromAsset || !toAsset)) {
    return <Navigate to={lp("/")} replace />;
  }

  const isLoading = loadingFrom || loadingTo;
  const fromName = fromAsset?.name || fromTicker.toUpperCase();
  const toName = toAsset?.name || toTicker.toUpperCase();
  const fromUp = fromTicker.toUpperCase();
  const toUp = toTicker.toUpperCase();

  const title = `How to Swap ${fromUp} to ${toUp} Instantly — No KYC, Best Rate | MRC GlobalPay`;
  const description = `Convert ${fromName} (${fromUp}) to ${toName} (${toUp}) in under 60 seconds with no account required. Compare rates from 700+ liquidity sources. Canadian MSB-registered (C100000015). Step-by-step guide, network details, and live rates.`;
  const canonicalUrl = `https://mrcglobalpay.com/exchange/${fromLower}-to-${toLower}`;

  const fromNetwork = fromAsset?.network || "";
  const toNetwork = toAsset?.network || "";
  const fromContract = fromAsset?.token_contract || null;
  const toContract = toAsset?.token_contract || null;
  const fromConfirmations = CONFIRMATIONS[fromNetwork.toLowerCase()] || CONFIRMATIONS[fromLower] || 12;
  const toConfirmations = CONFIRMATIONS[toNetwork.toLowerCase()] || CONFIRMATIONS[toLower] || 12;
  const fromSettlement = getSettlementTime(fromNetwork, fromLower);
  const toSettlement = getSettlementTime(toNetwork, toLower);
  const fromDesc = getAssetDescription(fromLower);
  const toDesc = getAssetDescription(toLower);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://mrcglobalpay.com" },
          { "@type": "ListItem", position: 2, name: "Exchange", item: "https://mrcglobalpay.com/exchange/btc-to-eth" },
          { "@type": "ListItem", position: 3, name: `${fromUp} to ${toUp}`, item: canonicalUrl },
        ],
      },
      {
        "@type": "HowTo",
        name: `How to Swap ${fromUp} to ${toUp}`,
        description: `Step-by-step guide to convert ${fromName} to ${toName} instantly on MRC GlobalPay.`,
        totalTime: "PT2M",
        tool: { "@type": "SoftwareApplication", name: "MRC GlobalPay", operatingSystem: "Web Browser", applicationCategory: "FinanceApplication" },
        step: [
          { "@type": "HowToStep", position: 1, name: "Select your pair", text: `Choose ${fromUp} as the source currency and ${toUp} as the destination in the swap widget.` },
          { "@type": "HowToStep", position: 2, name: "Enter amount", text: `Enter the amount of ${fromUp} you want to convert. The minimum is approximately $0.30 USD equivalent.` },
          { "@type": "HowToStep", position: 3, name: "Provide destination address", text: `Paste your ${toUp} wallet address.${toAsset?.has_external_id ? ` ${toName} requires a Memo/Destination Tag — you'll be prompted to enter it.` : ""}` },
          { "@type": "HowToStep", position: 4, name: "Send and receive", text: `Send your ${fromUp} to the provided deposit address. Your ${toUp} will arrive in ${toSettlement}.` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the minimum ${fromUp} required to swap for ${toUp}?`,
            acceptedAnswer: { "@type": "Answer", text: `The minimum swap amount is approximately $0.30 USD equivalent in ${fromUp}. MRC GlobalPay supports micro-swaps starting from crypto dust amounts, making it ideal for converting small balances.` },
          },
          {
            "@type": "Question",
            name: `How long does a ${fromUp} to ${toUp} swap take?`,
            acceptedAnswer: { "@type": "Answer", text: `Most ${fromUp} to ${toUp} swaps complete in under 60 seconds after the deposit transaction receives the required network confirmations. ${fromUp} typically needs ${fromConfirmations} confirmation(s) (${fromSettlement}), after which your ${toUp} is sent immediately.` },
          },
          {
            "@type": "Question",
            name: `Does ${toUp} require a Memo or Destination Tag?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: toAsset?.has_external_id
                ? `Yes, ${toName} requires an additional identifier (Memo or Destination Tag). You will be prompted to enter it during the swap. Failing to include this identifier may result in permanent loss of funds.`
                : `No, ${toName} does not require a Memo or Destination Tag. Simply provide your ${toUp} wallet address to receive your funds.`,
            },
          },
          {
            "@type": "Question",
            name: `Can I swap ${fromUp} to ${toUp} without KYC or identity verification?`,
            acceptedAnswer: { "@type": "Answer", text: `Yes. MRC GlobalPay is a registered Canadian Money Services Business (MSB #C100000015, FINTRAC-supervised). Standard crypto-to-crypto swaps do not require account creation, email registration, or identity verification. The service is non-custodial — your funds are never held by MRC GlobalPay.` },
          },
          {
            "@type": "Question",
            name: `What fees does MRC GlobalPay charge for ${fromUp} to ${toUp} swaps?`,
            acceptedAnswer: { "@type": "Answer", text: `MRC GlobalPay charges a small network fee that is transparently displayed before you confirm the swap. There are no hidden fees, no spread markup, and no withdrawal fees. The rate shown is the rate you get.` },
          },
          {
            "@type": "Question",
            name: `Is it safe to swap ${fromUp} to ${toUp} on MRC GlobalPay?`,
            acceptedAnswer: { "@type": "Answer", text: `Yes. MRC GlobalPay operates a fully non-custodial swap service — we never hold your private keys or funds. The platform is operated by MRC Pay International Corp., a FINTRAC-registered MSB headquartered in Ottawa, Canada. All swaps are executed through audited liquidity partners with real-time settlement.` },
          },
          {
            "@type": "Question",
            name: `What network does ${fromUp} use for this swap?`,
            acceptedAnswer: { "@type": "Answer", text: `${fromName} operates on the ${getNetworkLabel(fromNetwork)} network for this swap.${fromContract ? ` The verified contract address is ${fromContract}.` : ""} Ensure you send from a compatible wallet to avoid loss of funds.` },
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "MRC GlobalPay",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, Android, iOS",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: `Instant ${fromUp} to ${toUp} cryptocurrency exchange. No registration, no KYC, best rates from 700+ liquidity sources.`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
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

        {/* ─── Hero with Answer-First Snippet Block ─── */}
        <section className="relative py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
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
                How to Swap {fromUp} to {toUp} <span className="text-[#00E676]">Instantly</span>
              </h1>

              {/* Snippet-optimized answer block — visible to crawlers */}
              <div className="mt-4 max-w-3xl space-y-3">
                <p className="text-base text-[#C4C8D0] sm:text-lg leading-relaxed">
                  <strong className="text-white">To swap {fromUp} to {toUp}:</strong> Enter your amount, paste your {toUp} wallet address, and send {fromUp} to the deposit address. Your {toUp} arrives in {toSettlement}. No account, no KYC, no minimum beyond $0.30 USD.
                </p>
                <p className="text-sm text-[#8A8F98] leading-relaxed">
                  MRC GlobalPay aggregates rates from 700+ liquidity sources to find the best {fromUp}/{toUp} exchange rate in real time. We are a Canadian MSB (C100000015) operating non-custodial swaps — your funds are never held by us.
                </p>
              </div>

              {/* Quick Facts — structured for featured snippets */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-3.5 text-center">
                  <Timer className="mx-auto h-5 w-5 text-[#00E676] mb-1.5" />
                  <p className="text-xs text-[#8A8F98]">Settlement</p>
                  <p className="font-display text-sm font-bold text-white">{toSettlement}</p>
                </div>
                <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-3.5 text-center">
                  <Wallet className="mx-auto h-5 w-5 text-[#00E676] mb-1.5" />
                  <p className="text-xs text-[#8A8F98]">Minimum</p>
                  <p className="font-display text-sm font-bold text-white">~$0.30</p>
                </div>
                <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-3.5 text-center">
                  <Lock className="mx-auto h-5 w-5 text-[#00E676] mb-1.5" />
                  <p className="text-xs text-[#8A8F98]">KYC Required</p>
                  <p className="font-display text-sm font-bold text-white">No</p>
                </div>
                <div className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-3.5 text-center">
                  <BarChart3 className="mx-auto h-5 w-5 text-[#00E676] mb-1.5" />
                  <p className="text-xs text-[#8A8F98]">Liquidity Sources</p>
                  <p className="font-display text-sm font-bold text-white">700+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Swap Widget ─── */}
        <section className="pb-12" id="exchange">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <ExchangeWidget />
            </div>
          </div>
        </section>

        {/* ─── Step-by-Step How It Works (HowTo Schema alignment) ─── */}
        <section className="py-12 border-t border-[#1E2028]">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-2">
                How to Convert {fromName} to {toName} — Step by Step
              </h2>
              <p className="text-sm text-[#8A8F98] mb-8">
                Complete your {fromUp} to {toUp} swap in 4 simple steps. No downloads, no sign-ups, no identity checks.
              </p>
              <ol className="space-y-6">
                {[
                  { step: "1", title: `Select ${fromUp} → ${toUp}`, desc: `Choose ${fromName} as the source and ${toName} as the destination in the swap widget above. The exchange rate updates in real time.` },
                  { step: "2", title: "Enter your amount", desc: `Type the amount of ${fromUp} you want to convert. The minimum is ~$0.30 USD equivalent — we support micro-swaps for converting dust balances.` },
                  { step: "3", title: `Paste your ${toUp} wallet address`, desc: `Provide the ${toName} address where you want to receive funds.${toAsset?.has_external_id ? ` Important: ${toName} requires a Memo/Destination Tag — you'll be prompted to enter it.` : ""} Double-check the address — blockchain transactions are irreversible.` },
                  { step: "4", title: `Send ${fromUp} and receive ${toUp}`, desc: `Send your ${fromUp} to the one-time deposit address we generate. After ${fromConfirmations} network confirmation(s) (typically ${fromSettlement}), your ${toUp} is sent to your wallet automatically. Expected delivery: ${toSettlement}.` },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00E676]/10 font-display text-sm font-bold text-[#00E676]">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-white">{s.title}</h3>
                      <p className="mt-1 text-sm text-[#8A8F98] leading-relaxed">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ─── Asset Deep-Dive (unique editorial content per pair) ─── */}
        {!isLoading && (fromDesc || toDesc) && (
          <section className="py-12 border-t border-[#1E2028]">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl space-y-8">
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                  <BookOpen className="inline-block h-5 w-5 text-[#00E676] me-2 align-text-bottom" />
                  Understanding {fromUp} and {toUp}
                </h2>
                {fromDesc && (
                  <article>
                    <h3 className="font-display text-base font-bold text-white mb-2 flex items-center gap-2">
                      <TokenIcon src={fromAsset?.image_url} ticker={fromLower} alt={fromName} className="h-5 w-5" />
                      What is {fromName} ({fromUp})?
                    </h3>
                    <p className="text-sm text-[#C4C8D0] leading-relaxed">{fromDesc}</p>
                  </article>
                )}
                {toDesc && (
                  <article>
                    <h3 className="font-display text-base font-bold text-white mb-2 flex items-center gap-2">
                      <TokenIcon src={toAsset?.image_url} ticker={toLower} alt={toName} className="h-5 w-5" />
                      What is {toName} ({toUp})?
                    </h3>
                    <p className="text-sm text-[#C4C8D0] leading-relaxed">{toDesc}</p>
                  </article>
                )}

                {/* Why swap these two? — unique paragraph per pair */}
                <article>
                  <h3 className="font-display text-base font-bold text-white mb-2">
                    Why Swap {fromUp} to {toUp}?
                  </h3>
                  <p className="text-sm text-[#C4C8D0] leading-relaxed">
                    Converting {fromName} to {toName} allows you to
                    {fromAsset?.is_stable && !toAsset?.is_stable
                      ? ` exit a stable position and gain exposure to ${toName}'s price movements.`
                      : !fromAsset?.is_stable && toAsset?.is_stable
                      ? ` lock in your ${fromUp} gains by moving into a stable, dollar-pegged asset.`
                      : fromLower === "btc"
                      ? ` diversify beyond Bitcoin into ${toName}'s ecosystem and use cases.`
                      : toLower === "btc"
                      ? ` consolidate your holdings into Bitcoin, the most liquid and widely-accepted cryptocurrency.`
                      : ` rebalance your portfolio between two distinct blockchain ecosystems with different utility and risk profiles.`
                    }
                    {" "}On MRC GlobalPay, this swap settles in {toSettlement} with no slippage beyond the rate shown — what you see is what you get.
                  </p>
                </article>
              </div>
            </div>
          </section>
        )}

        {/* ─── Network Intelligence Cards ─── */}
        {!isLoading && (fromAsset || toAsset) && (
          <section className="py-12 border-t border-[#1E2028]">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-5xl">
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-2">
                  Network &amp; Security Details
                </h2>
                <p className="text-sm text-[#8A8F98] mb-6">
                  Technical specifications for the {fromUp}/{toUp} swap pair. Verify contract addresses before sending funds.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { asset: fromAsset, name: fromName, up: fromUp, network: fromNetwork, contract: fromContract, confs: fromConfirmations, settlement: fromSettlement },
                    { asset: toAsset, name: toName, up: toUp, network: toNetwork, contract: toContract, confs: toConfirmations, settlement: toSettlement },
                  ].filter((a) => a.asset).map((a) => (
                    <div key={a.up} className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <TokenIcon src={a.asset!.image_url} ticker={a.up.toLowerCase()} alt={a.name} className="h-8 w-8" />
                        <div>
                          <h3 className="font-display text-sm font-bold text-white">{a.name} ({a.up})</h3>
                          <span className="text-xs text-[#8A8F98]">{getNetworkLabel(a.network)}</span>
                        </div>
                      </div>
                      <dl className="space-y-2.5 text-sm">
                        <div className="flex items-start gap-2">
                          <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                          <div><dt className="sr-only">Network</dt><dd className="text-[#C4C8D0]"><strong className="text-white">Network:</strong> {getNetworkLabel(a.network)}</dd></div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                          <div><dt className="sr-only">Confirmations</dt><dd className="text-[#C4C8D0]"><strong className="text-white">Confirmations:</strong> {a.confs} ({a.settlement})</dd></div>
                        </div>
                        {a.contract && (
                          <div className="flex items-start gap-2">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" />
                            <div className="break-all"><dt className="sr-only">Contract</dt><dd className="text-[#C4C8D0]">
                              <strong className="text-white">Contract:</strong>{" "}
                              {getExplorerUrl(a.network, a.contract) ? (
                                <a href={getExplorerUrl(a.network, a.contract)!} target="_blank" rel="noopener noreferrer" className="text-[#00A3FF] hover:underline inline-flex items-center gap-1">
                                  {a.contract.slice(0, 10)}…{a.contract.slice(-6)} <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="font-mono text-xs">{a.contract.slice(0, 10)}…{a.contract.slice(-6)}</span>
                              )}
                            </dd></div>
                          </div>
                        )}
                        {a.asset!.has_external_id && (
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                            <dd className="text-yellow-400/80 text-xs"><strong>{a.name}</strong> requires a Memo/Destination Tag.</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-[#2A2D35] bg-[#12141A] p-4 flex items-start gap-3">
                  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#00E676]" />
                  <p className="text-sm text-[#C4C8D0]">
                    <strong className="text-white">Settlement Infrastructure:</strong> This swap is executed through institutional-grade liquidity rails aggregating 700+ providers. The process is non-custodial (your funds transit directly between wallets), forensic-verified, and compliant with Canadian FINTRAC regulations.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── Trust & Compliance Block (unique SEO content) ─── */}
        <section className="py-12 border-t border-[#1E2028]">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-6">
                <Shield className="inline-block h-5 w-5 text-[#00E676] me-2 align-text-bottom" />
                Why Trade {fromUp}/{toUp} on MRC GlobalPay?
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: <Globe className="h-5 w-5" />, title: "No Account Required", desc: "Start swapping in seconds. No email, no phone number, no selfie. Just enter your amount and wallet address." },
                  { icon: <Lock className="h-5 w-5" />, title: "Non-Custodial & Secure", desc: "Your private keys stay with you. We never hold your funds — every swap is a direct wallet-to-wallet settlement." },
                  { icon: <CheckCircle2 className="h-5 w-5" />, title: "Canadian MSB Registered", desc: "Operated by MRC Pay International Corp., registered with FINTRAC (MSB #C100000015). Fully compliant, fully transparent." },
                  { icon: <BarChart3 className="h-5 w-5" />, title: "Best Available Rate", desc: "Our engine queries 700+ liquidity sources in real time and routes your swap to the best rate. No hidden fees or spreads." },
                ].map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#2A2D35] bg-[#12141A] p-4 flex gap-3">
                    <div className="shrink-0 text-[#00E676]">{card.icon}</div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-white">{card.title}</h3>
                      <p className="mt-1 text-xs text-[#8A8F98] leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Expanded FAQ (7 questions, snippet-optimized) ─── */}
        <section className="py-12 border-t border-[#1E2028]">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl mb-2">
                <HelpCircle className="inline-block h-5 w-5 text-[#00E676] me-2 align-text-bottom" />
                {fromUp} to {toUp} — Frequently Asked Questions
              </h2>
              <p className="text-sm text-[#8A8F98] mb-6">
                Everything you need to know about converting {fromName} to {toName}.
              </p>
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  {
                    value: "faq-min",
                    q: `What is the minimum amount of ${fromUp} I can swap for ${toUp}?`,
                    a: `The minimum swap amount is approximately $0.30 USD equivalent in ${fromUp}. MRC GlobalPay is specifically designed to handle micro-swaps and "crypto dust" — small leftover balances that other exchanges refuse to process. The exact minimum fluctuates with market prices and is always displayed in the swap widget before you confirm.`,
                  },
                  {
                    value: "faq-time",
                    q: `How long does a ${fromUp} to ${toUp} swap take?`,
                    a: `The total time depends on ${fromName}'s network confirmation speed. ${fromUp} typically requires ${fromConfirmations} confirmation(s), which takes ${fromSettlement}. Once confirmed, your ${toUp} is sent within seconds. End-to-end, most swaps complete in under 2 minutes.`,
                  },
                  {
                    value: "faq-memo",
                    q: `Does ${toUp} require a Memo, Tag, or Extra ID?`,
                    a: toAsset?.has_external_id
                      ? `Yes. ${toName} uses an additional identifier (called a Memo, Destination Tag, or Extra ID depending on the network). You will be prompted to enter it during the swap process. Failing to include this identifier will result in permanent loss of funds — there is no way to recover them.`
                      : `No. ${toName} does not require a Memo, Destination Tag, or Extra ID. You only need to provide your ${toUp} wallet address. However, always double-check the address — blockchain transactions are irreversible.`,
                  },
                  {
                    value: "faq-kyc",
                    q: `Do I need to create an account or verify my identity to swap ${fromUp} to ${toUp}?`,
                    a: `No. MRC GlobalPay does not require account creation, email registration, or identity verification (KYC) for standard cryptocurrency swaps. We are a registered Canadian Money Services Business (MSB Identifier: C100000015, FINTRAC-supervised), which allows us to provide fully compliant non-custodial swap services without imposing KYC requirements on individual users.`,
                  },
                  {
                    value: "faq-fees",
                    q: `What fees does MRC GlobalPay charge for ${fromUp} to ${toUp}?`,
                    a: `There are no hidden fees. The exchange rate displayed in the swap widget includes a small service fee and the blockchain network fee required to send your ${toUp}. There is no withdrawal fee, no deposit fee, and no spread markup beyond what is shown. The rate you see is the rate you get.`,
                  },
                  {
                    value: "faq-safe",
                    q: `Is it safe to use MRC GlobalPay to swap ${fromUp} to ${toUp}?`,
                    a: `Yes. MRC GlobalPay operates a fully non-custodial service — we never take custody of your funds or private keys. Your ${fromUp} is exchanged directly through audited liquidity partners and sent to your ${toUp} address. The platform is operated by MRC Pay International Corp., a FINTRAC-registered MSB headquartered in Ottawa, Ontario, Canada.`,
                  },
                  {
                    value: "faq-network",
                    q: `What blockchain network should I use to send ${fromUp}?`,
                    a: `For this swap, ${fromName} uses the ${getNetworkLabel(fromNetwork)} network. Ensure your sending wallet is compatible with this network. Sending ${fromUp} on an incompatible network (e.g., sending ERC-20 tokens to a BEP-20 address) will result in permanent loss of funds. ${fromContract ? `The verified contract address is: ${fromContract}` : ""}`,
                  },
                ].map((faq) => (
                  <AccordionItem key={faq.value} value={faq.value} className="rounded-xl border border-[#2A2D35] bg-[#12141A] px-5">
                    <AccordionTrigger className="font-display text-sm font-semibold text-white hover:no-underline text-start">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#8A8F98] leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ─── Related Trading Pairs ─── */}
        {relatedAssets && relatedAssets.length > 0 && (
          <section className="py-12 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-5xl">
                <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl mb-2">
                  Explore {relatedAssets.length * (relatedAssets.length - 1)}+ Trading Pairs
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Swap between any of the {relatedAssets.length} most popular cryptocurrencies — instantly, no registration.
                </p>

                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Swap {fromUp} to
                </h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {relatedAssets
                    .filter((a) => a.ticker.toLowerCase() !== fromLower)
                    .slice(0, 20)
                    .map((a) => (
                      <Link key={a.ticker} to={lp(`/exchange/${fromLower}-to-${a.ticker.toLowerCase()}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent">
<TokenIcon src={a.image_url} ticker={a.ticker} alt={a.name} className="h-4 w-4" />
                        {a.ticker.toUpperCase()}
                      </Link>
                    ))}
                </div>

                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Swap to {toUp} from
                </h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {relatedAssets
                    .filter((a) => a.ticker.toLowerCase() !== toLower)
                    .slice(0, 20)
                    .map((a) => (
                      <Link key={a.ticker} to={lp(`/exchange/${a.ticker.toLowerCase()}-to-${toLower}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent">
                        <TokenIcon src={a.image_url} ticker={a.ticker} alt={a.name} className="h-4 w-4" />
                        {a.ticker.toUpperCase()}
                      </Link>
                    ))}
                </div>

                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Popular Pairs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {relatedAssets.slice(0, 8).flatMap((from) =>
                    relatedAssets.filter((to) => to.ticker !== from.ticker).slice(0, 3).map((to) => (
                      <Link key={`${from.ticker}-${to.ticker}`} to={lp(`/exchange/${from.ticker.toLowerCase()}-to-${to.ticker.toLowerCase()}`)}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs transition-colors hover:border-primary/40 hover:bg-accent">
                        <div className="flex -space-x-1">
                          <TokenIcon src={from.image_url} ticker={from.ticker} className="h-4 w-4 ring-1 ring-background" />
                          <TokenIcon src={to.image_url} ticker={to.ticker} className="h-4 w-4 ring-1 ring-background" />
                        </div>
                        <span className="font-medium text-foreground">{from.ticker.toUpperCase()}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">{to.ticker.toUpperCase()}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <LiveSwapTicker />

        {/* ─── CTA ─── */}
        <section className="py-12 border-t border-[#1E2028]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              Ready to swap {fromUp} for {toUp}?
            </h2>
            <p className="mt-2 text-sm text-[#8A8F98]">
              No registration. No KYC. Under 60 seconds. Canadian MSB-registered.
            </p>
            <a href="#exchange" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#00E676] px-6 py-3 font-display text-sm font-bold text-[#0B0D10] transition-all hover:bg-[#00C853]">
              <Zap className="h-4 w-4" /> Swap Now
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
