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
          <p className="text-center font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} MRC GlobalPay. All rights reserved. Cryptocurrency exchange services powered by ChangeNow.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
