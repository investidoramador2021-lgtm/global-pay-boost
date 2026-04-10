ALTER TABLE public.customers
ADD CONSTRAINT customers_email_not_blank CHECK (length(btrim(email)) > 0);