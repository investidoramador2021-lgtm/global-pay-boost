const stablecoinBridges = [
  { label: "USDT to TRX", href: "/swap/usdt-to-trx", title: "Swap USDT to TRX instantly" },
  { label: "USDT to SOL", href: "/swap/usdt-to-sol", title: "Swap USDT to SOL instantly" },
  { label: "USDT to Solana", href: "/swap/usdt-to-solana", title: "Swap USDT to Solana instantly" },
  { label: "USDT to LTC", href: "/swap/usdt-to-ltc", title: "Swap USDT to Litecoin instantly" },
  { label: "USDT TRX Instant", href: "/swap/usdt-trx-instant", title: "Instant USDT to TRX swap" },
  { label: "USDC to SOL", href: "/swap/usdc-sol", title: "Swap USDC to SOL instantly" },
  { label: "USDC Solana", href: "/swap/usdc-solana", title: "Swap USDC on Solana network" },
  { label: "30 TRX to USDT", href: "/swap/30-trx-to-usdt", title: "Convert 30 TRX to USDT instantly" },
  { label: "PYUSD to USDT", href: "/swap/pyusd-to-usdt", title: "Swap PayPal USD to USDT instantly" },
  { label: "USD to XMR", href: "/swap/usd-to-xmr", title: "Convert USD to Monero privately" },
  { label: "SOL to IDR", href: "/swap/solana-to-idr", title: "Convert Solana to Indonesian Rupiah" },
  { label: "ETH to SOL Bridge", href: "/bridge/eth-to-sol", title: "Bridge Ethereum to Solana instantly" },
  { label: "SOL to BNB Bridge", href: "/bridge/solana-to-bnb", title: "Bridge Solana to BNB Chain instantly" },
  { label: "PulseChain Bridge", href: "/bridge/pulsechain", title: "Bridge assets to PulseChain instantly" },
];

const popularCryptoSwaps = [
  { label: "ETH to SOL", href: "/swap/eth-to-sol", title: "Swap Ethereum to Solana instantly" },
  { label: "BTC to SOL", href: "/swap/btc-to-sol-instant", title: "Swap Bitcoin to Solana instantly" },
  { label: "XMR to ETH", href: "/swap/xmr-to-eth", title: "Swap Monero to Ethereum instantly" },
  { label: "BNB Swap", href: "/swap/bnb", title: "Swap BNB to any cryptocurrency instantly" },
  { label: "BTC to USDC", href: "/swap/btc-to-usdc", title: "Swap Bitcoin to USDC instantly" },
  { label: "SHIB to USDT", href: "/swap/shiba-to-usdt", title: "Swap Shiba Inu to USDT instantly" },
  { label: "VINU Swap", href: "/swap/vinu", title: "Swap Vita Inu instantly" },
  { label: "HYPE to USDT", href: "/swap/hype-to-usdt", title: "Swap HYPE to USDT instantly" },
  { label: "BERA to USDT", href: "/swap/bera-to-usdt", title: "Swap Berachain to USDT instantly" },
  { label: "Monad to USDT", href: "/swap/monad-to-usdt", title: "Swap Monad to USDT instantly" },
  { label: "Trade Trump/SOL", href: "/trade/trump-sol", title: "Trade TRUMP token on Solana" },
  { label: "Trade Alpaca", href: "/trade/alpaca", title: "Trade Alpaca Finance token instantly" },
  { label: "BNB Meme Coins", href: "/trade/bnb-meme-coins", title: "Trade BNB meme coins instantly" },
];


const buyLinks = [
  { label: "Buy Bitcoin", href: "/buy/bitcoin-no-kyc", title: "Buy Bitcoin registration-free, no account required" },
  { label: "Buy Ethereum", href: "/buy/ethereum", title: "Buy Ethereum instantly with no account" },
  { label: "Buy Solana", href: "/buy/solana-no-kyc", title: "Buy Solana registration-free, no account required" },
  { label: "Buy Solana No Verification", href: "/buy/solana-no-verification", title: "Buy Solana with no identity verification" },
  { label: "Buy Solana PayPal", href: "/buy/solana-paypal", title: "Buy Solana with PayPal instantly" },
  { label: "Buy Ether Instant", href: "/buy/ether-instant", title: "Buy Ether instantly with no delays" },
  { label: "Buy XDC", href: "/buy/xdc", title: "Buy XDC Network token instantly" },
  { label: "Buy LTC PayPal", href: "/buy/ltc-paypal", title: "Buy Litecoin with PayPal" },
  { label: "Buy Celo", href: "/buy/celo", title: "Buy Celo cryptocurrency instantly" },
  { label: "Buy Monero Private", href: "/buy/monero-no-kyc", title: "Buy Monero privately, registration-free" },
  { label: "Bitcoin No Verification", href: "/buy/bitcoin-no-verification", title: "Buy Bitcoin with no identity verification" },
];

const resourceLinks = [
  { label: "How It Works", href: "/#how-it-works", title: "Learn how MRC GlobalPay crypto swaps work" },
  { label: "Features", href: "/#features", title: "Explore MRC GlobalPay exchange features" },
  { label: "Swap Pairs", href: "/#swap-pairs", title: "Browse all supported swap pairs" },
  { label: "Blog", href: "/blog", title: "Read crypto guides and market analysis" },
  { label: "FAQ", href: "/#faq", title: "Frequently asked questions about crypto swaps" },
  { label: "Get Widget", href: "/get-widget", title: "Embed a free crypto swap widget on your website" },
  { label: "Developer Hub", href: "/developer", title: "Widget integration docs, URL deep-linking, and supported chains" },
  { label: "How to Swap Dust", href: "/resources/crypto-dust-guide", title: "Guide to converting small crypto balances" },
  { label: "Fractal BTC Bridge", href: "/resources/fractal-bitcoin-swap", title: "Bridge Fractal Bitcoin to other networks" },
  { label: "Best Place to Buy Solana", href: "/guides/best-place-to-buy-solana", title: "Find the best place to buy Solana" },
  { label: "How to Buy Litecoin", href: "/guides/how-to-buy-litecoin", title: "Step-by-step Litecoin buying guide" },
  { label: "How to Mine Litecoin", href: "/guides/how-to-mine-litecoin", title: "Complete Litecoin mining tutorial" },
  { label: "Is Solana a Good Investment?", href: "/guides/is-solana-a-good-investment", title: "Solana investment analysis and outlook" },
  { label: "Best Short-Term Crypto", href: "/guides/best-short-term-crypto", title: "Top cryptocurrencies for short-term trading" },
  { label: "Trade Meme Coins", href: "/guides/how-to-trade-meme-coins", title: "How to trade meme coins profitably" },
  { label: "USDT ERC20 Meaning", href: "/guides/usdt-erc20-meaning", title: "What USDT ERC20 means and how it works" },
  { label: "Wrapped BTC Guide", href: "/guides/wrapped-btc-to-bitcoin", title: "Convert Wrapped BTC back to Bitcoin" },
  { label: "Swap Nodes in Pairs", href: "/guides/swap-nodes-in-pairs", title: "Guide to swapping nodes in pairs" },
  { label: "Dust Calculator", href: "/tools/crypto-dust-calculator", title: "Calculate the purchasing power of your crypto dust" },
];

const toolsAndAlternatives = [
  { label: "LTC Tracker", href: "/tools/ltc-tracker", title: "Track Litecoin price and transactions" },
  { label: "Litecoin Tracker", href: "/tools/litecoin-tracker", title: "Monitor Litecoin portfolio and prices" },
  { label: "Rate of Change", href: "/tools/instant-rate-change", title: "Check instant crypto exchange rates" },
  { label: "Swap Bot", href: "/tools/swap-bot", title: "Automated cryptocurrency swap bot" },
  { label: "SOL Wallet Tracker", href: "/tools/sol-wallet-tracker", title: "Track Solana wallet activity" },
  { label: "AdaSwap Alternative", href: "/alternatives/adaswap", title: "Best alternative to AdaSwap exchange" },
  { label: "Holo Exchange Alt", href: "/alternatives/holo-exchange", title: "Best alternative to Holo Exchange" },
  { label: "Xcoins Alternative", href: "/alternatives/xcoins", title: "Best alternative to Xcoins" },
  { label: "Topper Crypto Alt", href: "/alternatives/topper-crypto", title: "Best alternative to Topper Crypto" },
  { label: "Kraken Monero Alt", href: "/alternatives/kraken-monero", title: "Best Kraken alternative for Monero" },
  { label: "Orange Fren XMR Alt", href: "/guides/buy-xmr-orange-fren-alternative", title: "Best Orange Fren alternative for Monero" },
];

const ecosystemLinks = [
  { label: "Solana AI Hub", href: "/ecosystem/solana-ai", title: "Instant Solana AI swaps for autonomous agents" },
  { label: "Solana Ecosystem Hub", href: "/ecosystem/solana", title: "Swap Solana AI agent & DePIN tokens instantly" },
  { label: "DAG Crypto", href: "/ecosystem/dag-crypto", title: "Explore DAG cryptocurrency ecosystem" },
  { label: "Jambo Solana", href: "/ecosystem/jambo-solana", title: "Jambo phone and Solana ecosystem" },
  { label: "DAG Coins", href: "/ecosystem/dag-coins", title: "Explore DAG-based cryptocurrencies" },
  { label: "DUSD Portal", href: "/ecosystem/dusd", title: "DUSD stablecoin portal and info" },
  { label: "Tether Pro", href: "/ecosystem/tether-pro", title: "Tether Pro platform overview" },
  { label: "Shiba Inu Card", href: "/ecosystem/shiba-inu-card", title: "Shiba Inu crypto debit card info" },
  { label: "ARK XRP", href: "/ecosystem/ark-xrp", title: "ARK and XRP ecosystem overview" },
  { label: "Harmony ONE Price", href: "/price/harmony-one", title: "Check Harmony ONE current price" },
  { label: "Coin Exchange Near Me", href: "/local-crypto-exchange", title: "Find local crypto exchanges nearby" },
  { label: "Exchange IU", href: "/exchange-iu", title: "Exchange IU crypto platform" },
];

const walletReviews = [
  { label: "Tangem Wallet Review", href: "/reviews/tangem-wallet", title: "In-depth Tangem hardware wallet review" },
  { label: "Best XRP Wallet", href: "/reviews/best-xrp-wallet", title: "Top wallets for storing XRP securely" },
  { label: "Best ERC20 Wallet", href: "/reviews/best-erc20-wallet", title: "Best wallets for ERC20 tokens" },
  { label: "DGB Wallet", href: "/reviews/dgb-wallet", title: "Best wallets for DigiByte" },
  { label: "BSV Wallet", href: "/reviews/bsv-wallet", title: "Best wallets for Bitcoin SV" },
  { label: "Best Ripple Wallet", href: "/reviews/best-ripple-wallet", title: "Top wallets for Ripple XRP" },
  { label: "Litecoin Mining Guide", href: "/guides/litecoin-mining", title: "Complete guide to mining Litecoin" },
];

const expertiseLinks = [
  { label: "Private Transfer", href: "/private-transfer", title: "Send crypto with shielded routing — no wallet exposure" },
  { label: "How UTXOs Work", href: "/resources/crypto-dust-guide#what-is-crypto-dust", title: "Understanding UTXO model and crypto dust" },
  { label: "Why $0.30 Is Our Minimum", href: "/dust-swap-comparison", title: "Why our minimum swap is only $0.30" },
  { label: "Non-Custodial Swaps", href: "/transparency-security", title: "How non-custodial crypto swaps work" },
  { label: "Micro-Swap FAQ", href: "/#faq", title: "Frequently asked questions about micro-swaps" },
  { label: "AML Compliance", href: "/aml", title: "Our Anti-Money Laundering policy and compliance" },
  { label: "Compare Exchanges", href: "/compare", title: "Compare MRC GlobalPay vs 50+ crypto exchanges" },
  { label: "Swap Solutions", href: "/solutions", title: "Browse all micro-swap solution guides" },
  { label: "MSB Compliance / About", href: "/about", title: "Canadian MSB registration and compliance information" },
  { label: "Referral Program", href: "/referral", title: "Earn 15% referral commission on every swap" },
  { label: "Rates Export (XML)", href: "/export/rates.xml", title: "Live exchange rates in BestChange XML format" },
];

const securityLegalLinks = [
  { label: "Trust & Transparency Hub", href: "/learn", title: "Learn how MRC GlobalPay protects your assets" },
  { label: "Non-Custodial Exchange", href: "/learn/why-non-custodial-is-safer", title: "Why non-custodial is safer for your crypto" },
  { label: "FINTRAC MSB Registration", href: "/learn/canadian-fintrac-msb", title: "Our Canadian MSB registration details" },
  { label: "Our Liquidity Partners", href: "/learn/our-liquidity-partners", title: "ChangeNOW & Fireblocks partner security" },
  { label: "Swap Without Registration", href: "/learn/swap-without-registration", title: "How to swap crypto with no account" },
  { label: "Track Your Micro-Swap", href: "/learn/tracking-your-micro-swap", title: "On-chain verification for every swap" },
];

type FooterLink = { label: string; href: string; title: string };

const FooterLinkList = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div>
    <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
      {title}
    </h3>
    <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            title={link.title}
            className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import GetTheAppBadges from "@/components/GetTheAppBadges";

const SiteFooter = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (path: string) => langPath(lang, path);

  return (
    <footer className="border-t border-border bg-muted py-10 sm:py-16">
      <div className="container mx-auto px-4">
        {/* Brand + main nav */}
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 xl:grid-cols-5">
          <div>
            <a href={lp("/")} title="MRC GlobalPay — Registration-Free Crypto Exchange" className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
              MRC<span className="text-primary">GlobalPay</span>
            </a>
            <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground sm:mt-4">
              Instant crypto-to-crypto swaps with zero delays. 500+ assets. No registration. Best market rates.
            </p>
          </div>

          <FooterLinkList title="Crypto Guides" links={resourceLinks} />
          <FooterLinkList title="Security & Legal" links={securityLegalLinks} />

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              {t("footer.legal")}
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              <li>
                <a href={lp("/privacy")} title="MRC GlobalPay Privacy Policy" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href={lp("/terms")} title="MRC GlobalPay Terms of Service" className="font-body text-sm font-semibold text-foreground transition-colors hover:text-primary">
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a href={lp("/aml")} title="MRC GlobalPay AML Policy" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("footer.aml")}
                </a>
              </li>
            </ul>
          </div>

          <FooterLinkList title="Wallet Reviews" links={walletReviews} />
        </div>

        {/* Swap pairs categorized grid */}
        <div className="mt-10 border-t border-border pt-8">
          <h3 className="mb-6 text-center font-display text-sm font-semibold uppercase tracking-wider text-foreground/70 sm:text-left">
            Swap Pairs Directory
          </h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FooterLinkList title="Popular Crypto Swaps" links={popularCryptoSwaps} />
            <FooterLinkList title="Stablecoin Bridges" links={stablecoinBridges} />
            <FooterLinkList title="Buy Crypto" links={buyLinks} />
            <FooterLinkList title="Tools & Alternatives" links={toolsAndAlternatives} />
          </div>
        </div>

        {/* Popular Comparisons */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FooterLinkList title="Popular Comparisons" links={[
              { label: "MRC vs Binance", href: "/compare/mrc-vs-binance", title: "Compare MRC GlobalPay vs Binance" },
              { label: "MRC vs Coinbase", href: "/compare/mrc-vs-coinbase", title: "Compare MRC GlobalPay vs Coinbase" },
              { label: "MRC vs ChangeNOW", href: "/compare/mrc-vs-changenow", title: "Compare MRC GlobalPay vs ChangeNOW" },
              { label: "MRC vs Changelly", href: "/compare/mrc-vs-changelly", title: "Compare MRC GlobalPay vs Changelly" },
              { label: "MRC vs SimpleSwap", href: "/compare/mrc-vs-simpleswap", title: "Compare MRC GlobalPay vs SimpleSwap" },
              { label: "MRC vs Uniswap", href: "/compare/mrc-vs-uniswap", title: "Compare MRC GlobalPay vs Uniswap" },
              { label: "MRC vs Kraken", href: "/compare/mrc-vs-kraken", title: "Compare MRC GlobalPay vs Kraken" },
              { label: "MRC vs THORChain", href: "/compare/mrc-vs-thorchain", title: "Compare MRC GlobalPay vs THORChain" },
              { label: "All Comparisons →", href: "/compare", title: "View all 50+ exchange comparisons" },
            ]} />
            <FooterLinkList title="Ecosystem & Prices" links={ecosystemLinks} />
          </div>
        </div>

        {/* Get the App + Technical Partners */}
        <div className="mt-8 border-t border-border pt-6 sm:mt-12 sm:pt-8">
          <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-3 text-center sm:text-left">
                Get the App
              </h3>
              <GetTheAppBadges variant="inline" />
            </div>
            <div>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-3 text-center sm:text-left">
                Technical Partners
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
                {["ChangeNOW", "Fireblocks"].map((partner) => (
                  <span
                    key={partner}
                    className="rounded border border-border bg-muted/50 px-3 py-1.5 font-body text-xs font-medium text-muted-foreground grayscale"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance & Security */}
          <div className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
              Compliance & Security
            </h3>
            <p className="font-body text-xs leading-relaxed text-muted-foreground">
              {t("footer.disclaimer")}{" "}
              <a href={lp("/transparency-security")} title="View MRC GlobalPay transparency and security practices" className="text-primary hover:underline">
                View our transparency &amp; security practices
              </a>
            </p>
          </div>

          {/* System Status */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Network Status: Optimal
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>Liquidity: Global Aggregate</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>Protocol: Non-Custodial</span>
          </div>

          <div className="mx-auto mb-6 max-w-md">
            <div
              className="trustpilot-widget"
              data-locale="en-US"
              data-template-id="56278e9abfbbba0bdcd568bc"
              data-businessunit-id="69b6ac5a99f240e8722db342"
              data-style-height="52px"
              data-style-width="100%"
              data-token="7bcf2cb1-257b-45b3-ba85-1bc33cf80fa7"
            >
              <a href="https://www.trustpilot.com/review/mrcglobalpay.com" target="_blank" rel="noopener" title="MRC GlobalPay reviews on Trustpilot">Trustpilot</a>
            </div>
          </div>
          {/* Author / Expertise Attribution */}
          <div className="mb-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="font-body text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground/70">Technical content by</strong>{" "}
              <a href="/about" className="text-foreground/80 underline decoration-foreground/20 underline-offset-2 hover:decoration-foreground/50">MRC GlobalPay Technical Architecture Team</a> — FINTRAC-registered MSB (M23225638) specializing in non-custodial cross-chain settlement infrastructure.
            </p>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-body text-sm font-medium text-foreground/80">
              © {new Date().getFullYear()} MRC Global Pay.{" "}
              <a
                href="https://www10.fintrac-canafe.gc.ca/msb-esm/public/detailed-information/bns-new/7b226d7362526567697374726174696f6e4e756d626572223a224d3233323235363338227d"
                target="_blank"
                rel="noopener noreferrer"
                title="Verify MRC GlobalPay FINTRAC MSB Registration (M23225638)"
                className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/70 transition-colors"
              >
                Registered MSB — Canada
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
