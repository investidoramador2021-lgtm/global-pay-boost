REVOKE ALL ON FUNCTION public.update_customers_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_customers_updated_at() TO postgres, service_role;