import SwapPairLanding from "@/components/SwapPairLanding";

const SwapBonkUsdt = () => (
  <SwapPairLanding
    assetA="BONK"
    assetAName="Bonk"
    assetB="USDT"
    assetBName="Tether"
    slug="bonk-usdt"
    avgSpeed="22s"
    isFeatured
    headline={<>Swap BONK to USDT Instantly – <span className="text-gradient-neon">Solana-Native Speed</span></>}
    subHeadline="Convert BONK to USDT in under 30 seconds. Solana-native SPL routing. Pre-funded USDT vaults. Sub-second on-chain finality. No account, no hidden fees."
    whyText="BONK is the most enduring Solana memecoin and remains one of the highest-volume SPL tokens through 2026. MRC GlobalPay leverages Solana's sub-second finality combined with pre-funded USDT liquidity vaults — delivering the fastest BONK-to-stablecoin conversion available on a non-custodial route. Zero confirmation delays."
    extraFaqs={[
      {
        q: "Do I need SOL in my wallet to swap BONK?",
        a: "You need a small SOL balance (~0.01 SOL is plenty) to cover Solana transaction fees and the small SPL token account 'rent.' Most Solana wallets prompt you if rent is missing.",
      },
      {
        q: "How fast does BONK arrive after a swap?",
        a: "15–30 seconds end-to-end on most days. Solana itself settles in under one second; the remainder is routing and confirmation time.",
      },
      {
        q: "Can I swap BONK on other chains?",
        a: "Wrapped BONK exists on Ethereum, BSC, and Base. Native SPL BONK on Solana is the canonical asset and has the deepest liquidity — that is what MRC GlobalPay routes by default.",
      },
    ]}
  />
);

export default SwapBonkUsdt;
