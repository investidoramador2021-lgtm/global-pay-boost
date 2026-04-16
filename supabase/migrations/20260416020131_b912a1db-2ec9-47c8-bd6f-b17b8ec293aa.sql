
CREATE TABLE public.exchange_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker text NOT NULL,
  name text NOT NULL,
  network text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  token_contract text DEFAULT NULL,
  has_external_id boolean NOT NULL DEFAULT false,
  is_stable boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  supports_fixed_rate boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  tier smallint NOT NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ticker, network)
);

ALTER TABLE public.exchange_assets ENABLE ROW LEVEL SECURITY;

-- Public read for SEO pages
CREATE POLICY "Anyone can read active assets"
  ON public.exchange_assets FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admin full management
CREATE POLICY "Admins can manage assets"
  ON public.exchange_assets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role full access
CREATE POLICY "Service role full access exchange_assets"
  ON public.exchange_assets FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_exchange_assets_ticker ON public.exchange_assets(ticker);
CREATE INDEX idx_exchange_assets_active ON public.exchange_assets(is_active);
CREATE INDEX idx_exchange_assets_tier ON public.exchange_assets(tier);
