CREATE TABLE public.transfer_email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transfer_email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (no auth required for this swap platform)
CREATE POLICY "Anyone can subscribe to transfer updates"
  ON public.transfer_email_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
