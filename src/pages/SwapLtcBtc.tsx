import SwapPairLanding from "@/components/SwapPairLanding";

const SwapLtcBtc = () => (
  <SwapPairLanding
    assetA="LTC"
    assetAName="Litecoin"
    assetB="BTC"
    assetBName="Bitcoin"
    slug="ltc-btc"
    avgSpeed="44s"
    headline={<>Swap LTC to BTC Instantly – <span className="text-gradient-neon">2.5-Minute Block Speed, Zero Delays</span></>}
    subHeadline="Processing: under 60 seconds. Settlement: immediate on-chain finality. Convert Litecoin to Bitcoin via direct liquidity routing — bypass standard 6-confirmation delays on both chains."
    whyText="LTC/BTC is the original 'silver-to-gold' rotation, still actively used in March 2026 by long-term holders consolidating into Bitcoin. MRC GlobalPay leverages Litecoin's 2.5-minute block time combined with pre-funded BTC liquidity vaults — your LTC deposit triggers immediate BTC release, completing in under 60 seconds. No 60-minute Bitcoin confirmation queue, no exchange withdrawal hold."
    extraFaqs={[
      {
        q: "Why swap LTC to BTC on MRC GlobalPay vs holding LTC?",
        a: "Many long-term holders consolidate altcoin positions into BTC during accumulation phases. MRC GlobalPay enables this rotation without exchange registration, without withdrawal limits, and with processing under 60 seconds — preserving full custody throughout.",
      },
      {
        q: "Are MimbleWimble (MWEB) Litecoin transactions supported?",
        a: "MRC GlobalPay accepts standard Litecoin deposits. MWEB confidential transactions should be converted to standard LTC before depositing to ensure correct routing through our liquidity vaults.",
      },
    ]}
  />
);

export default SwapLtcBtc;
