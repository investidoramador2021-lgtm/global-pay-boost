DROP POLICY IF EXISTS "Anyone can insert affiliate leads" ON public.affiliate_leads;

CREATE POLICY "Public can insert affiliate leads"
  ON public.affiliate_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND btc_wallet IS NOT NULL
    AND ref_token IS NOT NULL
    AND length(email) BETWEEN 3 AND 320
    AND length(btc_wallet) BETWEEN 8 AND 128
    AND length(ref_token) BETWEEN 4 AND 64
  );

NOTIFY pgrst, 'reload schema';