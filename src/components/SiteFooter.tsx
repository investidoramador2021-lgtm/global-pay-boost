const quickLinks = [
  { label: "Buy Bitcoin", href: "/buy/bitcoin-no-kyc" },
  { label: "Buy Ethereum", href: "/buy/ethereum" },
  { label: "Buy Solana", href: "/buy/solana-no-kyc" },
  { label: "Buy Solana No Verification", href: "/buy/solana-no-verification" },
  { label: "Swap BNB to SOL", href: "/swap/bnb-to-sol" },
  { label: "Bridge ETH to SOL", href: "/bridge/eth-to-sol" },
  { label: "Buy Ether Instant", href: "/buy/ether-instant" },
  { label: "Buy XDC", href: "/buy/xdc" },
  { label: "Buy LTC PayPal", href: "/buy/ltc-paypal" },
];

const popularSwaps = [
  { label: "USDT to TRX", href: "/swap/usdt-to-trx" },
  { label: "USDC to SOL", href: "/swap/usdc-sol" },
  { label: "USDC Solana", href: "/swap/usdc-solana" },
  { label: "XMR to ETH", href: "/swap/xmr-to-eth" },
  { label: "SHIB to USDT", href: "/swap/shiba-to-usdt" },
  { label: "BTC to SOL", href: "/swap/btc-to-sol-instant" },
  { label: "BNB Swap", href: "/swap/bnb" },
  { label: "USDT to SOL", href: "/swap/usdt-to-sol" },
  { label: "USDT to Solana", href: "/swap/usdt-to-solana" },
  { label: "USDT to LTC", href: "/swap/usdt-to-ltc" },
  { label: "ETH to SOL", href: "/swap/eth-to-sol" },
  { label: "USDT TRX Instant", href: "/swap/usdt-trx-instant" },
  { label: "SOL to IDR", href: "/swap/solana-to-idr" },
  { label: "30 TRX to USDT", href: "/swap/30-trx-to-usdt" },
  { label: "VINU Swap", href: "/swap/vinu" },
  { label: "USD to XMR", href: "/swap/usd-to-xmr" },
];

const moreLinks = [
  { label: "PulseChain Bridge", href: "/bridge/pulsechain" },
  { label: "Bridge SOL to BNB", href: "/bridge/solana-to-bnb" },
  { label: "Tangem Wallet Review", href: "/reviews/tangem-wallet" },
  { label: "Best XRP Wallet", href: "/reviews/best-xrp-wallet" },
  { label: "Trade Trump/SOL", href: "/trade/trump-sol" },
  { label: "SOL Wallet Tracker", href: "/tools/sol-wallet-tracker" },
  { label: "Buy Celo", href: "/buy/celo" },
  { label: "AdaSwap Alternative", href: "/alternatives/adaswap" },
  { label: "Holo Exchange Alt", href: "/alternatives/holo-exchange" },
  { label: "DAG Crypto", href: "/ecosystem/dag-crypto" },
  { label: "Jambo Solana", href: "/ecosystem/jambo-solana" },
  { label: "Xcoins Alternative", href: "/alternatives/xcoins" },
  { label: "Topper Crypto Alt", href: "/alternatives/topper-crypto" },
  { label: "Kraken Monero Alt", href: "/alternatives/kraken-monero" },
  { label: "DAG Coins", href: "/ecosystem/dag-coins" },
  { label: "DUSD Portal", href: "/ecosystem/dusd" },
  { label: "Tether Pro", href: "/ecosystem/tether-pro" },
  { label: "Shiba Inu Card", href: "/ecosystem/shiba-inu-card" },
  { label: "ARK XRP", href: "/ecosystem/ark-xrp" },
  { label: "Trade Alpaca", href: "/trade/alpaca" },
  { label: "Best ERC20 Wallet", href: "/reviews/best-erc20-wallet" },
  { label: "DGB Wallet", href: "/reviews/dgb-wallet" },
  { label: "BSV Wallet", href: "/reviews/bsv-wallet" },
  { label: "Best Ripple Wallet", href: "/reviews/best-ripple-wallet" },
];

const resourceLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Swap Pairs", href: "/#swap-pairs" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "How to Swap Dust", href: "/resources/crypto-dust-guide" },
  { label: "Fractal BTC Bridge", href: "/resources/fractal-bitcoin-swap" },
  { label: "Best Place to Buy Solana", href: "/guides/best-place-to-buy-solana" },
  { label: "How to Buy Litecoin", href: "/guides/how-to-buy-litecoin" },
  { label: "How to Mine Litecoin", href: "/guides/how-to-mine-litecoin" },
  { label: "Litecoin Mining Guide", href: "/guides/litecoin-mining" },
  { label: "Is Solana a Good Investment?", href: "/guides/is-solana-a-good-investment" },
  { label: "Best Short-Term Crypto", href: "/guides/best-short-term-crypto" },
  { label: "Trade Meme Coins", href: "/guides/how-to-trade-meme-coins" },
  { label: "USDT ERC20 Meaning", href: "/guides/usdt-erc20-meaning" },
  { label: "Wrapped BTC Guide", href: "/guides/wrapped-btc-to-bitcoin" },
  { label: "Orange Fren XMR Alt", href: "/guides/buy-xmr-orange-fren-alternative" },
  { label: "Swap Nodes in Pairs", href: "/guides/swap-nodes-in-pairs" },
  { label: "LTC Tracker", href: "/tools/ltc-tracker" },
  { label: "Litecoin Tracker", href: "/tools/litecoin-tracker" },
  { label: "Rate of Change", href: "/tools/instant-rate-change" },
  { label: "Swap Bot", href: "/tools/swap-bot" },
  { label: "Coin Exchange Near Me", href: "/local-crypto-exchange" },
  { label: "Exchange IU", href: "/exchange-iu" },
  { label: "Harmony ONE Price", href: "/price/harmony-one" },
  { label: "Buy Solana PayPal", href: "/buy/solana-paypal" },
  { label: "Buy Monero No KYC", href: "/buy/monero-no-kyc" },
  { label: "BNB Meme Coin Trading", href: "/trade/bnb-meme-coins" },
  { label: "Bitcoin No Verification", href: "/buy/bitcoin-no-verification" },
];

const expertiseLinks = [
  { label: "How UTXOs Work", href: "/resources/crypto-dust-guide#what-is-crypto-dust" },
  { label: "Why $0.30 Is Our Minimum", href: "/dust-swap-comparison" },
  { label: "Understanding Non-Custodial Swaps", href: "/transparency-security" },
  { label: "Transparency & Security", href: "/transparency-security" },
  { label: "Micro-Swap Comparison", href: "/dust-swap-comparison" },
];

const complianceText =
  "Registered Money Services Business (MSB) — Canada. Adhering to 2026 AML and FINTRAC standards.";

const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-muted py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 xl:grid-cols-7">
          <div>
            <a href="/" className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
              MRC<span className="text-primary">GlobalPay</span>
            </a>
            <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground sm:mt-4">
              Instant crypto-to-crypto swaps with zero delays. 500+ assets. No registration. Best market rates.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              Resources
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              Expertise
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {expertiseLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              <li>
                <a href="/privacy" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/aml" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                  AML Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              Popular Swaps
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {popularSwaps.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm">
              More
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {moreLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Technical Partners */}
        <div className="mt-8 border-t border-border pt-6 sm:mt-12 sm:pt-8">
          <div className="mb-6">
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

          {/* Compliance & Security */}
          <div className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
              Compliance & Security
            </h3>
            <p className="font-body text-xs leading-relaxed text-muted-foreground">
              {complianceText}{" "}
              <a href="/transparency-security" className="text-primary hover:underline">
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
              <a href="https://www.trustpilot.com/review/mrcglobalpay.com" target="_blank" rel="noopener">Trustpilot</a>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-body text-sm font-medium text-foreground/80">
              © {new Date().getFullYear()} MRC Global Pay | Ottawa, Canada
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-body text-[11px] font-medium text-muted-foreground">
              Liquidity provided by top-tier partners
            </span>
          </div>
          <p className="sr-only" aria-hidden="true">
            Low minimum crypto exchange, swap under $1, crypto dust converter, accountless trading 2026.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
