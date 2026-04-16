
-- Table: partner_api_keys
CREATE TABLE public.partner_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  key_id text NOT NULL UNIQUE DEFAULT 'pk_live_' || substr(encode(extensions.gen_random_bytes(16), 'hex'), 1, 24),
  api_secret_hash text NOT NULL,
  webhook_url text DEFAULT '',
  ip_whitelist text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own API keys"
  ON public.partner_api_keys FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Partners can insert own API keys"
  ON public.partner_api_keys FOR INSERT TO authenticated
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Partners can update own API keys"
  ON public.partner_api_keys FOR UPDATE TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Partners can delete own API keys"
  ON public.partner_api_keys FOR DELETE TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all API keys"
  ON public.partner_api_keys FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access partner_api_keys"
  ON public.partner_api_keys FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Table: partner_totp_secrets
CREATE TABLE public.partner_totp_secrets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  encrypted_secret text NOT NULL,
  is_verified boolean NOT NULL DEFAULT false,
  backup_codes text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_totp_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own TOTP secret"
  ON public.partner_totp_secrets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own TOTP secret"
  ON public.partner_totp_secrets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TOTP secret"
  ON public.partner_totp_secrets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own TOTP secret"
  ON public.partner_totp_secrets FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access partner_totp_secrets"
  ON public.partner_totp_secrets FOR ALL TO service_role
  USING (true) WITH CHECK (true);
