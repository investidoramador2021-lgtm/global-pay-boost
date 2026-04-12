-- Add ref_code column to swap_transactions to link swaps to partner referrals
ALTER TABLE public.swap_transactions ADD COLUMN ref_code text DEFAULT NULL;

-- Index for fast partner dashboard lookups
CREATE INDEX idx_swap_transactions_ref_code ON public.swap_transactions (ref_code) WHERE ref_code IS NOT NULL;