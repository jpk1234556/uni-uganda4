-- ============================================
-- PHASE 18: Universities Table Schema setup
-- ============================================

CREATE TABLE IF NOT EXISTS public.universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Everyone can view universities
DROP POLICY IF EXISTS "Universities are viewable by everyone" ON public.universities;
CREATE POLICY "Universities are viewable by everyone" 
    ON public.universities
    FOR SELECT 
    USING (true);

-- Only super admins can insert
DROP POLICY IF EXISTS "Super admins can insert universities" ON public.universities;
CREATE POLICY "Super admins can insert universities" 
    ON public.universities
    FOR INSERT 
    TO authenticated 
    WITH CHECK (public.get_user_role() = 'super_admin');

-- Only super admins can delete
DROP POLICY IF EXISTS "Super admins can delete universities" ON public.universities;
CREATE POLICY "Super admins can delete universities" 
    ON public.universities
    FOR DELETE 
    TO authenticated 
    USING (public.get_user_role() = 'super_admin');

-- Only super admins can update
DROP POLICY IF EXISTS "Super admins can update universities" ON public.universities;
CREATE POLICY "Super admins can update universities" 
    ON public.universities
    FOR UPDATE 
    TO authenticated 
    USING (public.get_user_role() = 'super_admin');
