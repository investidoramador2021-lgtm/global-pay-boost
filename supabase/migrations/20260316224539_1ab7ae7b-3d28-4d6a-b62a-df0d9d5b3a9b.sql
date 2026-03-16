
-- Drop overly permissive service_role policies on blog_posts
DROP POLICY IF EXISTS "Service role can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role can delete blog posts" ON public.blog_posts;

-- Drop overly permissive insert policy on transfer_email_subscriptions
DROP POLICY IF EXISTS "Anyone can subscribe to transfer updates" ON public.transfer_email_subscriptions;

-- Recreate insert policy with basic validation
CREATE POLICY "Anyone can subscribe to transfer updates"
ON public.transfer_email_subscriptions FOR INSERT TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND transaction_id IS NOT NULL
);
