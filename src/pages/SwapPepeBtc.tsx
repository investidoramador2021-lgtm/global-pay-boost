import SwapPairLanding from "@/components/SwapPairLanding";

const SwapPepeBtc = () => (
  <SwapPairLanding
    assetA="PEPE"
    assetAName="Pepe"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="pepe-btc"
    avgSpeed="55s"
    isFeatured
    headline={<>Swap PEPE to BTC Instantly – <span className="text-gradient-neon">Lock Profits in Hard Money</span></>}
    subHeadline="Convert PEPE memecoin gains directly into Bitcoin without an exchange account. Cross-chain routing handles the ERC-20 → BTC bridge in a single quote, locked rate, no hidden spread."
    whyText="Memecoin traders historically lose 30%+ of paper gains during the multi-step exit through stables and back into BTC. MRC Global Pay collapses that into a single PEPE → BTC swap with one locked quote. Native BTC delivery to your hardware wallet, Lightning, or any standard Bitcoin address — no IOU coins, no wrapped intermediaries."
    extraFaqs={[
      {
        q: "Can I swap PEPE directly to native Bitcoin?",
        a: "Yes. Send PEPE from your Ethereum wallet, receive native BTC at your specified Bitcoin address. The cross-chain routing happens in our liquidity layer — you only see one quote and one settlement.",
      },
      {
        q: "How long does PEPE → BTC take?",
        a: "Typically 8–15 minutes end-to-end: ~2 minutes for ERC-20 confirmation, then near-instant cross-chain routing, then 1–3 Bitcoin confirmations to your destination wallet.",
      },
      {
        q: "Why convert PEPE to BTC instead of USDT?",
        a: "Long-horizon memecoin traders often prefer to bank gains into Bitcoin to maintain crypto-native exposure, avoid stablecoin counterparty risk, and benefit from BTC's harder monetary policy. The locked rate makes the trade-off explicit at execution time.",
      },
    ]}
  />
);

export default SwapPepeBtc;
