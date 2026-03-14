import SwapPairLanding from "@/components/SwapPairLanding";

const SwapEthSol = () => (
  <SwapPairLanding
    assetA="ETH"
    assetAName="Ethereum"
    assetB="SOL"
    assetBName="Solana"
    slug="eth-sol"
    avgSpeed="48s"
    headline={<>Swap ETH to SOL Instantly – <span className="text-gradient-neon">No 2026 Network Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Zero confirmation delays. The top cross-chain bridge-swap for DeFi traders — no wrapped tokens, no bridges."
    whyText="ETH/SOL is the top cross-chain bridge-swap for DeFi traders in March 2026. As Solana's ecosystem matures, traders constantly rotate between Ethereum's deep liquidity and Solana's high-speed execution. MRC GlobalPay eliminates cross-chain bridge complexity — our direct liquidity routing delivers native SOL to your wallet with processing under 60 seconds and immediate on-chain finality. Zero bridging risk."
    extraFaqs={[
      {
        q: "Is ETH to SOL a cross-chain swap? How does it work without bridges?",
        a: "Yes, it's cross-chain — but MRC GlobalPay handles all complexity. You send ETH on Ethereum, receive native SOL on Solana. No wrapped tokens, no bridges, no smart contract risk. Our liquidity engine routes seamlessly with processing under 60 seconds.",
      },
    ]}
  />
);

export default SwapEthSol;
