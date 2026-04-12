
ALTER TABLE public.partner_profiles 
  ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'pending_verification',
  ADD COLUMN verification_token TEXT,
  ADD COLUMN verification_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_partner_profiles_verification ON public.partner_profiles (verification_status, created_at) 
  WHERE verification_status = 'pending_verification';
