// Edge function that serves the SPA shell with per-page SEO meta tags
// injected into <head>. Used for crawler-visible /exchange/[pair] routes
// across all 13 languages so Google/Bing/IndexNow see real metadata
// instead of an empty Vite shell.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SITE = "https://mrcglobalpay.com";
const LANGS = ["en", "es", "pt", "fr", "ja", "fa", "ur", "he", "af", "hi", "vi", "tr", "uk"] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

// Parse "/es/exchange/btc-to-eth" or "/pt/swap/btc-usdc" -> { lang, kind, from, to }
type RouteKind = "exchange" | "swap";
function parsePath(path: string): { lang: string; kind: RouteKind; from: string; to: string } | null {
  // Normalize, strip trailing slash, ignore query/hash
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const parts = clean.split("/").filter(Boolean);

  let lang = "en";
  let rest = parts;
  if (parts.length > 0 && (LANGS as readonly string[]).includes(parts[0])) {
    lang = parts[0];
    rest = parts.slice(1);
  }
  if (rest.length !== 2) return null;
  const kind = rest[0];
  if (kind !== "exchange" && kind !== "swap") return null;
  // /exchange/ uses "btc-to-eth" (with "-to-" separator)
  // /swap/    uses "btc-usdc"   (single hyphen between two tickers)
  if (kind === "exchange") {
    const m = rest[1].match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
    if (!m) return null;
    return { lang, kind, from: m[1].toLowerCase(), to: m[2].toLowerCase() };
  }
  const m = rest[1].match(/^([a-z0-9]+)-([a-z0-9]+)$/i);
  if (!m) return null;
  return { lang, kind, from: m[1].toLowerCase(), to: m[2].toLowerCase() };
}

function pairUrlPath(kind: RouteKind, from: string, to: string): string {
  return kind === "exchange" ? `/exchange/${from}-to-${to}` : `/swap/${from}-${to}`;
}

interface PairContent {
  title?: string;
  description?: string;
  h1?: string;
}

function buildSeoHead(opts: {
  lang: string;
  kind: RouteKind;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  title: string;
  description: string;
  canonical: string;
}): string {
  const { lang, kind, from, to, fromName, toName, title, description, canonical } = opts;
  const fromUp = from.toUpperCase();
  const toUp = to.toUpperCase();

  // hreflang block — one entry per language + x-default
  const hreflangLinks = LANGS.map((l) => {
    const prefix = l === "en" ? "" : `/${l}`;
    return `<link rel="alternate" hreflang="${l}" href="${SITE}${prefix}${pairUrlPath(kind, from, to)}" />`;
  }).join("\n    ");

  const ogImage = `${SITE}/og-image.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: kind === "exchange" ? "Exchange" : "Swap", item: `${SITE}/${kind === "exchange" ? "directory" : "swap"}` },
          { "@type": "ListItem", position: 3, name: `Swap ${fromUp} to ${toUp}`, item: canonical },
        ],
      },
      {
        "@type": "ExchangeRateSpecification",
        currency: fromUp,
        currentExchangeRate: {
          "@type": "UnitPriceSpecification",
          price: 1,
          priceCurrency: toUp,
        },
        provider: {
          "@type": "FinancialService",
          name: "MRC Global Pay",
          url: SITE,
        },
      },
      // NOTE: FAQPage schema intentionally omitted here. The React app
      // (DynamicExchange.tsx) renders a single FAQPage entity via Helmet to
      // avoid Google Search Console "Duplicate field FAQPage" warnings.
    ],
  };

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    ${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="${SITE}${pairUrlPath(kind, from, to)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:site_name" content="MRC Global Pay" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:locale" content="${lang === "en" ? "en_US" : lang}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `.trim();
}

// Server-rendered visible content for crawlers (revealed in JS-disabled view).
// React then hydrates over the same DOM; this is purely a "Zero-JS Visibility" payload.
function buildNoscriptBody(opts: {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  h1: string;
  description: string;
  canonical: string;
}): string {
  const { from, to, fromName, toName, h1, description, canonical } = opts;
  const fromUp = from.toUpperCase();
  const toUp = to.toUpperCase();
  return `
    <noscript>
      <div style="max-width:1280px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#0f172a;background:#fff;">
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(description)}</p>
        <h2>Swap ${escapeHtml(fromName)} (${fromUp}) to ${escapeHtml(toName)} (${toUp})</h2>
        <p>MRC Global Pay is a registered Canadian Money Services Business (FINTRAC MSB #C100000015) offering instant ${fromUp} → ${toUp} conversions in under 60 seconds. No account, no KYC for standard swaps. Minimum swap value is approximately $0.30 USD.</p>
        <h2>How it works</h2>
        <ol>
          <li>Enter the amount of ${fromUp} you want to swap.</li>
          <li>Paste your ${toUp} destination address.</li>
          <li>Send ${fromUp} to the deposit address shown.</li>
          <li>Receive ${toUp} in your wallet within ~60 seconds of confirmation.</li>
        </ol>
        <h2>Frequently asked questions</h2>
        <h3>What is the minimum ${fromUp} I can swap for ${toUp}?</h3>
        <p>Approximately $0.30 USD equivalent in ${fromUp}. MRC Global Pay supports micro-swaps from crypto dust.</p>
        <h3>How long does a ${fromUp} to ${toUp} swap take?</h3>
        <p>Most swaps complete in under 60 seconds after the required network confirmations are received.</p>
        <h3>Do I need to register or pass KYC to swap ${fromUp} for ${toUp}?</h3>
        <p>No. Standard crypto-to-crypto swaps on MRC Global Pay are non-custodial and require no account or identity verification.</p>
        <p><a href="${escapeAttr(canonical)}">Open the live ${fromUp} → ${toUp} swap interface</a></p>
      </div>
    </noscript>
  `.trim();
}

let cachedShell: string | null = null;
let cachedShellAt = 0;
const SHELL_TTL_MS = 5 * 60 * 1000;

async function fetchShell(): Promise<string | null> {
  const now = Date.now();
  if (cachedShell && now - cachedShellAt < SHELL_TTL_MS) return cachedShell;
  try {
    const res = await fetch(`${SITE}/index.html`, { headers: { "User-Agent": "MRC-SEO-Shell/1.0" } });
    if (!res.ok) return cachedShell; // fall back to stale if available
    const html = await res.text();
    cachedShell = html;
    cachedShellAt = now;
    return html;
  } catch (_e) {
    return cachedShell;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Path the user actually requested. Hosting rewrites pass it via ?path=
  // but also accept /seo-shell<path> for direct invocation.
  let targetPath = url.searchParams.get("path") || "";
  if (!targetPath) {
    // strip leading "/seo-shell" prefix if invoked directly
    targetPath = url.pathname.replace(/^\/seo-shell/, "") || "/";
  }
  if (!targetPath.startsWith("/")) targetPath = `/${targetPath}`;

  const parsed = parsePath(targetPath);
  if (!parsed) {
    // Not a recognized pair URL (e.g. /swap/eth-to-usdt-instantly handled by
    // KeywordPage). Return the SPA shell so React can route normally.
    const shell = await fetchShell();
    return new Response(shell || "<!doctype html><html><body>Not found</body></html>", {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  }

  const { lang, kind, from, to } = parsed;

  // Look up pre-generated SEO from the pairs table
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const [{ data: pair }, { data: fromAsset }, { data: toAsset }] = await Promise.all([
    supabase
      .from("pairs")
      .select("seo_title, seo_description, seo_h1, content_json, is_valid")
      .ilike("from_ticker", from)
      .ilike("to_ticker", to)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("exchange_assets")
      .select("name")
      .ilike("ticker", from)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("exchange_assets")
      .select("name")
      .ilike("ticker", to)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  const fromName = fromAsset?.name || from.toUpperCase();
  const toName = toAsset?.name || to.toUpperCase();
  const fromUp = from.toUpperCase();
  const toUp = to.toUpperCase();

  // Pull lang-specific content if available
  const contentJson = pair?.content_json as Record<string, PairContent> | undefined;
  const langContent = contentJson?.[lang];

  const fallbackTitle = `Swap ${fromUp} to ${toUp} Instantly | MRC Global Pay`;
  const fallbackDesc = `Convert ${fromName} (${fromUp}) to ${toName} (${toUp}) in under 60 seconds. No account required, MSB-registered (C100000015). Best rates from 700+ liquidity sources.`;
  const fallbackH1 = `${fromUp} → ${toUp} Instant Swap`;

  const title = langContent?.title || pair?.seo_title || fallbackTitle;
  const description = langContent?.description || pair?.seo_description || fallbackDesc;
  const h1 = langContent?.h1 || pair?.seo_h1 || fallbackH1;

  // Self-referencing canonical per language (must match what the React page
  // emits via Helmet, otherwise Google reports "Duplicate, Google chose
  // different canonical than user"). x-default already points to the English
  // URL in the hreflang block above.
  const path = pairUrlPath(kind, from, to);
  const canonical = lang === "en" ? `${SITE}${path}` : `${SITE}/${lang}${path}`;

  const shell = await fetchShell();
  if (!shell) {
    return new Response("Shell unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  const seoHead = buildSeoHead({ lang, kind, from, to, fromName, toName, title, description, canonical });
  const noscriptBody = buildNoscriptBody({ from, to, fromName, toName, h1, description, canonical });

  // Inject SEO into <head> (right before </head>) and noscript content right after <body>
  // Also fix the <html lang="..."> attribute.
  let html = shell.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);
  html = html.replace(/<\/head>/i, `${seoHead}\n  </head>`);
  html = html.replace(/<body([^>]*)>/i, `<body$1>\n    ${noscriptBody}`);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // 5 min CDN cache + 1 hr SWR — pair SEO changes infrequently
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
      "X-Robots-Tag": "index, follow",
      "Vary": "Accept-Encoding",
    },
  });
});
