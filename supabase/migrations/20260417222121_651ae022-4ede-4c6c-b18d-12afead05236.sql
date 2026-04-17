GRANT INSERT ON TABLE public.affiliate_leads TO anon;
GRANT INSERT, SELECT, UPDATE ON TABLE public.affiliate_leads TO authenticated;
GRANT ALL ON TABLE public.affiliate_leads TO service_role;
NOTIFY pgrst, 'reload schema';