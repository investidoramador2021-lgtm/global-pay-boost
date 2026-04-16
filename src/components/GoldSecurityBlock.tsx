import { Shield, Coins, Vault } from "lucide-react";

interface Props {
  fromTicker: string;
  toTicker: string;
  fromName: string;
  toName: string;
}

const GOLD_TICKERS = new Set(["xaut", "paxg"]);

export function isGoldPair(fromTicker: string, toTicker: string): boolean {
  const f = fromTicker.toLowerCase();
  const t = toTicker.toLowerCase();
  return GOLD_TICKERS.has(f) || GOLD_TICKERS.has(t);
}

export default function GoldSecurityBlock({ fromTicker, toTicker, fromName, toName }: Props) {
  const fromUp = fromTicker.toUpperCase();
  const toUp = toTicker.toUpperCase();
  const fromIsGold = GOLD_TICKERS.has(fromTicker.toLowerCase());
  const toIsGold = GOLD_TICKERS.has(toTicker.toLowerCase());
  const goldTicker = toIsGold ? toUp : fromUp;
  const goldName = toIsGold ? toName : fromName;
  const counterTicker = toIsGold ? fromUp : toUp;

  const headline = toIsGold
    ? `Secure your wealth in physical gold. Swap ${counterTicker} for ${goldTicker} with MRC GlobalPay's institutional-grade liquidity.`
    : `Convert your gold-backed ${goldTicker} to ${counterTicker} on demand — institutional-grade liquidity, FINTRAC-regulated execution.`;

  return (
    <section className="border-t border-[#1E2028] py-12" aria-labelledby="gold-security-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              background: "linear-gradient(135deg, hsl(45 80% 8% / 0.6), hsl(40 60% 12% / 0.4))",
              borderColor: "hsl(45 80% 50% / 0.25)",
              boxShadow: "0 0 40px hsl(45 90% 50% / 0.08), inset 0 1px 0 hsl(45 80% 60% / 0.1)",
            }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(45_80%_50%/0.3)] bg-[hsl(45_80%_50%/0.1)] px-3 py-1">
              <Coins className="h-3.5 w-3.5" style={{ color: "hsl(45 90% 60%)" }} />
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(45 90% 70%)" }}>
                Tokenized Gold · LBMA-Grade
              </span>
            </div>
            <h2 id="gold-security-heading" className="font-display text-xl font-bold text-white sm:text-2xl">
              {headline}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#C4C8D0] sm:text-base">
              {goldName} ({goldTicker}) is backed 1:1 by allocated, audited London Good Delivery gold bars held in tier-1 Swiss and Brink&apos;s vaults. Each token represents one troy ounce of physical bullion — no synthetic exposure, no rehypothecation, no counterparty risk beyond the bonded custodian.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#2A2D35] bg-[#0B0D10]/60 p-3.5">
                <Vault className="mb-2 h-4 w-4" style={{ color: "hsl(45 90% 60%)" }} />
                <p className="font-display text-xs font-bold text-white">Allocated Custody</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#8A8F98]">Segregated bullion, monthly attestations</p>
              </div>
              <div className="rounded-xl border border-[#2A2D35] bg-[#0B0D10]/60 p-3.5">
                <Shield className="mb-2 h-4 w-4" style={{ color: "hsl(45 90% 60%)" }} />
                <p className="font-display text-xs font-bold text-white">FINTRAC MSB</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#8A8F98]">Canadian-regulated swap rails (#C100000015)</p>
              </div>
              <div className="rounded-xl border border-[#2A2D35] bg-[#0B0D10]/60 p-3.5">
                <Coins className="mb-2 h-4 w-4" style={{ color: "hsl(45 90% 60%)" }} />
                <p className="font-display text-xs font-bold text-white">Institutional Liquidity</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#8A8F98]">Aggregated across 700+ venues</p>
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[#8A8F98]">
              Whether you&apos;re hedging crypto volatility, building a long-term store-of-value position, or rotating profits into a hard asset, the {fromUp} → {toUp} route settles in under 60 seconds with no minimum holding period.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
