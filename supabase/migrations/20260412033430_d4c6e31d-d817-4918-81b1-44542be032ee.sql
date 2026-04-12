
CREATE TABLE public.support_chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  persona_name text NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  page_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.support_chat_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous visitors)
CREATE POLICY "Anyone can insert chat logs"
  ON public.support_chat_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated (admin) can read
CREATE POLICY "Authenticated can read chat logs"
  ON public.support_chat_logs FOR SELECT
  TO authenticated
  USING (true);
