
CREATE TABLE public.compliance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hold_id uuid REFERENCES public.compliance_holds(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL DEFAULT 'hold_created',
  actor text NOT NULL DEFAULT 'system',
  details text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view compliance logs"
  ON public.compliance_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert compliance logs"
  ON public.compliance_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access compliance_logs"
  ON public.compliance_logs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_compliance_logs_hold_id ON public.compliance_logs(hold_id);
CREATE INDEX idx_compliance_logs_event_type ON public.compliance_logs(event_type);
