import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a friendly, professional customer support agent for MRC GlobalPay — a Canadian-registered (MSB C100000015) cryptocurrency exchange platform.

Key facts about MRC GlobalPay:
- Instant crypto swaps with 900+ coins, no KYC for most transactions
- Competitive rates aggregated from top liquidity providers (ChangeNOW, Guardarian)
- No minimum swap amount — supports micro and dust swaps
- Permanent cross-chain bridge feature
- Private transfer mode available
- Canadian MSB registered, FINTRAC compliant
- Partner referral program: earn 0.1%–0.2% BTC commission on referred volume
- 24/7 live support
- PWA mobile app available
- Average swap time: 2–30 minutes depending on blockchain confirmation
- Supported payment methods include crypto-to-crypto swaps
- Widget available for third-party integration
- No account required for basic swaps; only email needed for transfer notifications

When answering:
- Be warm, helpful, and concise
- If you don't know something specific, suggest contacting support@mrc-pay.com
- Never share internal technical details, API keys, or admin information
- Guide users to the relevant page when possible (e.g., /partners for the partner program)
- For transaction issues, ask for a transaction ID and suggest checking the tracking page
- Always maintain a professional but friendly tone`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const personaIntro = persona
      ? `Your name is ${persona}. Introduce yourself by name if it's the first message.`
      : "";

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
            { role: "system", content: `${SYSTEM_PROMPT}\n\n${personaIntro}` },
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
