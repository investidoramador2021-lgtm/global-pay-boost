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

/** Build a page-aware instruction so the bot adapts its opening + focus by route */
function buildPageContext(pageUrl?: string): string {
  if (!pageUrl) return "";
  const path = pageUrl.toLowerCase();

  // Strip language prefix like /pt/, /es/, etc.
  const stripped = path.replace(/^\/(en|es|pt|fr|ja|tr|hi|vi|af|fa|ur|he|uk)(\/|$)/, "/");

  if (stripped.startsWith("/affiliates") || stripped.startsWith("/partners") || stripped.startsWith("/referral")) {
    return `\n\n────────── CURRENT PAGE CONTEXT: AFFILIATE / PARTNER PROGRAM ──────────
The visitor is on the AFFILIATES / PARTNERS page (${pageUrl}). Your PRIMARY GOAL on this page is conversion to a partner sign-up.

OPENING POSTURE:
- Greet them as a prospective partner, not a swap customer.
- Lead with the value prop: "Earn 50% of MRC's revenue share — paid in BTC — every time someone swaps through your widget or referral link. No KYC, no minimums, no chargebacks."
- Mention the embeddable widget is fully translated into 13 languages — this is a real differentiator competitors do not offer, and it lets partners convert visitors in their own language.

WHAT TO PUSH:
1. Register a partner account at /affiliates (email + BTC payout wallet — that's it).
2. Generate a personal ref link or embed the multilingual widget on their site/blog.
3. Track earnings live on /dashboard, with weekly BTC payouts to the wallet on file.

KEY FACTS TO USE:
- Commissions are credited only after admin review (this protects partners from chargebacks/clawbacks).
- The widget's ?lang= parameter auto-translates labels to the visitor's language — perfect for international audiences.
- Partner accounts use TOTP 2FA and 30-min idle session timeout for security.
- BTC payout wallet is locked at signup (Source-Back policy) — cannot be changed without re-verification.
- Affiliate URLs format: https://mrcglobalpay.com/?ref={code}.
- Embed snippet format: <iframe src="https://mrcglobalpay.com/embed/widget?mode=dark&ref={code}&lang={lang}" />

OBJECTIONS TO HANDLE:
- "Will my visitors trust it?" → MRC is a registered Canadian MSB (FINTRAC C100000015), non-custodial, 900+ assets. The widget shows live rates and a Powered-by link.
- "How do I get paid?" → BTC, weekly, directly on-chain to your registered wallet. No invoicing, no thresholds.
- "What if I'm not technical?" → A plain ref link works — no coding needed. The widget is one copy-paste iframe.

End most replies with a soft CTA like: "Want me to walk you through generating your widget snippet?" or "Ready to register? It takes under 60 seconds."`;
  }

  if (stripped.startsWith("/dashboard") || stripped.startsWith("/partner-portal")) {
    return `\n\n────────── CURRENT PAGE CONTEXT: PARTNER DASHBOARD ──────────
The visitor is a logged-in partner viewing their dashboard (${pageUrl}). Treat them as an existing partner, not a prospect.
- Help with: reading their commission ledger, understanding pending vs approved status, generating new widget snippets in different languages, requesting BTC payouts, rotating API keys, setting up TOTP 2FA.
- Pending commissions are normal — they are reviewed by the admin team (typically within 48 hours) before being credited to the available BTC balance. This is a fraud-protection step that protects partners.
- If they ask "why is my commission still pending?" → reassure them: pending = scanned and queued for admin review; approved = credited to available BTC; rejected = explain the rejection reason was logged.`;
  }

  if (stripped.startsWith("/lend")) {
    return `\n\n────────── CURRENT PAGE CONTEXT: LEND & EARN ──────────
The visitor is on /lend (Loan / Earn portal). Focus on collateral selection, LTV explanation (50/70/80%), Source-Back payout policy, and the mandatory account + email-2FA for position management.`;
  }

  if (stripped.startsWith("/embed/widget")) {
    return `\n\n────────── CURRENT PAGE CONTEXT: EMBED WIDGET PREVIEW ──────────
The visitor is previewing the embeddable swap widget. They are likely a developer or partner evaluating it. Focus on the widget's multilingual support (?lang=), theme support (?mode=light|dark), affiliate attribution (?ref=), and the one-line iframe snippet from /affiliates.`;
  }

  if (stripped.startsWith("/blog")) {
    return `\n\n────────── CURRENT PAGE CONTEXT: BLOG ──────────
Visitor is reading educational content. Be helpful and tie answers back to the relevant product (Exchange / Buy / Bridge / Private / Loan / Earn / Affiliates) without being pushy.`;
  }

  return `\n\n────────── CURRENT PAGE CONTEXT ──────────\nVisitor is currently on: ${pageUrl}. Tailor opening focus to this page when relevant.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona, language, pageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dynamicKnowledge = await fetchDynamicKnowledge();
    const pageContext = buildPageContext(pageUrl);

    const personaIntro = persona
      ? `Your name is ${persona}. Introduce yourself by name only if it's the very first message in the conversation.`
      : "";

    const langInstruction = language && language !== "en"
      ? `\n\nIMPORTANT: The user's interface is set to "${language}". Default to responding in this language unless they write in a different one.`
      : "";

    const fullSystemPrompt = `${BASE_KNOWLEDGE}${dynamicKnowledge}${pageContext}\n\n${personaIntro}${langInstruction}`;

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
