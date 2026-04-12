
-- Compliance alerts table
CREATE TABLE public.compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partner_profiles(id) ON DELETE SET NULL,
  transaction_ref text NOT NULL,
  alert_type text NOT NULL DEFAULT 'high_value',
  amount numeric NOT NULL DEFAULT 0,
  from_currency text NOT NULL DEFAULT '',
  to_currency text NOT NULL DEFAULT '',
  source_wallet text NOT NULL DEFAULT '',
  destination_wallet text NOT NULL DEFAULT '',
  exchange_rate numeric NOT NULL DEFAULT 0,
  partner_legal_name text NOT NULL DEFAULT '',
  partner_email text NOT NULL DEFAULT '',
  msb_reference text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view compliance alerts"
  ON public.compliance_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access compliance_alerts"
  ON public.compliance_alerts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Audit links table
CREATE TABLE public.audit_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.compliance_alerts(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage audit links"
  ON public.audit_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access audit_links"
  ON public.audit_links FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Immutable audit access logs
CREATE TABLE public.audit_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_link_id uuid NOT NULL REFERENCES public.audit_links(id) ON DELETE CASCADE,
  accessed_by uuid NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text DEFAULT '',
  user_agent text DEFAULT ''
);

ALTER TABLE public.audit_access_logs ENABLE ROW LEVEL SECURITY;

-- Read-only for admins (immutable: no UPDATE, no DELETE)
CREATE POLICY "Admins can view audit access logs"
  ON public.audit_access_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit access logs"
  ON public.audit_access_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access audit_access_logs"
  ON public.audit_access_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- MSB reference generator
CREATE OR REPLACE FUNCTION public.generate_msb_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.msb_reference := 'MSB-' || to_char(now(), 'YYYYMMDD') || '-' || substr(NEW.id::text, 1, 8);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compliance_msb_ref
  BEFORE INSERT ON public.compliance_alerts
  FOR EACH ROW EXECUTE FUNCTION public.generate_msb_reference();
