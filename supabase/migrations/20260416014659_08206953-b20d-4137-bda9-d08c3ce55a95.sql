ALTER TABLE public.partner_transactions
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'api';