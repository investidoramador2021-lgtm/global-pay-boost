import SwapPairLanding from "@/components/SwapPairLanding";

const SwapSirenUsdt = () => (
  <SwapPairLanding
    assetA="SIREN"
    assetAName="SIREN"
    assetB="USDT"
    assetBName="Tether"
    slug="siren-usdt"
    avgSpeed="35s"
    headline={<>Swap SIREN to USDT Instantly – <span className="text-gradient-neon">Clean BNB Chain Execution</span></>}
    subHeadline="Convert SIREN to USDT in under 60 seconds with verified BEP-20 routing. Locked rate before funding. No account required. Sub-cent BNB Chain gas."
    whyText="SIREN trades on BNB Chain (BEP-20) with growing on-chain liquidity through 2026. MRC Global Pay aggregates SIREN/USDT routing across verified BNB Chain venues — verifying contract integrity at quote time and locking the rate before you send. Settlement uses BNB Chain's 3-second finality, then routes USDT to your network of choice."
    extraFaqs={[
      {
        q: "Which network does my USDT arrive on after a SIREN swap?",
        a: "You choose at quote time: Ethereum (ERC-20), Tron (TRC-20), BNB Chain (BEP-20), or other supported networks — all priced in a single locked quote.",
      },
      {
        q: "How do I avoid buying a fake SIREN contract?",
        a: "MRC Global Pay routes only against the verified canonical SIREN contract. When using direct DEX routes elsewhere, always cross-reference the contract address through CoinGecko, CoinMarketCap, or BscScan before approving any transaction.",
      },
      {
        q: "What is the minimum SIREN swap?",
        a: "$0.30 USD-equivalent. Practical for testing the flow before scaling, with identical execution behavior at any size up to deep-liquidity limits.",
      },
    ]}
  />
);

export default SwapSirenUsdt;
