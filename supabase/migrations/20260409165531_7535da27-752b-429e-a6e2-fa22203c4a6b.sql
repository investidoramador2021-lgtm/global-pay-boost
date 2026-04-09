
CREATE TABLE public.swap_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  recipient_address text NOT NULL,
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_swap_transactions_recipient ON public.swap_transactions (recipient_address);
CREATE INDEX idx_swap_transactions_tx_id ON public.swap_transactions (transaction_id);

ALTER TABLE public.swap_transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (no auth required for this non-custodial service)
CREATE POLICY "Anyone can insert swap transactions"
  ON public.swap_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can look up by recipient address
CREATE POLICY "Anyone can read swap transactions"
  ON public.swap_transactions FOR SELECT
  TO anon, authenticated
  USING (true);
