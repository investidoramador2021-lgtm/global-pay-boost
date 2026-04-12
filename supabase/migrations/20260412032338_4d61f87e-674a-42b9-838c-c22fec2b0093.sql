-- Remove redundant policies created during over-hardening
DROP POLICY IF EXISTS "Authenticated users can read swap transactions" ON public.swap_transactions;
DROP POLICY IF EXISTS "Service role can read swap transactions" ON public.swap_transactions;
DROP POLICY IF EXISTS "Anon can read swap transactions for tracking" ON public.swap_transactions;

-- Restore the original clean policy
CREATE POLICY "Anyone can read swap transactions"
  ON public.swap_transactions FOR SELECT
  TO anon, authenticated
  USING (true);