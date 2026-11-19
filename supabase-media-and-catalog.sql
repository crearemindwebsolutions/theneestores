-- ==============================================================================
-- THENEE E-COMMERCE - ALL WEBSITE IMAGES, MEDIA ASSETS & LIVE CATALOG SQL SEED
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/fdfqtfocdqvontrwkclf
-- 2. Click "SQL Editor" in the left navigation sidebar
-- 3. Click "+ New query"
-- 4. Paste this entire script and click "Run" (Green button or Ctrl+Enter)
-- ==============================================================================

-- 1. MEDIA & ASSETS TABLE (Stores all live website media, promotional banners, product cutouts & scenes)
create table if not exists public.media (
  id text primary key,
  title text not null,
  category text not null,
  file_path text not null,
  public_url text,
  alt_text text,
  media_type text default 'image/jpeg',
  file_size integer,
  dimensions text,
  tag text,
  metadata jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.media enable row level security;
drop policy if exists "Allow select on media" on public.media;
create policy "Allow select on media" on public.media for select using (true);
drop policy if exists "Allow all on media" on public.media;
create policy "Allow all on media" on public.media for all using (true) with check (true);

-- 2. PRODUCTS TABLE (Live Catalog CMS - Botanicals, Food Podis, Superfoods)
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
  bottle_image text,
  scene_image text,
  poster_image text,
  key_benefits jsonb default '[]'::jsonb,
  how_to_use jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
drop policy if exists "Allow all on products" on public.products;
create policy "Allow all on products" on public.products for all using (true) with check (true);

-- 3. COUPONS TABLE (Promotional discount codes)
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

-- 4. SITE_CONTENT TABLE (Storefront CMS - Announcements, Marquee, Hero Banners)
create table if not exists public.site_content (
  key text primary key,
  content jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_content enable row level security;
drop policy if exists "Allow all on site_content" on public.site_content;
create policy "Allow all on site_content" on public.site_content for all using (true) with check (true);

-- 5. STORE_SETTINGS TABLE (Contact numbers, WhatsApp, FSSAI, Shipping thresholds)
create table if not exists public.store_settings (
  key text primary key,
  settings jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.store_settings enable row level security;
drop policy if exists "Allow all on store_settings" on public.store_settings;
create policy "Allow all on store_settings" on public.store_settings for all using (true) with check (true);

-- 6. REVIEWS TABLE (Customer feedback & verified testimonials)
create table if not exists public.reviews (
  id text primary key,
  product_id text,
  user_name text not null,
  location text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  image_url text,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;
drop policy if exists "Allow all on reviews" on public.reviews;
create policy "Allow all on reviews" on public.reviews for all using (true) with check (true);

-- ==============================================================================
-- 7. SEED ALL 67 CURRENT LIVE WEBSITE IMAGES & MEDIA INTO public.media
-- ==============================================================================
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-banner-3452da4c-b8af-400c-8278-89986c138532-png', '3452da4c B8af 400c 8278 89986c138532', 'banner', '/banner\3452da4c-b8af-400c-8278-89986c138532.png', '3452da4c B8af 400c 8278 89986c138532 - THENEE Botanical Kadayam Stores', 'image/png', 1828424, 'Hero Banner', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-banner-9d2935b8-e64b-4da5-bbf9-131a9b83f82e-png', '9d2935b8 E64b 4da5 Bbf9 131a9b83f82e', 'banner', '/banner\9d2935b8-e64b-4da5-bbf9-131a9b83f82e.png', '9d2935b8 E64b 4da5 Bbf9 131a9b83f82e - THENEE Botanical Kadayam Stores', 'image/png', 1964831, 'Hero Banner', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-banner-a8a2f266-9745-4ab2-9480-c0900e5e0e12-png', 'A8a2f266 9745 4ab2 9480 C0900e5e0e12', 'banner', '/banner\a8a2f266-9745-4ab2-9480-c0900e5e0e12.png', 'A8a2f266 9745 4ab2 9480 C0900e5e0e12 - THENEE Botanical Kadayam Stores', 'image/png', 1850252, 'Hero Banner', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-bliss-tea-bottle-png', 'Bliss Tea Bottle', 'product', '/images\custom_thenee\bliss-tea-bottle.png', 'Bliss Tea Bottle - THENEE Botanical Kadayam Stores', 'image/png', 263444, 'Product Bottle Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-bliss-tea-product-jpg', 'Bliss Tea Product', 'product', '/images\custom_thenee\bliss-tea-product.jpg', 'Bliss Tea Product - THENEE Botanical Kadayam Stores', 'image/jpeg', 263444, 'Packaging Box', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-bliss-tea-product-png', 'Bliss Tea Product', 'product', '/images\custom_thenee\bliss-tea-product.png', 'Bliss Tea Product - THENEE Botanical Kadayam Stores', 'image/png', 263444, 'Packaging Box', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-bliss-tea-scene-jpg', 'Bliss Tea Scene', 'product', '/images\custom_thenee\bliss-tea-scene.jpg', 'Bliss Tea Scene - THENEE Botanical Kadayam Stores', 'image/jpeg', 1193462, 'Botanical Scene', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-curry-leaves-podi-float-png', 'Curry Leaves Podi Float', 'podi', '/images\custom_thenee\curry-leaves-podi-float.png', 'Curry Leaves Podi Float - THENEE Botanical Kadayam Stores', 'image/png', 383793, 'Podi Floating Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-curry-leaves-podi-jpg', 'Curry Leaves Podi', 'podi', '/images\custom_thenee\curry-leaves-podi.jpg', 'Curry Leaves Podi - THENEE Botanical Kadayam Stores', 'image/jpeg', 42721, 'Traditional Food Podi', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-food-podis-bottle-png', 'Food Podis Bottle', 'product', '/images\custom_thenee\food-podis-bottle.png', 'Food Podis Bottle - THENEE Botanical Kadayam Stores', 'image/png', 1847293, 'Product Bottle Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-food-podis-product-jpg', 'Food Podis Product', 'product', '/images\custom_thenee\food-podis-product.jpg', 'Food Podis Product - THENEE Botanical Kadayam Stores', 'image/jpeg', 825718, 'Packaging Box', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-fssai-certified-badge-svg', 'Fssai Certified Badge', 'brand', '/images\custom_thenee\fssai-certified-badge.svg', 'Fssai Certified Badge - THENEE Botanical Kadayam Stores', 'image/svg+xml', 1267, 'Brand Asset', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-garlic-podi-float-png', 'Garlic Podi Float', 'podi', '/images\custom_thenee\garlic-podi-float.png', 'Garlic Podi Float - THENEE Botanical Kadayam Stores', 'image/png', 405044, 'Podi Floating Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-garlic-podi-jpg', 'Garlic Podi', 'podi', '/images\custom_thenee\garlic-podi.jpg', 'Garlic Podi - THENEE Botanical Kadayam Stores', 'image/jpeg', 44317, 'Traditional Food Podi', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-herbal-harvest-village-jpg', 'Herbal Harvest Village', 'story', '/images\custom_thenee\herbal-harvest-village.jpg', 'Herbal Harvest Village - THENEE Botanical Kadayam Stores', 'image/jpeg', 1035354, 'Heritage Story', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-herbal-tea-bottle-png', 'Herbal Tea Bottle', 'product', '/images\custom_thenee\herbal-tea-bottle.png', 'Herbal Tea Bottle - THENEE Botanical Kadayam Stores', 'image/png', 340264, 'Product Bottle Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-herbal-tea-product-jpg', 'Herbal Tea Product', 'product', '/images\custom_thenee\herbal-tea-product.jpg', 'Herbal Tea Product - THENEE Botanical Kadayam Stores', 'image/jpeg', 652505, 'Packaging Box', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-herbal-tea-scene-jpg', 'Herbal Tea Scene', 'product', '/images\custom_thenee\herbal-tea-scene.jpg', 'Herbal Tea Scene - THENEE Botanical Kadayam Stores', 'image/jpeg', 798895, 'Botanical Scene', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-instagram-connect-qr-svg', 'Instagram Connect Qr', 'brand', '/images\custom_thenee\instagram-connect-qr.svg', 'Instagram Connect Qr - THENEE Botanical Kadayam Stores', 'image/svg+xml', 3169, 'Brand Asset', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-moringa-podi-float-png', 'Moringa Podi Float', 'podi', '/images\custom_thenee\moringa-podi-float.png', 'Moringa Podi Float - THENEE Botanical Kadayam Stores', 'image/png', 392523, 'Podi Floating Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-moringa-podi-jpg', 'Moringa Podi', 'podi', '/images\custom_thenee\moringa-podi.jpg', 'Moringa Podi - THENEE Botanical Kadayam Stores', 'image/jpeg', 44155, 'Traditional Food Podi', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-moringa-powder-bottle-png', 'Moringa Powder Bottle', 'product', '/images\custom_thenee\moringa-powder-bottle.png', 'Moringa Powder Bottle - THENEE Botanical Kadayam Stores', 'image/png', 2237185, 'Product Bottle Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-moringa-powder-product-jpg', 'Moringa Powder Product', 'product', '/images\custom_thenee\moringa-powder-product.jpg', 'Moringa Powder Product - THENEE Botanical Kadayam Stores', 'image/jpeg', 2237185, 'Packaging Box', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-moringa-scene-jpg', 'Moringa Scene', 'general', '/images\custom_thenee\moringa-scene.jpg', 'Moringa Scene - THENEE Botanical Kadayam Stores', 'image/jpeg', 946026, 'Website Asset', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-podis-scene-jpg', 'Podis Scene', 'podi', '/images\custom_thenee\podis-scene.jpg', 'Podis Scene - THENEE Botanical Kadayam Stores', 'image/jpeg', 833979, 'Traditional Food Podi', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-rural-women-artisans-jpg', 'Rural Women Artisans', 'story', '/images\custom_thenee\rural-women-artisans.jpg', 'Rural Women Artisans - THENEE Botanical Kadayam Stores', 'image/jpeg', 954089, 'Heritage Story', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-sesame-podi-float-png', 'Sesame Podi Float', 'podi', '/images\custom_thenee\sesame-podi-float.png', 'Sesame Podi Float - THENEE Botanical Kadayam Stores', 'image/png', 413029, 'Podi Floating Cutout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-sesame-podi-jpg', 'Sesame Podi', 'podi', '/images\custom_thenee\sesame-podi.jpg', 'Sesame Podi - THENEE Botanical Kadayam Stores', 'image/jpeg', 46003, 'Traditional Food Podi', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-thenee-brand-logo-png', 'Thenee Brand Logo', 'brand', '/images\custom_thenee\thenee-brand-logo.png', 'Thenee Brand Logo - THENEE Botanical Kadayam Stores', 'image/png', 626967, 'Brand Asset', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-thenee-brand-logo-svg', 'Thenee Brand Logo', 'brand', '/images\custom_thenee\thenee-brand-logo.svg', 'Thenee Brand Logo - THENEE Botanical Kadayam Stores', 'image/svg+xml', 4533, 'Brand Asset', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-custom-thenee-whatsapp-order-qr-svg', 'Whatsapp Order Qr', 'brand', '/images\custom_thenee\whatsapp-order-qr.svg', 'Whatsapp Order Qr - THENEE Botanical Kadayam Stores', 'image/svg+xml', 3606, 'Brand Asset', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-blue-wave-bg-png', 'Blue Wave Bg', 'perfume', '/images\perfume\blue-wave-bg.png', 'Blue Wave Bg - THENEE Botanical Kadayam Stores', 'image/png', 2803024, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-blue-wave-bottle-png', 'Blue Wave Bottle', 'perfume', '/images\perfume\blue-wave-bottle.png', 'Blue Wave Bottle - THENEE Botanical Kadayam Stores', 'image/png', 2338740, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-lavender-blossom-bg-png', 'Lavender Blossom Bg', 'perfume', '/images\perfume\lavender-blossom-bg.png', 'Lavender Blossom Bg - THENEE Botanical Kadayam Stores', 'image/png', 2578441, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-lavender-blossom-bottle-png', 'Lavender Blossom Bottle', 'perfume', '/images\perfume\lavender-blossom-bottle.png', 'Lavender Blossom Bottle - THENEE Botanical Kadayam Stores', 'image/png', 2314762, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-oud-wood-bg-png', 'Oud Wood Bg', 'perfume', '/images\perfume\oud-wood-bg.png', 'Oud Wood Bg - THENEE Botanical Kadayam Stores', 'image/png', 2187613, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-oud-wood-bottle-png', 'Oud Wood Bottle', 'perfume', '/images\perfume\oud-wood-bottle.png', 'Oud Wood Bottle - THENEE Botanical Kadayam Stores', 'image/png', 2294233, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-ruby-passion-bg-png', 'Ruby Passion Bg', 'perfume', '/images\perfume\ruby-passion-bg.png', 'Ruby Passion Bg - THENEE Botanical Kadayam Stores', 'image/png', 2214880, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-images-perfume-ruby-passion-bottle-png', 'Ruby Passion Bottle', 'perfume', '/images\perfume\ruby-passion-bottle.png', 'Ruby Passion Bottle - THENEE Botanical Kadayam Stores', 'image/png', 2301726, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-1b05dd54172b151618ac9b7ecba9e51d-jpg', '1b05dd54172b151618ac9b7ecba9e51d', 'review', '/people\1b05dd54172b151618ac9b7ecba9e51d.jpg', '1b05dd54172b151618ac9b7ecba9e51d - THENEE Botanical Kadayam Stores', 'image/jpeg', 53094, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-1d79a2f96c55e40ed685105da216843d-jpg', '1d79a2f96c55e40ed685105da216843d', 'review', '/people\1d79a2f96c55e40ed685105da216843d.jpg', '1d79a2f96c55e40ed685105da216843d - THENEE Botanical Kadayam Stores', 'image/jpeg', 128342, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-7d555b95ffefb9fc9c5f64c340e77b87-jpg', '7d555b95ffefb9fc9c5f64c340e77b87', 'review', '/people\7d555b95ffefb9fc9c5f64c340e77b87.jpg', '7d555b95ffefb9fc9c5f64c340e77b87 - THENEE Botanical Kadayam Stores', 'image/jpeg', 77275, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-a127d1dc816a727207dfcd788e440d3f-jpg', 'A127d1dc816a727207dfcd788e440d3f', 'review', '/people\a127d1dc816a727207dfcd788e440d3f.jpg', 'A127d1dc816a727207dfcd788e440d3f - THENEE Botanical Kadayam Stores', 'image/jpeg', 163947, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-a83ce099b074f55ed9d9f3bc5c51ae93-jpg', 'A83ce099b074f55ed9d9f3bc5c51ae93', 'review', '/people\a83ce099b074f55ed9d9f3bc5c51ae93.jpg', 'A83ce099b074f55ed9d9f3bc5c51ae93 - THENEE Botanical Kadayam Stores', 'image/jpeg', 122161, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-af6777ce69cecd4b65da707386eb43c6-jpg', 'Af6777ce69cecd4b65da707386eb43c6', 'review', '/people\af6777ce69cecd4b65da707386eb43c6.jpg', 'Af6777ce69cecd4b65da707386eb43c6 - THENEE Botanical Kadayam Stores', 'image/jpeg', 53259, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-bc35a325a8cfb0a10757433a4e67cc4c-jpg', 'Bc35a325a8cfb0a10757433a4e67cc4c', 'review', '/people\bc35a325a8cfb0a10757433a4e67cc4c.jpg', 'Bc35a325a8cfb0a10757433a4e67cc4c - THENEE Botanical Kadayam Stores', 'image/jpeg', 150644, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-c6d03a9f02d2cfb0410ae129e6e6f95c-jpg', 'C6d03a9f02d2cfb0410ae129e6e6f95c', 'review', '/people\c6d03a9f02d2cfb0410ae129e6e6f95c.jpg', 'C6d03a9f02d2cfb0410ae129e6e6f95c - THENEE Botanical Kadayam Stores', 'image/jpeg', 225373, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-d24693b2a8ec030497c4dae49bd48a59-jpg', 'D24693b2a8ec030497c4dae49bd48a59', 'review', '/people\d24693b2a8ec030497c4dae49bd48a59.jpg', 'D24693b2a8ec030497c4dae49bd48a59 - THENEE Botanical Kadayam Stores', 'image/jpeg', 121168, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-d492f5583260f1fcab1978a61a8cbd2d-jpg', 'D492f5583260f1fcab1978a61a8cbd2d', 'review', '/people\d492f5583260f1fcab1978a61a8cbd2d.jpg', 'D492f5583260f1fcab1978a61a8cbd2d - THENEE Botanical Kadayam Stores', 'image/jpeg', 95515, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-ed7c9b6e46615e66e8f44b328fd616d3-jpg', 'Ed7c9b6e46615e66e8f44b328fd616d3', 'review', '/people\ed7c9b6e46615e66e8f44b328fd616d3.jpg', 'Ed7c9b6e46615e66e8f44b328fd616d3 - THENEE Botanical Kadayam Stores', 'image/jpeg', 52637, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-f4e9be922233f0d3c234809267fdf86d-jpg', 'F4e9be922233f0d3c234809267fdf86d', 'review', '/people\f4e9be922233f0d3c234809267fdf86d.jpg', 'F4e9be922233f0d3c234809267fdf86d - THENEE Botanical Kadayam Stores', 'image/jpeg', 39350, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-people-fa00fb96d435ae93ad50ee9ddcd48418-jpg', 'Fa00fb96d435ae93ad50ee9ddcd48418', 'review', '/people\fa00fb96d435ae93ad50ee9ddcd48418.jpg', 'Fa00fb96d435ae93ad50ee9ddcd48418 - THENEE Botanical Kadayam Stores', 'image/jpeg', 126978, 'Patron Avatar', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-19249e71-6023-4e24-9953-b0610c4bdac5-png', '19249e71 6023 4e24 9953 B0610c4bdac5', 'perfume', '/perfume\19249e71-6023-4e24-9953-b0610c4bdac5.png', '19249e71 6023 4e24 9953 B0610c4bdac5 - THENEE Botanical Kadayam Stores', 'image/png', 2338740, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-30c85ca9-2a7f-4fca-86a5-aaf2a17bb960-png', '30c85ca9 2a7f 4fca 86a5 Aaf2a17bb960', 'perfume', '/perfume\30c85ca9-2a7f-4fca-86a5-aaf2a17bb960.png', '30c85ca9 2a7f 4fca 86a5 Aaf2a17bb960 - THENEE Botanical Kadayam Stores', 'image/png', 2294233, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-8561342a-43e5-44cc-adb7-3c7750c5c462-png', '8561342a 43e5 44cc Adb7 3c7750c5c462', 'perfume', '/perfume\8561342a-43e5-44cc-adb7-3c7750c5c462.png', '8561342a 43e5 44cc Adb7 3c7750c5c462 - THENEE Botanical Kadayam Stores', 'image/png', 2314762, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-91adf8c7-29bf-4116-a87a-25a90076ba26-png', '91adf8c7 29bf 4116 A87a 25a90076ba26', 'perfume', '/perfume\91adf8c7-29bf-4116-a87a-25a90076ba26.png', '91adf8c7 29bf 4116 A87a 25a90076ba26 - THENEE Botanical Kadayam Stores', 'image/png', 2301726, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-bg-19249e71-6023-4e24-9953-b0610c4bdac5-png', '19249e71 6023 4e24 9953 B0610c4bdac5', 'perfume', '/perfume bg\19249e71-6023-4e24-9953-b0610c4bdac5.png', '19249e71 6023 4e24 9953 B0610c4bdac5 - THENEE Botanical Kadayam Stores', 'image/png', 2578441, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-bg-42233238-2dfb-4aab-807a-b37c64bcf1bb-png', '42233238 2dfb 4aab 807a B37c64bcf1bb', 'perfume', '/perfume bg\42233238-2dfb-4aab-807a-b37c64bcf1bb.png', '42233238 2dfb 4aab 807a B37c64bcf1bb - THENEE Botanical Kadayam Stores', 'image/png', 2803024, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-bg-8b05eb47-3cbd-49a0-b396-c7c2aff56c71-png', '8b05eb47 3cbd 49a0 B396 C7c2aff56c71', 'perfume', '/perfume bg\8b05eb47-3cbd-49a0-b396-c7c2aff56c71.png', '8b05eb47 3cbd 49a0 B396 C7c2aff56c71 - THENEE Botanical Kadayam Stores', 'image/png', 2187613, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-perfume-bg-b7bc7718-7c21-41a9-a0bb-eb957455f5e5-png', 'B7bc7718 7c21 41a9 A0bb Eb957455f5e5', 'perfume', '/perfume bg\b7bc7718-7c21-41a9-a0bb-eb957455f5e5.png', 'B7bc7718 7c21 41a9 A0bb Eb957455f5e5 - THENEE Botanical Kadayam Stores', 'image/png', 2214880, 'Botanical Aroma', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-reviews-20dcdc23e2a4f226f07d20c7877b8cac-jpg', '20dcdc23e2a4f226f07d20c7877b8cac', 'review', '/reviews\20dcdc23e2a4f226f07d20c7877b8cac.jpg', '20dcdc23e2a4f226f07d20c7877b8cac - THENEE Botanical Kadayam Stores', 'image/jpeg', 64137, 'Verified Review Photo', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-reviews-46956dba564442462cef3ad1a8c08ec9-jpg', '46956dba564442462cef3ad1a8c08ec9', 'review', '/reviews\46956dba564442462cef3ad1a8c08ec9.jpg', '46956dba564442462cef3ad1a8c08ec9 - THENEE Botanical Kadayam Stores', 'image/jpeg', 63009, 'Verified Review Photo', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-reviews-661c3eccb4e65e1807e740ef7618ae1c-jpg', '661c3eccb4e65e1807e740ef7618ae1c', 'review', '/reviews\661c3eccb4e65e1807e740ef7618ae1c.jpg', '661c3eccb4e65e1807e740ef7618ae1c - THENEE Botanical Kadayam Stores', 'image/jpeg', 131114, 'Verified Review Photo', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-reviews-c093b9cd25b45bf7a7500b7a1b1b7ff1-jpg', 'C093b9cd25b45bf7a7500b7a1b1b7ff1', 'review', '/reviews\c093b9cd25b45bf7a7500b7a1b1b7ff1.jpg', 'C093b9cd25b45bf7a7500b7a1b1b7ff1 - THENEE Botanical Kadayam Stores', 'image/jpeg', 82148, 'Verified Review Photo', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-ui-layout-9a0d280d-e3eb-4a88-bdf8-3f1a6cdc386f-png', '9a0d280d E3eb 4a88 Bdf8 3f1a6cdc386f', 'ui', '/ui layout\9a0d280d-e3eb-4a88-bdf8-3f1a6cdc386f.png', '9a0d280d E3eb 4a88 Bdf8 3f1a6cdc386f - THENEE Botanical Kadayam Stores', 'image/png', 1558916, 'Storefront UI Layout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-ui-layout-c1663fd1-d59c-45e8-97b1-bf88610aaadf-png', 'C1663fd1 D59c 45e8 97b1 Bf88610aaadf', 'ui', '/ui layout\c1663fd1-d59c-45e8-97b1-bf88610aaadf.png', 'C1663fd1 D59c 45e8 97b1 Bf88610aaadf - THENEE Botanical Kadayam Stores', 'image/png', 1558901, 'Storefront UI Layout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();
insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('media-ui-layout-ce099d6c-a10d-4d0e-baca-2f60aa6eba56-png', 'Ce099d6c A10d 4d0e Baca 2f60aa6eba56', 'ui', '/ui layout\ce099d6c-a10d-4d0e-baca-2f60aa6eba56.png', 'Ce099d6c A10d 4d0e Baca 2f60aa6eba56 - THENEE Botanical Kadayam Stores', 'image/png', 1778432, 'Storefront UI Layout', true, now())
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  file_path = excluded.file_path,
  alt_text = excluded.alt_text,
  media_type = excluded.media_type,
  file_size = excluded.file_size,
  tag = excluded.tag,
  is_active = excluded.is_active,
  updated_at = now();

-- ==============================================================================
-- 8. SEED LIVE PRODUCTS CATALOG WITH REAL IMAGES & DESCRIPTIONS
-- ==============================================================================
insert into public.products (id, name, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle_image, scene_image, poster_image, key_benefits, how_to_use, updated_at)
values 
(
  'bliss-tea',
  'Thenee Bliss Tea',
  'tea',
  'Botanical Teas',
  349,
  449,
  '75g Floral Blend',
  '100% Caffeine-Free',
  'Sangu Poo & Sembaruthi Poo Herbal Floral Infusion',
  'THENEE Bliss Tea is a premium herbal floral infusion of sangu poo (Butterfly Pea Flower) & sembaruthi poo (Hibiscus Flower) blending traditional herbal wisdom with the pure benefits of natural flowers. Crafted from a vibrant mix of butterfly pea flower, hibiscus, and aromatic botanicals.',
  'Natural Butterfly Pea Flower (Sangu Poo), Hibiscus (Sembaruthi Poo), Aromatic Botanicals',
  true,
  85,
  '/images/custom_thenee/bliss-tea-product.jpg',
  '/images/custom_thenee/bliss-tea-bottle.png',
  '/images/custom_thenee/bliss-tea-scene.jpg',
  '/images/custom_thenee/bliss-tea-product.jpg',
  '[{"title": "Natural Antioxidants", "desc": "Loaded with plant polyphenols and anthocyanins for deep cellular repair."}, {"title": "Calm & Stress Relief", "desc": "Restores natural calm and sustained energy for both body and mind."}, {"title": "Skin & Hair Health", "desc": "Traditionally cherished in Tamil medicine to nourish glowing skin and hair follicles."}, {"title": "Aromatic & Caffeine-Free", "desc": "Delicate floral aroma with zero artificial colors or added sugar."}]'::jsonb,
  '["Boil 150ml water and take off flame.", "Add 1 teaspoon of Bliss Tea petals.", "Cover and infuse for 3–5 minutes until vibrant blue-purple hues bloom.", "Strain and sip warm or chilled. Add a dash of lemon for a magical violet color shift!"]'::jsonb,
  now()
),
(
  'herbal-tea',
  'Thenee Herbal Tea',
  'tea',
  'Botanical Teas',
  299,
  399,
  '100g Pouch & Jar',
  'Best Seller',
  '100% Organic Traditional Healing Blend',
  'Thenee Herbal Tea is a 100% organic, traditional blend handcrafted by rural women in Tamil Nadu. Inspired by natural healing, it restores balance, aids digestion, and boosts daily immunity.',
  'Traditional herbal blend, roots, botanical leaves, spices',
  true,
  120,
  '/images/custom_thenee/herbal-tea-product.jpg',
  '/images/custom_thenee/herbal-tea-bottle.png',
  '/images/custom_thenee/herbal-tea-scene.jpg',
  '/images/custom_thenee/herbal-tea-product.jpg',
  '[{"title": "Blood Sugar & Metabolism", "desc": "Helps control blood sugar levels and supports natural weight management."}, {"title": "Digestive & Gut Health", "desc": "Promotes smooth digestion and improves overall gut comfort."}, {"title": "Body Balance & Immunity", "desc": "Balances internal body heat, boosts immunity, and lowers bad cholesterol."}, {"title": "Detox & Radiance", "desc": "Purifies the blood to support clear, glowing skin from within."}]'::jsonb,
  '["Boil 150ml of clean drinking water.", "Add 1 teaspoon of Thenee Herbal Tea.", "Brew gently for 2–3 minutes to release active botanicals.", "Strain and enjoy warm. (Optional: Add pure honey or palm jaggery)."]'::jsonb,
  now()
),
(
  'moringa-powder',
  'Pure Moringa Powder',
  'superfood',
  'Superfood Powders',
  249,
  320,
  '150g Natural Pouch',
  'Village Superfood',
  '100% Pure Village Sourced Moringa Leaves',
  'THENEE Pure Moringa Powder is a natural superfood made from 100% pure moringa leaves. Carefully sourced from villages in Tamil Nadu and gently shade-dried and processed to retain maximum nutrients, vitamins, and minerals.',
  '100% Pure Shade-Dried Moringa Oleifera Leaves',
  true,
  95,
  '/images/custom_thenee/moringa-powder-product.jpg',
  '/images/custom_thenee/moringa-powder-bottle.png',
  '/images/custom_thenee/moringa-scene.jpg',
  '/images/custom_thenee/moringa-powder-product.jpg',
  '[{"title": "Rich in Essential Nutrients", "desc": "Abundant in natural vitamins A & C, calcium, iron, and complete plant protein."}, {"title": "Energy & Daily Stamina", "desc": "Provides natural, clean, long-lasting energy throughout the day without caffeine crash."}, {"title": "Immunity & Body Defenses", "desc": "High in bioflavonoids and antioxidants to strengthen immune defenses naturally."}, {"title": "Gut Health & Digestion", "desc": "High natural dietary fiber supports smooth digestion and healthy gut flora."}]'::jsonb,
  '["Mix 1/2 to 1 teaspoon into warm water, morning smoothie, or buttermilk.", "Can also be mixed directly into warm cooked rice with ghee or stirred into dal and soups."]'::jsonb,
  now()
),
(
  'food-podis-collection',
  'Traditional Food Podis',
  'podi',
  'Food Podis',
  699,
  850,
  'Set of 4 Varieties (400g total)',
  'Heritage Flavors',
  'Handcrafted Poondu, Karuveppilai, Murungai & Ellu Podis',
  'THENEE offers a traditional range of nutrient-rich podi varieties handcrafted by rural women in Tamil Nadu. Made with 100% natural ingredients, zero preservatives, and zero artificial additives, these versatile powders add authentic flavor and wellness to everyday meals like rice, idli, dosa, and curd rice.',
  'Hand-picked herbs, seeds, lentils, rock salt, traditional spices (No additives)',
  true,
  60,
  '/images/custom_thenee/food-podis-product.jpg',
  '/images/custom_thenee/food-podis-bottle.png',
  '/images/custom_thenee/podis-scene.jpg',
  '/images/custom_thenee/food-podis-product.jpg',
  '[{"title": "Poondu Podi (Garlic)", "desc": "Rich in natural allicin & antioxidants; supports gut comfort and heart wellness."}, {"title": "Karuveppilai Podi (Curry Leaves)", "desc": "Loaded with bio-available iron and vitamin A to improve eyesight and healthy hair."}, {"title": "Murungakeerai Podi (Moringa)", "desc": "Mineral-rich green superfood to balance body heat and boost metabolic vitality."}, {"title": "Ellu Podi (Sesame)", "desc": "Premium roasted sesame packed with bone-strengthening calcium and healthy fats."}]'::jsonb,
  '["Mix 1-2 spoons with hot steamed rice and add sesame oil or cow ghee.", "Serve as a flavorful side dip for idli, dosa, adai, or sprinkle over curd rice."]'::jsonb,
  now()
),
(
  'garlic-podi',
  'Garlic Powder (Poondu Podi)',
  'podi',
  'Traditional Food Podi',
  180,
  220,
  '100g Pouch',
  'Heart & Gut',
  'Roasted Village Garlic For Hot Steamed Rice & Ghee',
  'THENEE Garlic Powder is a traditional hand-roasted digestive blend made from authentic village garlic and spices. Slow-roasted over firewood in Kadayam, it protects gut microflora, reduces acidity, and brings authentic South Indian home aroma.',
  'Country Garlic, Roasted Gram (Urad Dal, Chana Dal), Red Chilies, Cumin, Asafoetida (Hing), Himalayan Rock Salt',
  true,
  140,
  '/images/custom_thenee/garlic-podi.jpg',
  '/images/custom_thenee/garlic-podi-float.png',
  '/images/custom_thenee/podis-scene.jpg',
  '/images/custom_thenee/garlic-podi.jpg',
  '[{"title": "Supports Gut & Digestive Health", "desc": "Natural allicin in roasted garlic calms acid reflux, reduces bloating, and improves gut microflora."}, {"title": "Lowers Bad Cholesterol", "desc": "Promotes heart health and healthy lipid profiles when consumed as part of daily meals."}, {"title": "Boosts Natural Immunity", "desc": "Rich in sulfur compounds and plant antioxidants to protect against seasonal infections."}, {"title": "Savory & Comforting Kick", "desc": "Aromatic roasted garlic flavor that pairs perfectly with hot rice, idli, dosai, or curries."}]'::jsonb,
  '["Mix 1–2 teaspoons with warm cooked rice and a spoonful of cold-pressed sesame oil or pure ghee.", "Sprinkle generously over hot crispy dosas, idlis, or uthappams.", "Add as a natural digestive seasoning to rasam, vegetable stir-fries, and dal."]'::jsonb,
  now()
),
(
  'curry-leaves-podi',
  'Curry Leaves Powder (Karuveppilai Podi)',
  'podi',
  'Traditional Food Podi',
  180,
  220,
  '100g Pouch',
  'Hair & Vision',
  'Freshly Ground Mountain Curry Leaves Rich In Iron',
  'THENEE Curry Leaves Powder is handcrafted from fresh, tender village curry leaves harvested from the foothills of the Western Ghats. Sun-dried and gently roasted with traditional pulses, it is naturally loaded with plant-based iron and essential vitamins.',
  'Fresh Mountain Curry Leaves, Urad Dal, Bengal Gram, Black Pepper, Cumin Seeds, Dry Red Chilies, Asafoetida, Rock Salt',
  true,
  110,
  '/images/custom_thenee/curry-leaves-podi.jpg',
  '/images/custom_thenee/curry-leaves-podi-float.png',
  '/images/custom_thenee/podis-scene.jpg',
  '/images/custom_thenee/curry-leaves-podi.jpg',
  '[{"title": "Rich in Natural Plant Iron", "desc": "Naturally combats iron deficiency and improves hemoglobin without synthetic supplements."}, {"title": "Promotes Dense Hair Growth", "desc": "High beta-carotene and amino acid content nourish hair follicles and prevent premature graying."}, {"title": "Enhances Vision & Eye Health", "desc": "Packed with natural Vitamin A to protect eye cells and relieve screen strain."}, {"title": "Aids Smooth Daily Digestion", "desc": "Carminative properties stimulate digestive enzymes and soothe intestinal walls."}]'::jsonb,
  '["Take 1–2 tablespoons with hot steamed rice and a spoonful of pure cow ghee or sesame oil for lunch.", "Serve as a nutritious dry chutney side for soft idlis, dosas, and appams.", "Stir into fresh buttermilk with a pinch of rock salt for a cooling, iron-rich drink."]'::jsonb,
  now()
),
(
  'moringa-podi',
  'Moringa Leaves Podi (Murungakeerai Podi)',
  'podi',
  'Traditional Food Podi',
  190,
  240,
  '100g Pouch',
  'Energy Superfood',
  'Green Superfood For Natural Metabolism & Vitality',
  'THENEE Moringa Leaves Podi is made from tender, shade-dried drumstick tree leaves sourced from pesticide-free village groves in Tenkasi. Renowned as nature complete botanical multivitamin, it provides bioavailable calcium and plant protein.',
  'Shade-Dried Moringa Leaves, Split Urad Dal, Chana Dal, Cumin, Pepper, Dry Red Chilies, Asafoetida, Rock Salt',
  true,
  130,
  '/images/custom_thenee/moringa-podi.jpg',
  '/images/custom_thenee/moringa-podi-float.png',
  '/images/custom_thenee/podis-scene.jpg',
  '/images/custom_thenee/moringa-podi.jpg',
  '[{"title": "Complete Green Multivitamin", "desc": "Loaded with natural plant Vitamin C and bio-available calcium."}, {"title": "Balances Internal Body Heat", "desc": "Gently cools the internal digestive tract and relieves heat-induced fatigue."}, {"title": "Sustained Metabolic Energy", "desc": "Plant-based amino acids and chlorophyll provide clean stamina without caffeine."}, {"title": "Joint & Bone Density Support", "desc": "High bio-calcium and phosphorus nurture bone strength and ease joint stiffness."}]'::jsonb,
  '["Mix 1–2 teaspoons into steaming hot rice with a dollop of ghee or cold-pressed sesame oil.", "Sprinkle over roasted vegetables, salads, or toast for an instant superfood boost.", "Mix into curd rice or buttermilk for a soothing, nutrient-dense meal finisher."]'::jsonb,
  now()
),
(
  'sesame-podi',
  'Sesame Powder (Ellu Podi)',
  'podi',
  'Traditional Food Podi',
  180,
  220,
  '100g Pouch',
  'Bone Strength',
  'Slow-Roasted Heritage Sesame Rich In Calcium',
  'THENEE Sesame Powder (Ellu Podi) is crafted from heritage black sesame seeds, slow-roasted in iron pans to preserve natural lignans and healthy fats. Revered in traditional village nutrition for building bone density and deep cellular strength.',
  'Heritage Black Sesame Seeds, Roasted Urad Dal, Dry Red Chilies, Cumin, Pure Asafoetida, Sea Salt',
  true,
  95,
  '/images/custom_thenee/sesame-podi.jpg',
  '/images/custom_thenee/sesame-podi-float.png',
  '/images/custom_thenee/podis-scene.jpg',
  '/images/custom_thenee/sesame-podi.jpg',
  '[{"title": "Highest Natural Plant Calcium", "desc": "One of the richest botanical sources of calcium, vital for bone density and joint mobility."}, {"title": "Hormonal Balance & Vitality", "desc": "Natural sesamin lignans support healthy estrogen balance and cyclical wellness."}, {"title": "Healthy Fats for Heart & Skin", "desc": "Monounsaturated and polyunsaturated fats nourish radiant skin and cardiovascular flow."}, {"title": "Rich Nutty Roasted Flavor", "desc": "Deep earthy aroma and crunchy texture that elevates any simple traditional meal."}]'::jsonb,
  '["Enjoy 1 spoonful mixed with hot rice and sesame oil at the beginning of lunch.", "Perfect accompaniment for idli, dosai, or adai with a touch of cold-pressed oil.", "Roll into small nutritious wellness balls with palm jaggery for an evening energy bite."]'::jsonb,
  now()
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  category_label = excluded.category_label,
  price = excluded.price,
  original_price = excluded.original_price,
  volume = excluded.volume,
  badge = excluded.badge,
  tagline = excluded.tagline,
  description = excluded.description,
  ingredients = excluded.ingredients,
  in_stock = excluded.in_stock,
  stock_count = excluded.stock_count,
  card_image = excluded.card_image,
  bottle_image = excluded.bottle_image,
  scene_image = excluded.scene_image,
  poster_image = excluded.poster_image,
  key_benefits = excluded.key_benefits,
  how_to_use = excluded.how_to_use,
  updated_at = now();

-- ==============================================================================
-- 9. SEED ACTIVE COUPONS
-- ==============================================================================
insert into public.coupons (code, discount_type, discount_value, min_order, max_discount, is_active, description, usage_count, expiry_date, updated_at)
values
  ('ROOTS50', 'flat', 50, 499, 50, true, 'Flat ₹50 off on orders above ₹499', 0, '2026-12-31', now()),
  ('WELCOME10', 'percent', 10, 299, 100, true, '10% instant discount for new patrons', 0, '2026-12-31', now()),
  ('THENEE15', 'percent', 15, 699, 150, true, '15% off on festive Kadayam wellness combos', 0, '2026-12-31', now()),
  ('FREESHIP', 'flat', 40, 350, 40, true, 'Special free shipping voucher across India', 0, '2026-12-31', now())
on conflict (code) do update set
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_order = excluded.min_order,
  max_discount = excluded.max_discount,
  is_active = excluded.is_active,
  description = excluded.description,
  updated_at = now();

-- ==============================================================================
-- 10. SEED SITE CONTENT WITH LIVE BANNERS & MARQUEE
-- ==============================================================================
insert into public.site_content (key, content, updated_at)
values (
  'main',
  '{
    "marqueeText": "Fresh Daily Dispatches From Kadayam Village Unit • Free Speed Post Across India Over ₹499 • 100% Chemical-Free Ayurvedic Formulations",
    "marqueeSpeed": 30,
    "heroBanner": {
      "badge": "Direct from Kadayam, Tenkasi",
      "title": "Pure Western Ghats Botanical Formulations",
      "subtitle": "Hand-harvested by rural women artisans, sun-shade dried and stone-ground with zero synthetic additives.",
      "ctaText": "Explore Collection",
      "image": "/banner/3452da4c-b8af-400c-8278-89986c138532.png"
    },
    "heritageStory": {
      "title": "Pure Western Ghats Botanicals",
      "subtitle": "Handcrafted with devotion by rural women SHG artisans in Manthiyoor, Kadayam, Tenkasi District.",
      "fssaiLicense": "22425278000320",
      "familiesHealed": "16,000+",
      "womenArtisans": "100%",
      "image": "/images/custom_thenee/rural-women-artisans.jpg"
    },
    "promoTile1": {
      "heading": "Handcrafted Botanical Wellness",
      "body": "100% pure village-sourced herbal teas & traditional food podis.",
      "cta": "Explore Products",
      "image": "/images/custom_thenee/bliss-tea-scene.jpg"
    },
    "promoTile2": {
      "heading": "Free Shipping Over ₹499",
      "body": "Free delivery across India on all orders above ₹499 via Speed Post.",
      "cta": "Shop Now",
      "image": "/images/custom_thenee/herbal-harvest-village.jpg"
    }
  }'::jsonb,
  now()
)
on conflict (key) do update set
  content = excluded.content,
  updated_at = now();

-- ==============================================================================
-- 11. SEED STORE SETTINGS & LOGISTICS
-- ==============================================================================
insert into public.store_settings (key, settings, updated_at)
values (
  'main',
  '{
    "phone": "+91 7550248005",
    "whatsapp": "+917550248005",
    "email": "rootsenterprises2025@gmail.com",
    "fssai": "22425278000320",
    "address": "The Roots Enterprises, 2/224, South Street, Manthiyoor, Kadayam - 627415, Tenkasi District, Tamil Nadu",
    "freeShippingThreshold": 499,
    "standardShippingFee": 40,
    "greenPointValueInr": 0.5,
    "logo": "/images/custom_thenee/thenee-brand-logo.png",
    "fssaiBadge": "/images/custom_thenee/fssai-certified-badge.svg",
    "whatsappQr": "/images/custom_thenee/whatsapp-order-qr.svg",
    "instagramQr": "/images/custom_thenee/instagram-connect-qr.svg"
  }'::jsonb,
  now()
)
on conflict (key) do update set
  settings = excluded.settings,
  updated_at = now();

-- ==============================================================================
-- 12. SEED LIVE VERIFIED CUSTOMER REVIEWS
-- ==============================================================================
insert into public.reviews (id, product_id, user_name, location, rating, comment, image_url, verified, created_at)
values
  ('rev-1', 'herbal-tea', 'Kavitha Sundaram', 'Madurai', 5, 'Thenee Herbal Tea is now our family morning sacred ritual. Our digestion feels so light, internal body heat is balanced, and knowing it is handcrafted by rural women in Tamil Nadu makes it so special.', '/images/custom_thenee/herbal-tea-scene.jpg', true, now() - interval '14 days'),
  ('rev-2', 'bliss-tea', 'Aarthi Natarajan', 'Bengaluru', 5, 'The vibrant color of butterfly pea & hibiscus flowers is mesmerizing! It is completely caffeine-free, and drinking a warm cup before bed melts away all workday stress.', '/images/custom_thenee/bliss-tea-scene.jpg', true, now() - interval '10 days'),
  ('rev-3', 'moringa-powder', 'Dr. Senthil Kumar', 'Coimbatore', 5, 'You can immediately tell how freshly shade-dried the leaves are by the rich green color and clean aroma. It provides clean, non-jittery stamina throughout my long hospital shifts.', '/images/custom_thenee/moringa-scene.jpg', true, now() - interval '8 days'),
  ('rev-4', 'food-podis-collection', 'Meenakshi Raman', 'Chennai', 5, 'The Garlic Podi and Curry Leaves Podi bring back memories of my grandmother cooking in Tirunelveli. Authentic flavors, zero preservatives, and heavenly with hot rice and ghee!', '/images/custom_thenee/podis-scene.jpg', true, now() - interval '5 days')
on conflict (id) do update set
  comment = excluded.comment,
  rating = excluded.rating,
  image_url = excluded.image_url,
  verified = excluded.verified;

-- ==============================================================================
-- 13. PERMISSIONS & SCHEMA PRIVILEGES
-- ==============================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
