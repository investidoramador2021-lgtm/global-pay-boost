ALTER TABLE public.invoices
  ADD COLUMN service_fee_percent numeric NOT NULL DEFAULT 1.5,
  ADD COLUMN service_fee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN net_crypto_amount numeric NOT NULL DEFAULT 0;