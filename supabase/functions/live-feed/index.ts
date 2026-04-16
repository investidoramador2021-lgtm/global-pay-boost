import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";
const LANGS = ["es","pt","fr","ja","fa","ur","he","af","hi","vi","tr","uk"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* New tokens recently added to the platform */
const NEW_TOKENS = [
  { ticker: "ONDO", name: "Ondo Finance", date: "2026-04-10", category: "RWA" },
  { ticker: "NOS", name: "Nosana", date: "2026-04-09", category: "AI GPU" },
  { ticker: "JUPSOL", name: "Jupiter Staked SOL", date: "2026-04-08", category: "LST" },
  { ticker: "HYPE", name: "Hyperliquid", date: "2026-04-05", category: "DeFi" },
  { ticker: "BERA", name: "Berachain", date: "2026-04-03", category: "L1" },
  { ticker: "MONAD", name: "Monad", date: "2026-04-01", category: "L1" },
];

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function hreflangLinks(path: string): string {
  const enUrl = `${SITE}${path}`;
  const links = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />`,
    ...LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${path}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
  ];
  return links.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "atom";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch latest 100 valid pairs from the pairs table
  const { data: latestPairs } = await supabase
    .from("pairs")
    .select("from_ticker, to_ticker, seo_title, seo_description, updated_at")
    .eq("is_valid", true)
    .order("updated_at", { ascending: false })
    .limit(100);

  // Fetch recent swap transactions for "live events"
  const { data: recentSwaps } = await supabase
    .from("swap_transactions")
    .select("from_currency, to_currency, amount, created_at, transaction_id")
    .order("created_at", { ascending: false })
    .limit(20);

  const swaps = recentSwaps || [];
  const pairs = latestPairs || [];
  const now = new Date().toISOString();

  // Build entries: pairs + live swaps + new tokens
  const pairEntries = pairs.map((p: any) => {
    const from = p.from_ticker.toUpperCase();
    const to = p.to_ticker.toUpperCase();
    const slug = `${p.from_ticker}-to-${p.to_ticker}`;
    const title = p.seo_title || `Convert ${from} to ${to} | MRC GlobalPay`;
    const desc = p.seo_description || `Swap ${from} for ${to} instantly. No KYC, no account.`;
    const updated = new Date(p.updated_at).toISOString();
    const path = `/exchange/${slug}`;
    return `  <entry>
    <title>${escapeXml(title)}</title>
    <id>${SITE}${path}</id>
    <updated>${updated}</updated>
    <category term="ExchangePair" />
    <summary>${escapeXml(desc)}</summary>
    <link href="${SITE}${path}" rel="alternate" />
${hreflangLinks(path)}
  </entry>`;
  });

  const swapEntries = swaps.map((s: any) => {
    const title = `Swap: ${s.amount} ${s.from_currency.toUpperCase()} → ${s.to_currency.toUpperCase()}`;
    const id = `${SITE}/tx/${s.transaction_id}`;
    const updated = new Date(s.created_at).toISOString();
    return `  <entry>
    <title>${escapeXml(title)}</title>
    <id>${escapeXml(id)}</id>
    <updated>${updated}</updated>
    <category term="LiveSwap" />
    <summary>Non-custodial swap of ${s.amount} ${s.from_currency.toUpperCase()} to ${s.to_currency.toUpperCase()} settled via MRC GlobalPay.</summary>
    <link href="${SITE}/#exchange" rel="alternate" />
  </entry>`;
  });

  const tokenEntries = NEW_TOKENS.map((t) => {
    const updated = new Date(t.date).toISOString();
    return `  <entry>
    <title>New Token: ${escapeXml(t.name)} (${t.ticker}) — ${t.category}</title>
    <id>${SITE}/tokens/${t.ticker.toLowerCase()}</id>
    <updated>${updated}</updated>
    <category term="NewToken" />
    <summary>${escapeXml(t.name)} (${t.ticker}) is now available for instant non-custodial swaps on MRC GlobalPay. Category: ${t.category}. Minimum: $0.30.</summary>
    <link href="${SITE}/?from=${t.ticker.toLowerCase()}&amp;to=usdt#exchange" rel="alternate" />
  </entry>`;
  });

  const allEntries = [...pairEntries, ...tokenEntries, ...swapEntries].join("\n");

  if (format === "rss") {
    // RSS 2.0 format – convert entries to items
    const rssItems = pairs.map((p: any) => {
      const from = p.from_ticker.toUpperCase();
      const to = p.to_ticker.toUpperCase();
      const slug = `${p.from_ticker}-to-${p.to_ticker}`;
      const title = p.seo_title || `Convert ${from} to ${to} | MRC GlobalPay`;
      const desc = p.seo_description || `Swap ${from} for ${to} instantly. No KYC, no account.`;
      const pubDate = new Date(p.updated_at).toUTCString();
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${SITE}/exchange/${slug}</link>
      <guid isPermaLink="true">${SITE}/exchange/${slug}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>ExchangePair</category>
    </item>`;
    });

    const swapItems = swaps.map((s: any) => {
      const title = `Swap: ${s.amount} ${s.from_currency.toUpperCase()} → ${s.to_currency.toUpperCase()}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${SITE}/#exchange</link>
      <guid isPermaLink="false">${SITE}/tx/${s.transaction_id}</guid>
      <description>Non-custodial swap of ${s.amount} ${s.from_currency.toUpperCase()} to ${s.to_currency.toUpperCase()}.</description>
      <pubDate>${new Date(s.created_at).toUTCString()}</pubDate>
      <category>LiveSwap</category>
    </item>`;
    });

    const tokenItems = NEW_TOKENS.map((t) => `    <item>
      <title>New Token: ${escapeXml(t.name)} (${t.ticker}) — ${t.category}</title>
      <link>${SITE}/?from=${t.ticker.toLowerCase()}&amp;to=usdt#exchange</link>
      <guid isPermaLink="false">${SITE}/tokens/${t.ticker.toLowerCase()}</guid>
      <description>${escapeXml(t.name)} (${t.ticker}) is now available for instant swaps. Category: ${t.category}.</description>
      <pubDate>${new Date(t.date).toUTCString()}</pubDate>
      <category>NewToken</category>
    </item>`);

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <channel>
    <title>MRC GlobalPay — Live Swap Events, New Pairs &amp; Tokens</title>
    <link>${SITE}</link>
    <description>Real-time non-custodial crypto swap activity, newly generated exchange pairs, and supported tokens. FINTRAC MSB C100000015.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${[...rssItems, ...tokenItems, ...swapItems].join("\n")}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
    });
  }

  // Default: Atom feed
  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <title>MRC GlobalPay — Live Swap Events, New Pairs &amp; Tokens</title>
  <subtitle>Real-time non-custodial crypto swap activity, newly generated exchange pairs, and supported tokens. FINTRAC MSB C100000015.</subtitle>
  <link href="${SITE}" rel="alternate" />
  <link href="${SITE}/feed.xml" rel="self" type="application/atom+xml" />
  <id>${SITE}/feed</id>
  <updated>${now}</updated>
  <author>
    <name>MRC Global Pay Architecture Team</name>
    <uri>${SITE}</uri>
  </author>
  <rights>© 2026 MRC Global Pay. Registered MSB — Canada.</rights>
${allEntries}
</feed>`;

  return new Response(atom, {
    headers: { ...corsHeaders, "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
});
