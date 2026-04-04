CREATE TABLE public.competitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  min_swap_usd text NOT NULL DEFAULT '10.00',
  kyc_policy text NOT NULL DEFAULT 'No Account',
  avg_speed text NOT NULL DEFAULT 'Instant',
  fees text NOT NULL DEFAULT 'Variable',
  primary_weakness text NOT NULL DEFAULT '',
  mrc_advantage text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read competitors"
ON public.competitors
FOR SELECT
USING (true);

CREATE INDEX idx_competitors_slug ON public.competitors (slug);