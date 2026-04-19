import { useState } from "react";
import {
  ImageIcon,
  Share2,
  Mail,
  Youtube,
  FileText,
  Copy,
  Check,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ─────────── Reusable copy block ─────────── */
const CopyBlock = ({ text, label = "Copy" }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="relative">
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 pr-20 font-mono text-xs leading-relaxed text-foreground">
        {text}
      </pre>
      <Button
        size="sm"
        variant={copied ? "default" : "outline"}
        onClick={onCopy}
        className="absolute right-2 top-2 h-7 gap-1 text-[11px]"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : label}
      </Button>
    </div>
  );
};

/* ─────────── BANNERS ─────────── */
const banners = [
  {
    id: "leaderboard",
    name: "Banner 1 — Leaderboard (728×90)",
    size: "728 × 90 px",
    theme: "Dark",
    overlay: "Swap 6,000+ Cryptos in 60 Seconds — Earn Lifetime BTC →",
    prompt: `Ultra-modern 728x90 leaderboard banner for a non-custodial crypto exchange called MRC GlobalPay. Dark slate background (#0B1220) with subtle hexagonal mesh pattern. Glowing emerald-green to mint-green gradient (#00E676 to #00C853) glassmorphism panel on the right. Bitcoin coin icon with soft neon glow on the left. Clean sans-serif white text reading "Swap 6,000+ Cryptos in 60 Seconds" with a smaller line "Lifetime BTC commissions". Fine grid lines, premium fintech aesthetic, Revolut-style minimalism, 4K, sharp, vector-clean, no people, no logos other than a small Bitcoin symbol.`,
  },
  {
    id: "medium-rect-dark",
    name: "Banner 2 — Medium Rectangle (300×250) — Dark",
    size: "300 × 250 px",
    theme: "Dark",
    overlay: "Non-Custodial. Regulated in Canada. Earn BTC.",
    prompt: `Premium 300x250 medium rectangle banner. Dark navy gradient background (#0B1220 to #111B2D). Centered glowing emerald shield icon (#00E676) with a small Canadian maple leaf accent. Soft volumetric light, subtle radial glow. Bold white sans-serif headline "Non-Custodial Crypto Swaps". Smaller text "FINTRAC MSB · Bank of Canada PSP". Glass card with 12px blur, thin emerald border, rounded 16px corners. Fintech, institutional, trustworthy, 4K, no people.`,
  },
  {
    id: "medium-rect-light",
    name: "Banner 3 — Medium Rectangle (300×250) — Light",
    size: "300 × 250 px",
    theme: "Light",
    overlay: "Micro-Swaps from $0.30. No Sign-Up.",
    prompt: `Clean 300x250 medium rectangle banner with off-white background (#F8FAFC) and subtle dotted grid. A single elegant Bitcoin coin in 3D isometric style with soft emerald-green (#00C853) shadow. Bold dark slate sans-serif headline "Micro-Swaps from $0.30". Subtext "No sign-up · No KYC for swaps". Thin emerald accent line. Apple-like minimalism, premium fintech, white space, sharp, 4K, no people.`,
  },
  {
    id: "skyscraper",
    name: "Banner 4 — Wide Skyscraper (160×600)",
    size: "160 × 600 px",
    theme: "Dark",
    overlay: "Earn BTC on Every Swap You Refer",
    prompt: `Vertical 160x600 wide skyscraper banner. Dark gradient (#0B1220 top, #00251A bottom) with vertical neon-green light beam down the center. Stacked icons top to bottom: lightning bolt, Bitcoin coin, shield with maple leaf, dollar coin. Vertical white text reading "Lifetime BTC Commissions" with subtext "0.1% – 0.4% per swap". Glassmorphism panels, soft glow, 4K, sharp, no people, fintech aesthetic.`,
  },
  {
    id: "social-1200",
    name: "Banner 5 — Social Share (1200×628)",
    size: "1200 × 628 px",
    theme: "Dark",
    overlay: "The Smartest Way to Swap Crypto in 2026",
    prompt: `Cinematic 1200x628 social share image (Twitter/Facebook/LinkedIn open graph). Dark slate background (#0A0F1C) with abstract flowing emerald-green to mint particle waves on the right side. On the left: bold large white sans-serif headline "The Smartest Way to Swap Crypto in 2026" with subtitle "Non-custodial · 6,000+ pairs · Under 60 seconds · Regulated in Canada". A small "MRC GlobalPay" wordmark in clean white at the bottom-left. Premium fintech, Revolut/Stripe-style, 4K, ultra-sharp, no people.`,
  },
  {
    id: "story-1080",
    name: "Banner 6 — Mobile Story (1080×1920)",
    size: "1080 × 1920 px",
    theme: "Dark",
    overlay: "Swap. Earn BTC. Repeat.",
    prompt: `Vertical 1080x1920 Instagram/TikTok/YouTube Shorts story banner. Full-bleed dark gradient background with glowing emerald-green orb in the center. Floating 3D Bitcoin, Ethereum, Solana, and USDT coins orbiting around a glassmorphism card. Massive bold white sans-serif text top: "SWAP. EARN BTC. REPEAT." Bottom call-to-action band: "6,000+ pairs · From $0.30 · Lifetime commissions". Premium cinematic fintech, motion-blur particles, 4K, no people, no faces.`,
  },
];

/* ─────────── SOCIAL POSTS ─────────── */
const socials = [
  {
    platform: "X (Twitter)",
    label: "X Post 1 — Hook",
    text: `Just found the cleanest non-custodial crypto swap I've used in years.

→ 6,000+ pairs
→ Swap in under 60 seconds
→ From just $0.30
→ Regulated Canadian MSB

And they pay LIFETIME BTC commissions to anyone who shares it 👇

[YOUR-AFFILIATE-LINK]

#Bitcoin #Crypto #DeFi`,
  },
  {
    platform: "X (Twitter)",
    label: "X Post 2 — Value Drop",
    text: `Most "no-KYC" swaps are sketchy.

MRC GlobalPay is different:
✅ FINTRAC MSB C100000015
✅ Bank of Canada PSP registered
✅ Non-custodial (you keep your keys)
✅ Lifetime BTC affiliate revenue (0.1% – 0.4%)

Try it → [YOUR-AFFILIATE-LINK]

#Crypto #BTC #SelfCustody`,
  },
  {
    platform: "Telegram",
    label: "Telegram Post 1 — Channel Drop",
    text: `🚀 New favorite swap tool: MRC GlobalPay

• Non-custodial — your keys, your coins
• 6,000+ trading pairs
• Swaps complete in under 60 seconds
• Micro-swaps from $0.30 (perfect for cleaning up dust)
• Fully regulated in Canada (FINTRAC MSB C100000015)

I'm earning lifetime BTC every time someone uses my link 👇

🔗 [YOUR-AFFILIATE-LINK]`,
  },
  {
    platform: "Telegram",
    label: "Telegram Post 2 — Quick Tip",
    text: `💡 Tip for anyone holding leftover dust on multiple chains:

MRC GlobalPay lets you swap from $0.30 — most exchanges won't even let you touch amounts that small.

Non-custodial. No account. ~60 seconds.

Try it: [YOUR-AFFILIATE-LINK]`,
  },
  {
    platform: "LinkedIn",
    label: "LinkedIn Post — Professional",
    text: `A quick note for anyone navigating the regulated side of crypto:

I've been recommending MRC GlobalPay to clients and contacts because it solves three problems most exchanges don't:

1. Non-custodial architecture — assets never sit on the platform
2. Genuine Canadian regulatory standing (FINTRAC MSB C100000015 + Bank of Canada PSP registration)
3. Practical UX — 6,000+ pairs, sub-60-second swaps, micro-swaps from $0.30

They also run a transparent affiliate program (0.1% – 0.4% lifetime BTC commissions), which is how I'm sharing this.

If you have a network that swaps crypto regularly, take a look:
👉 [YOUR-AFFILIATE-LINK]

#Fintech #Crypto #Compliance #Bitcoin`,
  },
  {
    platform: "Instagram / Threads",
    label: "Instagram / Threads Post",
    text: `Crypto swap tool I actually trust ⚡️

🔐 Non-custodial (you keep control)
🇨🇦 Regulated in Canada
💸 Swap from just $0.30
⏱️ Done in under 60 seconds
🪙 6,000+ pairs

Lifetime BTC commissions if you share it.

Link in bio → [YOUR-AFFILIATE-LINK]

#crypto #bitcoin #web3 #defi #selfcustody`,
  },
];

/* ─────────── EMAILS ─────────── */
const emails = [
  {
    label: "Email 1 — Short (newsletter blurb)",
    text: `Subject: A crypto swap tool I had to share

Quick one — I've been using MRC GlobalPay for the last few weeks and it's quietly become my default.

• Non-custodial (your keys stay yours)
• 6,000+ trading pairs
• Under 60 seconds per swap
• From $0.30 — yes, even dust
• Regulated Canadian MSB (FINTRAC C100000015)

If you swap crypto at all, give it a try: [YOUR-AFFILIATE-LINK]

Cheers,
[YOUR-NAME]`,
  },
  {
    label: "Email 2 — Medium (review-style)",
    text: `Subject: The non-custodial swap I wish I'd found sooner

Hey [FIRST-NAME],

I get asked all the time which exchange I use for quick crypto swaps. For a while my answer was "depends on the chain." Not anymore.

MRC GlobalPay has become my go-to, and here's why:

🔐 Non-custodial — funds never sit on the platform
🇨🇦 Fully regulated — FINTRAC MSB C100000015 + Bank of Canada PSP registered
⚡ 6,000+ pairs, swaps complete in under 60 seconds
💸 Micro-swaps from $0.30 (perfect for clearing dust on Solana, BSC, TRON, etc.)
🎯 No account needed for swaps

I also signed up for their affiliate program — they pay LIFETIME commissions in real BTC (0.1% – 0.4% per swap). That's why this email has my link in it. Full transparency.

Try it here:
👉 [YOUR-AFFILIATE-LINK]

If you have questions, just reply.

— [YOUR-NAME]`,
  },
  {
    label: "Email 3 — Long (full pitch)",
    text: `Subject: I finally found a crypto swap that ticks every box

Hey [FIRST-NAME],

If you've been in crypto for more than five minutes, you know the pattern:

→ Centralized exchanges are fast but custodial (and increasingly KYC-everything)
→ DEX aggregators are non-custodial but slow, expensive, and chain-limited
→ "No-KYC" swap sites are sketchy and almost never regulated

I spent months looking for something in the middle. I found it.

It's called MRC GlobalPay, and it's the cleanest non-custodial swap I've used:

✅ Non-custodial — you keep your keys, every time
✅ 6,000+ trading pairs across all major chains
✅ Swaps settle in under 60 seconds
✅ Micro-swaps from just $0.30 (huge for cleaning up dust)
✅ Regulated as a Canadian MSB (FINTRAC C100000015) and registered with the Bank of Canada as a PSP
✅ Operated by MRC Pay International Corp out of Ottawa, Canada

That last point matters. Most "anonymous" swap platforms are based in jurisdictions where there's zero recourse if something goes wrong. MRC is the opposite — fully on the record, fully compliant, but still non-custodial and still no-account-required for swaps.

Here's the bonus: they run an affiliate program that pays LIFETIME commissions in BTC (0.1% – 0.4% of every swap, forever). That's how this email is monetized — full transparency. If you click my link and ever swap, I get a tiny piece in BTC.

Try it once and see for yourself:
👉 [YOUR-AFFILIATE-LINK]

Reply if you want a walkthrough — happy to help.

Talk soon,
[YOUR-NAME]

P.S. Even if you're skeptical, just try a $0.30 swap. It costs almost nothing and you'll see exactly how the flow works.`,
  },
];

/* ─────────── VIDEO SCRIPT ─────────── */
const videoScript = `🎬 60-SECOND VIDEO SCRIPT — "The Best Non-Custodial Crypto Swap of 2026"
─────────────────────────────────────────────

[0:00 – 0:05] HOOK (on-camera or text overlay)
"If you swap crypto and you're still using centralized exchanges — stop. I'll show you something better in 60 seconds."

[0:05 – 0:15] PROBLEM
"Centralized exchanges hold your funds, ask for KYC on everything, and freeze accounts at random. DEXs are slow, expensive, and chain-limited. Most 'no-KYC' swaps? Unregulated and risky."

[0:15 – 0:35] SOLUTION — MRC GlobalPay
"This is MRC GlobalPay. It's non-custodial — you never give up your keys. It supports 6,000+ trading pairs across every major chain. Swaps complete in under 60 seconds. And you can swap as little as $0.30 — perfect for cleaning up dust. Best part? It's a fully regulated Canadian MSB — FINTRAC registered and Bank of Canada PSP."

[0:35 – 0:50] PROOF / DEMO
"Here's the swap I just did — BTC to USDT, 47 seconds, no account, no email. Funds went straight to my wallet."

[0:50 – 1:00] CTA
"Link in the description — it's my affiliate link, full transparency. Try a small swap, see for yourself, and if you like it, share your own link and earn lifetime BTC commissions just like I do. See you in the next one."

─────────────────────────────────────────────
📝 VIDEO DESCRIPTION TEMPLATE
─────────────────────────────────────────────

The fastest, cleanest non-custodial crypto swap I've used in 2026.

🔗 Try MRC GlobalPay (my affiliate link): [YOUR-AFFILIATE-LINK]

Why it's different:
✅ Non-custodial — you keep your keys
✅ 6,000+ pairs across all major chains
✅ Swaps complete in under 60 seconds
✅ Micro-swaps from $0.30
✅ FINTRAC MSB C100000015 + Bank of Canada PSP registered
✅ No account required for swaps

💰 Affiliate disclosure: The link above is my referral link. If you swap through it, I earn a small lifetime commission in BTC (0.1% – 0.4%) — at zero extra cost to you. You can get your own link too.

⏱️ TIMESTAMPS
0:00 Intro
0:05 Why centralized exchanges suck
0:15 What MRC GlobalPay actually is
0:35 Live swap demo
0:50 How to try it

#Crypto #Bitcoin #NonCustodial #CryptoSwap #DeFi #SelfCustody #BTC #2026Crypto`;

/* ─────────── BLOG POST ─────────── */
const blogPost = `# The Best Non-Custodial Crypto Swap Platform in 2026

If you've spent any time in crypto recently, you've felt the squeeze: centralized exchanges keep tightening KYC, "no-KYC" platforms look increasingly suspicious, and decentralized aggregators are still too slow and chain-limited for everyday use.

There's finally a better option — and after testing it for several months, I'm convinced it's the most well-balanced non-custodial swap platform available in 2026.

## Meet MRC GlobalPay

[MRC GlobalPay]([YOUR-AFFILIATE-LINK]) is a non-custodial cryptocurrency exchange operated by MRC Pay International Corp, headquartered in Ottawa, Canada. Unlike most "anonymous" swap sites, it's a fully registered Canadian Money Services Business (FINTRAC MSB **C100000015**) and a registered Payment Service Provider with the **Bank of Canada**. That's a level of regulatory legitimacy almost no comparable platform can match.

But it isn't a centralized exchange. Your funds never sit on the platform — every swap is an atomic, non-custodial transaction. You don't need an account to swap.

## Why It Stands Out

Here's what makes it different from every other swap I've tested:

- **6,000+ trading pairs** across Bitcoin, Ethereum, Solana, BNB Chain, TRON, and dozens more.
- **Sub-60-second swap times.** Most transactions settle in under a minute.
- **Micro-swaps from just $0.30.** Almost no platform supports amounts this small — perfect for clearing dust on multi-chain wallets.
- **Zero account required for swaps.** You only register if you want to use the affiliate or partner program.
- **Real regulatory standing.** Canadian MSB + Bank of Canada PSP registration means there's a real entity behind the product.

## Who Should Use It

If you fall into any of these groups, it's worth trying:

1. **Long-term holders** who occasionally rebalance and hate the friction of centralized exchanges.
2. **Multi-chain users** drowning in dust they can't otherwise convert.
3. **Self-custody advocates** who refuse to deposit funds anywhere.
4. **Creators and educators** who want a regulated platform they can recommend without reputational risk.

## Bonus: Lifetime BTC Commissions

There's also an affiliate program — and it's one of the most generous I've seen. You earn **0.1% to 0.4% in real BTC** on every swap your referrals ever make, paid automatically and forever. No minimums. No payout thresholds. Just lifetime Bitcoin.

That's exactly how this article is monetized: the link below is my affiliate link. Full transparency.

## Try It Yourself

The fastest way to evaluate MRC GlobalPay is to try a small swap — even $0.30 will show you the entire flow.

👉 **[Start a swap on MRC GlobalPay →]([YOUR-AFFILIATE-LINK])**

In a market full of bad options, it's rare to find a tool that's simultaneously non-custodial, fast, regulated, and creator-friendly. MRC GlobalPay is the first platform I've used in 2026 that ticks every box.

---

*Disclosure: The links above are affiliate links. If you swap through them, I earn a small lifetime BTC commission at no extra cost to you.*`;

/* ─────────── COMPONENT ─────────── */
const MarketingMaterials = () => {
  return (
    <section
      id="marketing-materials"
      className="border-b border-border bg-background py-16 sm:py-20"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-display font-semibold text-primary">
            <Megaphone className="h-3 w-3" /> Copy. Paste. Promote.
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Ready-Made Marketing Materials — Start Promoting in Minutes
          </h2>
          <p className="mt-3 font-body text-muted-foreground leading-relaxed">
            Every asset below is fully written, fully formatted, and ready to use right now. Copy any block, swap{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">[YOUR-AFFILIATE-LINK]</code>{" "}
            for your real link, and post. No design tools, no copywriting, no setup needed.
          </p>
        </div>

        <div className="mt-10">
          <Tabs defaultValue="banners" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
              <TabsTrigger value="banners" className="gap-1.5 text-xs">
                <ImageIcon className="h-3.5 w-3.5" /> Banners
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" /> Social
              </TabsTrigger>
              <TabsTrigger value="emails" className="gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" /> Emails
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-1.5 text-xs">
                <Youtube className="h-3.5 w-3.5" /> Video
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Blog
              </TabsTrigger>
            </TabsList>

            {/* ─────────── BANNERS ─────────── */}
            <TabsContent value="banners" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Generate any banner instantly by pasting the prompt into Grok Imagine, Midjourney, DALL·E, or any AI image tool.
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {b.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          b.theme === "Dark"
                            ? "bg-foreground/10 text-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {b.theme}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size: <span className="font-mono">{b.size}</span>
                    </p>
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Text overlay
                      </p>
                      <CopyBlock text={b.overlay} label="Copy text" />
                    </div>
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        AI image prompt
                      </p>
                      <CopyBlock text={b.prompt} label="Copy prompt" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─────────── SOCIAL ─────────── */}
            <TabsContent value="social" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Six ready-to-post templates — replace{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[YOUR-AFFILIATE-LINK]</code> and post.
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                {socials.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {s.label}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {s.platform}
                      </span>
                    </div>
                    <div className="mt-3">
                      <CopyBlock text={s.text} label="Copy post" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─────────── EMAILS ─────────── */}
            <TabsContent value="emails" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Three full email templates — short, medium, and long. Drop into any newsletter tool.
              </p>
              <div className="grid gap-5">
                {emails.map((e) => (
                  <div
                    key={e.label}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {e.label}
                    </h3>
                    <div className="mt-3">
                      <CopyBlock text={e.text} label="Copy email" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─────────── VIDEO ─────────── */}
            <TabsContent value="video" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                A complete 60-second script + YouTube/TikTok/Shorts description with affiliate disclosure.
              </p>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    60-Second Video Script + Description
                  </h3>
                </div>
                <div className="mt-3">
                  <CopyBlock text={videoScript} label="Copy script" />
                </div>
              </div>
            </TabsContent>

            {/* ─────────── BLOG ─────────── */}
            <TabsContent value="blog" className="mt-8">
              <p className="mb-6 text-center text-sm text-muted-foreground">
                A complete ~400-word blog article in Markdown. Paste into WordPress, Ghost, Medium, Substack, or any CMS.
              </p>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    "The Best Non-Custodial Crypto Swap Platform in 2026"
                  </h3>
                </div>
                <div className="mt-3">
                  <CopyBlock text={blogPost} label="Copy article" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            <strong className="text-foreground">Pro tip:</strong> Always disclose that you're using an affiliate
            link — it builds trust and is required by most platforms (FTC, X, YouTube, etc.). Every template above
            already includes a clean, friendly disclosure.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketingMaterials;
