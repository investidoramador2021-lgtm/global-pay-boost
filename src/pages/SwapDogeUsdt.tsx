import SwapPairLanding from "@/components/SwapPairLanding";

const SwapDogeUsdt = () => (
  <SwapPairLanding
    assetA="DOGE"
    assetAName="Dogecoin"
    assetB="USDT"
    assetBName="Tether"
    slug="doge-usdt"
    avgSpeed="55s"
    isFeatured
    headline={<>Swap DOGE to USDT Instantly – <span className="text-gradient-neon">No Confirmation Delays</span></>}
    subHeadline="Convert Dogecoin to USDT in under a minute. Native Dogecoin chain settlement. Pre-funded USDT vaults. No account, no KYC for typical retail volumes, no hidden fees."
    whyText="Dogecoin remains one of the highest-volume crypto pairs globally in 2026, with steady ETF speculation and continued payments-utility growth. MRC Global Pay matches DOGE's native 1-minute block time with pre-funded USDT liquidity vaults — delivering the cleanest DOGE-to-stablecoin conversion available. Zero confirmation delays beyond the single Dogecoin block needed for chain finality."
    extraFaqs={[
      {
        q: "Can I swap DOGE without verifying my identity?",
        a: "Yes. MRC Global Pay does not require KYC for typical retail swap volumes. Send DOGE from your wallet, receive USDT at the destination you specify.",
      },
      {
        q: "What network does USDT arrive on after a DOGE swap?",
        a: "You choose. USDT can be delivered on Ethereum (ERC-20), Tron (TRC-20), BNB Chain (BEP-20), or other supported networks — all routed and quoted in a single flow.",
      },
      {
        q: "How does MRC Global Pay handle DOGE swap volatility?",
        a: "The displayed rate is locked the moment you confirm the swap, before you send any DOGE. If the market moves during transit, your receive amount is unaffected.",
      },
    ]}
  />
);

export default SwapDogeUsdt;
