import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://mrcglobalpay.com";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "atom";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch recent swap transactions for "live events"
  const { data: recentSwaps } = await supabase
    .from("swap_transactions")
    .select("from_currency, to_currency, amount, created_at, transaction_id")
    .order("created_at", { ascending: false })
    .limit(20);

  const swaps = recentSwaps || [];
  const now = new Date().toISOString();

  // Build entries: live swaps + new tokens
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

  const allEntries = [...tokenEntries, ...swapEntries].join("\n");

  if (format === "rss") {
    // RSS 2.0 format
    const rssItems = [...tokenEntries, ...swapEntries]
      .join("\n")
      .replace(/<entry>/g, "<item>")
      .replace(/<\/entry>/g, "</item>")
      .replace(/<summary>/g, "<description>")
      .replace(/<\/summary>/g, "</description>");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MRC GlobalPay — Live Swap Events &amp; New Tokens</title>
    <link>${SITE}</link>
    <description>Real-time non-custodial crypto swap activity and newly supported tokens. FINTRAC MSB M23225638.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
    });
  }

  // Default: Atom feed
  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>MRC GlobalPay — Live Swap Events &amp; New Tokens</title>
  <subtitle>Real-time non-custodial crypto swap activity and newly supported tokens. FINTRAC MSB M23225638.</subtitle>
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
