import { Link } from "react-router-dom";
import { ArrowUpRight, CreditCard, GitBranch, BookOpen, Star, Sparkles, Network } from "lucide-react";

interface ResourceCard {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

const cards: ResourceCard[] = [
  {
    icon: CreditCard,
    eyebrow: "Buy Crypto",
    title: "Buy with Card, SEPA & PIX",
    description: "On-ramp directly into 6,000+ assets with debit/credit, SEPA, PIX, and Apple Pay. Settles to your wallet — never ours.",
    href: "/?tab=buysell",
    cta: "Buy now",
  },
  {
    icon: GitBranch,
    eyebrow: "Permanent Bridge",
    title: "Reusable Fixed-Address Bridges",
    description: "Generate a permanent deposit address for any pair. Send anytime, receive automatically — no session, no expiry.",
    href: "/permanent-bridge",
    cta: "Create bridge",
  },
  {
    icon: BookOpen,
    eyebrow: "Guides",
    title: "Crypto Dust & Swap Guides",
    description: "Step-by-step playbooks on micro-swaps, tokenized stocks, AI tokens, and how to avoid hidden exchange fees.",
    href: "/learn",
    cta: "Read guides",
  },
  {
    icon: Star,
    eyebrow: "Reviews",
    title: "Compare 30+ Exchanges",
    description: "Side-by-side comparisons of fees, speed, KYC policy, and minimums — built for both casual swappers and serious affiliates.",
    href: "/compare",
    cta: "See comparisons",
  },
  {
    icon: Sparkles,
    eyebrow: "Ecosystem",
    title: "Trending Ecosystems & Hubs",
    description: "Solana AI, DePIN, RWA, restaking, and tokenized equities — discover what's moving and swap into it instantly.",
    href: "/solana-ecosystem",
    cta: "Explore ecosystems",
  },
  {
    icon: Network,
    eyebrow: "Developers",
    title: "Embed the Swap Widget",
    description: "Drop a free, branded swap widget on your site. Earn 0.1%–0.4% lifetime BTC commissions on every referred trade.",
    href: "/get-widget",
    cta: "Get widget",
  },
];

const HomeResourceCards = () => (
  <section className="bg-background py-14 sm:py-20">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Explore the Platform
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Everything you need in one place
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
          From card on-ramps to permanent bridges and developer tools — built for casual swappers and serious partners alike.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {cards.map(({ icon: Icon, eyebrow, title, description, href, cta }) => (
          <Link
            key={title}
            to={href}
            className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated sm:p-6"
            aria-label={`${eyebrow}: ${title}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/80">
              {eyebrow}
            </span>
            <h3 className="font-display text-base font-bold text-foreground sm:text-lg">{title}</h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{description}</p>
            <span className="mt-auto inline-flex items-center gap-1 pt-2 font-display text-xs font-bold uppercase tracking-wider text-primary">
              {cta}
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default HomeResourceCards;
