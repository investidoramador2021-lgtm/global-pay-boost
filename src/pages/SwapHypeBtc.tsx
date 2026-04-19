import SwapPairLanding from "@/components/SwapPairLanding";

const SwapHypeBtc = () => (
  <SwapPairLanding
    assetA="HYPE"
    assetAName="Hyperliquid"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="hype-btc"
    avgSpeed="3m"
    isFeatured
    headline={<>Swap HYPE to BTC Instantly – <span className="text-gradient-neon">Bank Perp DEX Gains in Hard Money</span></>}
    subHeadline="Convert Hyperliquid (HYPE) directly into native Bitcoin without leaving your self-custody flow. Sub-second HyperEVM finality plus fast Bitcoin routing means your capital is in BTC in minutes."
    whyText="HYPE holders looking to bank perp DEX gains into long-term Bitcoin positions usually pay 1–3% in unnecessary intermediary fees through CEX hops. MRC GlobalPay swaps HYPE → native BTC in a single quote, locked rate, no exchange account. The HyperEVM's near-instant finality means you only wait for Bitcoin confirmations on the receive side."
    extraFaqs={[
      {
        q: "Where does my HYPE need to be held?",
        a: "Send HYPE from your HyperEVM-compatible wallet (HyperLiquid native, MetaMask configured for HyperEVM, etc.). The destination is your standard Bitcoin address.",
      },
      {
        q: "How long does HYPE → BTC take?",
        a: "Approximately 3–8 minutes: near-instant HyperEVM finality, ~30 seconds for cross-chain routing, then 1–3 Bitcoin confirmations.",
      },
      {
        q: "Why use MRC GlobalPay instead of bridging through USDT?",
        a: "Two-leg conversions (HYPE → USDT → BTC) typically cost 0.6–1.2% in cumulative spread. A direct HYPE → BTC route through our aggregator quotes a single locked rate, eliminating the second leg's slippage entirely.",
      },
    ]}
  />
);

export default SwapHypeBtc;
