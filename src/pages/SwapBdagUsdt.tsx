import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBdagUsdt = () => (
  <SwapPairLanding
    assetA="BDAG"
    assetAName="BlockDAG"
    assetB="USDT"
    assetBName="Tether"
    slug="bdag-usdt"
    avgSpeed="75s"
    headline={<>Swap BDAG to USDT Instantly – <span className="text-gradient-neon">Aggregated DAG Liquidity</span></>}
    subHeadline="Convert BlockDAG (BDAG) to USDT in under 90 seconds. Aggregated routing across supported BDAG venues. Locked rate before funding. No account required."
    whyText="BlockDAG (BDAG) is one of the more aggressively traded emerging Layer 1 tokens of 2025–2026. MRC GlobalPay aggregates available BDAG/USDT liquidity across multiple routing partners, picks the highest-output venue automatically, and locks the rate before you send. Settlement times depend on routing depth — typically 60–90 seconds end-to-end."
    extraFaqs={[
      {
        q: "Is BDAG liquidity available 24/7?",
        a: "Liquidity is aggregated across our routing partners. Quoting reflects real-time availability — if no executable route exists at quote time, the swap simply will not be offered, protecting you from failed transactions.",
      },
      {
        q: "Which network does USDT arrive on after a BDAG swap?",
        a: "Selectable at quote time: Ethereum (ERC-20), Tron (TRC-20), BNB Chain (BEP-20), or other supported networks. The locked quote includes routing across the network of your choice.",
      },
      {
        q: "What should I verify before buying BDAG?",
        a: "For any emerging Layer 1: validator distribution, real on-chain transaction volume, independent third-party audits, and team/investor unlock schedules. Marketing claims are not analysis. Size positions to reflect early-stage risk.",
      },
    ]}
  />
);

export default SwapBdagUsdt;
