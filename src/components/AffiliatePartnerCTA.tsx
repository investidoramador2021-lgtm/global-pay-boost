import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import {
  ArrowRight,
  Bitcoin,
  Code2,
  Gauge,
  Infinity as InfinityIcon,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

const AffiliatePartnerCTA = () => {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const lp = (p: string) => langPath(lang, p);

  const benefits = [
    { icon: InfinityIcon, label: "Lifetime commissions" },
    { icon: Wallet, label: "No minimums" },
    { icon: Code2, label: "Easy widget embed" },
    { icon: Gauge, label: "Real-time dashboard" },
    { icon: ShieldCheck, label: "FINTRAC MSB C100000015" },
    { icon: ShieldCheck, label: "Bank of Canada PSP registered" },
  ];

  return (
    <section
      aria-labelledby="affiliate-partner-heading"
      className="cv-auto px-4 py-16 sm:py-20"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 shadow-xl sm:p-10 lg:p-14">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative">
            {/* Header */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Earn in BTC · Paid Automatically
              </div>
              <h2
                id="affiliate-partner-heading"
                className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                Earn Lifetime BTC Commissions – Join Our Affiliate &amp; Partner Programs
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Promote a regulated Canadian non-custodial swap platform and earn{" "}
                <span className="font-semibold text-foreground">0.1% – 0.4% lifetime commissions</span>{" "}
                paid automatically in BTC.
              </p>
            </div>

            {/* Benefits grid */}
            <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
              {benefits.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground backdrop-blur"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="font-medium">{label}</span>
                </li>
              ))}
            </ul>

            {/* Side-by-side preview cards */}
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {/* Affiliate / Widget card */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-background/80 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Code2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Affiliate Program
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Generate a branded swap widget in seconds. Drop one line of code on any site
                      and start earning BTC on every swap.
                    </p>
                  </div>
                </div>

                {/* Mock widget preview */}
                <div className="mt-5 rounded-xl border border-border/60 bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive/60" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    <span className="ms-2 text-[10px]">widget.html</span>
                  </div>
                  <div className="text-foreground/80">
                    &lt;iframe src="mrcglobalpay.com/embed/widget?ref=YOU"/&gt;
                  </div>
                </div>

                <Link
                  to={lp("/affiliates")}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Generate My Affiliate Widget Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Partner / Dashboard card */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-background/80 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Gauge className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Partner Program
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Access the full partner dashboard with API keys, real-time volume tracking,
                      webhooks, and automated BTC payouts.
                    </p>
                  </div>
                </div>

                {/* Mock dashboard preview */}
                <div className="mt-5 rounded-xl border border-border/60 bg-muted/40 p-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono">Lifetime BTC Earned</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                      <Bitcoin className="h-3 w-3" aria-hidden="true" />
                      Live
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-lg font-bold text-foreground">
                    ₿ 0.14582910
                  </div>
                  <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-border/60">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary/60" />
                  </div>
                </div>

                <Link
                  to={lp("/partners")}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-background px-5 py-3 text-sm font-bold text-primary shadow-md transition-all hover:bg-primary/10 active:scale-[0.98]"
                >
                  Become a Partner &amp; Access Dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Referral teaser */}
            <div className="mt-6 text-center">
              <Link
                to={lp("/referral")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Also explore our Referral Program
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Regulatory trust line */}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs text-muted-foreground sm:mx-auto sm:max-w-md">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Promote with confidence —{" "}
                <span className="font-semibold text-foreground">Fully regulated in Canada</span>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AffiliatePartnerCTA;
