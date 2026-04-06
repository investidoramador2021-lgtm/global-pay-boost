import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Config ──────────────────────────────────────────────────────────
const SUPPORTED_TOKENS: Record<string, string> = {
  nos: "nossol",
  ondo: "ondo",
  aixbt: "aixbtsol",
  jup: "jup",
  pyth: "pyth",
};

const TOKEN_LABELS: Record<string, string> = {
  nos: "$NOS",
  ondo: "$ONDO",
  aixbt: "$AIXBT",
  jup: "$JUP",
  pyth: "$PYTH",
};

const SEARCH_KEYWORDS = ["swap", "buy", "no kyc", "no account", "instant"];
const REPLY_DELAY_MS = 5_000; // 5 seconds between replies
const COOLDOWN_HOURS = 24;
const MAX_REPLIES_PER_RUN = 10;

// ── OAuth 1.0a helpers (for X API v2) ───────────────────────────────
function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function generateNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

function buildOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Merge all params for signature base
  const allParams = { ...params, ...oauthParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join("&");

  const signatureBase = `${method.toUpperCase()}&${percentEncode(
    url
  )}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(
    accessSecret
  )}`;

  const hmac = createHmac("sha1", signingKey);
  hmac.update(signatureBase);
  const signature = hmac.digest("base64");

  oauthParams["oauth_signature"] = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

// ── X API helpers ───────────────────────────────────────────────────
async function searchTweets(
  query: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<any[]> {
  const url = "https://api.x.com/2/tweets/search/recent";
  const params: Record<string, string> = {
    query,
    max_results: "20",
    "tweet.fields": "author_id,created_at,conversation_id",
    expansions: "author_id",
  };

  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const fullUrl = `${url}?${queryString}`;

  const authHeader = buildOAuthHeader(
    "GET",
    url,
    params,
    consumerKey,
    consumerSecret,
    accessToken,
    accessSecret
  );

  const resp = await fetch(fullUrl, {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`Search failed (${resp.status}): ${errText}`);
    return [];
  }

  const json = await resp.json();
  return json.data || [];
}

async function getUserTweets(
  userId: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<any[]> {
  const url = `https://api.x.com/2/users/${userId}/tweets`;
  const params: Record<string, string> = {
    max_results: "10",
    "tweet.fields": "created_at,conversation_id",
  };

  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const fullUrl = `${url}?${queryString}`;

  const authHeader = buildOAuthHeader(
    "GET",
    url,
    params,
    consumerKey,
    consumerSecret,
    accessToken,
    accessSecret
  );

  const resp = await fetch(fullUrl, {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`User tweets failed (${resp.status}): ${errText}`);
    return [];
  }

  const json = await resp.json();
  return json.data || [];
}

async function lookupUserId(
  username: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<string | null> {
  const url = `https://api.x.com/2/users/by/username/${username}`;

  const authHeader = buildOAuthHeader(
    "GET",
    url,
    {},
    consumerKey,
    consumerSecret,
    accessToken,
    accessSecret
  );

  const resp = await fetch(url, {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`User lookup failed (${resp.status}): ${errText}`);
    return null;
  }

  const json = await resp.json();
  return json.data?.id || null;
}

async function replyToTweet(
  tweetId: string,
  text: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<string | null> {
  const url = "https://api.x.com/2/tweets";

  const body = JSON.stringify({
    text,
    reply: { in_reply_to_tweet_id: tweetId },
  });

  // For POST with JSON body, do NOT include body params in OAuth signature
  const authHeader = buildOAuthHeader(
    "POST",
    url,
    {},
    consumerKey,
    consumerSecret,
    accessToken,
    accessSecret
  );

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`Reply failed (${resp.status}): ${errText}`);
    return null;
  }

  const json = await resp.json();
  return json.data?.id || null;
}

// ── Detect token in tweet ───────────────────────────────────────────
function detectToken(text: string): string | null {
  const lower = text.toLowerCase();
  for (const token of Object.keys(SUPPORTED_TOKENS)) {
    if (lower.includes(`$${token}`) || lower.includes(` ${token} `)) {
      return token;
    }
  }
  return null;
}

function buildReplyText(token: string): string {
  const label = TOKEN_LABELS[token] || `$${token.toUpperCase()}`;
  const ticker = SUPPORTED_TOKENS[token] || token;
  return `If you're looking for a registration-free swap for ${label}, MRC Global Pay has a $0.30 minimum and settles directly to your wallet. 🛡️ Check it here: https://mrcglobalpay.com/?to=${ticker}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth: require CRON_SECRET for automated calls
  const authHeader = req.headers.get("authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow service_role for manual testing
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseKey || authHeader !== `Bearer ${supabaseKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const consumerKey = Deno.env.get("TWITTER_CONSUMER_KEY")!;
  const consumerSecret = Deno.env.get("TWITTER_CONSUMER_SECRET")!;
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN")!;
  const accessSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")!;
  const botUsername = Deno.env.get("TWITTER_BOT_USERNAME") || "";

  if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
    return new Response(
      JSON.stringify({ error: "Twitter credentials not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: string[] = [];
  let replyCount = 0;

  try {
    // ── 1. Search-based replies ──────────────────────────────────
    for (const token of Object.keys(SUPPORTED_TOKENS)) {
      if (replyCount >= MAX_REPLIES_PER_RUN) break;

      const keywordQuery = SEARCH_KEYWORDS.map(
        (kw) => `"${kw}"`
      ).join(" OR ");
      const query = `($${token} OR ${token}) (${keywordQuery}) -is:retweet -is:reply lang:en`;

      console.log(`Searching: ${query}`);
      const tweets = await searchTweets(
        query,
        consumerKey,
        consumerSecret,
        accessToken,
        accessSecret
      );

      for (const tweet of tweets) {
        if (replyCount >= MAX_REPLIES_PER_RUN) break;

        const authorId = tweet.author_id;

        // Skip own tweets (handled in self-reply)
        if (
          botUsername &&
          tweet.text?.toLowerCase().includes(`@${botUsername.toLowerCase()}`)
        ) {
          continue;
        }

        // Check 24h cooldown
        const cutoff = new Date(
          Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000
        ).toISOString();
        const { data: existing } = await supabase
          .from("x_bot_logs")
          .select("id")
          .eq("tweet_id", tweet.id)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Check user cooldown
        const { data: userRecent } = await supabase
          .from("x_bot_logs")
          .select("id")
          .eq("author_username", authorId)
          .gte("created_at", cutoff)
          .limit(1);

        if (userRecent && userRecent.length > 0) continue;

        // Send reply
        const replyText = buildReplyText(token);
        const replyId = await replyToTweet(
          tweet.id,
          replyText,
          consumerKey,
          consumerSecret,
          accessToken,
          accessSecret
        );

        if (replyId) {
          await supabase.from("x_bot_logs").insert({
            tweet_id: tweet.id,
            reply_tweet_id: replyId,
            author_username: authorId,
            matched_token: token,
            match_type: "search",
          });
          replyCount++;
          results.push(`Replied to ${tweet.id} for $${token.toUpperCase()}`);
        }

        await sleep(REPLY_DELAY_MS);
      }
    }

    // ── 2. Self-reply logic ──────────────────────────────────────
    if (botUsername && replyCount < MAX_REPLIES_PER_RUN) {
      const userId = await lookupUserId(
        botUsername,
        consumerKey,
        consumerSecret,
        accessToken,
        accessSecret
      );

      if (userId) {
        const myTweets = await getUserTweets(
          userId,
          consumerKey,
          consumerSecret,
          accessToken,
          accessSecret
        );

        for (const tweet of myTweets) {
          if (replyCount >= MAX_REPLIES_PER_RUN) break;

          const token = detectToken(tweet.text || "");
          if (!token) continue;

          // Check if we already replied to this tweet
          const { data: existing } = await supabase
            .from("x_bot_logs")
            .select("id")
            .eq("tweet_id", tweet.id)
            .eq("match_type", "self_reply")
            .limit(1);

          if (existing && existing.length > 0) continue;

          const replyText = buildReplyText(token);
          const replyId = await replyToTweet(
            tweet.id,
            replyText,
            consumerKey,
            consumerSecret,
            accessToken,
            accessSecret
          );

          if (replyId) {
            await supabase.from("x_bot_logs").insert({
              tweet_id: tweet.id,
              reply_tweet_id: replyId,
              author_username: botUsername,
              matched_token: token,
              match_type: "self_reply",
            });
            replyCount++;
            results.push(
              `Self-replied to ${tweet.id} for $${token.toUpperCase()}`
            );
          }

          await sleep(REPLY_DELAY_MS);
        }
      }
    }
  } catch (err) {
    console.error("Bot error:", err);
    return new Response(
      JSON.stringify({
        error: "Bot execution error",
        replies: results,
        count: replyCount,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      replies: results,
      count: replyCount,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
