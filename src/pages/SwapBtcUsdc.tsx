import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBtcUsdc = () => (
  <SwapPairLanding
    assetA="BTC"
    assetAName="Bitcoin"
    assetB="USDC"
    assetBName="USD Coin"
    slug="btc-usdc"
    avgSpeed="45s"
    headline={<>Swap BTC to USDC Instantly – <span className="text-gradient-neon">No 2026 Network Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Zero confirmation delays. Bypass Bitcoin's standard 6-confirmation wait with direct liquidity routing."
    whyText="BTC/USDC is the primary institutional and safety pair in March 2026. Whether you're de-risking a Bitcoin position or moving into regulated stablecoins, our direct liquidity routing bypasses Bitcoin's standard 6-confirmation wait. Processing under 60 seconds through pre-funded liquidity vaults — immediate settlement finality, no slippage on large orders."
    extraFaqs={[
      {
        q: "Why choose USDC over USDT for BTC swaps in 2026?",
        a: "USDC offers full regulatory transparency with monthly attestations. Institutional traders and compliance-conscious users prefer BTC/USDC for its auditability and 1:1 USD backing guarantee. Settlement: immediate on-chain finality on MRC GlobalPay.",
      },
    ]}
  />
);

export default SwapBtcUsdc;
