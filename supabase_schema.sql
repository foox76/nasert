-- Create the inventory table
create table inventory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text null,
  stock integer default 0,
  unit text null,
  min_level integer default 0,
  status text null, -- 'good', 'low', 'critical'
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) is good practice, but for starting out we can allow public access if you want, 
-- or better: allow access to authenticated users. 
-- For now, to match your keys (anon), we'll create a policy that allows everything for anon (public) users
-- CAUTION: This makes your DB public. Ideally you'd want auth.
alter table inventory enable row level security;

create policy "Enable all access for all users" on inventory
for all using (true) with check (true);

-- Insert some dummy data to match what you had
insert into inventory (name, category, stock, unit, min_level, status) values
  ('Premium Matcha Powder', 'Raw Material', 45, 'kg', 10, 'good'),
  ('Latte Mix Base', 'Raw Material', 8, 'bags', 15, 'low'),
  ('Takeaway Cups (12oz)', 'Packaging', 1200, 'pcs', 500, 'good'),
  ('Bamboo Whisks', 'Equipment', 3, 'pcs', 5, 'critical'),
  ('Sugar Syrup', 'Raw Material', 20, 'bottles', 10, 'good');
