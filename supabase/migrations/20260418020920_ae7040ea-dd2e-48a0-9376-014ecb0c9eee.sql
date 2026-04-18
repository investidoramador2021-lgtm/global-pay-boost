CREATE OR REPLACE FUNCTION public.get_valid_pair_slugs()
RETURNS TABLE(from_ticker text, to_ticker text, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
  SELECT from_ticker, to_ticker, updated_at
  FROM public.pairs
  WHERE is_valid = true;
$$;