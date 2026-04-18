import SwapPairLanding from "@/components/SwapPairLanding";

const SwapEthUsdt = () => (
  <SwapPairLanding
    assetA="ETH"
    assetAName="Ethereum"
    assetB="USDT"
    assetBName="Tether"
    slug="eth-usdt"
    avgSpeed="40s"
    headline={<>Swap ETH to USDT Instantly – <span className="text-gradient-neon">Best 2026 Rates, Zero Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Convert Ethereum to Tether with deep ERC-20 liquidity routing — no registration, no withdrawal queues."
    whyText="ETH/USDT remains the single highest-volume crypto pair globally in March 2026, powering everything from L2 settlement to institutional hedging. MRC GlobalPay's pre-funded USDT vaults route directly through ERC-20, BEP-20 and TRC-20 liquidity, executing your swap under 60 seconds with immediate finality. Skip the 12-confirmation Ethereum wait imposed by centralized exchanges — our liquidity rails settle the moment your deposit is detected, even during peak gas spikes."
    extraFaqs={[
      {
        q: "Which USDT network should I receive on after swapping ETH?",
        a: "MRC GlobalPay supports USDT on TRC-20 (cheapest, ~$0 fee), ERC-20 (Ethereum, highest compatibility), and BEP-20 (BNB Chain, fast). For maximum value, TRC-20 is the recommended payout. Processing: under 60 seconds across all networks.",
      },
      {
        q: "Are there hidden fees swapping ETH to USDT?",
        a: "No. The USDT amount displayed is the exact amount delivered to your wallet. No spreads, no withdrawal fees, no network surcharges. All costs are baked into the live rate before you confirm.",
      },
    ]}
  />
);

export default SwapEthUsdt;
