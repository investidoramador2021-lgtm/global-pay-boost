import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://mrcglobalpay.com";
const INDEXNOW_KEY = "5b41e59fca3649f389b22450cd5cb8dc";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Rotating author pool for E-E-A-T
const AUTHORS = [
  {
    name: "Daniel Carter",
    role: "Senior Blockchain Analyst",
    bio: "Daniel has spent eight years working across crypto trading desks, first at Cumberland DRW and later at a mid-cap digital asset fund. He writes about market microstructure, swap execution, and DeFi infrastructure. He holds a CFA charter and a Master's in Financial Engineering from Columbia University.",
    credentials: "CFA Charterholder · Columbia MFE · 8 years in digital asset trading",
  },
  {
    name: "Sophia Ramirez",
    role: "DeFi Infrastructure Researcher",
    bio: "Sophia spent four years as a protocol engineer at a Layer 1 blockchain before transitioning to research and education. She specializes in AMM design, cross-chain bridging, and liquidity aggregation architecture. Her work has been cited by Messari, The Block, and Delphi Digital.",
    credentials: "Former L1 Protocol Engineer · Published in Messari & The Block · MSc Computer Science, ETH Zurich",
  },
  {
    name: "Marcus Chen",
    role: "Cybersecurity Lead & Crypto Security Advisor",
    bio: "Marcus has fifteen years in information security, including six years focused on cryptocurrency custody, wallet security, and exchange infrastructure. He previously led the security team at a top-20 centralized exchange.",
    credentials: "CISSP · OSCP · Former Security Lead at top-20 CEX · 15 years in InfoSec",
  },
  {
    name: "Elena Volkova",
    role: "Crypto Markets Strategist",
    bio: "Elena worked as a quantitative analyst at Jane Street before moving into crypto full-time in 2021. She covers macro trends, on-chain analytics, and trading pair dynamics for institutional and retail audiences.",
    credentials: "Former Quant Analyst, Jane Street · CoinDesk & Blockworks contributor · MSc Mathematics, MIT",
  },
];

const INTERNAL_LINKS = [
  { text: "instant swap tool", url: "/#exchange" },
  { text: "MRC GlobalPay", url: "/#exchange" },
  { text: "swap BTC to USDC", url: "/swap/btc-usdc" },
  { text: "swap SOL to USDT", url: "/swap/sol-usdt" },
  { text: "swap ETH to SOL", url: "/swap/eth-sol" },
  { text: "swap XRP to USDT", url: "/swap/xrp-usdt" },
  { text: "swap HYPE to USDT", url: "/swap/hype-usdt" },
  { text: "swap BERA to USDC", url: "/swap/bera-usdt" },
  { text: "swap TIA to USDT", url: "/swap/tia-usdt" },
  { text: "swap MONAD to ETH", url: "/swap/monad-usdt" },
  { text: "swap PYUSD to SOL", url: "/swap/pyusd-usdt" },
  { text: "liquidity aggregation", url: "/blog/understanding-crypto-liquidity-aggregation" },
  { text: "crypto security guide", url: "/blog/crypto-security-best-practices-2026" },
  { text: "BTC to ETH swap guide", url: "/blog/how-to-swap-bitcoin-to-ethereum-2026" },
  { text: "top trading pairs", url: "/blog/top-crypto-trading-pairs-march-2026" },
  { text: "Privacy Policy", url: "/privacy" },
  { text: "AML Policy", url: "/aml" },
  { text: "blog", url: "/blog" },
];

const TOPIC_TEMPLATES = [
  "Write a deep, expert guide about how to use {coin} in DeFi in 2026. Cover staking, lending, LP strategies, and risks. Target keyword: '{coin} DeFi strategies 2026'.",
  "Write a detailed comparison of the top 5 ways to swap {coin} in 2026. Compare CEXs, DEXs, aggregators, and instant swap platforms. Target keyword: 'best way to swap {coin} 2026'.",
  "Write an expert analysis of {coin}'s on-chain metrics and what they reveal about the token's trajectory. Cover active addresses, TVL, transaction volume, and whale behavior. Target keyword: '{coin} on-chain analysis 2026'.",
  "Write a comprehensive guide to {coin} staking in 2026 — how it works, expected yields, risks, validators, and whether it's worth it. Target keyword: '{coin} staking guide 2026'.",
  "Write a detailed explainer on how {coin}'s underlying technology works and why it matters for traders. Cover consensus mechanism, throughput, finality, and ecosystem advantages. Target keyword: 'how {coin} blockchain works'.",
  "Write a practical guide on the safest ways to store and manage {coin} in 2026. Cover hardware wallets, software wallets, custody solutions, and security best practices. Target keyword: '{coin} wallet security 2026'.",
  "Write an analysis of institutional adoption of {coin} in 2026. Cover ETF flows, fund allocations, corporate treasury adoption, and what it means for retail traders. Target keyword: '{coin} institutional adoption 2026'.",
  "Write a guide about cross-chain bridging involving {coin}. How to move {coin} between chains, bridge risks, best practices, and how instant swaps simplify the process. Target keyword: '{coin} cross-chain bridge 2026'.",
];

const COINS = ["Bitcoin", "Ethereum", "Solana", "HYPE", "BERA", "Celestia (TIA)", "Monad", "PYUSD", "XRP", "BNB", "Polygon", "Avalanche", "Arbitrum", "Optimism"];

const MIN_WORD_COUNT = 2000;

function countWords(input: string): number {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function evaluatePostQuality(postData: any): string[] {
  const issues: string[] = [];

  if (!postData?.title || postData.title.length < 45) {
    issues.push("title is too short for competitive SEO");
  }

  if (!postData?.metaTitle || postData.metaTitle.length > 60) {
    issues.push("metaTitle must exist and stay under 60 characters");
  }

  if (!postData?.metaDescription || postData.metaDescription.length > 160) {
    issues.push("metaDescription must exist and stay under 160 characters");
  }

  const content = typeof postData?.content === "string" ? postData.content : "";
  const words = countWords(content);
  if (words < MIN_WORD_COUNT) {
    issues.push(`content too thin (${words} words, need at least ${MIN_WORD_COUNT})`);
  }

  const headingCount = (content.match(/^##\s+/gm) || []).length + (content.match(/^###\s+/gm) || []).length;
  if (headingCount < 10) {
    issues.push("content needs stronger structure (at least 10 H2/H3 headings)");
  }

  const h2Count = (content.match(/^##\s+[^#]/gm) || []).length;
  if (h2Count < 6) {
    issues.push("content needs at least 6 H2 sections");
  }

  const internalLinks = content.match(/\]\((?:\/#exchange|\/blog(?:\/[^)]*)?|\/swap\/[^)]+|\/privacy|\/aml)\)/g) || [];
  if (internalLinks.length < 8) {
    issues.push("content needs at least 8 internal links");
  }

  if (!/##\s+FAQ/i.test(content)) {
    issues.push("content must include a dedicated FAQ section");
  }

  if (!/##\s+Related Reading/i.test(content)) {
    issues.push("content must include a Related Reading section");
  }

  const hasTables = /\|.*\|.*\|/.test(content);
  if (!hasTables) {
    issues.push("content must include at least one comparison table");
  }

  const bulletPoints = (content.match(/^[-*]\s+/gm) || []).length;
  if (bulletPoints < 8) {
    issues.push("content needs more bullet points for readability (at least 8)");
  }

  return issues;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check post count — stop at 100
    const { count: postCount } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    if ((postCount ?? 0) >= 100) {
      return new Response(
        JSON.stringify({ success: true, message: "Target of 100 posts reached. No new post generated.", totalPosts: postCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pick a random coin and topic template
    const coin = COINS[Math.floor(Math.random() * COINS.length)];
    const template = TOPIC_TEMPLATES[Math.floor(Math.random() * TOPIC_TEMPLATES.length)];
    const topic = template.replace(/\{coin\}/g, coin);
    const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

    // Build internal links reference for the AI
    const linksRef = INTERNAL_LINKS.map((l) => `- [${l.text}](${l.url})`).join("\n");

    const systemPrompt = `You are ${author.name}, ${author.role}. ${author.bio}
Credentials: ${author.credentials}

You write expert-level blog posts for MRC GlobalPay (mrcglobalpay.com), an instant non-custodial crypto swap platform that aggregates liquidity from 700+ exchanges. The current date is ${new Date().toISOString().split("T")[0]}.

YOUR WRITING IDENTITY:
- You are a REAL person with years of hands-on crypto experience
- Write in first person. Use "I", "in my experience", "when I was at [previous role]"
- Reference your actual career background naturally (trading desks, protocol engineering, security audits, quant analysis)
- Share specific anecdotes: "Last month I tested…", "Back in 2024 when I was working on…"
- Have OPINIONS. Disagree with common advice when warranted. Call out bad practices
- Be honest about risks and downsides — never oversell

CONTENT QUALITY REQUIREMENTS (2,500-3,500 words):
- Open with a compelling hook — a surprising stat, a personal story, or a contrarian take
- Every section must deliver actionable insight, not filler
- Include specific numbers: TVL figures, APY ranges, gas costs, market cap data, dates
- Use markdown tables for any comparison (at least 1 table per post)
- Include code snippets, wallet addresses, or transaction examples where relevant
- Add blockquotes for key takeaways or expert opinions
- Break up long sections with bullet points and numbered lists

STRUCTURE (mandatory sections):
1. Strong H1 title (the title field) — specific, keyword-rich, compelling
2. Opening hook paragraph (no heading needed)
3. At least 6 H2 sections with substantive content (200+ words each)
4. At least 4 H3 subsections distributed across H2 sections
5. At least 1 comparison table
6. "## Practical Tips" or "## Step-by-Step" section with numbered actionable steps
7. "## FAQ" section with exactly 4 questions using ### for each question
8. "## Related Reading" section linking to 3-4 internal blog posts or swap pages

INTERNAL LINKING (minimum 8 links, naturally woven):
Use these links contextually throughout the content — never dump them in one place:
${linksRef}

SEO RULES:
- Target the provided keyword naturally — use it in H1, first paragraph, one H2, and meta fields
- Use semantic variations and LSI keywords throughout
- Write for humans first, search engines second
- No keyword stuffing — max 3 uses of exact keyword in body

E-E-A-T SIGNALS:
- Reference your credentials and experience naturally in the intro
- Cite specific data sources (DeFiLlama, Dune Analytics, CoinGecko, etc.)
- Mention specific dates and timeframes
- Acknowledge counterarguments and limitations
- Include a brief author context in the opening paragraph

OUTPUT FORMAT — respond with ONLY a valid JSON object (no markdown fences, no explanation):
{
  "title": "Compelling, specific title (50-70 chars)",
  "metaTitle": "SEO meta title under 60 chars with primary keyword",
  "metaDescription": "Action-oriented meta description under 155 chars with keyword",
  "excerpt": "Two compelling sentences summarizing the article's value proposition",
  "readTime": "X min read",
  "category": "One of: Guides, Education, Security, Market Analysis, Technology, DeFi",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "The full markdown article (2500-3500 words) with all formatting, tables, links, FAQ, and Related Reading"
}`;

    console.log(`Generating post about: ${coin} | Author: ${author.name}`);

    let postData: any;
    let qualityIssues: string[] = [];

    for (let attempt = 1; attempt <= 3; attempt++) {
      const attemptTopic =
        attempt === 1
          ? topic
          : `${topic}\n\nIMPORTANT: Your previous draft was REJECTED for these reasons:\n${qualityIssues.map(i => `- ${i}`).join("\n")}\n\nYou MUST fix every issue. Write a completely new article from scratch. Make it longer, more detailed, with more headings, more internal links, and proper FAQ + Related Reading sections. Do NOT repeat the same mistakes.`;

      const aiResponse = await fetch(AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: attemptTopic },
          ],
          temperature: 0.7,
          max_tokens: 16000,
          tools: [
            {
              type: "function",
              function: {
                name: "publish_blog_post",
                description: "Publish a complete, high-quality blog post with all required fields.",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Compelling article title, 50-70 chars" },
                    metaTitle: { type: "string", description: "SEO meta title under 60 chars" },
                    metaDescription: { type: "string", description: "Meta description under 155 chars" },
                    excerpt: { type: "string", description: "Two-sentence excerpt for blog index" },
                    readTime: { type: "string", description: "e.g. 12 min read" },
                    category: { type: "string", enum: ["Guides", "Education", "Security", "Market Analysis", "Technology", "DeFi"] },
                    tags: { type: "array", items: { type: "string" }, description: "4-5 relevant tags" },
                    content: { type: "string", description: "Full markdown article, 2500-3500 words, with tables, FAQ, Related Reading, and 8+ internal links" },
                  },
                  required: ["title", "metaTitle", "metaDescription", "excerpt", "readTime", "category", "tags", "content"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "publish_blog_post" } },
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        throw new Error(`AI API failed [${aiResponse.status}]: ${errText}`);
      }

      const aiData = await aiResponse.json();
      
      // Extract from tool call response
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          postData = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          // Try fixing escaped newlines
          try {
            const fixed = toolCall.function.arguments
              .replace(/\r\n/g, "\\n")
              .replace(/\r/g, "\\n");
            postData = JSON.parse(fixed);
          } catch (_) {
            console.error("Failed to parse tool call args:", toolCall.function.arguments.substring(0, 500));
            throw new Error(`Failed to parse tool call response: ${e.message}`);
          }
        }
      } else {
        // Fallback: try content field
        let rawContent = aiData.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("AI returned no tool call and no content");
        rawContent = rawContent.replace(/^```json\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        try {
          postData = JSON.parse(rawContent);
        } catch (e) {
          const fixed = rawContent.replace(/\r\n/g, "\\n").replace(/\r/g, "\\n").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
          postData = JSON.parse(fixed);
        }
      }

      console.log(`Parsed post: "${postData?.title}" | Words: ${countWords(postData?.content || "")} | Has FAQ: ${/##\s+FAQ/i.test(postData?.content || "")}`);
      qualityIssues = evaluatePostQuality(postData);
      if (qualityIssues.length === 0) break;

      console.warn(`Quality attempt ${attempt} failed: ${qualityIssues.join(" | ")}`);
    }

    if (qualityIssues.length > 0) {
      throw new Error(`Generated post rejected by quality gate: ${qualityIssues.join("; ")}`);
    }

    if (!postData?.title || !postData?.content) {
      throw new Error("Post data is missing title or content after generation");
    }

    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80)
      .replace(/-$/, "");

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      console.log(`Post with slug "${slug}" already exists, appending timestamp`);
    }

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    // Insert into database
    const { data: inserted, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        slug: finalSlug,
        title: postData.title,
        meta_title: postData.metaTitle,
        meta_description: postData.metaDescription,
        excerpt: postData.excerpt,
        author_name: author.name,
        author_role: author.role,
        author_bio: author.bio,
        author_credentials: author.credentials,
        read_time: postData.readTime || "10 min read",
        category: postData.category || "Guides",
        tags: postData.tags || [],
        content: postData.content,
        is_published: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`DB insert failed: ${insertError.message}`);
    }

    console.log(`Published: "${postData.title}" → /blog/${finalSlug}`);

    // Ping search engines
    const pingResults: Record<string, string> = {};

    // Collect all blog URLs for IndexNow
    const { data: allPosts } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("is_published", true);

    const blogUrls = (allPosts || []).map((p: any) => `${SITE}/blog/${p.slug}`);
    const allUrls = [
      `${SITE}/`,
      `${SITE}/blog`,
      ...blogUrls,
      `${SITE}/swap/sol-usdt`,
      `${SITE}/swap/btc-usdc`,
      `${SITE}/swap/hype-usdt`,
      `${SITE}/swap/eth-sol`,
      `${SITE}/swap/xrp-usdt`,
      `${SITE}/swap/bera-usdt`,
      `${SITE}/swap/tia-usdt`,
      `${SITE}/swap/monad-usdt`,
      `${SITE}/swap/pyusd-usdt`,
    ];

    // Google sitemap ping
    try {
      const g = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`);
      pingResults.google = g.ok ? "OK" : `${g.status}`;
    } catch (e) { pingResults.google = `error: ${e.message}`; }

    // Bing sitemap ping
    try {
      const b = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`);
      pingResults.bing = b.ok ? "OK" : `${b.status}`;
    } catch (e) { pingResults.bing = `error: ${e.message}`; }

    // IndexNow
    try {
      const inRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: "mrcglobalpay.com",
          key: INDEXNOW_KEY,
          keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
          urlList: [`${SITE}/blog/${finalSlug}`, `${SITE}/blog`, `${SITE}/sitemap.xml`],
        }),
      });
      pingResults.indexnow = inRes.ok || inRes.status === 202 ? "OK" : `${inRes.status}`;
    } catch (e) { pingResults.indexnow = `error: ${e.message}`; }

    return new Response(
      JSON.stringify({
        success: true,
        post: { slug: finalSlug, title: postData.title, author: author.name },
        ping: pingResults,
        totalPosts: (allPosts || []).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-publish error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
