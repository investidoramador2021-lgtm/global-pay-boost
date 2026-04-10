DROP POLICY IF EXISTS "Service role can read customers" ON public.customers;

CREATE POLICY "Service role can read customers"
ON public.customers
FOR SELECT
TO public
USING (auth.role() = 'service_role');