UPDATE public.pairs
SET is_valid = false,
    updated_at = now()
WHERE is_valid = true
  AND (length(from_ticker) < 3 OR length(to_ticker) < 3);