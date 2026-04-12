-- Ensure one partner profile per auth user
ALTER TABLE public.partner_profiles ADD CONSTRAINT partner_profiles_user_id_unique UNIQUE (user_id);