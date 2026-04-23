WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY lower(from_ticker), lower(to_ticker)
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id
    ) AS rn
  FROM public.pairs
)
DELETE FROM public.pairs p
USING ranked r
WHERE p.id = r.id AND r.rn > 1;

UPDATE public.pairs SET from_ticker = lower(from_ticker) WHERE from_ticker <> lower(from_ticker);
UPDATE public.pairs SET to_ticker = lower(to_ticker) WHERE to_ticker <> lower(to_ticker);

CREATE UNIQUE INDEX IF NOT EXISTS pairs_lower_from_to_uniq
  ON public.pairs (lower(from_ticker), lower(to_ticker));