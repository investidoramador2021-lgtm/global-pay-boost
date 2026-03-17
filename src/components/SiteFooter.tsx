const quickLinks = [
  { label: "Buy Bitcoin", href: "/#exchange-widget" },
  { label: "Buy Ethereum", href: "/#exchange-widget" },
  { label: "Swap BTC to ETH", href: "/#exchange-widget" },
  { label: "Swap SOL to USDC", href: "/#exchange-widget" },
  { label: "Buy Solana", href: "/#exchange-widget" },
  { label: "Swap XRP to BTC", href: "/#exchange-widget" },
];

const resourceLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Swap Pairs", href: "/#swap-pairs" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
];

const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-muted py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
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
        </div>

        <div className="mt-8 border-t border-border pt-6 sm:mt-12 sm:pt-8">
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
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
