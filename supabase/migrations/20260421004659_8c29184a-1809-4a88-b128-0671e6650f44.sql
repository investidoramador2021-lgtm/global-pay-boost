-- Add `kind` column to swap_transactions to distinguish widget tab origin
-- Values: 'swap' (Exchange), 'buy' (Guardarian on-ramp), 'sell' (Guardarian off-ramp),
-- 'private' (PrivateTransferTab), 'bridge' (PermanentBridgeTab fixed-address)
ALTER TABLE public.swap_transactions
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'swap';

CREATE INDEX IF NOT EXISTS idx_swap_transactions_kind ON public.swap_transactions(kind);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_created_at ON public.swap_transactions(created_at DESC);