-- 002_rls_policies.sql

alter table members       enable row level security;
alter table eyeballs      enable row level security;
alter table attendance    enable row level security;
alter table contributions enable row level security;
alter table expenses      enable row level security;
alter table events        enable row level security;
alter table media         enable row level security;

-- PUBLIC READ (no login required — used by transparency page)
create policy "public read members"       on members       for select using (deleted_at is null);
create policy "public read eyeballs"      on eyeballs      for select using (true);
create policy "public read attendance"    on attendance    for select using (true);
create policy "public read contributions" on contributions for select using (true);
create policy "public read expenses"      on expenses      for select using (true);
create policy "public read events"        on events        for select using (true);
create policy "public read media"         on media         for select using (true);

-- ADMIN INSERT
create policy "admin insert members"       on members       for insert to authenticated with check (true);
create policy "admin insert eyeballs"      on eyeballs      for insert to authenticated with check (true);
create policy "admin insert attendance"    on attendance    for insert to authenticated with check (true);
create policy "admin insert contributions" on contributions for insert to authenticated with check (true);
create policy "admin insert expenses"      on expenses      for insert to authenticated with check (true);
create policy "admin insert events"        on events        for insert to authenticated with check (true);
create policy "admin insert media"         on media         for insert to authenticated with check (true);

-- ADMIN UPDATE
create policy "admin update members"       on members       for update to authenticated using (true);
create policy "admin update eyeballs"      on eyeballs      for update to authenticated using (true);
create policy "admin update attendance"    on attendance    for update to authenticated using (true);
create policy "admin update contributions" on contributions for update to authenticated using (true);
create policy "admin update expenses"      on expenses      for update to authenticated using (true);
create policy "admin update events"        on events        for update to authenticated using (true);
create policy "admin update media"         on media         for update to authenticated using (true);

-- ADMIN DELETE
create policy "admin delete members"       on members       for delete to authenticated using (true);
create policy "admin delete eyeballs"      on eyeballs      for delete to authenticated using (true);
create policy "admin delete attendance"    on attendance    for delete to authenticated using (true);
create policy "admin delete contributions" on contributions for delete to authenticated using (true);
create policy "admin delete expenses"      on expenses      for delete to authenticated using (true);
create policy "admin delete events"        on events        for delete to authenticated using (true);
create policy "admin delete media"         on media         for delete to authenticated using (true);