import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MsbTrustBar from "@/components/MsbTrustBar";
import { ArrowRight, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import ogRavedaoImage from "@/assets/og-ravedao-research.jpg";

const BASE_URL = "https://mrcglobalpay.com";
const PAGE_PATH = "/research/ravedao-rave-token-analysis-2026";
const CANONICAL = `${BASE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-16T00:00:00Z";

const META_TITLE =
  "RaveDAO (RAVE) Research: 6,000% Rally Analysis & Risk Report | MRC GlobalPay";
const META_DESCRIPTION =
  "A deep dive into RaveDAO (RAVE) tokenomics, the April 2026 short squeeze, and critical supply concentration risks. Learn how to swap RAVE securely via a Canadian MSB.";
const META_KEYWORDS =
  "RaveDAO price, RAVE token utility, crypto short squeeze April 2026, buy RAVE Canada, RaveDAO supply risk, non-custodial RAVE swap";

const stats = [
  { label: "ATH (Apr 15, 2026)", value: "$19.54", note: "From $0.14 in Dec 2025" },
  { label: "30-day gain", value: "6,000%+", note: "Top-50 by market cap" },
  { label: "Market cap", value: "~$3B", note: "At peak; volatile" },
  { label: "Supply float", value: "25%", note: "250M of 1B max circulating" },
];

const tokenomics = [
  { metric: "Max supply", detail: "1,000,000,000 RAVE", outlook: "High dilution risk" },
  { metric: "Circulating supply", detail: "~250M (25% of max)", outlook: "Low float = volatile" },
  { metric: "Fully diluted val.", detail: "~$12B at current prices", outlook: "Stretched vs. fundamentals" },
  { metric: "Contract (ERC-20)", detail: "0x17205fab…70db97", outlook: "Verifiable on-chain" },
  { metric: "Chains", detail: "Ethereum, Base, BNB Smart Chain", outlook: "Multi-chain accessible" },
  { metric: "Staking mechanism", detail: "Supply-reducing; rewards long-term holders", outlook: "Demand-side positive" },
  { metric: "Top 3 wallet concentration", detail: "~90% of total supply", outlook: "Critical risk factor" },
];

const faqs = [
  {
    q: "What is RaveDAO (RAVE) and how does the token work?",
    a: "RaveDAO is a Web3 entertainment protocol that anchors EDM events to blockchain rails. The RAVE token has dual utility: B2B staking (organizers and vendors stake RAVE for verified partner status) and B2C payments (tickets, VIP access, on-site spend). Holders also govern treasury and the 20% event-proceeds donation pool.",
  },
  {
    q: "How did RAVE rally over 6,000% in April 2026?",
    a: "The rally combined real project momentum (Binance Alpha listing, OKX campaign, flagship events) with a textbook short squeeze. High short interest plus a low circulating float (only 25% of max supply) plus staking-locked supply created cascading liquidations — $43M of shorts were wiped out in a single 24-hour window.",
  },
  {
    q: "What are the biggest risks of holding RAVE?",
    a: "Supply concentration is the dominant risk: roughly 90% of total RAVE supply sits in three Gnosis Safe multi-sig wallets, and the top 10 wallets control over 98%. Fully diluted valuation is ~$12B vs. ~$3B circulating cap, so future unlocks could quadruple the float at today's prices. The team has not published a granular on-chain vesting schedule.",
  },
  {
    q: "Is it safe to swap RAVE in Canada?",
    a: "Yes. MRC GlobalPay is a registered Canadian Money Services Business (MSB #C100000015) supervised by FINTRAC. Swaps are non-custodial, require no registration for standard volumes, and settle wallet-to-wallet in under 60 seconds.",
  },
  {
    q: "What are the fees to swap RAVE to USDT or ETH?",
    a: "Fees are built into the displayed exchange rate — there are no hidden charges. You see the exact amount of USDT, ETH, or any other asset you'll receive before confirming the swap.",
  },
];

const relatedPairs = [
  { from: "rave", to: "usdt", label: "RAVE → USDT" },
  { from: "rave", to: "eth", label: "RAVE → ETH" },
  { from: "rave", to: "btc", label: "RAVE → BTC" },
  { from: "eth", to: "usdt", label: "ETH → USDT" },
  { from: "btc", to: "usdt", label: "BTC → USDT" },
  { from: "sol", to: "usdt", label: "SOL → USDT" },
  { from: "bnb", to: "usdt", label: "BNB → USDT" },
  { from: "usdt", to: "rave", label: "USDT → RAVE" },
  { from: "eth", to: "rave", label: "ETH → RAVE" },
  { from: "usdc", to: "usdt", label: "USDC → USDT" },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "AnalysisNewsArticle",
  headline: "RaveDAO (RAVE) Explained: Real Utility, a 6,000% Rally, and the Risks You Need to Understand",
  description: META_DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "MRC GlobalPay Research" },
  publisher: {
    "@type": "Organization",
    name: "MRC GlobalPay",
    logo: { "@type": "ImageObject", url: `${BASE_URL}/icon-512.png` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
  about: { "@type": "Thing", name: "RaveDAO (RAVE)" },
  keywords: META_KEYWORDS,
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MRC GlobalPay — RAVE Swap",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: `${BASE_URL}/exchange/rave-to-usdt`,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1240" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const ResearchRavedao = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{META_TITLE}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta name="keywords" content={META_KEYWORDS} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={META_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content={`${BASE_URL}${ogRavedaoImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="RaveDAO (RAVE) Research — 6,000% Rally & Risk Report by MRC GlobalPay" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={META_TITLE} />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:image" content={`${BASE_URL}${ogRavedaoImage}`} />
        <meta name="twitter:image:alt" content="RaveDAO (RAVE) Research — 6,000% Rally & Risk Report by MRC GlobalPay" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <SiteHeader />

      <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        {/* Tag row */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">Web3 Music</span>
          <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">High Risk</span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">April 2026</span>
        </div>

        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          RaveDAO (RAVE) Explained: Real Utility, a 6,000% Rally, and the Risks You Need to Understand
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Updated April 16, 2026 · 12 min read · MRC GlobalPay Research
        </p>

        <p className="mt-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
          RAVE went from a $60M market cap project to a $3B+ token in under two weeks. Before you buy the
          narrative — or the dip — here is the complete picture: what RaveDAO actually does, how its
          tokenomics work, what drove the rally, and the supply concentration red flags that every serious
          trader needs to see.
        </p>

        {/* Stats */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Trust bar — prominent placement near top */}
      <MsbTrustBar />

      <article className="container mx-auto max-w-4xl px-4 py-10 prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-2xl prose-h2:sm:text-3xl prose-h3:text-xl prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary">
        <h2>What is RaveDAO?</h2>
        <p>
          RaveDAO is a Web3-native entertainment protocol built at the intersection of electronic dance
          music (EDM) culture and blockchain infrastructure. The premise is straightforward: use real-world
          rave events as a funnel for mass crypto onboarding, and use blockchain rails — NFTs, on-chain
          ticketing, staking, and decentralized governance — to align the financial interests of organizers,
          artists, vendors, and attendees around a single token.
        </p>
        <p>
          The project launched in November 2023 as a 200-person afterparty at a crypto conference. By April
          2026 it claims over 100,000 total event attendees, an average of 3,000 per event, with a presence
          across Europe, the Middle East, North America, and Asia. Flagship events have included a 55,000
          sq ft venue transformation at Singapore's Pasir Panjang Power Station during TOKEN2049 and F1 week.
        </p>
        <p>
          Every RaveDAO event attendee receives a Proof-of-Participation NFT — a persistent, on-chain
          record of attendance that functions as community identity, not just a digital ticket stub.{" "}
          <strong>20% of all event proceeds</strong> are donated to philanthropic causes voted on by the
          community. Current beneficiaries include Tilganga Eye Center in Nepal (funding cataract
          surgeries) and Nalanda West (wellness and education programs).
        </p>

        <h2>How the RAVE token actually works</h2>
        <p>
          The RAVE token has two distinct demand layers — one institutional (B2B), one consumer-facing
          (B2C) — which is a more sophisticated utility design than most entertainment tokens.
        </p>

        <div className="not-prose grid gap-3 sm:grid-cols-2">
          {[
            { title: "B2B staking", body: "Event organizers and vendors must stake RAVE to receive brand licensing and verified partner status. Creates structural buy-and-hold demand from the supply side of the ecosystem." },
            { title: "Event payments", body: "Ticket purchases, VIP access, and on-site transactions at events accept RAVE. Live event revenue creates a recurring real-world sink for token velocity." },
            { title: "Governance", body: "Token holders vote on treasury allocation, event planning, and which charitable causes receive the 20% event proceeds donation. Proposals are executed on-chain via smart contracts." },
            { title: "Staking rewards", body: "Long-term holders stake RAVE to earn yield. Staking reduces liquid circulating supply, which — in a low-float market — amplifies price sensitivity to any demand spike." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border/60 bg-card/40 p-5">
              <h3 className="font-display text-base font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-6">
          The multi-chain architecture spans Ethereum, Base, and BNB Smart Chain. Ecosystem partnerships
          include Warner Music, 1001Tracklists, and AMF (Amsterdam Music Festival), lending the project
          credibility beyond the typical crypto-native audience. Binance and OKX are listed as exchange
          partners and have run joint campaigns with the project.
        </p>

        <h2>The 6,000% rally: what actually happened</h2>
        <p>
          Understanding the RAVE price surge requires separating two distinct forces: genuine project
          momentum and pure market mechanics. Both were present simultaneously, which is what made the move
          so violent.
        </p>

        <div className="not-prose space-y-4 my-6">
          {[
            { date: "December 2025", title: "All-time low: $0.14", body: "RAVE trades near its floor with a market cap of approximately $60M. Low visibility, mostly community-held." },
            { date: "Early April 2026", title: "Short interest builds — and the squeeze begins", body: "With low float and high staking participation reducing liquid supply, a majority of leveraged traders positioned short. As price began rising on organic event news, forced short liquidations cascaded — $43M in short positions wiped out in 24 hours alone, the third-largest liquidation event in crypto behind only BTC and ETH at the time." },
            { date: "April 13–14, 2026", title: "+198% in 24 hours — top 50 by market cap", body: "RAVE briefly hits $19.54 ATH. Binance Alpha listing and OKX campaign amplify retail inflows. Trading volume exceeds $600M/day — larger than most established altcoins." },
            { date: "April 15–16, 2026", title: "Correction: -40% from ATH", body: "Post-squeeze cooling. Price retreats to $11–12 range. Community debates whether real utility or pure mechanics drove the move." },
          ].map((t) => (
            <div key={t.title} className="rounded-xl border-l-4 border-primary bg-card/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.date}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>

        <p>
          The mechanics of this rally should be understood clearly: thin liquidity + high short interest +
          staking-reduced float = textbook short squeeze amplifier. The project's real-world utility
          provided the narrative fuel, but the price action was primarily a derivative of market structure,
          not a revaluation of the underlying business.
        </p>

        <h2 className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          The supply concentration problem — read this before buying
        </h2>
        <p>
          This is the section that most RAVE articles gloss over. It shouldn't be glossed over.
        </p>
        <p>
          On-chain data from Arkham shows that approximately <strong>90% of the total RAVE supply</strong>{" "}
          is held across just three wallets — all Gnosis Safe multi-signature addresses, the standard
          format used by crypto project teams to manage treasuries. The top 10 wallets control over 98% of
          supply.
        </p>

        <div className="not-prose grid gap-3 sm:grid-cols-2 my-6">
          {[
            { title: "3-wallet control", body: "~90% of total supply concentrated in three Gnosis Safe wallets almost certainly associated with the founding team. Any coordinated unlock or transfer can overwhelm market liquidity instantly." },
            { title: "Low circulating float", body: "Only 250M of a 1B max supply token is circulating (25%). FDV is ~$12B at current prices — meaning the market is pricing undiluted upside that hasn't been earned by the protocol yet." },
            { title: "FDV vs. market cap gap", body: "Circulating market cap ~$3B. Fully diluted valuation ~$12B. If remaining supply unlocks and is sold into the market, it represents 4x the current float at today's prices." },
            { title: "Unlock schedule opacity", body: "The team has not published a granular, on-chain-verifiable vesting schedule. Watch for large wallet movements as the primary leading indicator of sell pressure." },
          ].map((r) => (
            <div key={r.title} className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="font-display text-base font-bold text-foreground">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>

        <p>
          This doesn't make RAVE a fraud. Gnosis Safe wallets are standard treasury management, and many
          legitimate projects hold large reserves centrally early in their lifecycle. But it does mean the
          ceiling for downside is structurally high if team wallets rotate to exchanges. Monitor Arkham and
          on-chain analytics for large RAVE transfers as the single most important risk signal for this
          token.
        </p>

        <h2>RAVE tokenomics: the full picture</h2>
        <div className="not-prose overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Metric</th>
                <th scope="col" className="px-4 py-3">Detail</th>
                <th scope="col" className="px-4 py-3">Outlook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tokenomics.map((row) => (
                <tr key={row.metric} className="bg-card/30">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">{row.metric}</th>
                  <td className="px-4 py-3 font-mono text-foreground/80">{row.detail}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.outlook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Upcoming catalysts to watch</h2>
        <p>
          Two near-term events are the most meaningful indicators of whether RaveDAO's real-world utility
          can support its current valuation:
        </p>
        <p>
          The <strong>Dim Sum Rave in Hong Kong on April 18, 2026</strong> — days away — is a flagship
          event showcasing on-chain ticketing and Web3-native event infrastructure at scale. Execution
          quality here matters: successful deployment of crypto payments and NFT issuance at a 3,000+
          person event is genuine proof-of-concept. A botched experience will hit sentiment directly.
        </p>
        <p>
          The <strong>Lisbon Dance Summit co-hosting (April 29–May 2)</strong> is a higher-prestige signal —
          it positions RaveDAO alongside legacy music industry infrastructure, not just crypto-native
          audiences. If this translates into new institutional partnerships or token integrations, it could
          anchor a second leg of the rally on fundamentals rather than mechanics.
        </p>
        <p>
          The clearest bull-to-bear signal to watch: event-driven token utility. If RAVE volume spikes on
          event days from actual ticket purchases and vendor payments — not just CEX speculation — it
          indicates the staking-and-spend flywheel is turning.
        </p>

        <h2>Honest bull vs. bear case</h2>
        <div className="not-prose grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              Bull case for RAVE
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Real revenue from IRL events — multi-million-dollar claimed run rate</li>
              <li>• B2B staking creates structural demand beyond speculation</li>
              <li>• Warner Music, Binance, OKX, AMF partnerships add institutional legitimacy</li>
              <li>• EDM onboards a non-crypto-native demographic at scale</li>
              <li>• Upcoming events in HK, Lisbon, LA, and NYC expand token utility</li>
            </ul>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
              Bear case for RAVE
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• 90% of supply in 3 team wallets — concentrated sell risk at any time</li>
              <li>• FDV ~$12B is difficult to justify on current event revenues</li>
              <li>• Rally was structurally a short squeeze, not fundamental revaluation</li>
              <li>• No published, on-chain-verifiable vesting or unlock schedule</li>
              <li>• Post-squeeze corrections of 70–95% are common for this rally archetype</li>
            </ul>
          </div>
        </div>

        <h2>Who should consider RAVE — and how much?</h2>
        <p>
          RAVE is a high-conviction speculative position, not a portfolio anchor. The utility layer is real
          — unlike pure meme coins, there is a functioning events business underneath the token. But the
          supply mechanics make it unsuitable for risk-averse allocation.
        </p>
        <p>
          If the project's vision resonates with you and you want exposure: size it as a satellite position
          (5–10% of a crypto-specific allocation at most), enter after confirmed event execution rather
          than chasing post-rally peaks, and set a hard stop based on on-chain wallet monitoring — not
          price alone.
        </p>

        <h2>How to swap RAVE without registration</h2>
        <p>
          If you're holding RAVE and want to exit into <Link to="/exchange/eth-to-usdt">USDT</Link>, ETH,
          or any other asset — or if you want to acquire RAVE from another crypto position — MRC GlobalPay
          supports{" "}
          <Link to="/exchange">non-custodial swaps</Link> with no registration required, processing in
          under 60 seconds. As a{" "}
          <Link to="/compliance">Canadian MSB</Link>, the platform handles AML compliance without demanding
          KYC for standard swap volumes.
        </p>

        {/* CTA */}
        <div className="not-prose my-10 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-6 sm:p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
          <h3 className="mt-3 font-display text-2xl font-bold text-foreground">
            Swap RAVE Instantly
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            6,000+ pairs including RAVE · No registration · Under 60 seconds · Canadian MSB
          </p>
          <Link
            to="/exchange/rave-to-usdt"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            Swap RAVE Instantly
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <h2>Related Research & Crawlable Pairs</h2>
        <nav aria-label="Related Research" className="not-prose">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPairs.map((p) => (
              <li key={`${p.from}-${p.to}`}>
                <Link
                  to={`/exchange/${p.from}-to-${p.to}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <span>{p.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/research/paxg-vs-xaut-2026"
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span>PAXG vs XAUT 2026 Research</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        <h2>Frequently Asked Questions</h2>
        <div className="not-prose space-y-3">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-xl border border-border/60 bg-card/40 p-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-base font-semibold text-foreground">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> This research is for informational purposes only and does not
          constitute financial advice. Cryptocurrency investments carry substantial risk of loss. Always do
          your own research and consult a licensed advisor before making investment decisions.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
};

export default ResearchRavedao;
