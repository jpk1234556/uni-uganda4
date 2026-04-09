-- ============================================
-- PHASE 20: Restore Owner Self-Service
-- ============================================

-- Fix: Allow owners to insert their own hostels and map it specifically to themselves
DROP POLICY IF EXISTS "Owners can insert own hostels" ON public.hostels;
CREATE POLICY "Owners can insert own hostels" 
ON public.hostels FOR INSERT 
WITH CHECK (
  auth.uid() = owner_id AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'hostel_owner'
);

-- Fix: Allow owners to update their own hostels
DROP POLICY IF EXISTS "Owners can update own hostels" ON public.hostels;
CREATE POLICY "Owners can update own hostels" 
ON public.hostels FOR UPDATE 
USING (
  auth.uid() = owner_id AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'hostel_owner'
);

-- Fix: Allow owners to insert room types for their own hostels
DROP POLICY IF EXISTS "Owners can insert room types" ON public.room_types;
CREATE POLICY "Owners can insert room types"
ON public.room_types FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.hostels
    WHERE hostels.id = hostel_id AND hostels.owner_id = auth.uid()
  ) AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'hostel_owner'
);

-- Fix: Allow owners to update room types for their own hostels
DROP POLICY IF EXISTS "Owners can update room types" ON public.room_types;
CREATE POLICY "Owners can update room types"
ON public.room_types FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.hostels
    WHERE hostels.id = hostel_id AND hostels.owner_id = auth.uid()
  ) AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'hostel_owner'
);

-- Fix: Allow owners to delete their room types
DROP POLICY IF EXISTS "Owners can delete room types" ON public.room_types;
CREATE POLICY "Owners can delete room types"
ON public.room_types FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.hostels
    WHERE hostels.id = hostel_id AND hostels.owner_id = auth.uid()
  ) AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'hostel_owner'
);
