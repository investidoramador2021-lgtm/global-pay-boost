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
  { label: "Popular Pairs", href: "/#popular-pairs" },
  { label: "FAQ", href: "/#faq" },
];

const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="/" className="font-display text-xl font-bold tracking-tight text-primary-foreground">
              MRC<span className="text-primary">GlobalPay</span>
            </a>
            <p className="mt-4 font-body text-sm leading-relaxed text-primary-foreground/60">
              The fastest and most secure way to exchange 500+ cryptocurrencies. No registration required.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="font-body text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/privacy" className="font-body text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="font-body text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/aml" className="font-body text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                  AML Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8">
          <p className="text-center font-body text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} MRC GlobalPay. All rights reserved. Cryptocurrency exchange services powered by ChangeNow.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
