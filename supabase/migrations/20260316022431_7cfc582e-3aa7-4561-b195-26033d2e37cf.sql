
-- Fix 1: Make service_role policy more explicit (split into specific operations)
DROP POLICY IF EXISTS "Service role can manage blog posts" ON public.blog_posts;

CREATE POLICY "Service role can insert blog posts"
ON public.blog_posts FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update blog posts"
ON public.blog_posts FOR UPDATE TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete blog posts"
ON public.blog_posts FOR DELETE TO service_role
USING (true);

CREATE POLICY "Service role can select blog posts"
ON public.blog_posts FOR SELECT TO service_role
USING (true);

-- Fix 2: Add explicit SELECT deny for transfer_email_subscriptions
CREATE POLICY "Deny public select on transfer subscriptions"
ON public.transfer_email_subscriptions FOR SELECT TO anon, authenticated
USING (false);
