CREATE TABLE public.partner_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  swap_transaction_id UUID NOT NULL REFERENCES public.swap_transactions(id) ON DELETE CASCADE,
  ref_code TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'referral_link',
  provider TEXT NOT NULL DEFAULT 'cn',
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  swap_amount NUMERIC NOT NULL DEFAULT 0,
  volume_usd NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0,
  commission_btc NUMERIC NOT NULL DEFAULT 0,
  btc_usd_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT partner_commissions_swap_unique UNIQUE (swap_transaction_id)
);

CREATE INDEX idx_partner_commissions_partner ON public.partner_commissions(partner_id, created_at DESC);
CREATE INDEX idx_partner_commissions_ref_code ON public.partner_commissions(ref_code);

ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own commissions"
  ON public.partner_commissions FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all commissions"
  ON public.partner_commissions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access partner_commissions"
  ON public.partner_commissions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

GRANT SELECT ON public.partner_commissions TO authenticated;
GRANT ALL ON public.partner_commissions TO service_role;

CREATE INDEX IF NOT EXISTS idx_swap_transactions_ref_code ON public.swap_transactions(ref_code) WHERE ref_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_swap_transactions_created_at ON public.swap_transactions(created_at DESC);

NOTIFY pgrst, 'reload schema';