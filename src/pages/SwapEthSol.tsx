import SwapPairLanding from "@/components/SwapPairLanding";

const SwapEthSol = () => (
  <SwapPairLanding
    assetA="ETH"
    assetAName="Ethereum"
    assetB="SOL"
    assetBName="Solana"
    slug="eth-sol"
    avgSpeed="48s"
    whyText="ETH/SOL is the top cross-chain bridge-swap for DeFi traders in 2026. As Solana's ecosystem matures with DePIN, gaming, and DeFi protocols, traders are constantly rotating between Ethereum's deep liquidity and Solana's high-speed execution. MRC GlobalPay eliminates the complexity of cross-chain bridges — our direct liquidity routing delivers SOL to your wallet in under 60 seconds, with zero bridging risk."
    extraFaqs={[
      {
        q: "Is ETH to SOL a cross-chain swap?",
        a: "Yes, but MRC GlobalPay handles the cross-chain complexity for you. You send ETH on Ethereum, and receive native SOL on Solana — no wrapped tokens, no bridges, no smart contract risk. Our liquidity engine handles the routing seamlessly.",
      },
    ]}
  />
);

export default SwapEthSol;
