import SwapPairLanding from "@/components/SwapPairLanding";

const SwapSolUsdt = () => (
  <SwapPairLanding
    assetA="SOL"
    assetAName="Solana"
    assetB="USDT"
    assetBName="Tether"
    slug="sol-usdt"
    avgSpeed="42s"
    whyText="Solana's high-throughput network paired with USDT's stability makes SOL/USDT the highest-volume retail swap pair in 2026. MRC GlobalPay uses direct liquidity routing to bypass standard confirmation waits — your USDT settles in under 60 seconds, every time. Whether you're locking in profits from a SOL rally or moving to stables for a re-entry, our pre-funded liquidity vaults guarantee instant execution at the best aggregated rate."
    extraFaqs={[
      {
        q: "Why is SOL/USDT the most popular swap in 2026?",
        a: "Solana's ecosystem explosion — from DePIN to memecoin activity — has driven massive retail volume. Traders constantly rotate between SOL exposure and USDT stability, making this the #1 retail swap pair by volume in March 2026.",
      },
    ]}
  />
);

export default SwapSolUsdt;
