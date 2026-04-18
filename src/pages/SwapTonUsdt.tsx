import SwapPairLanding from "@/components/SwapPairLanding";

const SwapTonUsdt = () => (
  <SwapPairLanding
    assetA="TON"
    assetAName="Toncoin"
    assetB="USDT"
    assetBName="Tether"
    slug="ton-usdt"
    avgSpeed="30s"
    isFeatured
    headline={<>Swap TON to USDT Instantly – <span className="text-gradient-neon">Telegram-Native Liquidity, Zero Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Convert Toncoin to USDT with sub-minute finality powered by TON's 5-second block time."
    whyText="TON/USDT is among the fastest-growing pairs of March 2026, fueled by Telegram's billion-user wallet rollout and TON-native USDT issuance. MRC GlobalPay routes through TON-native USDT liquidity (no bridge required) and pairs it with pre-funded vaults on TRC-20, ERC-20 and BEP-20 — letting you receive USDT on whichever network your wallet uses. Processing under 60 seconds, leveraging TON's 5-second block finality."
    extraFaqs={[
      {
        q: "Do I need a Telegram wallet to swap TON?",
        a: "No. Any TON-compatible wallet works (Tonkeeper, MyTonWallet, Telegram Wallet, Bitget). Just send TON to the deposit address shown — USDT lands in your destination wallet in under 60 seconds.",
      },
      {
        q: "Which USDT network is recommended after a TON swap?",
        a: "TRC-20 USDT offers the lowest network fee (~$0). For DeFi compatibility, choose ERC-20 or BEP-20. MRC GlobalPay routes all three from the same pre-funded vaults with identical sub-minute settlement.",
      },
      {
        q: "Is TON exchange available 24/7 with no confirmation delay?",
        a: "Yes. TON's 5-second blocks combined with our pre-funded USDT liquidity rails deliver continuous sub-minute settlement, including weekends and high-volatility windows.",
      },
    ]}
  />
);

export default SwapTonUsdt;
