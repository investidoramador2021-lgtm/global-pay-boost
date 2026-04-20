import SwapPairLanding from "@/components/SwapPairLanding";

const SwapTaoBtc = () => (
  <SwapPairLanding
    assetA="TAO"
    assetAName="Bittensor"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="tao-btc"
    avgSpeed="8m"
    isFeatured
    headline={<>Swap TAO to BTC Instantly – <span className="text-gradient-neon">Convert Decentralized AI Yield into Bitcoin</span></>}
    subHeadline="Convert Bittensor (TAO) directly into native Bitcoin. Substrate-native withdrawal, cross-chain routing, and Bitcoin settlement — all in one locked quote, no exchange account required."
    whyText="TAO subnet operators and miners earning rewards in Bittensor's native token historically faced friction converting yield into long-term Bitcoin holdings — most CEX routes still require KYC and impose tight withdrawal limits on TAO. MRC Global Pay handles TAO → BTC in a single quote, sourced across multiple top-tier liquidity providers, with native BTC delivery to your specified Bitcoin address."
    extraFaqs={[
      {
        q: "Can I send TAO directly from a Bittensor wallet?",
        a: "Yes. Send TAO from your Bittensor (Substrate) wallet to the deposit address we generate. Native BTC arrives at your specified Bitcoin address after cross-chain routing.",
      },
      {
        q: "How long does TAO → BTC take?",
        a: "Approximately 8–15 minutes: 1 Substrate block confirmation, cross-chain routing, then 1–3 Bitcoin confirmations.",
      },
      {
        q: "Is TAO supply limited like Bitcoin?",
        a: "Yes — TAO has a 21M hard cap with Bitcoin-style halving emissions, which is part of the long thesis. Many TAO holders rotate a portion into BTC to balance the AI-thesis exposure with hard-money store-of-value.",
      },
    ]}
  />
);

export default SwapTaoBtc;
