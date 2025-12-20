-- 1. Update Inventory Table (Add Price)
-- We use 'alter table' to add to your existing table
alter table inventory add column if not exists price numeric default 0;

-- 2. Create Clients Table
create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text null, -- e.g. "Seeb", "Muscat"
  phone text null,
  maps_link text null,
  status text default 'green', -- 'green', 'red'
  last_visited timestamptz default now(),
  created_at timestamptz default now()
);

-- 3. Create Visits Table (This is the History)
create table visits (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  visit_date timestamptz default now(),
  notes text null,
  total_due numeric default 0,
  status text default 'completed',
  created_at timestamptz default now()
);

-- 4. Create Visit Items Table (Details of what changed during a visit)
create table visit_items (
  id uuid default gen_random_uuid() primary key,
  visit_id uuid references visits(id) on delete cascade not null,
  product_id uuid references inventory(id) not null,
  expected_qty integer default 0,
  actual_qty integer default 0,
  restock_qty integer default 0,
  sold_qty integer default 0,
  created_at timestamptz default now()
);

-- 5. Enable Security (Allow public access for now)
alter table clients enable row level security;
alter table visits enable row level security;
alter table visit_items enable row level security;

create policy "Enable all access for clients" on clients for all using (true) with check (true);
create policy "Enable all access for visits" on visits for all using (true) with check (true);
create policy "Enable all access for visit_items" on visit_items for all using (true) with check (true);
