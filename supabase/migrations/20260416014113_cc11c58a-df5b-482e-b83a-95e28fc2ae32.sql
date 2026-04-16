-- Payout requests table
CREATE TABLE public.payout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  amount_btc NUMERIC NOT NULL DEFAULT 0,
  wallet_address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  payout_txid TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own payout requests"
ON public.payout_requests FOR SELECT
TO authenticated
USING (partner_id IN (
  SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Partners can insert own payout requests"
ON public.payout_requests FOR INSERT
TO authenticated
WITH CHECK (partner_id IN (
  SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all payout requests"
ON public.payout_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payout requests"
ON public.payout_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access payout_requests"
ON public.payout_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add Strategic Intervention columns to partner_transactions
ALTER TABLE public.partner_transactions
ADD COLUMN IF NOT EXISTS request_payload JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS provider_response JSONB DEFAULT '{}'::jsonb;