-- ── Drop all existing policies ─────────────────────────────────────

-- members
drop policy if exists "Public can read members"              on members;
drop policy if exists "Authenticated can insert members"     on members;
drop policy if exists "Authenticated can update members"     on members;
drop policy if exists "Authenticated can delete members"     on members;
drop policy if exists "admin insert members"                 on members;
drop policy if exists "admin update members"                 on members;
drop policy if exists "admin delete members"                 on members;

-- eyeballs
drop policy if exists "Public can read eyeballs"             on eyeballs;
drop policy if exists "Authenticated can insert eyeballs"    on eyeballs;
drop policy if exists "Authenticated can update eyeballs"    on eyeballs;
drop policy if exists "Authenticated can delete eyeballs"    on eyeballs;
drop policy if exists "admin insert eyeballs"                on eyeballs;
drop policy if exists "admin update eyeballs"                on eyeballs;
drop policy if exists "admin delete eyeballs"                on eyeballs;

-- attendance
drop policy if exists "Public can read attendance"           on attendance;
drop policy if exists "Authenticated can insert attendance"  on attendance;
drop policy if exists "Authenticated can update attendance"  on attendance;
drop policy if exists "Authenticated can delete attendance"  on attendance;
drop policy if exists "admin insert attendance"              on attendance;
drop policy if exists "admin update attendance"              on attendance;
drop policy if exists "admin delete attendance"              on attendance;

-- contributions
drop policy if exists "Public can read contributions"        on contributions;
drop policy if exists "Authenticated can insert contributions" on contributions;
drop policy if exists "Authenticated can update contributions" on contributions;
drop policy if exists "Authenticated can delete contributions" on contributions;
drop policy if exists "admin insert contributions"           on contributions;
drop policy if exists "admin update contributions"           on contributions;
drop policy if exists "admin delete contributions"           on contributions;

-- expenses
drop policy if exists "Public can read expenses"             on expenses;
drop policy if exists "Authenticated can insert expenses"    on expenses;
drop policy if exists "Authenticated can update expenses"    on expenses;
drop policy if exists "Authenticated can delete expenses"    on expenses;
drop policy if exists "admin insert expenses"                on expenses;
drop policy if exists "admin update expenses"                on expenses;
drop policy if exists "admin delete expenses"                on expenses;

-- events
drop policy if exists "Public can read events"               on events;
drop policy if exists "Authenticated can insert events"      on events;
drop policy if exists "Authenticated can update events"      on events;
drop policy if exists "Authenticated can delete events"      on events;
drop policy if exists "admin insert events"                  on events;
drop policy if exists "admin update events"                  on events;
drop policy if exists "admin delete events"                  on events;

-- media
drop policy if exists "Public can read media"                on media;
drop policy if exists "Authenticated can insert media"       on media;
drop policy if exists "Authenticated can delete media"       on media;
drop policy if exists "admin insert media"                   on media;
drop policy if exists "admin update media"                   on media;
drop policy if exists "admin delete media"                   on media;

-- ── MEMBERS ───────────────────────────────────────────────────────

create policy "members_select_public"
  on members for select
  using (deleted_at is null);

create policy "members_insert_admin"
  on members for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "members_update_admin"
  on members for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "members_delete_admin"
  on members for delete
  to authenticated
  using (auth.uid() is not null);

-- ── EYEBALLS ──────────────────────────────────────────────────────

create policy "eyeballs_select_public"
  on eyeballs for select
  using (true);

create policy "eyeballs_insert_admin"
  on eyeballs for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "eyeballs_update_admin"
  on eyeballs for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "eyeballs_delete_admin"
  on eyeballs for delete
  to authenticated
  using (auth.uid() is not null);

-- ── ATTENDANCE ────────────────────────────────────────────────────

create policy "attendance_select_public"
  on attendance for select
  using (true);

create policy "attendance_insert_admin"
  on attendance for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "attendance_update_admin"
  on attendance for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "attendance_delete_admin"
  on attendance for delete
  to authenticated
  using (auth.uid() is not null);

-- ── CONTRIBUTIONS ─────────────────────────────────────────────────

create policy "contributions_select_public"
  on contributions for select
  using (true);

create policy "contributions_insert_admin"
  on contributions for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "contributions_update_admin"
  on contributions for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "contributions_delete_admin"
  on contributions for delete
  to authenticated
  using (auth.uid() is not null);

-- ── EXPENSES ──────────────────────────────────────────────────────

create policy "expenses_select_public"
  on expenses for select
  using (true);

create policy "expenses_insert_admin"
  on expenses for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "expenses_update_admin"
  on expenses for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "expenses_delete_admin"
  on expenses for delete
  to authenticated
  using (auth.uid() is not null);

-- ── EVENTS ────────────────────────────────────────────────────────

create policy "events_select_public"
  on events for select
  using (true);

create policy "events_insert_admin"
  on events for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "events_update_admin"
  on events for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "events_delete_admin"
  on events for delete
  to authenticated
  using (auth.uid() is not null);

-- ── MEDIA ─────────────────────────────────────────────────────────

create policy "media_select_public"
  on media for select
  using (true);

create policy "media_insert_admin"
  on media for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "media_update_admin"
  on media for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "media_delete_admin"
  on media for delete
  to authenticated
  using (auth.uid() is not null);