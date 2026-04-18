-- The CREATE OR REPLACE in the prior migration failed for the paginated overload
-- because we tried to rename its params. Drop & recreate using the original
-- (p_offset, p_limit) order so existing callers keep working.
DROP FUNCTION IF EXISTS public.get_valid_pair_slugs(integer, integer);

CREATE FUNCTION public.get_valid_pair_slugs(p_offset integer DEFAULT 0, p_limit integer DEFAULT NULL)
RETURNS TABLE(from_ticker text, to_ticker text, updated_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout TO '120s'
AS $function$
  SELECT from_ticker, to_ticker, updated_at
  FROM public.pairs
  WHERE is_valid = true
    AND length(from_ticker) >= 3
    AND length(to_ticker) >= 3
  ORDER BY id
  LIMIT p_limit
  OFFSET COALESCE(p_offset, 0);
$function$;