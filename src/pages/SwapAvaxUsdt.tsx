import SwapPairLanding from "@/components/SwapPairLanding";

const SwapAvaxUsdt = () => (
  <SwapPairLanding
    assetA="AVAX"
    assetAName="Avalanche"
    assetB="USDT"
    assetBName="Tether"
    slug="avax-usdt"
    avgSpeed="34s"
    headline={<>Swap AVAX to USDT Instantly – <span className="text-gradient-neon">Sub-Second Finality, Best 2026 Rates</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Leverage Avalanche's sub-second consensus combined with pre-funded USDT vaults."
    whyText="AVAX/USDT volume has surged through March 2026 as Avalanche's subnet ecosystem (gaming, RWA, institutional L1s) drives constant capital rotation. MRC GlobalPay leverages Avalanche C-Chain's sub-second consensus and pairs it with pre-funded USDT vaults across TRC-20, ERC-20 and BEP-20 — completing AVAX-to-stable conversions in under 60 seconds with zero confirmation wait."
    extraFaqs={[
      {
        q: "Can I swap AVAX from a subnet (e.g. DFK, Beam)?",
        a: "MRC GlobalPay accepts AVAX on the C-Chain (the standard Avalanche network). To swap from a subnet, first bridge to C-Chain via the official Avalanche Core bridge, then swap to USDT in under 60 seconds.",
      },
      {
        q: "Is AVAX/USDT swap available 24/7?",
        a: "Yes. Liquidity vaults run continuously with no maintenance windows. Processing remains under 60 seconds even during weekend volatility events when CEX deposit queues backlog.",
      },
    ]}
  />
);

export default SwapAvaxUsdt;
