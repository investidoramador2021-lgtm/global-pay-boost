
-- Pairs table for pre-registered trading combinations
CREATE TABLE public.pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_ticker TEXT NOT NULL,
  to_ticker TEXT NOT NULL,
  partner_fee_percent NUMERIC NOT NULL DEFAULT 0.4,
  seo_template_id SMALLINT NOT NULL DEFAULT 1,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  seo_h1 TEXT NOT NULL DEFAULT '',
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_ticker, to_ticker)
);

-- Indexes for fast lookups
CREATE INDEX idx_pairs_from_ticker ON public.pairs (from_ticker);
CREATE INDEX idx_pairs_to_ticker ON public.pairs (to_ticker);
CREATE INDEX idx_pairs_synced ON public.pairs (last_synced_at);

-- RLS
ALTER TABLE public.pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pairs"
  ON public.pairs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access pairs"
  ON public.pairs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Sync engine health state (singleton row)
CREATE TABLE public.sync_engine_state (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY,
  last_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pairs_count INTEGER NOT NULL DEFAULT 0,
  last_batch_size INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_engine_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sync state"
  ON public.sync_engine_state FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access sync_engine_state"
  ON public.sync_engine_state FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed the singleton row
INSERT INTO public.sync_engine_state (id) VALUES (1);
