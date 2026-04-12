-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex') UNIQUE,
  payer_name TEXT NOT NULL,
  payer_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  fiat_amount NUMERIC NOT NULL,
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  crypto_amount NUMERIC NOT NULL,
  crypto_ticker TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  language TEXT NOT NULL DEFAULT 'en',
  rate_locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '168 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Public can read invoices by token (for pay/status pages)
CREATE POLICY "Anyone can read invoice by token"
  ON public.invoices
  FOR SELECT
  USING (true);

-- Public can insert invoices (widget creates without auth)
CREATE POLICY "Anyone can insert invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (true);

-- No public update/delete (only service role)

-- Index on token for fast lookups
CREATE INDEX idx_invoices_token ON public.invoices(token);
CREATE INDEX idx_invoices_invoice_id ON public.invoices(invoice_id);