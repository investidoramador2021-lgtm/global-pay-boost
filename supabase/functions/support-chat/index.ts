import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { BASE_KNOWLEDGE } from "./knowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
