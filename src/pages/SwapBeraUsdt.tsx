import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBeraUsdt = () => (
  <SwapPairLanding
    assetA="BERA"
    assetAName="Berachain"
    assetB="USDT"
    assetBName="Tether"
    slug="bera-usdt"
    avgSpeed="42s"
    isFeatured
    headline={<>Instant BERA to USDT Swap – <span className="text-gradient-neon">Zero Delays, Sub-Minute Settlement</span></>}
    subHeadline="MRC GlobalPay's liquidity rails are specifically optimized for BERA — Berachain's Proof-of-Liquidity consensus token and one of the highest-performance 2026 assets. Sub-minute settlement. No confirmation delays. Direct-to-protocol execution."
    whyText="Berachain (BERA) introduced Proof-of-Liquidity consensus to the blockchain space, creating a new paradigm for capital efficiency. MRC GlobalPay's infrastructure is purpose-built to handle BERA's unique settlement characteristics — our direct-to-protocol liquidity bridges bypass standard exchange withdrawal delays and network confirmation bottlenecks. Pre-funded USDT vaults guarantee sub-minute execution with immediate on-chain finality."
    extraFaqs={[
      {
        q: "Why is MRC GlobalPay the fastest way to swap BERA?",
        a: "Our direct-to-protocol liquidity bridges bypass standard exchange withdrawal delays and network confirmation bottlenecks. BERA swaps leverage optimized routing through Berachain's Proof-of-Liquidity layer, settling in under 60 seconds with zero delays.",
      },
      {
        q: "Can I swap BERA to USDT instantly without confirmation delays?",
        a: "Yes. MRC GlobalPay's liquidity rails eliminate the standard multi-block confirmation wait. Our pre-funded USDT vaults execute BERA swaps with immediate settlement — no withdrawal queues, no network congestion delays.",
      },
      {
        q: "Is BERA exchange available with no confirmation delay on MRC GlobalPay?",
        a: "Yes. Our infrastructure is specifically optimized for high-performance 2026 assets like BERA. Direct-to-protocol bridges deliver BERA to USDT swap instant execution with sub-minute settlement and zero confirmation bottlenecks.",
      },
    ]}
  />
);

export default SwapBeraUsdt;
