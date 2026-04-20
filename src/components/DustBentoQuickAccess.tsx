import { Link } from "react-router-dom";
import {
  ArrowRight,
  Repeat,
  Landmark,
  ShieldCheck,
  Coins,
  Calculator,
  FileText,
  Globe,
  Network,
  Gem,
  Zap,
  BookOpen,
} from "lucide-react";

interface BentoLink {
  icon: React.ElementType;
  title: string;
  desc: string;
  path: string;
  span?: "wide";
}

const links: BentoLink[] = [
  { icon: Repeat, title: "Non-Custodial Swap Engine", desc: "Atomic cross-chain settlement from $0.30", path: "/", span: "wide" },
  { icon: Landmark, title: "Permanent Bridge Infrastructure", desc: "Stateless mapping with deterministic persistence", path: "/permanent-bridge" },
  { icon: ShieldCheck, title: "Shielded Private Transfers", desc: "Zero-knowledge routing for sovereign settlement", path: "/private-transfer" },
  { icon: Calculator, title: "Dust Recovery Calculator", desc: "Real-time micro-balance conversion estimates", path: "/tools/crypto-dust-calculator", span: "wide" },
  { icon: Coins, title: "BTC → USDC Settlement", desc: "Bitcoin-to-stablecoin consolidation rails", path: "/solutions/how-to-swap-btc-to-usdc" },
  { icon: Zap, title: "SOL → USDT Express", desc: "Sub-30s Solana dust sweeps", path: "/solutions/how-to-swap-sol-to-usdt" },
  { icon: Gem, title: "ETH → SOL Cross-Chain", desc: "Ethereum-to-Solana atomic bridge", path: "/solutions/how-to-swap-eth-to-sol" },
  { icon: Network, title: "Dust Swap Comparison", desc: "Platform benchmark analysis", path: "/dust-swap-comparison" },
  { icon: BookOpen, title: "Institutional Dust Guide", desc: "Technical resource for portfolio managers", path: "/resources/crypto-dust-guide" },
  { icon: FileText, title: "Bridge Whitepaper", desc: "Infrastructure persistence architecture", path: "/permanent-bridge/whitepaper" },
  { icon: Globe, title: "Shielded Whitepaper", desc: "Zero-knowledge settlement protocol", path: "/private-transfer/whitepaper" },
  { icon: Repeat, title: "XRP → USDT Settlement", desc: "Ripple dust consolidation pathway", path: "/solutions/how-to-swap-xrp-to-usdt", span: "wide" },
];

interface Props {
  langPath: (path: string) => string;
}

const DustBentoQuickAccess = ({ langPath }: Props) => (
  <section className="border-t border-[#D4AF37]/10 py-16 sm:py-24">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-[#D4AF37]">
          <Globe className="h-3.5 w-3.5" />
          Quick-Access Utility
        </span>
        <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Institutional Recovery & Settlement Tools
        </h2>
        <p className="mt-3 font-body text-sm text-muted-foreground sm:text-base">
          Direct access to every consolidation pathway, bridge, and settlement rail in the MRC Global Pay infrastructure.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={langPath(card.path)}
              className={`group relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-card/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#D4AF37]/40 hover:bg-card/60 hover:shadow-[0_0_40px_-12px_rgba(212,175,55,0.12)] ${
                card.span === "wide" ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#D4AF37]/5 blur-2xl transition-opacity duration-500 group-hover:bg-[#D4AF37]/10" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                  <Icon className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
                    {card.desc}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#D4AF37]" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default DustBentoQuickAccess;
