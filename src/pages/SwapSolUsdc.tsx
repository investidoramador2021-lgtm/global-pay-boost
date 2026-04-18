import SwapPairLanding from "@/components/SwapPairLanding";

const SwapSolUsdc = () => (
  <SwapPairLanding
    assetA="SOL"
    assetAName="Solana"
    assetB="USDC"
    assetBName="USD Coin"
    slug="sol-usdc"
    avgSpeed="32s"
    headline={<>Swap SOL to USDC Instantly – <span className="text-gradient-neon">Native SPL Liquidity, Zero Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Route through native Solana SPL USDC liquidity — no bridge, no wrap, no waiting."
    whyText="SOL/USDC is the dominant on-chain stable rotation in March 2026, powering Solana's DeFi, memecoin and DePIN economy. MRC GlobalPay routes through native SPL USDC liquidity pools — no Wormhole bridge, no wrapped assets, no extra hop. Solana's 400ms block time combined with our pre-funded USDC vaults delivers the fastest fiat-equivalent payout in the industry: processing under 60 seconds with immediate on-chain finality."
    extraFaqs={[
      {
        q: "Will my USDC arrive on Solana or Ethereum?",
        a: "By default, USDC is delivered as native SPL on Solana for fastest settlement. You can also choose ERC-20 (Ethereum), Polygon, Base, or Arbitrum at the swap step — each with deep native liquidity. Processing: under 60 seconds regardless of destination chain.",
      },
      {
        q: "Why is SOL/USDC the preferred stable pair on Solana?",
        a: "USDC is the most regulator-transparent stablecoin (monthly attestations) and has the deepest native SPL liquidity of any stable on Solana — meaning zero slippage even on five-figure SOL conversions. MRC GlobalPay routes directly through these pools.",
      },
    ]}
  />
);

export default SwapSolUsdc;
