import SwapPairLanding from "@/components/SwapPairLanding";

const SwapXrpUsdt = () => (
  <SwapPairLanding
    assetA="XRP"
    assetAName="Ripple"
    assetB="USDT"
    assetBName="Tether"
    slug="xrp-usdt"
    avgSpeed="35s"
    whyText="XRP search volume has surged in 2026 following full legal clarity and ETF approvals. Traders are actively rotating between XRP exposure and USDT stability. MRC GlobalPay leverages XRP's native 3-5 second settlement combined with our pre-funded USDT liquidity vaults — delivering the fastest XRP-to-stablecoin conversion available, typically under 40 seconds end-to-end."
    extraFaqs={[
      {
        q: "Why is XRP swap volume so high in 2026?",
        a: "The SEC case resolution and subsequent XRP ETF approvals in early 2026 have driven massive institutional and retail interest. XRP/USDT is now one of the highest-volume trading pairs globally, with traders frequently moving between XRP positions and stablecoin safety.",
      },
    ]}
  />
);

export default SwapXrpUsdt;
