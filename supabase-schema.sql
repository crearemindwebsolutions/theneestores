-- ==============================================================================
-- THENEE HERBAL E-COMMERCE - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. PROFILES TABLE (Stores user account info, delivery addresses & perks)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  email text,
  addresses jsonb default '[]'::jsonb,
  reward_points integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Profiles RLS Policies: users can view and edit only their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Trigger: Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.phone, new.raw_user_meta_data->>'phone', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ORDERS TABLE (Stores customer orders, items, speed post dispatch info)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  delivery_fee numeric default 0,
  total_amount numeric not null,
  shipping_address jsonb not null,
  payment_method text not null,
  payment_status text default 'paid',
  order_status text default 'Confirmed',
  tracking_awb text,
  courier text default 'India Post Speed Post',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders
alter table public.orders enable row level security;

-- Orders RLS Policies:
-- Authenticated users can view their own orders
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id or auth.uid() is null);

-- Authenticated and guest checkout users can insert orders
create policy "Anyone can insert an order"
  on public.orders for insert
  with check (true);


-- 3. INQUIRIES TABLE (Stores contact form & wholesale inquiries from ContactPage)
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text,
  inquiry_type text default 'General Inquiries',
  message text not null,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on inquiries
alter table public.inquiries enable row level security;

-- Anyone can submit an inquiry
create policy "Anyone can submit an inquiry"
  on public.inquiries for insert
  with check (true);


-- 4. REVIEWS TABLE (Customer feedback & testimonials)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on reviews
alter table public.reviews enable row level security;

-- Everyone can read reviews
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

-- Authenticated users can insert reviews
create policy "Authenticated users can submit reviews"
  on public.reviews for insert
  with check (auth.uid() is not null);
