import SwapPairLanding from "@/components/SwapPairLanding";

const SwapPyusdUsdt = () => (
  <SwapPairLanding
    assetA="PYUSD"
    assetAName="PayPal USD"
    assetB="SOL"
    assetBName="Solana"
    slug="pyusd-usdt"
    avgSpeed="22s"
    isFeatured
    headline={<>Instant PYUSD to SOL Swap – <span className="text-gradient-neon">Regulated-Grade Liquidity, Zero Delays</span></>}
    subHeadline="Secure, regulated-grade liquidity for PayPal USD on Solana. Bypass delays and swap in seconds. MRC GlobalPay's liquidity rails are specifically optimized for PYUSD's cross-chain settlement."
    whyText="PayPal USD (PYUSD) bridges traditional finance and crypto, backed by one of the world's largest payment processors. MRC GlobalPay's 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing — eliminating the 3–6 confirmation wait times common on standard exchanges. Deep PYUSD/SOL liquidity pools ensure sub-minute execution with immediate on-chain finality and zero slippage."
    extraFaqs={[
      {
        q: "Why is MRC GlobalPay the fastest way to swap PYUSD?",
        a: "Our 2026 liquidity architecture utilizes pre-funded vaults and direct-to-protocol routing. This eliminates the 3–6 confirmation wait times common on standard exchanges, delivering assets to your wallet in under 60 seconds.",
      },
      {
        q: "Can I swap PYUSD to SOL instantly without confirmation delays?",
        a: "Yes. MRC GlobalPay eliminates the standard confirmation wait for PYUSD conversions. Our pre-funded SOL vaults execute swaps with immediate settlement — no exchange withdrawal queues, no network delays.",
      },
      {
        q: "Is PYUSD exchange available with no confirmation delay?",
        a: "Yes. Our infrastructure is specifically optimized for high-performance 2026 assets including PYUSD on Solana. Direct-to-protocol bridges ensure PYUSD to SOL swap instant execution with sub-minute settlement.",
      },
    ]}
  />
);

export default SwapPyusdUsdt;
