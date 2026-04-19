import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PriorityTokenAsset } from "@/lib/priority-token-assets";
import { buildSwapDeepLink } from "@/lib/priority-token-assets";

/**
 * Hero block rendered at the very top of priority-token blog posts.
 * - 16:9 hero image (LCP — eager + fetchpriority high)
 * - Glassmorphism overlay with the token name + a prominent "Swap Now"
 *   CTA that deep-links into the homepage exchange widget pre-filled.
 *
 * Style: dark theme, green accents, matches the rest of the site.
 */

interface PriorityTokenHeroProps {
  token: PriorityTokenAsset;
  langPrefix: string;
}

const PriorityTokenHero = ({ token, langPrefix }: PriorityTokenHeroProps) => {
  const swapUrl = buildSwapDeepLink(token, langPrefix);

  return (
    <figure className="relative mb-8 overflow-hidden rounded-2xl border border-border shadow-card">
      <img
        src={token.heroImage}
        alt={token.heroAlt}
        width={1600}
        height={900}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="h-auto w-full object-cover"
      />
      {/* Gradient legibility overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent"
      />
      {/* CTA panel */}
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6 lg:p-8">
        <div className="max-w-xl">
          <p className="font-display text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">
            Trending in 2026
          </p>
          <p className="mt-1 font-display text-base font-bold leading-tight text-foreground sm:text-lg lg:text-xl">
            Ready to swap into {token.symbol}? Lock the rate in seconds.
          </p>
        </div>
        <Button size="lg" className="shadow-neon shrink-0 self-start sm:self-auto" asChild>
          <a
            href={swapUrl}
            aria-label={`Swap into ${token.name} (${token.symbol}) now — opens the exchange widget pre-filled`}
          >
            <Zap className="mr-2 h-5 w-5" />
            Swap into {token.symbol} now
          </a>
        </Button>
      </figcaption>
    </figure>
  );
};

export default PriorityTokenHero;
