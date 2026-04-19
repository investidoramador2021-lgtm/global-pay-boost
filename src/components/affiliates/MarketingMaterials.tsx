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
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import banner1 from "@/assets/affiliate-banner-1-leaderboard.jpg";
import banner2 from "@/assets/affiliate-banner-2-mediumrect-dark.jpg";
import banner3 from "@/assets/affiliate-banner-3-mediumrect-light.jpg";
import banner4 from "@/assets/affiliate-banner-4-skyscraper.jpg";
import banner5 from "@/assets/affiliate-banner-5-social.jpg";
import banner6 from "@/assets/affiliate-banner-6-story.jpg";

/* ─────────── Shared helpers ─────────── */
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

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
    name: "Banner 1 — Leaderboard",
    size: "1920 × 1080 (use as 728×90)",
    theme: "Dark",
    overlay: "Swap 6,000+ Cryptos in Under 60 Seconds →",
    image: banner1,
    filename: "mrcglobalpay-banner-leaderboard.jpg",
    aspect: "aspect-[16/9]",
  },
  {
    id: "medium-rect-dark",
    name: "Banner 2 — Medium Rectangle (Dark)",
    size: "1024 × 1024 (use as 300×250)",
    theme: "Dark",
    overlay: "Non-Custodial. Fast. Trusted.",
    image: banner2,
    filename: "mrcglobalpay-banner-mediumrect-dark.jpg",
    aspect: "aspect-square",
  },
  {
    id: "medium-rect-light",
    name: "Banner 3 — Medium Rectangle (Light)",
    size: "1024 × 1024 (use as 300×250)",
    theme: "Light",
    overlay: "Micro-Swaps from $0.30. No Sign-Up.",
    image: banner3,
    filename: "mrcglobalpay-banner-mediumrect-light.jpg",
    aspect: "aspect-square",
  },
  {
    id: "skyscraper",
    name: "Banner 4 — Wide Skyscraper",
    size: "1080 × 1920 (use as 160×600)",
    theme: "Dark",
    overlay: "6,000+ Pairs. Swap in Seconds.",
    image: banner4,
    filename: "mrcglobalpay-banner-skyscraper.jpg",
    aspect: "aspect-[9/16]",
  },
  {
    id: "social-1200",
    name: "Banner 5 — Social Share",
    size: "1024 × 1024 (use as 1200×628)",
    theme: "Dark",
    overlay: "The Smartest Way to Swap Crypto in 2026",
    image: banner5,
    filename: "mrcglobalpay-banner-social.jpg",
    aspect: "aspect-square",
  },
  {
    id: "story-1080",
    name: "Banner 6 — Mobile Story",
    size: "1080 × 1920 (Instagram / TikTok / Shorts)",
    theme: "Dark",
    overlay: "Swap Smarter. Move Faster.",
    image: banner6,
    filename: "mrcglobalpay-banner-story.jpg",
    aspect: "aspect-[9/16]",
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
→ No account required

Worth a look 👇

[YOUR-AFFILIATE-LINK]

#Bitcoin #Crypto #DeFi`,
  },
  {
    platform: "X (Twitter)",
    label: "X Post 2 — Value Drop",
    text: `Most "no-KYC" swaps are sketchy.

MRC GlobalPay is different:
✅ Non-custodial (you keep your keys)
✅ 6,000+ trading pairs
✅ Swaps complete in under 60 seconds
✅ Micro-swaps from $0.30

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
• No account required

Give it a try 👇

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
    text: `A quick note for anyone navigating crypto swaps:

I've been recommending MRC GlobalPay to clients and contacts because it solves three problems most exchanges don't:

1. Non-custodial architecture — assets never sit on the platform
2. Trusted operator with a real corporate entity behind the product
3. Practical UX — 6,000+ pairs, sub-60-second swaps, micro-swaps from $0.30

If you have a network that swaps crypto regularly, take a look:
👉 [YOUR-AFFILIATE-LINK]

#Fintech #Crypto #Bitcoin`,
  },
  {
    platform: "Instagram / Threads",
    label: "Instagram / Threads Post",
    text: `Crypto swap tool I actually trust ⚡️

🔐 Non-custodial (you keep control)
💸 Swap from just $0.30
⏱️ Done in under 60 seconds
🪙 6,000+ pairs
✅ No account required

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
• No account required for swaps

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
⚡ 6,000+ pairs, swaps complete in under 60 seconds
💸 Micro-swaps from $0.30 (perfect for clearing dust on Solana, BSC, TRON, etc.)
🎯 No account needed for swaps

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
→ "No-KYC" swap sites are sketchy and almost never trustworthy

I spent months looking for something in the middle. I found it.

It's called MRC GlobalPay, and it's the cleanest non-custodial swap I've used:

✅ Non-custodial — you keep your keys, every time
✅ 6,000+ trading pairs across all major chains
✅ Swaps settle in under 60 seconds
✅ Micro-swaps from just $0.30 (huge for cleaning up dust)
✅ Operated by MRC Pay International Corp out of Ottawa, Canada
✅ No account required for swaps

That last point matters. Most "anonymous" swap platforms are based in jurisdictions where there's zero recourse if something goes wrong. MRC is the opposite — a real corporate entity, on the record, but still non-custodial and still no-account-required for swaps.

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
"Centralized exchanges hold your funds, ask for KYC on everything, and freeze accounts at random. DEXs are slow, expensive, and chain-limited. Most 'no-KYC' swaps? Sketchy and risky."

[0:15 – 0:35] SOLUTION — MRC GlobalPay
"This is MRC GlobalPay. It's non-custodial — you never give up your keys. It supports 6,000+ trading pairs across every major chain. Swaps complete in under 60 seconds. And you can swap as little as $0.30 — perfect for cleaning up dust. No account, no email required."

[0:35 – 0:50] PROOF / DEMO
"Here's the swap I just did — BTC to USDT, 47 seconds, no account, no email. Funds went straight to my wallet."

[0:50 – 1:00] CTA
"Link in the description — try a small swap and see for yourself. See you in the next one."

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
✅ No account required for swaps

💰 Affiliate disclosure: The link above is my referral link. If you swap through it, I may earn a small commission — at zero extra cost to you.

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

[MRC GlobalPay]([YOUR-AFFILIATE-LINK]) is a non-custodial cryptocurrency exchange operated by MRC Pay International Corp, headquartered in Ottawa, Canada. Unlike most "anonymous" swap sites, it has a real corporate entity behind it — but it isn't a centralized exchange. Your funds never sit on the platform. Every swap is an atomic, non-custodial transaction, and you don't need an account to swap.

## Why It Stands Out

Here's what makes it different from every other swap I've tested:

- **6,000+ trading pairs** across Bitcoin, Ethereum, Solana, BNB Chain, TRON, and dozens more.
- **Sub-60-second swap times.** Most transactions settle in under a minute.
- **Micro-swaps from just $0.30.** Almost no platform supports amounts this small — perfect for clearing dust on multi-chain wallets.
- **Zero account required for swaps.** Sign-up is only needed if you want to use the partner or affiliate tools.
- **Real corporate operator.** A real entity behind the product, headquartered in Ottawa.

## Who Should Use It

If you fall into any of these groups, it's worth trying:

1. **Long-term holders** who occasionally rebalance and hate the friction of centralized exchanges.
2. **Multi-chain users** drowning in dust they can't otherwise convert.
3. **Self-custody advocates** who refuse to deposit funds anywhere.
4. **Creators and educators** who want a clean tool they can recommend.

## Try It Yourself

The fastest way to evaluate MRC GlobalPay is to try a small swap — even $0.30 will show you the entire flow.

👉 **[Start a swap on MRC GlobalPay →]([YOUR-AFFILIATE-LINK])**

In a market full of bad options, it's rare to find a tool that's simultaneously non-custodial, fast, and easy. MRC GlobalPay is the first platform I've used in 2026 that ticks every box.

---

*Disclosure: The links above are affiliate links. If you swap through them, I may earn a small commission at no extra cost to you.*`;

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
                Six on-brand banners — preview, then download the full-resolution image. Pair with the suggested overlay text or use as-is.
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

                    <div
                      className={cn(
                        "mt-3 overflow-hidden rounded-lg border border-border bg-muted/40",
                        b.aspect,
                      )}
                    >
                      <img
                        src={b.image}
                        alt={`${b.name} — ${b.overlay}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <a
                      href={b.image}
                      download={b.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const res = await fetch(b.image);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = b.filename;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        } catch {
                          window.open(b.image, "_blank");
                        }
                      }}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-display text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <Download className="h-3.5 w-3.5" /> Download banner
                    </a>

                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Suggested overlay text
                      </p>
                      <CopyBlock text={b.overlay} label="Copy text" />
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
