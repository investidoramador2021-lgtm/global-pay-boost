
CREATE TABLE public.partner_update_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_update_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on partner_update_tokens"
  ON public.partner_update_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_partner_update_tokens_token ON public.partner_update_tokens (token);
CREATE INDEX idx_partner_update_tokens_user ON public.partner_update_tokens (user_id);
