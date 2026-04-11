import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Network, ShieldCheck, Route, Building2, Globe, Lock, Cpu, Layers, FileCheck, Zap,
} from "lucide-react";

interface SpecCard {
  icon: React.ElementType;
  title: string;
  body: string;
  span?: "wide" | "tall";
}

const specs: SpecCard[] = [
  { icon: Route, title: "Stateless Routing Architecture", body: "Deterministic address derivation eliminates session dependency. Each permanent bridge endpoint is computed from a BIP-44/SLIP-44 master path, ensuring infinite reusability without database persistence or key-rotation risk.", span: "wide" },
  { icon: Building2, title: "Institutional Compliance Rails", body: "FINTRAC-registered MSB (M23225638) with full STR/LTR filing capability. AML/KYC thresholds are enforced at the protocol layer, enabling compliant settlement without custodial exposure." },
  { icon: Lock, title: "Zero-Knowledge Settlement", body: "Shielded routing decouples on-chain identity from transaction flow. No IP logging, no session cookies, no wallet fingerprinting — cryptographic proofs replace trust assumptions." },
  { icon: Network, title: "Multi-Chain Liquidity Mesh", body: "700+ liquidity sources aggregated across 50+ blockchains. Smart order routing splits large settlements across DEX/CEX pools to minimize slippage below 0.1% on institutional volumes.", span: "wide" },
  { icon: Cpu, title: "Deterministic Address Derivation", body: "BIP-44 hierarchical derivation ensures each currency pair maps to a unique, reproducible deposit address. No database round-trips, no TTL expiry, no address collision risk." },
  { icon: Globe, title: "13-Language Localization Engine", body: "Full RTL mirroring for Persian, Urdu, and Hebrew. Subdirectory routing (/fa/, /he/, /ur/) with reciprocal hreflang tags ensures correct SERP targeting across 190+ jurisdictions." },
  { icon: Layers, title: "Cross-Chain Atomic Settlement", body: "Hash-time-locked contracts (HTLCs) guarantee atomic execution. Either both legs of a cross-chain swap complete, or the entire transaction reverts — eliminating counterparty risk.", span: "wide" },
  { icon: FileCheck, title: "Audit-Ready Transaction Proofs", body: "Every settlement generates a downloadable PDF receipt with cryptographic signatures, block confirmations, and timestamped routing metadata for institutional audit trails." },
  { icon: Zap, title: "Sub-60s Finality", body: "Median settlement time of 23 seconds across top-50 assets. Lightning-fast execution via pre-staged liquidity pools and parallel mempool monitoring." },
  { icon: ShieldCheck, title: "Non-Custodial by Design", body: "At no point does MRC GlobalPay take custody of user funds. Direct wallet-to-wallet routing ensures assets move from sender to recipient without intermediary holding risk.", span: "wide" },
];

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const BentoSpecsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="border-t border-border/30 bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
            <Cpu className="h-3.5 w-3.5" />
            Specifications &amp; Governance
          </span>
          <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Financial Engineering, Open-Source Transparency
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
            2,500+ words of institutional-grade documentation distilled into auditable specification cards.
            Every claim is verifiable on-chain.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          {specs.map((card) => {
            const Icon = card.icon;
            const isWide = card.span === "wide";
            return (
              <motion.div
                key={card.title}
                variants={cardVariant}
                className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)] ${
                  isWide ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity duration-500 group-hover:bg-primary/10" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* MSB Trust footer */}
        <motion.div
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              FINTRAC MSB M23225638 · Ottawa, ON, Canada
            </span>
          </div>
          <p className="font-body text-xs text-muted-foreground">
            Registered Money Services Business operating under Canadian federal AML/ATF legislation.
            All settlement rails are non-custodial by design.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoSpecsSection;
