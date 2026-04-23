-- Lite API webhook callbacks support
ALTER TABLE public.lite_api_swaps
  ADD COLUMN IF NOT EXISTS webhook_url text,
  ADD COLUMN IF NOT EXISTS webhook_secret text,
  ADD COLUMN IF NOT EXISTS last_webhook_state text;

CREATE INDEX IF NOT EXISTS lite_api_swaps_mrc_tx_id_idx
  ON public.lite_api_swaps (mrc_tx_id);

CREATE INDEX IF NOT EXISTS lite_api_swaps_webhook_idx
  ON public.lite_api_swaps (mrc_tx_id)
  WHERE webhook_url IS NOT NULL;