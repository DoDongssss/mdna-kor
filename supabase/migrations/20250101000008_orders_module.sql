-- ORDER BATCHES
create type item_type as enum ('Jersey', 'T-shirt', 'Cap', 'Sticker', 'Other');

create table if not exists order_batches (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text,
  item_type      item_type not null default 'Jersey',
  price_per_unit numeric(10,2) not null check (price_per_unit > 0),
  deadline       date,
  created_at     timestamptz not null default now()
);

-- ORDER ITEMS (one per member per batch)
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid not null references order_batches(id) on delete cascade,
  member_id   uuid not null references members(id) on delete restrict,
  quantity    int not null default 1 check (quantity > 0),
  total_amount numeric(10,2) not null,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (batch_id, member_id)
);

-- ORDER PAYMENTS (installments per order item)
create table if not exists order_payments (
  id            uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  amount        numeric(10,2) not null check (amount > 0),
  notes         text,
  created_at    timestamptz not null default now()
);

-- Indexes
create index on order_items(batch_id);
create index on order_items(member_id);
create index on order_payments(order_item_id);

-- RLS
alter table order_batches  enable row level security;
alter table order_items    enable row level security;
alter table order_payments enable row level security;

-- Public read
create policy "order_batches_select_public"
  on order_batches for select using (true);

create policy "order_items_select_public"
  on order_items for select using (true);

create policy "order_payments_select_public"
  on order_payments for select using (true);

-- Admin write
create policy "order_batches_insert_admin"
  on order_batches for insert to authenticated
  with check (auth.uid() is not null);

create policy "order_batches_update_admin"
  on order_batches for update to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "order_batches_delete_admin"
  on order_batches for delete to authenticated
  using (auth.uid() is not null);

create policy "order_items_insert_admin"
  on order_items for insert to authenticated
  with check (auth.uid() is not null);

create policy "order_items_update_admin"
  on order_items for update to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "order_items_delete_admin"
  on order_items for delete to authenticated
  using (auth.uid() is not null);

create policy "order_payments_insert_admin"
  on order_payments for insert to authenticated
  with check (auth.uid() is not null);

create policy "order_payments_delete_admin"
  on order_payments for delete to authenticated
  using (auth.uid() is not null);