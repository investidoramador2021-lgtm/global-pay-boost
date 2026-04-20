import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBnbUsdc = () => (
  <SwapPairLanding
    assetA="BNB"
    assetAName="BNB Chain"
    assetB="USDC"
    assetBName="USD Coin"
    slug="bnb-usdc"
    avgSpeed="38s"
    headline={<>Swap BNB to USDC Instantly – <span className="text-gradient-neon">Zero Delays, Best 2026 Rates</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Zero confirmation delays. Convert BNB to USDC with direct liquidity routing and no registration."
    whyText="BNB/USDC is a high-demand trading pair in March 2026 as Binance Smart Chain continues to power DeFi and GameFi ecosystems. MRC Global Pay's pre-funded liquidity vaults deliver instant BNB to USDC conversions — processing under 60 seconds with immediate on-chain finality. No account required, no withdrawal queues, no network congestion delays."
    extraFaqs={[
      {
        q: "Why swap BNB to USDC on MRC Global Pay instead of a CEX?",
        a: "MRC Global Pay is non-custodial and requires zero registration. Your BNB converts to USDC in under 60 seconds via direct liquidity routing — no withdrawal queues, no identity verification, no minimum above $0.30.",
      },
    ]}
  />
);

export default SwapBnbUsdc;
