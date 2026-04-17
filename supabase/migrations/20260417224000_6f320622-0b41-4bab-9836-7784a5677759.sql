-- Add approval workflow to partner_commissions
ALTER TABLE public.partner_commissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON public.partner_commissions(status);

-- Backfill: any rows that already exist were credited under the old auto-credit flow → mark approved
UPDATE public.partner_commissions
SET status = 'approved', approved_at = COALESCE(approved_at, created_at)
WHERE status = 'pending_review' AND created_at < now();

-- Hide pending commissions from partners; only approved ones are visible
DROP POLICY IF EXISTS "Partners can view own commissions" ON public.partner_commissions;
CREATE POLICY "Partners can view own approved commissions"
  ON public.partner_commissions
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved'
    AND partner_id IN (
      SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can update commissions (approve / reject)
DROP POLICY IF EXISTS "Admins can update commissions" ON public.partner_commissions;
CREATE POLICY "Admins can update commissions"
  ON public.partner_commissions
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));