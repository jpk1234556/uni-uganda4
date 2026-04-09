-- Phase 22: Booking + Payment Enablement
-- Ensures students can create bookings/payments and owners/admins can process booking statuses.

alter table if exists public.bookings enable row level security;
alter table if exists public.payments enable row level security;

-- ------------------------------------------------------------------
-- Bookings policies
-- ------------------------------------------------------------------

drop policy if exists "Students can create own bookings" on public.bookings;
create policy "Students can create own bookings"
  on public.bookings
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'student'
        and u.is_active = true
    )
    and exists (
      select 1
      from public.hostels h
      where h.id = hostel_id
        and h.status = 'approved'
    )
    and exists (
      select 1
      from public.room_types rt
      where rt.id = room_type_id
        and rt.hostel_id = hostel_id
        and rt.available > 0
    )
  );

drop policy if exists "Students can update own pending bookings" on public.bookings;
create policy "Students can update own pending bookings"
  on public.bookings
  for update
  to authenticated
  using (
    student_id = auth.uid()
    and status = 'pending'
  )
  with check (
    student_id = auth.uid()
  );

drop policy if exists "Owners can update bookings for their hostels" on public.bookings;
create policy "Owners can update bookings for their hostels"
  on public.bookings
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.hostels h
      where h.id = hostel_id
        and h.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.hostels h
      where h.id = hostel_id
        and h.owner_id = auth.uid()
    )
  );

drop policy if exists "Super admins can update all bookings" on public.bookings;
create policy "Super admins can update all bookings"
  on public.bookings
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'super_admin'
        and u.is_active = true
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'super_admin'
        and u.is_active = true
    )
  );

-- ------------------------------------------------------------------
-- Payments policies
-- ------------------------------------------------------------------

drop policy if exists "Students can create own payment records" on public.payments;
create policy "Students can create own payment records"
  on public.payments
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.student_id = auth.uid()
    )
  );

drop policy if exists "Super admins can update all payments" on public.payments;
create policy "Super admins can update all payments"
  on public.payments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'super_admin'
        and u.is_active = true
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'super_admin'
        and u.is_active = true
    )
  );
