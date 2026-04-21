import { Helmet } from "react-helmet-async";
import { usePageUrl } from "@/hooks/use-page-url";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialShare from "@/components/blog/SocialShare";
import StickyShareRail from "@/components/blog/StickyShareRail";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { getLangFromPath, langPath } from "@/i18n";
import heroAsset from "@/assets/whitepaper-nicehash-mining-3d.png";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

// NiceHash-mineable / payout assets — algorithm grouping
const ALGO_GROUPS: { algo: string; assets: string[]; note: string }[] = [
  {
    algo: "SHA-256",
    assets: ["BTC", "BCH", "BSV"],
    note: "ASIC-dominated. NiceHash auto-converts hashpower to BTC payouts.",
  },
  {
    algo: "Scrypt",
    assets: ["LTC", "DOGE"],
    note: "Merge-mined Litecoin + Dogecoin via merged pools.",
  },
  {
    algo: "Etchash / Ethash",
    assets: ["ETC", "ETHW"],
    note: "GPU mining after Ethereum's Merge. Etchash is the dominant choice.",
  },
  {
    algo: "kHeavyHash",
    assets: ["KAS"],
    note: "Kaspa — most popular GPU coin of 2024-2026.",
  },
  {
    algo: "Autolykos2",
    assets: ["ERG"],
    note: "Ergo — eUTXO smart contract platform, GPU-friendly.",
  },
  {
    algo: "BeamHashIII",
    assets: ["BEAM"],
    note: "Privacy-focused MimbleWimble chain.",
  },
  {
    algo: "ZHash / Equihash 144,5",
    assets: ["ZEC", "FLUX", "BTG"],
    note: "Equihash variants — Zcash family.",
  },
  {
    algo: "RandomX",
    assets: ["XMR"],
    note: "CPU-only Monero. Privacy default.",
  },
  {
    algo: "Octopus",
    assets: ["CFX"],
    note: "Conflux — Tree-Graph chain with EVM compatibility.",
  },
  {
    algo: "KawPow",
    assets: ["RVN"],
    note: "Ravencoin — ASIC-resistant GPU mining.",
  },
  {
    algo: "FishHash",
    assets: ["IRON"],
    note: "Ironfish — privacy-preserving L1.",
  },
  {
    algo: "Karlsenhash / Pyrinhash",
    assets: ["KLS", "PYI"],
    note: "Kaspa-family forks with rising hashrate.",
  },
  {
    algo: "Verthash",
    assets: ["VTC"],
    note: "Vertcoin — ASIC-resistant by design.",
  },
  {
    algo: "Nexapow",
    assets: ["NEXA"],
    note: "UTXO L1 with high TPS targets.",
  },
  {
    algo: "Alephium (Blake3)",
    assets: ["ALPH"],
    note: "Sharded UTXO smart-contract chain.",
  },
];

const PAYOUT_TARGETS = [
  { ticker: "BTC", reason: "Long-term store of value. Lowest counterparty risk." },
  { ticker: "ETH", reason: "Yield, DeFi exposure, programmable settlement." },
  { ticker: "USDT", reason: "Lock in fiat value instantly. TRC-20 = ~$0.50 fees." },
  { ticker: "USDC", reason: "Regulated stablecoin (Circle). Preferred for treasuries." },
  { ticker: "SOL", reason: "Sub-cent fees, high throughput, growing ecosystem." },
  { ticker: "XMR", reason: "Privacy default. Sever the on-chain link to your rig." },
  { ticker: "PAXG", reason: "Tokenized gold. Hedge against crypto drawdowns." },
];

const NicehashMiningWhitepaper = () => {
  const canonicalUrl = usePageUrl("/whitepapers/nicehash-mining-payout-strategy");
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const homeCta = langPath(lang, "/") + "#exchange";
  const lendCta = langPath(lang, "/lend");
  const transparencyCta = langPath(lang, "/transparency-security");
  const compareCta = langPath(lang, "/compare");
  const liquidityCta = langPath(lang, "/liquidity-expansion");
  const sovereignCta = langPath(lang, "/sovereign-settlement");

  const title = "NiceHash Mining Payouts: The 2026 Off-Ramp Whitepaper | MRC GlobalPay";
  const description =
    "A complete guide to every coin NiceHash mines and the cheapest, safest way to convert mining payouts into BTC, ETH, stablecoins, or yield-bearing positions — with no account required.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MRC Global Pay" />
        <meta property="og:image" content={`https://mrcglobalpay.com${heroAsset}`} />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`https://mrcglobalpay.com${heroAsset}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: title,
            description,
            url: canonicalUrl,
            image: `https://mrcglobalpay.com${heroAsset}`,
            datePublished: "2026-04-21",
            dateModified: "2026-04-21",
            author: { "@type": "Organization", name: "MRC Global Pay" },
            publisher: {
              "@type": "FinancialService",
              name: "MRC Global Pay",
              url: "https://mrcglobalpay.com",
            },
            about: { "@type": "Thing", name: "Cryptocurrency Mining Payouts" },
          })}
        </script>
      </Helmet>

      <StickyShareRail url={canonicalUrl} title={title} />
      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* HERO */}
        <section className="relative py-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 30%, hsl(142 76% 36% / 0.10) 0%, transparent 70%)",
            }}
          />
          <div className="container mx-auto max-w-6xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mining Payout Whitepaper · 2026
              </span>
            </motion.div>

            <motion.h1
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mx-auto max-w-4xl text-center font-display text-[clamp(1.85rem,4vw,3.25rem)] font-black leading-[1.1] tracking-tight text-foreground"
            >
              From Hashrate to Wealth: The Smart Off-Ramp for NiceHash Miners
            </motion.h1>

            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
              className="mx-auto mt-5 max-w-3xl text-center text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed text-muted-foreground"
            >
              Every NiceHash payout is denominated in BTC — but BTC is rarely the asset
              you actually want to hold, spend, or earn yield on. This whitepaper maps
              every coin NiceHash mines and shows how to convert your hashpower into
              stablecoins, ETH, gold, or interest-bearing positions in under 90 seconds —
              <span className="font-semibold text-emerald-400"> without an account, KYC, or hidden spreads.</span>
            </motion.p>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}
              className="mt-10 flex justify-center"
            >
              <img
                src={heroAsset}
                alt="NiceHash mining rig with BTC, ETH, LTC, KAS, XMR coins"
                width={1024}
                height={1024}
                className="w-full max-w-xl rounded-2xl border border-emerald-500/15 shadow-[0_0_60px_rgba(16,185,129,0.15)]"
              />
            </motion.div>
          </div>
        </section>

        {/* SECTION I — The NiceHash payout problem */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">§ I · The Payout Problem</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                NiceHash pays in BTC. That's a feature — and a tax.
              </h2>
              <div className="mt-5 space-y-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground">
                <p>
                  NiceHash is the largest <strong>hashpower marketplace</strong> in the
                  world. Whether you point an Antminer at SHA-256, a fleet of GPUs at
                  Kaspa's <em>kHeavyHash</em>, or a single CPU at Monero's RandomX,
                  NiceHash auto-converts the buyer's payment into Bitcoin and credits
                  it to your internal wallet.
                </p>
                <p>
                  This is convenient — until you want to <strong>actually use the money</strong>.
                  The moment you withdraw, you face three frictions:
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    <strong>Withdrawal fees</strong> that scale with on-chain congestion (often $5–$25 in BTC network fees alone).
                  </li>
                  <li>
                    <strong>Forced exposure to BTC volatility</strong> while your rig keeps producing — a 6% drop overnight can erase a week of margin.
                  </li>
                  <li>
                    <strong>KYC walls</strong> on most centralized exchanges if you want to convert into stablecoins, fiat, or another asset.
                  </li>
                </ul>
                <p>
                  Every miner eventually asks the same question: <em>How do I move
                  from BTC payouts into the asset I actually want, with the lowest
                  possible spread, no account, and no surprise?</em>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION II — Algorithm × Asset matrix */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-5xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">§ II · The Asset Matrix</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                Every coin you can mine through NiceHash
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                NiceHash supports 30+ algorithms across ASIC, GPU, and CPU rigs. Below
                is the complete 2026 working list grouped by algorithm. Every asset on
                the right column can be swapped to BTC / ETH / USDT / USDC / SOL / XMR /
                PAXG via the <Link to={homeCta} className="text-emerald-400 underline-offset-4 hover:underline">MRC GlobalPay widget</Link> in one transaction.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mt-10 overflow-x-auto rounded-xl border border-emerald-500/15 bg-background/40 backdrop-blur-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="px-4 py-3 text-start font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Algorithm</th>
                    <th className="px-4 py-3 text-start font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Mineable Assets</th>
                    <th className="px-4 py-3 text-start font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {ALGO_GROUPS.map((row) => (
                    <tr key={row.algo} className="border-b border-border/40 transition-colors hover:bg-emerald-500/5">
                      <td className="px-4 py-3 font-semibold text-foreground">{row.algo}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{row.assets.join(" · ")}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Even if your specific coin isn't on this list, NiceHash settles in BTC —
              and BTC is the most liquid pair on MRC GlobalPay's
              {" "}
              <Link to={liquidityCta} className="text-emerald-400 underline-offset-4 hover:underline">multi-provider liquidity aggregator</Link>.
            </p>
          </div>
        </section>

        {/* SECTION III — Why MRC */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">§ III · The MRC Edge</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                Why miners are routing payouts through MRC GlobalPay
              </h2>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  t: "Inclusive 0.5% pricing",
                  d: "What you see is what you get. The 0.5% service fee is already baked into the quoted rate — no FX markup, no withdrawal surcharge, no inactivity fee. Compare against typical CEX off-ramps that hide 1.5–3% in spread.",
                },
                {
                  t: "Registered MSB (Canada)",
                  d: "MRC Pay International Corp is a FINTRAC-registered Money Services Business (Identifier C100000015), headquartered in Ottawa. Your transactions clear through audited rails — not anonymous offshore mixers.",
                },
                {
                  t: "Zero account required",
                  d: "No sign-up. No KYC for crypto-to-crypto swaps. Paste your destination wallet, scan the deposit QR, and the converted asset lands in your wallet within minutes. Mining payouts deserve mining-grade speed.",
                },
                {
                  t: "Multi-provider routing",
                  d: "Every quote is fetched in parallel from multiple liquidity providers. The smart router picks the highest payout automatically, then silently fails over if one provider rejects. Result: better rates than any single venue.",
                },
                {
                  t: "Privacy by default",
                  d: "We never log your IP against your wallet. For miners who want to fully sever the link between their rig payout address and their treasury, the Private Transfer rail uses Monero as a shielded hop.",
                },
                {
                  t: "Earn while you sleep",
                  d: (
                    <>
                      Don't let stables sit idle. Move converted USDT, USDC, BTC or ETH into the
                      {" "}
                      <Link to={lendCta} className="text-emerald-400 underline-offset-4 hover:underline">Lend &amp; Earn portal</Link>
                      {" "}
                      and put your mining proceeds to work generating institutional yield while
                      your rigs keep humming.
                    </>
                  ),
                },
              ].map((item, i) => (
                <motion.div
                  key={item.t}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="rounded-xl border border-emerald-500/15 bg-background/60 p-5 backdrop-blur-sm"
                >
                  <h3 className="text-sm font-bold text-foreground">{item.t}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.d}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Side-by-side: </strong>
              See exactly how MRC stacks up against the major venues miners typically use on the
              {" "}
              <Link to={compareCta} className="text-emerald-400 underline-offset-4 hover:underline">comparison directory</Link>
              {" "}
              — kept up to date with live fee data.
            </div>
          </div>
        </section>

        {/* SECTION IV — Payout strategies */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">§ IV · Payout Strategies</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                Which asset should your hashpower convert into?
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground">
                There is no single "best" payout asset — the right choice depends on
                your time horizon, electricity cost, and risk appetite. The seven
                profiles below cover ~95% of professional miners.
              </p>
            </motion.div>

            <div className="mt-10 space-y-3">
              {PAYOUT_TARGETS.map((row, i) => (
                <motion.div
                  key={row.ticker}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="flex items-start gap-4 rounded-xl border border-emerald-500/15 bg-background/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 font-mono text-sm font-bold text-emerald-400">
                    {row.ticker}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{row.reason}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm font-bold text-foreground">The 60/30/10 mining treasury rule</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                A common heuristic among professional GPU farms in 2026: convert 60% of
                weekly payouts into stablecoins (operating costs), 30% into BTC or ETH
                (long-term thesis), and 10% into a yield-bearing position via the
                {" "}
                <Link to={lendCta} className="text-emerald-400 underline-offset-4 hover:underline">Lend &amp; Earn portal</Link>.
                {" "}
                MRC's batch swap flow lets you split a single BTC payout across all
                three destinations in one session.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION V — Step by step */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">§ V · Walkthrough</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                Converting a NiceHash payout in 90 seconds
              </h2>
            </motion.div>

            <ol className="mt-8 space-y-5">
              {[
                "Withdraw from NiceHash to a personal BTC wallet (or use the Lightning rail for sub-cent fees on smaller balances).",
                "Open the MRC GlobalPay widget. Select BTC as the source and your target asset (USDT, USDC, ETH, SOL, XMR, PAXG, etc.) as the destination.",
                "Paste your destination address. The 60-second rate lock activates the moment a valid address is detected.",
                "Send BTC to the deposit address shown. Multi-provider routing picks the best available rate at confirmation time.",
                "Receive the converted asset directly in your wallet. Optionally, route stablecoins straight into the Lend & Earn portal for yield.",
              ].map((step, i) => (
                <motion.li
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="flex gap-4 rounded-xl border border-emerald-500/15 bg-background/60 p-4 backdrop-blur-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{step}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* SECTION VI — Trust */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">§ VI · Verify Before You Trust</span>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-foreground">
                Auditable. Registered. Non-custodial.
              </h2>
              <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground">
                Don't take our word for it. Read the full security disclosures, MSB
                registration details, liquidity partner stack, and on-chain settlement
                model on the
                {" "}
                <Link to={transparencyCta} className="text-emerald-400 underline-offset-4 hover:underline">Transparency &amp; Security</Link>
                {" "}page. For the underlying settlement architecture, see the
                {" "}
                <Link to={sovereignCta} className="text-emerald-400 underline-offset-4 hover:underline">Sovereign Settlement whitepaper</Link>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-5 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                ⛏️ Built for miners, by people who run rigs
              </span>
            </motion.div>

            <motion.h3
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mt-6 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-foreground"
            >
              Stop bleeding margin on BTC withdrawals.
            </motion.h3>

            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
              className="mt-4 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-muted-foreground"
            >
              Convert your next NiceHash payout into the asset that actually matches
              your strategy — at the lowest fee in the industry, with no account, no KYC,
              and no surprise spreads.
            </motion.p>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={homeCta}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
              >
                Swap My Payout Now
              </Link>
              <Link
                to={lendCta}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-8 py-3.5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:border-emerald-500/40"
              >
                Earn on My Stablecoins
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 pb-16">
          <SocialShare url={canonicalUrl} title={title} description={description} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NicehashMiningWhitepaper;
