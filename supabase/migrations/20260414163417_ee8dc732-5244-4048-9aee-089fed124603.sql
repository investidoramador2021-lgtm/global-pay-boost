
-- Table to track all Loan & Earn client submissions for admin visibility
CREATE TABLE public.lend_earn_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_type TEXT NOT NULL CHECK (tx_type IN ('loan', 'earn')),
  external_tx_id TEXT DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  currency TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  loan_currency TEXT DEFAULT '',
  loan_amount NUMERIC DEFAULT 0,
  ltv_percent NUMERIC DEFAULT 0,
  apy_percent NUMERIC DEFAULT 0,
  deposit_address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'initiated',
  language TEXT NOT NULL DEFAULT 'en',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.lend_earn_transactions ENABLE ROW LEVEL SECURITY;

-- Admin can see all
CREATE POLICY "Admins can view all lend_earn_transactions"
  ON public.lend_earn_transactions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role full access (edge functions)
CREATE POLICY "Service role full access lend_earn_transactions"
  ON public.lend_earn_transactions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Anon/authenticated can insert (guest submissions)
CREATE POLICY "Anyone can insert lend_earn_transactions"
  ON public.lend_earn_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view own records
CREATE POLICY "Users can view own lend_earn_transactions"
  ON public.lend_earn_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
