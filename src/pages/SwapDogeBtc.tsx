import SwapPairLanding from "@/components/SwapPairLanding";

const SwapDogeBtc = () => (
  <SwapPairLanding
    assetA="DOGE"
    assetAName="Dogecoin"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="doge-btc"
    avgSpeed="6m"
    isFeatured
    headline={<>Swap DOGE to BTC Instantly – <span className="text-gradient-neon">Convert Memecoin Liquidity into Hard Money</span></>}
    subHeadline="Convert Dogecoin directly into native Bitcoin in under 10 minutes. No registration, no custody, no surprises. The quoted BTC amount is the amount delivered to your wallet."
    whyText="Dogecoin remains the deepest memecoin liquidity pool in 2026 — and the most common exit path for long-term holders is into Bitcoin. MRC GlobalPay routes DOGE → BTC across multiple top-tier liquidity providers in parallel, locks the best quote, and delivers native BTC to any standard Bitcoin address. No wrapped tokens. No exchange account."
    extraFaqs={[
      {
        q: "What is the minimum DOGE → BTC swap?",
        a: "$0.30 USD-equivalent. Useful for testing the destination address before committing larger amounts.",
      },
      {
        q: "Do I get native Bitcoin or wrapped BTC?",
        a: "Native Bitcoin. The settlement happens on the Bitcoin mainnet to your specified address — no wrapped derivatives, no IOU tokens.",
      },
      {
        q: "How long does the DOGE to BTC swap take?",
        a: "Approximately 6–12 minutes total: 1 DOGE confirmation (~1 minute), cross-chain routing (~30 seconds), then 1–3 Bitcoin confirmations to the destination.",
      },
    ]}
  />
);

export default SwapDogeBtc;
