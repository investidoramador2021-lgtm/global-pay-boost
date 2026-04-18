import SwapPairLanding from "@/components/SwapPairLanding";

const SwapDogeUsdt = () => (
  <SwapPairLanding
    assetA="DOGE"
    assetAName="Dogecoin"
    assetB="USDT"
    assetBName="Tether"
    slug="doge-usdt"
    avgSpeed="38s"
    headline={<>Swap DOGE to USDT Instantly – <span className="text-gradient-neon">Lock In Gains, Zero 2026 Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Convert Dogecoin to USDT during volatility spikes with pre-funded liquidity routing."
    whyText="DOGE/USDT remains one of the highest-volume retail pairs in March 2026, driven by social momentum, payment integrations, and constant volatility-driven rotation into stables. MRC GlobalPay's pre-funded USDT vaults absorb DOGE deposits the moment they hit the mempool — processing under 60 seconds with immediate on-chain finality. During pump events when CEX deposit queues backlog, our direct liquidity routing keeps executing without delay."
    extraFaqs={[
      {
        q: "Can I swap DOGE during a pump without delays?",
        a: "Yes. Unlike CEXs that throttle deposits during DOGE volatility events, MRC GlobalPay's pre-funded USDT vaults continue executing in under 60 seconds — letting you lock in gains the moment you decide.",
      },
      {
        q: "What's the minimum DOGE amount I can swap?",
        a: "The minimum is $0.30 USD equivalent in DOGE — designed to support 'crypto dust' conversion. No upper limit, with deep liquidity for five-figure orders.",
      },
    ]}
  />
);

export default SwapDogeUsdt;
