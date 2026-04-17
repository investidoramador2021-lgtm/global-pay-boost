-- Create affiliate_leads table to map ref tokens back to payout wallets
CREATE TABLE public.affiliate_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  btc_wallet TEXT NOT NULL,
  ref_token TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'dark',
  source TEXT NOT NULL DEFAULT 'affiliates_page',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique on ref_token so the same email+wallet maps to one lead
CREATE UNIQUE INDEX idx_affiliate_leads_ref_token ON public.affiliate_leads(ref_token);
CREATE INDEX idx_affiliate_leads_email ON public.affiliate_leads(lower(email));
CREATE INDEX idx_affiliate_leads_created_at ON public.affiliate_leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.affiliate_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (public) can insert their own affiliate signup from the public page
CREATE POLICY "Anyone can insert affiliate leads"
  ON public.affiliate_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND btc_wallet IS NOT NULL
    AND ref_token IS NOT NULL
    AND length(email) <= 320
    AND length(btc_wallet) <= 128
    AND length(ref_token) <= 64
  );

-- Only admins can view affiliate leads (PII protection)
CREATE POLICY "Admins can view affiliate leads"
  ON public.affiliate_leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update / delete
CREATE POLICY "Admins can update affiliate leads"
  ON public.affiliate_leads
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete affiliate leads"
  ON public.affiliate_leads
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role full access
CREATE POLICY "Service role full access affiliate_leads"
  ON public.affiliate_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER update_affiliate_leads_updated_at
  BEFORE UPDATE ON public.affiliate_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customers_updated_at();