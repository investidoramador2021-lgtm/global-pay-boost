CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  latest_trade_direction TEXT,
  latest_from_currency TEXT,
  latest_to_currency TEXT,
  latest_payment_method TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX customers_email_lower_unique_idx
ON public.customers (lower(email));

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read customers"
ON public.customers
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can insert customers"
ON public.customers
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update customers"
ON public.customers
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete customers"
ON public.customers
FOR DELETE
TO service_role
USING (true);

CREATE OR REPLACE FUNCTION public.update_customers_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_customers_updated_at();