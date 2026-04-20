import SwapPairLanding from "@/components/SwapPairLanding";

const SwapMonadUsdt = () => (
  <SwapPairLanding
    assetA="MONAD"
    assetAName="Monad"
    assetB="ETH"
    assetBName="Ethereum"
    slug="monad-usdt"
    avgSpeed="28s"
    isFeatured
    headline={<>Instant MONAD to ETH Swap – <span className="text-gradient-neon">Zero-Delay, One-Click Settlement</span></>}
    subHeadline="Move capital across parallelized EVM rails with 2026 speed. Zero-delay, one-click settlement. MRC Global Pay's liquidity rails are specifically optimized for MONAD's parallel-execution architecture."
    whyText="Monad brought parallel transaction execution to the EVM, achieving throughput levels previously impossible on Ethereum-compatible chains. MRC Global Pay's 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing — eliminating the 3–6 confirmation wait times common on standard exchanges, delivering ETH to your wallet in under 60 seconds."
    extraFaqs={[
      {
        q: "Why is MRC Global Pay the fastest way to swap MONAD?",
        a: "Our 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing. This eliminates the 3–6 confirmation wait times common on standard exchanges, delivering assets to your wallet in under 60 seconds.",
      },
      {
        q: "Can I swap MONAD to ETH instantly without confirmation delays?",
        a: "Yes. MRC Global Pay's liquidity rails eliminate the standard multi-block confirmation wait. Our pre-funded ETH vaults execute MONAD swaps with immediate settlement — taking full advantage of Monad's sub-second finality.",
      },
      {
        q: "Is MONAD exchange available with no confirmation delay?",
        a: "Yes. Our infrastructure is specifically optimized for high-performance 2026 assets like MONAD. Direct-to-protocol bridges deliver MONAD to ETH swap instant execution with sub-minute settlement and zero confirmation bottlenecks.",
      },
    ]}
  />
);

export default SwapMonadUsdt;
