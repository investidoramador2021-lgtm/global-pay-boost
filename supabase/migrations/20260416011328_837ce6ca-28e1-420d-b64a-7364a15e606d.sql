
-- Create partner_balances table
CREATE TABLE public.partner_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  available_btc NUMERIC NOT NULL DEFAULT 0,
  pending_btc NUMERIC NOT NULL DEFAULT 0,
  total_earned_btc NUMERIC NOT NULL DEFAULT 0,
  last_credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id)
);

ALTER TABLE public.partner_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own balance" ON public.partner_balances
  FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all balances" ON public.partner_balances
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access partner_balances" ON public.partner_balances
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Add columns to partner_transactions
ALTER TABLE public.partner_transactions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS changenow_order_id TEXT,
  ADD COLUMN IF NOT EXISTS mrc_transaction_id TEXT DEFAULT ('MRC-' || substr(gen_random_uuid()::text, 1, 12));

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_partner_tx_changenow_id ON public.partner_transactions(changenow_order_id);
CREATE INDEX IF NOT EXISTS idx_partner_tx_mrc_id ON public.partner_transactions(mrc_transaction_id);
CREATE INDEX IF NOT EXISTS idx_partner_balances_partner ON public.partner_balances(partner_id);
