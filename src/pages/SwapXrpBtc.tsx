import SwapPairLanding from "@/components/SwapPairLanding";

const SwapXrpBtc = () => (
  <SwapPairLanding
    assetA="XRP"
    assetAName="Ripple"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="xrp-btc"
    avgSpeed="4m"
    isFeatured
    headline={<>Swap XRP to BTC Instantly – <span className="text-gradient-neon">XRPL Speed Meets Bitcoin Settlement</span></>}
    subHeadline="Convert XRP into native Bitcoin in minutes. The XRP Ledger's 3–5 second finality means your funds clear our routing layer almost instantly — you only wait for Bitcoin confirmations."
    whyText="XRP holders rotating into Bitcoin face fragmented liquidity across exchanges and high spreads on direct XRP/BTC books. MRC Global Pay aggregates the best XRP/BTC routes across multiple providers, locks the quoted rate, and settles native BTC to your specified address. No registration. No custody. The XRPL's deterministic 3–5 second finality keeps the swap window tight even during volatile sessions."
    extraFaqs={[
      {
        q: "Do I need an XRP destination tag?",
        a: "No — you are sending XRP, not receiving it. Your standard Bitcoin address is the only destination required for this swap.",
      },
      {
        q: "How long does XRP → BTC take?",
        a: "Typically 4–8 minutes total: ~10 seconds for XRPL settlement, near-instant cross-chain routing, then 1–3 Bitcoin confirmations.",
      },
      {
        q: "Is the XRP/BTC rate competitive?",
        a: "Yes. We quote across multiple top-tier liquidity providers in parallel and lock the best execution. The displayed rate is the rate you receive — no hidden spread.",
      },
    ]}
  />
);

export default SwapXrpBtc;
