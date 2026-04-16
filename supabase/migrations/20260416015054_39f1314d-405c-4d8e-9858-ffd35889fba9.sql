-- Compliance holds table for flagged transactions
CREATE TABLE public.compliance_holds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_transaction_id UUID REFERENCES public.partner_transactions(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  hold_type TEXT NOT NULL DEFAULT 'hold',
  provider_case_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'action_required',
  upload_token TEXT DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  upload_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '72 hours'),
  admin_notes TEXT DEFAULT '',
  partner_notified_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all compliance holds"
ON public.compliance_holds FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert compliance holds"
ON public.compliance_holds FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update compliance holds"
ON public.compliance_holds FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access compliance_holds"
ON public.compliance_holds FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Compliance documents metadata
CREATE TABLE public.compliance_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hold_id UUID NOT NULL REFERENCES public.compliance_holds(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL DEFAULT '',
  uploaded_by TEXT NOT NULL DEFAULT 'admin',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view compliance documents"
ON public.compliance_documents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert compliance documents"
ON public.compliance_documents FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access compliance_documents"
ON public.compliance_documents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Storage bucket for compliance documents
INSERT INTO storage.buckets (id, name, public) VALUES ('compliance-docs', 'compliance-docs', false);

CREATE POLICY "Admins can upload compliance docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'compliance-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view compliance docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'compliance-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access compliance-docs bucket"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'compliance-docs')
WITH CHECK (bucket_id = 'compliance-docs');