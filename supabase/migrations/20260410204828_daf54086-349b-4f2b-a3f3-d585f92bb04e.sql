DROP POLICY IF EXISTS "Service role can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Service role can update customers" ON public.customers;
DROP POLICY IF EXISTS "Service role can delete customers" ON public.customers;

CREATE POLICY "Service role can insert customers"
ON public.customers
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update customers"
ON public.customers
FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete customers"
ON public.customers
FOR DELETE
TO public
USING (auth.role() = 'service_role');