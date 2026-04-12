
-- Partner profiles
CREATE TABLE public.partner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  btc_wallet TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own profile"
  ON public.partner_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can update own profile"
  ON public.partner_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert own profile"
  ON public.partner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on partner_profiles"
  ON public.partner_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Partner transactions (commission log)
CREATE TABLE public.partner_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  volume NUMERIC NOT NULL DEFAULT 0,
  commission_btc NUMERIC NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own transactions"
  ON public.partner_transactions FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access on partner_transactions"
  ON public.partner_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to generate referral code like "Smith1"
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_name TEXT;
  counter INT;
  candidate TEXT;
BEGIN
  base_name := initcap(trim(NEW.last_name));
  counter := 1;
  candidate := base_name || counter::text;
  WHILE EXISTS (SELECT 1 FROM public.partner_profiles WHERE referral_code = candidate) LOOP
    counter := counter + 1;
    candidate := base_name || counter::text;
  END LOOP;
  NEW.referral_code := candidate;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();
