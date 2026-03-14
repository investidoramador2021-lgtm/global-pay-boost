import SwapPairLanding from "@/components/SwapPairLanding";

const SwapSolUsdt = () => (
  <SwapPairLanding
    assetA="SOL"
    assetAName="Solana"
    assetB="USDT"
    assetBName="Tether"
    slug="sol-usdt"
    avgSpeed="42s"
    headline={<>Swap SOL to USDT Instantly – <span className="text-gradient-neon">No 2026 Network Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Zero confirmation delays. MRC GlobalPay uses direct liquidity routing to bypass standard confirmation waits."
    whyText="SOL/USDT is the highest-volume retail swap pair in March 2026. Solana's ecosystem explosion — DePIN, gaming, memecoins — drives constant rotation between SOL exposure and USDT stability. Our pre-funded liquidity vaults guarantee processing under 60 seconds with immediate settlement finality, even during peak network congestion."
    extraFaqs={[
      {
        q: "Why is SOL/USDT the most popular retail swap in March 2026?",
        a: "Solana's ecosystem has reached critical mass with DePIN, gaming, and DeFi protocols driving billions in daily on-chain volume. Traders constantly rotate between SOL and USDT, making this the #1 retail pair by volume. Processing: under 60 seconds on MRC GlobalPay.",
      },
    ]}
  />
);

export default SwapSolUsdt;
