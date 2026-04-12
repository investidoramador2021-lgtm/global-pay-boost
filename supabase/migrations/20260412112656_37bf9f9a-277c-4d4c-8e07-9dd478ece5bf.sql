CREATE POLICY "Admins can delete chat logs"
ON public.support_chat_logs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));