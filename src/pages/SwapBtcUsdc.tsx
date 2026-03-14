import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBtcUsdc = () => (
  <SwapPairLanding
    assetA="BTC"
    assetAName="Bitcoin"
    assetB="USDC"
    assetBName="USD Coin"
    slug="btc-usdc"
    avgSpeed="45s"
    whyText="BTC/USDC is the primary institutional and safety pair in 2026. Whether you're de-risking a Bitcoin position or moving into regulated stablecoins, MRC GlobalPay's direct liquidity routing bypasses Bitcoin's standard 6-confirmation wait. Your USDC settles in under 60 seconds through our pre-funded liquidity vaults — no delays, no slippage on large orders."
    extraFaqs={[
      {
        q: "Why choose USDC over USDT for BTC swaps?",
        a: "USDC offers full regulatory transparency with monthly attestations by top accounting firms. Institutional traders and compliance-conscious users prefer BTC/USDC for its auditability and 1:1 USD backing guarantee.",
      },
    ]}
  />
);

export default SwapBtcUsdc;
