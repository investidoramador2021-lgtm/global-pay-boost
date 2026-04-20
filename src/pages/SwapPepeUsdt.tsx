import SwapPairLanding from "@/components/SwapPairLanding";

const SwapPepeUsdt = () => (
  <SwapPairLanding
    assetA="PEPE"
    assetAName="Pepe"
    assetB="USDT"
    assetBName="Tether"
    slug="pepe-usdt"
    avgSpeed="42s"
    isFeatured
    headline={<>Swap PEPE to USDT Instantly – <span className="text-gradient-neon">Capture Memecoin Volatility</span></>}
    subHeadline="Convert PEPE to USDT in under 60 seconds with deep ERC-20 liquidity. No registration. Lock the rate before you send. Settle to your wallet with zero hidden deductions."
    whyText="PEPE volatility creates execution windows that close in seconds. MRC Global Pay aggregates PEPE/USDT liquidity across multiple top-tier providers, locks the quoted rate before funding, and routes directly into pre-funded USDT vaults — eliminating the 3–6 confirmation wait on standard Ethereum swaps. The number you see is the number you receive."
    extraFaqs={[
      {
        q: "What is the minimum PEPE swap on MRC Global Pay?",
        a: "$0.30 USD-equivalent. Useful for testing the flow before scaling up — the locked rate behaves identically at any size up to deep-liquidity limits.",
      },
      {
        q: "Do I need a PEPE token account before swapping?",
        a: "No. Send your standard Ethereum (0x...) wallet address as the destination. PEPE arrives as a standard ERC-20 — most wallets display the balance automatically; if not, add the PEPE contract as a custom token.",
      },
      {
        q: "Why is PEPE/USDT volume surging in April 2026?",
        a: "Memecoin-basket ETF filings expected to receive H2 2026 decisions, plus PEPE deployments to Base and Arbitrum lowering retail entry costs, are driving renewed PEPE interest. MRC Global Pay processes PEPE/USDT swaps in under 60 seconds even during peak-volatility windows.",
      },
    ]}
  />
);

export default SwapPepeUsdt;
