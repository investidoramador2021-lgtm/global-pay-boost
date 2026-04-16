
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  mrc_transaction_id TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access webhook_deliveries"
  ON public.webhook_deliveries FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view all webhook deliveries"
  ON public.webhook_deliveries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view own webhook deliveries"
  ON public.webhook_deliveries FOR SELECT TO authenticated
  USING (partner_id IN (
    SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_webhook_deliveries_partner ON public.webhook_deliveries(partner_id);
CREATE INDEX idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_mrc_tx ON public.webhook_deliveries(mrc_transaction_id);
