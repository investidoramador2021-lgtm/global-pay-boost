-- Rate-limit & velocity tracking for Public Lite API
CREATE TABLE IF NOT EXISTS public.lite_api_swaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT NOT NULL,
  destination_wallet TEXT NOT NULL,
  from_ticker TEXT NOT NULL,
  to_ticker TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  country_code TEXT,
  outcome TEXT NOT NULL DEFAULT 'created',
  provider_tx_id TEXT,
  mrc_tx_id TEXT
);

CREATE INDEX IF NOT EXISTS lite_api_swaps_ip_created_idx
  ON public.lite_api_swaps (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS lite_api_swaps_wallet_created_idx
  ON public.lite_api_swaps (destination_wallet, created_at DESC);

ALTER TABLE public.lite_api_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access lite_api_swaps"
  ON public.lite_api_swaps FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view lite_api_swaps"
  ON public.lite_api_swaps FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Destination wallet blacklist
CREATE TABLE IF NOT EXISTS public.lite_api_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'abuse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lite_api_blacklist_wallet_idx
  ON public.lite_api_blacklist (wallet_address);

ALTER TABLE public.lite_api_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access lite_api_blacklist"
  ON public.lite_api_blacklist FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage lite_api_blacklist"
  ON public.lite_api_blacklist FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));