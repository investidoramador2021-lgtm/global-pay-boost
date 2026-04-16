
-- Developer profiles for opt-in developer tier
CREATE TABLE public.developer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  totp_configured BOOLEAN NOT NULL DEFAULT false,
  tier TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id)
);

ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own developer profile"
  ON public.developer_profiles FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Partners can insert own developer profile"
  ON public.developer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Partners can update own developer profile"
  ON public.developer_profiles FOR UPDATE
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all developer profiles"
  ON public.developer_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access developer_profiles"
  ON public.developer_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
