-- ── Enable RLS on all tables ──────────────────────────────────────

alter table members       enable row level security;
alter table eyeballs      enable row level security;
alter table attendance    enable row level security;
alter table contributions enable row level security;
alter table expenses      enable row level security;
alter table events        enable row level security;
alter table media         enable row level security;

-- ── MEMBERS ───────────────────────────────────────────────────────

-- Public can read active, non-deleted members (for transparency page)
create policy "Public can read members"
  on members for select
  using (deleted_at is null);

-- Only authenticated users can insert/update/delete
create policy "Authenticated can insert members"
  on members for insert
  to authenticated
  with check (true);

create policy "Authenticated can update members"
  on members for update
  to authenticated
  using (true);

create policy "Authenticated can delete members"
  on members for delete
  to authenticated
  using (true);

-- ── EYEBALLS ──────────────────────────────────────────────────────

create policy "Public can read eyeballs"
  on eyeballs for select
  using (true);

create policy "Authenticated can insert eyeballs"
  on eyeballs for insert
  to authenticated
  with check (true);

create policy "Authenticated can update eyeballs"
  on eyeballs for update
  to authenticated
  using (true);

create policy "Authenticated can delete eyeballs"
  on eyeballs for delete
  to authenticated
  using (true);

-- ── ATTENDANCE ────────────────────────────────────────────────────

create policy "Public can read attendance"
  on attendance for select
  using (true);

create policy "Authenticated can insert attendance"
  on attendance for insert
  to authenticated
  with check (true);

create policy "Authenticated can update attendance"
  on attendance for update
  to authenticated
  using (true);

create policy "Authenticated can delete attendance"
  on attendance for delete
  to authenticated
  using (true);

-- ── CONTRIBUTIONS ─────────────────────────────────────────────────

-- Public read for transparency page
create policy "Public can read contributions"
  on contributions for select
  using (true);

create policy "Authenticated can insert contributions"
  on contributions for insert
  to authenticated
  with check (true);

create policy "Authenticated can update contributions"
  on contributions for update
  to authenticated
  using (true);

create policy "Authenticated can delete contributions"
  on contributions for delete
  to authenticated
  using (true);

-- ── EXPENSES ──────────────────────────────────────────────────────

-- Public read for transparency page
create policy "Public can read expenses"
  on expenses for select
  using (true);

create policy "Authenticated can insert expenses"
  on expenses for insert
  to authenticated
  with check (true);

create policy "Authenticated can update expenses"
  on expenses for update
  to authenticated
  using (true);

create policy "Authenticated can delete expenses"
  on expenses for delete
  to authenticated
  using (true);

-- ── EVENTS ────────────────────────────────────────────────────────

-- Public read for events page
create policy "Public can read events"
  on events for select
  using (true);

create policy "Authenticated can insert events"
  on events for insert
  to authenticated
  with check (true);

create policy "Authenticated can update events"
  on events for update
  to authenticated
  using (true);

create policy "Authenticated can delete events"
  on events for delete
  to authenticated
  using (true);

-- ── MEDIA ─────────────────────────────────────────────────────────

create policy "Public can read media"
  on media for select
  using (true);

create policy "Authenticated can insert media"
  on media for insert
  to authenticated
  with check (true);

create policy "Authenticated can delete media"
  on media for delete
  to authenticated
  using (true);