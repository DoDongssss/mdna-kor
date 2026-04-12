-- 001_init_schema.sql

create extension if not exists "pgcrypto";

-- MEMBERS
create table if not exists members (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  nickname       text,
  contact_number text,
  is_active      boolean not null default true,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now()
);

-- EYEBALLS (Club Meetups)
create table if not exists eyeballs (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  date        date not null,
  location    text not null,
  notes       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ATTENDANCE
create type attendance_status as enum ('present', 'absent');

create table if not exists attendance (
  id          uuid primary key default gen_random_uuid(),
  eyeball_id  uuid not null references eyeballs(id) on delete cascade,
  member_id   uuid not null references members(id)  on delete cascade,
  status      attendance_status not null default 'absent',
  created_at  timestamptz not null default now(),
  unique (eyeball_id, member_id)
);

-- CONTRIBUTIONS  (eyeball_id nullable — supports out-of-meetup donations)
create table if not exists contributions (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references members(id)  on delete restrict,
  eyeball_id     uuid          references eyeballs(id) on delete set null,
  amount         numeric(10,2) not null check (amount > 0),
  notes          text,
  payment_method text,
  created_at     timestamptz not null default now()
);
create index on contributions(member_id);
create index on contributions(eyeball_id);

-- EXPENSES  (eyeball_id nullable)
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  amount      numeric(10,2) not null check (amount > 0),
  description text,
  date        date not null default current_date,
  eyeball_id  uuid references eyeballs(id) on delete set null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- EVENTS
create type event_type as enum ('meetup', 'charity_ride', 'announcement', 'other');

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        event_type not null default 'announcement',
  date        date not null,
  description text,
  location    text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- MEDIA
create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  type        text not null default 'image',
  related_to  text,
  caption     text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- VIEWS
create or replace view fund_summary as
select
  (select coalesce(sum(amount),0) from contributions) as total_contributions,
  (select coalesce(sum(amount),0) from expenses)       as total_expenses,
  (select coalesce(sum(amount),0) from contributions) -
  (select coalesce(sum(amount),0) from expenses)       as net_balance;

create or replace view eyeball_summary as
select
  e.id, e.title, e.date, e.location,
  count(distinct a.member_id) filter (where a.status = 'present') as present_count,
  count(distinct a.member_id) filter (where a.status = 'absent')  as absent_count,
  coalesce(sum(c.amount), 0)                                       as total_collected
from eyeballs e
left join attendance    a on a.eyeball_id = e.id
left join contributions c on c.eyeball_id = e.id
group by e.id, e.title, e.date, e.location;