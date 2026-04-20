import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBeraUsdt = () => (
  <SwapPairLanding
    assetA="BERA"
    assetAName="Berachain"
    assetB="USDC"
    assetBName="USD Coin"
    slug="bera-usdt"
    avgSpeed="42s"
    isFeatured
    headline={<>Fastest BERA to USDC Swaps – <span className="text-gradient-neon">Zero-Delay Execution</span></>}
    subHeadline="Access Berachain liquidity with zero-delay execution and automated 2026 settlement protocols. Sub-minute settlement. Direct-to-protocol bridges eliminate standard exchange bottlenecks."
    whyText="Berachain (BERA) introduced Proof-of-Liquidity consensus to the blockchain space, creating a new paradigm for capital efficiency. MRC Global Pay's 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing — eliminating the 3–6 confirmation wait times common on standard exchanges, delivering USDC to your wallet in under 60 seconds."
    extraFaqs={[
      {
        q: "Why is MRC Global Pay the fastest way to swap BERA?",
        a: "Our 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing. This eliminates the 3–6 confirmation wait times common on standard exchanges, delivering assets to your wallet in under 60 seconds.",
      },
      {
        q: "Can I swap BERA to USDC instantly without confirmation delays?",
        a: "Yes. MRC Global Pay's liquidity rails eliminate the standard multi-block confirmation wait. Our pre-funded USDC vaults execute BERA swaps with immediate settlement — no withdrawal queues, no network congestion delays.",
      },
      {
        q: "Is BERA exchange available with no confirmation delay?",
        a: "Absolutely. Our infrastructure is specifically optimized for high-performance 2026 assets like BERA. Direct-to-protocol bridges deliver BERA to USDC swap instant execution with sub-minute settlement and zero confirmation bottlenecks.",
      },
    ]}
  />
);

export default SwapBeraUsdt;
