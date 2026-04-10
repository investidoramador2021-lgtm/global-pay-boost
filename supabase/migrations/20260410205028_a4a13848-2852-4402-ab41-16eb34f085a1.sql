CREATE OR REPLACE FUNCTION public.upsert_customer_capture(
  p_email TEXT,
  p_latest_trade_direction TEXT DEFAULT NULL,
  p_latest_from_currency TEXT DEFAULT NULL,
  p_latest_to_currency TEXT DEFAULT NULL,
  p_latest_payment_method TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS public.customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer public.customers;
BEGIN
  INSERT INTO public.customers (
    email,
    latest_trade_direction,
    latest_from_currency,
    latest_to_currency,
    latest_payment_method,
    metadata
  )
  VALUES (
    lower(trim(p_email)),
    p_latest_trade_direction,
    p_latest_from_currency,
    p_latest_to_currency,
    p_latest_payment_method,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT ((lower(email))) DO UPDATE
  SET
    latest_trade_direction = EXCLUDED.latest_trade_direction,
    latest_from_currency = EXCLUDED.latest_from_currency,
    latest_to_currency = EXCLUDED.latest_to_currency,
    latest_payment_method = EXCLUDED.latest_payment_method,
    metadata = COALESCE(public.customers.metadata, '{}'::jsonb) || COALESCE(EXCLUDED.metadata, '{}'::jsonb),
    updated_at = now()
  RETURNING * INTO v_customer;

  RETURN v_customer;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_customer_capture(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_customer_capture(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;