import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBonkBtc = () => (
  <SwapPairLanding
    assetA="BONK"
    assetAName="Bonk"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="bonk-btc"
    avgSpeed="2m"
    isFeatured
    headline={<>Swap BONK to BTC Instantly – <span className="text-gradient-neon">Solana Memecoin Gains into Hard Money</span></>}
    subHeadline="Convert BONK directly into native Bitcoin without an exchange account. Solana's sub-second finality plus cross-chain routing means your funds are out of memecoin risk and into BTC in minutes."
    whyText="BONK holders looking to bank gains into Bitcoin usually move through Solana → USDC → CEX → BTC, losing 1–2% in cumulative spread and exposing themselves to custodial risk at the CEX hop. MRC GlobalPay collapses that into a single BONK → BTC swap with one locked quote and native BTC settlement to your specified address."
    extraFaqs={[
      {
        q: "Do I need a Solana wallet to swap BONK?",
        a: "Yes — send BONK as an SPL token from any Solana-compatible wallet (Phantom, Solflare, Backpack, etc.). The destination for the swap is your standard Bitcoin address.",
      },
      {
        q: "How long does BONK → BTC take?",
        a: "Approximately 2–6 minutes: ~1 second for Solana confirmation, near-instant cross-chain routing, then 1–3 Bitcoin confirmations.",
      },
      {
        q: "What's the minimum BONK swap size?",
        a: "$0.30 USD-equivalent. Convenient for testing the destination address before committing larger amounts.",
      },
    ]}
  />
);

export default SwapBonkBtc;
