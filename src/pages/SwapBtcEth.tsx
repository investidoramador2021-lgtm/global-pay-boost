import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBtcEth = () => (
  <SwapPairLanding
    assetA="BTC"
    assetAName="Bitcoin"
    assetB="ETH"
    assetBName="Ethereum"
    slug="btc-eth"
    avgSpeed="48s"
    headline={<>Swap BTC to ETH Instantly – <span className="text-gradient-neon">No 6-Confirmation Wait</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Bypass Bitcoin's standard 6-confirmation delay with pre-funded ETH liquidity vaults."
    whyText="BTC/ETH is the foundational rotation pair in March 2026 — used by every serious crypto allocator to rebalance between digital gold and the world's smartstore-of-value chain. MRC GlobalPay's direct liquidity routing eliminates the 60+ minute Bitcoin confirmation wait imposed by centralized exchanges. Pre-funded ETH vaults execute the moment your BTC deposit hits the mempool with sufficient fee, delivering ETH in under 60 seconds with zero slippage even on six-figure orders."
    extraFaqs={[
      {
        q: "Why swap BTC to ETH on MRC GlobalPay instead of a CEX?",
        a: "Centralized exchanges enforce a 3–6 block Bitcoin confirmation wait (30–60 minutes) before crediting your account, then add a withdrawal delay. MRC GlobalPay's pre-funded ETH vaults eliminate both — processing under 60 seconds with immediate on-chain finality and zero registration.",
      },
      {
        q: "Is there a minimum BTC amount required?",
        a: "Yes — the minimum swap is $0.30 USD equivalent in BTC. There is no maximum: large orders route through deep liquidity pools with zero slippage on six-figure trades.",
      },
    ]}
  />
);

export default SwapBtcEth;
