
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions (endpoint);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert push subscriptions"
ON public.push_subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read push subscriptions by endpoint"
ON public.push_subscriptions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can delete their push subscription"
ON public.push_subscriptions
FOR DELETE
TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on push_subscriptions"
ON public.push_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
