-- ==============================================================================
-- THENEE HERBAL E-COMMERCE - PRODUCTION LIVE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/fdfqtfocdqvontrwkclf
-- 2. Click "SQL Editor" in the left navigation sidebar
-- 3. Click "+ New query"
-- 4. Paste this entire script and click "Run" (Green button or Ctrl+Enter)
-- ==============================================================================

-- 1. PROFILES TABLE (Stores customer accounts, delivery addresses & green points)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  email text,
  addresses jsonb default '[]'::jsonb,
  reward_points integer default 100,
  profile_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure column exists if table was created previously
alter table public.profiles add column if not exists profile_completed boolean default false;

alter table public.profiles enable row level security;

drop policy if exists "Anyone can read profiles for store admin and account" on public.profiles;
create policy "Anyone can read profiles for store admin and account" 
  on public.profiles for select 
  using (true);

drop policy if exists "Users and admin can update profiles" on public.profiles;
create policy "Users and admin can update profiles" 
  on public.profiles for update 
  using (true);

drop policy if exists "Users and admin can insert profiles" on public.profiles;
create policy "Users and admin can insert profiles" 
  on public.profiles for insert 
  with check (true);

-- Auto-create profile trigger on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.phone, new.raw_user_meta_data->>'phone', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    email = coalesce(excluded.email, public.profiles.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sync all existing auth.users directly into public.profiles
insert into public.profiles (id, full_name, phone, email, reward_points, profile_completed, created_at, updated_at)
select 
  id,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)) as full_name,
  coalesce(phone, raw_user_meta_data->>'phone', '') as phone,
  coalesce(email, '') as email,
  100 as reward_points,
  coalesce((raw_user_meta_data->>'profile_completed')::boolean, false) as profile_completed,
  created_at,
  now() as updated_at
from auth.users
on conflict (id) do update set
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  phone = coalesce(excluded.phone, public.profiles.phone),
  email = coalesce(excluded.email, public.profiles.email);


-- 2. ORDERS TABLE (Customer orders, consignment tracking, Speed Post dispatch)
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

alter table public.orders enable row level security;

drop policy if exists "Allow select on orders" on public.orders;
create policy "Allow select on orders" on public.orders for select using (true);

drop policy if exists "Allow insert on orders" on public.orders;
create policy "Allow insert on orders" on public.orders for insert with check (true);

drop policy if exists "Allow update on orders" on public.orders;
create policy "Allow update on orders" on public.orders for update using (true);

drop policy if exists "Allow delete on orders" on public.orders;
create policy "Allow delete on orders" on public.orders for delete using (true);


-- 3. INQUIRIES TABLE (Contact page messages, wholesale requests, CRM)
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text,
  inquiry_type text default 'Retail Order & Tracking',
  message text not null,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inquiries enable row level security;

drop policy if exists "Allow select on inquiries" on public.inquiries;
create policy "Allow select on inquiries" on public.inquiries for select using (true);

drop policy if exists "Allow insert on inquiries" on public.inquiries;
create policy "Allow insert on inquiries" on public.inquiries for insert with check (true);

drop policy if exists "Allow update on inquiries" on public.inquiries;
create policy "Allow update on inquiries" on public.inquiries for update using (true);

drop policy if exists "Allow delete on inquiries" on public.inquiries;
create policy "Allow delete on inquiries" on public.inquiries for delete using (true);


-- 4. REVIEWS TABLE (Customer feedback & verified testimonials)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

drop policy if exists "Allow all on reviews" on public.reviews;
create policy "Allow all on reviews" on public.reviews for all using (true) with check (true);


-- 5. PRODUCTS TABLE (Live Catalog CMS - Botanicals, Food Podis, Superfoods)
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text default 'tea',
  category_label text,
  price numeric not null,
  original_price numeric,
  volume text,
  badge text,
  tagline text,
  description text,
  ingredients text,
  in_stock boolean default true,
  stock_count integer default 50,
  card_image text,
  key_benefits jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

drop policy if exists "Allow all on products" on public.products;
create policy "Allow all on products" on public.products for all using (true) with check (true);


-- 6. COUPONS TABLE (Promotional discount codes)
create table if not exists public.coupons (
  code text primary key,
  discount_type text default 'flat',
  discount_value numeric not null,
  min_order numeric default 0,
  max_discount numeric,
  is_active boolean default true,
  description text,
  usage_count integer default 0,
  expiry_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;

drop policy if exists "Allow all on coupons" on public.coupons;
create policy "Allow all on coupons" on public.coupons for all using (true) with check (true);


-- 7. SITE_CONTENT TABLE (Storefront CMS - Announcements, Marquee, Hero Banners)
create table if not exists public.site_content (
  key text primary key,
  content jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_content enable row level security;

drop policy if exists "Allow all on site_content" on public.site_content;
create policy "Allow all on site_content" on public.site_content for all using (true) with check (true);


-- 8. STORE_SETTINGS TABLE (Contact numbers, WhatsApp, FSSAI, Shipping thresholds)
create table if not exists public.store_settings (
  key text primary key,
  settings jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.store_settings enable row level security;

drop policy if exists "Allow all on store_settings" on public.store_settings;
create policy "Allow all on store_settings" on public.store_settings for all using (true) with check (true);


-- ==============================================================================
-- 9. ESSENTIAL POSTGRESQL PERMISSIONS & GRANTS
-- Enables anon (storefront visitors) and authenticated (users & admin) to read/write
-- ==============================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
