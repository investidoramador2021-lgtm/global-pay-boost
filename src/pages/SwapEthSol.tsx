import SwapPairLanding from "@/components/SwapPairLanding";

const SwapEthSol = () => (
  <SwapPairLanding
    assetA="ETH"
    assetAName="Ethereum"
    assetB="SOL"
    assetBName="Solana"
    slug="eth-sol"
    avgSpeed="48s"
    metaTitle="ETH to SOL – Swap Ethereum to Solana in 48s | Registration-Free | MRC Global Pay"
    metaDescription="Swap ETH to SOL instantly with no registration required. Cross-chain settlement in under 48 seconds, 0.5% flat fee, 6,000+ assets. Best ETH to SOL exchange 2026."
    headline={<>Swap ETH to SOL Instantly – <span className="text-gradient-neon">No 2026 Network Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Zero confirmation delays. The top cross-chain bridge-swap for DeFi traders — no wrapped tokens, no bridges."
    whyText="ETH/SOL is the top cross-chain bridge-swap for DeFi traders in March 2026. As Solana's ecosystem matures, traders constantly rotate between Ethereum's deep liquidity and Solana's high-speed execution. MRC Global Pay eliminates cross-chain bridge complexity — our direct liquidity routing delivers native SOL to your wallet with processing under 60 seconds and immediate on-chain finality. Zero bridging risk."
    extraFaqs={[
      {
        q: "Is ETH to SOL a cross-chain swap? How does it work without bridges?",
        a: "Yes, it's cross-chain — but MRC Global Pay handles all complexity. You send ETH on Ethereum, receive native SOL on Solana. No wrapped tokens, no bridges, no smart contract risk. Our liquidity engine routes seamlessly with processing under 60 seconds.",
      },
      {
        q: "How fast is an ETH to SOL swap on MRC Global Pay?",
        a: "Most ETH to SOL swaps settle in under 48 seconds. Our pre-funded liquidity vaults eliminate the 3–6 confirmation wait times found on bridge-based platforms, giving you native SOL with immediate on-chain finality.",
      },
      {
        q: "Is there a minimum or maximum for ETH to SOL swaps?",
        a: "There is no maximum. The minimum is just $0.30 USD equivalent — far lower than the $15+ minimums required by competing exchanges. This makes MRC Global Pay ideal for converting leftover ETH dust into SOL.",
      },
      {
        q: "Do I need to register or complete KYC to swap ETH to SOL?",
        a: "No. MRC Global Pay is completely registration-free. Enter your SOL wallet address, send ETH, and receive SOL — no email, no identity verification, no account creation required.",
      },
    ]}
  />
);

export default SwapEthSol;
