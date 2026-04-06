
CREATE TABLE public.x_bot_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id text NOT NULL,
  reply_tweet_id text,
  author_username text NOT NULL,
  matched_token text NOT NULL,
  match_type text NOT NULL DEFAULT 'search',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_x_bot_logs_author ON public.x_bot_logs (author_username);
CREATE INDEX idx_x_bot_logs_created ON public.x_bot_logs (created_at);

ALTER TABLE public.x_bot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on x_bot_logs"
ON public.x_bot_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
