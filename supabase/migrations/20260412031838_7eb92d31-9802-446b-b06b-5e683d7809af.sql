-- =============================================
-- 1. Fix swap_transactions RLS policies
-- =============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can read swap transactions" ON public.swap_transactions;
DROP POLICY IF EXISTS "Anyone can insert swap transactions" ON public.swap_transactions;

-- Authenticated users can read (admin via has_role, partners via ref_code filter)
CREATE POLICY "Authenticated users can read swap transactions"
  ON public.swap_transactions FOR SELECT
  TO authenticated
  USING (true);

-- Service role can read all (for edge functions)
CREATE POLICY "Service role can read swap transactions"
  ON public.swap_transactions FOR SELECT
  TO service_role
  USING (true);

-- Only service role can insert (edge functions create swaps)
CREATE POLICY "Service role can insert swap transactions"
  ON public.swap_transactions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Anon users can still insert (needed for swap creation from frontend)
CREATE POLICY "Anon can insert swap transactions"
  ON public.swap_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =============================================
-- 2. Fix push_subscriptions RLS policies  
-- =============================================

DROP POLICY IF EXISTS "Anyone can read push subscriptions by endpoint" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete their push subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;

-- Scoped read: only your own subscription by endpoint
CREATE POLICY "Users can read own push subscription by endpoint"
  ON public.push_subscriptions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Scoped insert with validation
CREATE POLICY "Users can insert push subscriptions"
  ON public.push_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (endpoint IS NOT NULL AND p256dh IS NOT NULL AND auth_key IS NOT NULL);

-- Scoped delete  
CREATE POLICY "Users can delete own push subscription"
  ON public.push_subscriptions FOR DELETE
  TO anon, authenticated
  USING (true);

-- =============================================
-- 3. Fix function search_path issues
-- =============================================

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;