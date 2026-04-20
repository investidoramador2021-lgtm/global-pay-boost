import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ── Base32 encode/decode ── */
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buf: Uint8Array): string {
  let bits = 0, value = 0, out = "";
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_CHARS[(value << (5 - bits)) & 31];
  return out;
}
function base32Decode(s: string): Uint8Array {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of s.toUpperCase()) {
    const i = BASE32_CHARS.indexOf(c);
    if (i === -1) continue;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}

/* ── HOTP/TOTP via Web Crypto ── */
async function hmacSha1(key: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, msg));
}
async function generateTOTP(secret: Uint8Array, time: number = Math.floor(Date.now() / 1000), period = 30): Promise<string> {
  const counter = Math.floor(time / period);
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, BigInt(counter));
  const hmac = await hmacSha1(secret, new Uint8Array(buf));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset + 1] << 16 | hmac[offset + 2] << 8 | hmac[offset + 3]) % 1000000;
  return code.toString().padStart(6, "0");
}

/* ── Generate backup codes ── */
function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    codes.push(Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase());
  }
  return codes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "setup" && req.method === "POST") {
      // Check if already set up
      const { data: existing } = await svc.from("partner_totp_secrets").select("id, is_verified").eq("user_id", user.id).maybeSingle();
      if (existing?.is_verified) {
        return new Response(JSON.stringify({ error: "TOTP already configured" }), { status: 409, headers: corsHeaders });
      }

      // Generate secret
      const secretBytes = crypto.getRandomValues(new Uint8Array(20));
      const secret = base32Encode(secretBytes);
      const backupCodes = generateBackupCodes();
      const issuer = "MRC Global Pay";
      const label = encodeURIComponent(user.email || "partner");
      const otpauthUrl = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

      // Upsert secret
      if (existing) {
        await svc.from("partner_totp_secrets").update({ encrypted_secret: secret, backup_codes: backupCodes, is_verified: false }).eq("user_id", user.id);
      } else {
        await svc.from("partner_totp_secrets").insert({ user_id: user.id, encrypted_secret: secret, backup_codes: backupCodes, is_verified: false });
      }

      return new Response(JSON.stringify({ otpauthUrl, secret, backupCodes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify" && req.method === "POST") {
      const { code } = await req.json();
      if (!code || typeof code !== "string" || code.length !== 6) {
        return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers: corsHeaders });
      }

      const { data: totpRow } = await svc.from("partner_totp_secrets").select("*").eq("user_id", user.id).maybeSingle();
      if (!totpRow) return new Response(JSON.stringify({ error: "No TOTP configured" }), { status: 404, headers: corsHeaders });

      const secretBytes = base32Decode(totpRow.encrypted_secret);
      const now = Math.floor(Date.now() / 1000);
      // Check current and adjacent windows
      for (const offset of [-1, 0, 1]) {
        const expected = await generateTOTP(secretBytes, now + offset * 30);
        if (code === expected) {
          if (!totpRow.is_verified) {
            await svc.from("partner_totp_secrets").update({ is_verified: true }).eq("user_id", user.id);
          }
          return new Response(JSON.stringify({ valid: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      // Check backup codes
      const backupCodes: string[] = totpRow.backup_codes || [];
      const idx = backupCodes.indexOf(code.toUpperCase());
      if (idx !== -1) {
        backupCodes.splice(idx, 1);
        await svc.from("partner_totp_secrets").update({ backup_codes: backupCodes }).eq("user_id", user.id);
        return new Response(JSON.stringify({ valid: true, backupCodeUsed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ valid: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "status" && req.method === "GET") {
      const { data } = await svc.from("partner_totp_secrets").select("is_verified").eq("user_id", user.id).maybeSingle();
      return new Response(JSON.stringify({ configured: !!data?.is_verified }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
