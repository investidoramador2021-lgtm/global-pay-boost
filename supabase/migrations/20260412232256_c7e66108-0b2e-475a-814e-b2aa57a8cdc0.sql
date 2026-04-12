
-- Drop the header-based policy (won't work with JS client)
DROP POLICY IF EXISTS "invoices_select_by_token" ON public.invoices;

-- Create a security-definer function for token-based lookup
CREATE OR REPLACE FUNCTION public.get_invoice_by_token(p_token text)
RETURNS SETOF public.invoices
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.invoices WHERE token = p_token LIMIT 1;
$$;

-- Only admins can SELECT directly on the invoices table
CREATE POLICY "invoices_select_admin_only"
ON public.invoices FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Also fix push_subscriptions to use simpler approach - service_role only for SELECT
DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_select_service"
ON public.push_subscriptions FOR SELECT
TO service_role
USING (true);

-- Fix push_subscriptions DELETE - service_role only
DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_delete_service"
ON public.push_subscriptions FOR DELETE
TO service_role
USING (true);
