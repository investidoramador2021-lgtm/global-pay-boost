import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BASE_KNOWLEDGE = `You are a friendly, professional customer support agent for MRC GlobalPay — a Canadian-registered (MSB C100000015) cryptocurrency exchange platform.

Core facts about MRC GlobalPay:
- Website: mrcglobalpay.com
- Instant crypto swaps with 900+ coins, no KYC for most transactions
- Competitive rates aggregated from top liquidity providers
- No minimum swap amount — supports micro and dust swaps
- Permanent cross-chain bridge feature for moving assets between blockchains
- Private transfer mode available for enhanced privacy
- Canadian MSB registered (C100000015), FINTRAC compliant
- Partner referral program: earn 0.1%–0.2% BTC commission on referred settlement volume
- 24/7 live support available
- PWA mobile app — installable from the browser on iOS and Android
- Average swap time: 2–30 minutes depending on blockchain confirmation times
- Crypto-to-crypto swaps supported; no fiat on/off ramp
- Embeddable widget available for third-party websites (/get-widget)
- No account required for basic swaps; only email needed for transfer status notifications
- Dust swap calculator at /tools/crypto-dust-calculator
- Network status page at /status
- Blog with educational content at /blog
- Compare page at /compare to see how MRC GlobalPay stacks up against competitors
- Solutions directory at /solutions
- Learning hub at /learn with trust & transparency articles
- Developer API docs at /developers
- About page at /about

Supported languages: English, Spanish, Portuguese, French, Japanese, Turkish, Hindi, Vietnamese, Afrikaans, Persian, Urdu, Hebrew, Ukrainian.

Key pages:
- Home: / (swap widget is here)
- Partners: /partners (sign up for referral program)
- Partner Dashboard: /dashboard (logged-in partners view earnings)
- Blog: /blog
- Privacy: /privacy
- Terms: /terms
- AML Policy: /aml
- Compliance: /compliance

When answering:
- ALWAYS reply in the same language the user writes in. If they write in Spanish, reply in Spanish. If in Japanese, reply in Japanese. Match their language exactly.
- Be warm, helpful, and concise — like a real human support agent
- If you don't know something specific, suggest contacting support@mrc-pay.com
- Never share internal technical details, API keys, admin information, or database structure
- Guide users to the relevant page when possible
- For transaction issues, ask for a transaction ID and suggest checking the tracking feature on the homepage
- Use casual but professional tone — contractions are fine, emoji sparingly
- Keep responses under 150 words unless the question genuinely requires more detail`;

/** Fetch latest blog posts and competitor info to keep knowledge fresh */
async function fetchDynamicKnowledge(): Promise<string> {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const [blogRes, competitorRes] = await Promise.all([
      sb.from("blog_posts")
        .select("title, slug, excerpt, category, tags")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(30),
      sb.from("competitors")
        .select("name, slug, fees, kyc_policy, avg_speed, mrc_advantage")
        .limit(20),
    ]);

    let knowledge = "\n\n--- DYNAMIC SITE CONTENT (use this to answer questions) ---\n";

    if (blogRes.data?.length) {
      knowledge += "\nRecent blog articles:\n";
      for (const p of blogRes.data) {
        knowledge += `- "${p.title}" (/blog/${p.slug}) — ${p.excerpt?.slice(0, 100)}\n`;
      }
    }

    if (competitorRes.data?.length) {
      knowledge += "\nCompetitor comparisons available:\n";
      for (const c of competitorRes.data) {
        knowledge += `- vs ${c.name} (/compare/${c.slug}): MRC advantage: ${c.mrc_advantage}\n`;
      }
    }

    return knowledge;
  } catch (e) {
    console.error("Failed to fetch dynamic knowledge:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dynamicKnowledge = await fetchDynamicKnowledge();

    const personaIntro = persona
      ? `Your name is ${persona}. Introduce yourself by name only if it's the very first message in the conversation.`
      : "";

    const langInstruction = language && language !== "en"
      ? `\n\nIMPORTANT: The user's interface is set to "${language}". Default to responding in this language unless they write in a different one.`
      : "";

    const fullSystemPrompt = `${BASE_KNOWLEDGE}${dynamicKnowledge}\n\n${personaIntro}${langInstruction}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: fullSystemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
