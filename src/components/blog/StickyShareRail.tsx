import { useState } from "react";
import { Check, Link2, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Sticky vertical share rail rendered on the LEFT of the article on desktop only.
 * Mobile users get the existing bottom <SocialShare /> block.
 *
 * Pinned to the viewport at top-1/3, narrow 56px column, no chrome — pure icon
 * column matching the dark/green aesthetic.
 */

interface StickyShareRailProps {
  url: string;
  title: string;
}

const iconClass = "h-4 w-4";

const StickyShareRail = ({ url, title }: StickyShareRailProps) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      name: "X",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.43-4.94 8.43-9.94z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      ),
    },
    {
      name: "Reddit",
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.01 13.47a1.54 1.54 0 0 1 .04.36c0 2.22-2.58 4.02-5.77 4.02s-5.77-1.8-5.77-4.02c0-.12.01-.24.04-.36a1.42 1.42 0 1 1 1.56-2.32 7.07 7.07 0 0 1 3.85-1.22l.74-3.46a.3.3 0 0 1 .36-.23l2.42.51a1 1 0 1 1-.1.46l-2.16-.46-.66 3.13a7 7 0 0 1 3.79 1.22 1.42 1.42 0 1 1 1.66 2.37zM8.4 13.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm6.62 2.85a.36.36 0 0 0-.51 0 2.84 2.84 0 0 1-2.04.7 2.84 2.84 0 0 1-2.04-.7.36.36 0 0 0-.5.51 3.51 3.51 0 0 0 2.54.9 3.51 3.51 0 0 0 2.55-.9.36.36 0 0 0 0-.51zm-1.4-1.85a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      label: "Share on Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.18-1.85 8.74c-.14.62-.51.77-1.03.48l-2.85-2.1-1.37 1.32c-.15.15-.28.28-.57.28l.2-2.9 5.27-4.76c.23-.2-.05-.32-.36-.12L8.5 12.78l-2.81-.88c-.61-.19-.62-.61.13-.9l10.98-4.23c.51-.19.96.12.79.86z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      label: "Share on WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M17.47 14.38c-.3-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.19-.24-.57-.49-.5-.66-.5h-.57c-.2 0-.5.07-.76.37-.26.3-1 .98-1 2.4 0 1.41 1.03 2.78 1.17 2.97.15.2 2.03 3.1 4.92 4.34.69.3 1.22.47 1.64.6.69.22 1.31.19 1.81.12.55-.08 1.74-.71 1.99-1.4.25-.69.25-1.28.17-1.4-.07-.12-.27-.2-.57-.34zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.93 9.93 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2z" />
        </svg>
      ),
    },
    {
      name: "Email",
      label: "Share via Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: <Mail className={iconClass} />,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it anywhere." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  return (
    <aside
      aria-label="Share this article"
      className="pointer-events-none fixed left-3 top-1/3 z-30 hidden xl:block"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-lg backdrop-blur-md">
        <span className="px-1 py-1 font-display text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Share
        </span>
        {networks.map((n) => (
          <a
            key={n.name}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={n.label}
            title={n.label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {n.icon}
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy link"
          title="Copy link"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className={`${iconClass} text-primary`} /> : <Link2 className={iconClass} />}
        </button>
      </div>
    </aside>
  );
};

export default StickyShareRail;
