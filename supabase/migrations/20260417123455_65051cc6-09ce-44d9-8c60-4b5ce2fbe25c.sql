ALTER TABLE public.swap_transactions
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'cn',
  ADD COLUMN IF NOT EXISTS mrc_tx_id text;

CREATE INDEX IF NOT EXISTS idx_swap_transactions_provider ON public.swap_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_mrc_tx_id ON public.swap_transactions(mrc_tx_id);