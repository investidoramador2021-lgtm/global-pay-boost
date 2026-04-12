
-- 1. Invoices: replace open SELECT with token-scoped access
DROP POLICY IF EXISTS "Public can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public read invoices" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;

-- Allow SELECT only when token matches (for /pay and /status pages)
CREATE POLICY "invoices_select_by_token"
ON public.invoices FOR SELECT
TO anon, authenticated
USING (
  token = current_setting('request.headers', true)::json->>'x-invoice-token'
  OR token = current_setting('request.headers', true)::json->>'x-invoice-token'
  OR public.has_role(auth.uid(), 'admin')
);

-- 2. Push subscriptions: restrict SELECT and DELETE to owner by endpoint
DROP POLICY IF EXISTS "Allow public read push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_select_policy" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can read push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public delete push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_delete_policy" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_select_own"
ON public.push_subscriptions FOR SELECT
TO anon, authenticated
USING (
  endpoint = current_setting('request.headers', true)::json->>'x-push-endpoint'
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "push_subscriptions_delete_own"
ON public.push_subscriptions FOR DELETE
TO anon, authenticated
USING (
  endpoint = current_setting('request.headers', true)::json->>'x-push-endpoint'
  OR public.has_role(auth.uid(), 'admin')
);

-- 3. Support chat logs: restrict SELECT to admin only
DROP POLICY IF EXISTS "Allow authenticated read support_chat_logs" ON public.support_chat_logs;
DROP POLICY IF EXISTS "support_chat_logs_select_policy" ON public.support_chat_logs;
DROP POLICY IF EXISTS "Authenticated users can view chat logs" ON public.support_chat_logs;

CREATE POLICY "support_chat_logs_select_admin"
ON public.support_chat_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
