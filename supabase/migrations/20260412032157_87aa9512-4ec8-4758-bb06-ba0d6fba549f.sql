-- Allow anon users to read swap_transactions for tracking feature
CREATE POLICY "Anon can read swap transactions for tracking"
  ON public.swap_transactions FOR SELECT
  TO anon
  USING (true);