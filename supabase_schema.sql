-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients Table
create table clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  contact_person text,
  email text,
  current_balance decimal(10, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  unit_price decimal(10, 2) not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inventory Locations Table (Links Clients to Products, tracks stock at specific shop)
create table inventory_locations (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  current_stock_count integer default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(client_id, product_id)
);

-- Visits/Transactions Table
create table visits (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  visit_date timestamp with time zone default timezone('utc'::text, now()) not null,
  total_due decimal(10, 2) default 0.00,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Visit Items Table (To track details of each visit per product if needed, though prompt implied simple logic, let's make it robust)
create table visit_items (
  id uuid default uuid_generate_v4() primary key,
  visit_id uuid references visits(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  items_sold integer not null,
  restock_amount integer not null,
  unit_price_at_sale decimal(10, 2) not null, -- Store price at time of sale in case it changes
  total_cost decimal(10, 2) generated always as (items_sold * unit_price_at_sale) stored
);
