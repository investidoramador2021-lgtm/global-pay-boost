-- Link affiliate signups to a partner account once they register
ALTER TABLE public.affiliate_leads
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partner_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_affiliate_leads_partner_id ON public.affiliate_leads(partner_id);

-- Partners can view their own affiliate leads (so the dashboard can show
-- the widgets/links that drive their commissions).
CREATE POLICY "Partners can view own affiliate leads"
  ON public.affiliate_leads
  FOR SELECT
  TO authenticated
  USING (
    partner_id IN (
      SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
    )
  );

-- Partners can claim (link) unclaimed leads matching their email when registering.
CREATE POLICY "Partners can claim own affiliate leads"
  ON public.affiliate_leads
  FOR UPDATE
  TO authenticated
  USING (
    partner_id IS NULL
    AND lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    partner_id IN (
      SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
    )
    AND lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );