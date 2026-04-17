DROP POLICY IF EXISTS "Public can insert affiliate leads" ON public.affiliate_leads;
CREATE POLICY "Public can insert affiliate leads"
  ON public.affiliate_leads
  FOR INSERT
  TO public
  WITH CHECK (true);
NOTIFY pgrst, 'reload schema';