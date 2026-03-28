-- =================================================================================
-- PHASE 17: GUARANTEE STUDENT VISIBILITY FOR ADMIN-PUBLISHED HOSTELS
-- Goal: Ensure approved hostels are always readable by all clients.
-- =================================================================================

-- Enforce RLS and explicit public-read policy for approved hostels.
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved hostels" ON public.hostels;
CREATE POLICY "Anyone can view approved hostels"
ON public.hostels
FOR SELECT
USING (status = 'approved');

-- Keep explicit super admin management controls in case older migrations differ.
DROP POLICY IF EXISTS "Super admin can insert hostels" ON public.hostels;
CREATE POLICY "Super admin can insert hostels"
ON public.hostels
FOR INSERT
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin');

DROP POLICY IF EXISTS "Super admin can update hostels" ON public.hostels;
CREATE POLICY "Super admin can update hostels"
ON public.hostels
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin');

DROP POLICY IF EXISTS "Super admin can delete hostels" ON public.hostels;
CREATE POLICY "Super admin can delete hostels"
ON public.hostels
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin');
