const fs = require('fs');
const path = require('path');

const mediaList = JSON.parse(fs.readFileSync('src/data/websiteMedia.json', 'utf8'));

let sql = `-- ==============================================================================
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
`;

mediaList.forEach(m => {
  const escTitle = m.title.replace(/'/g, "''");
  const escAlt = m.alt_text.replace(/'/g, "''");
  const escTag = (m.tag || '').replace(/'/g, "''");
  sql += `insert into public.media (id, title, category, file_path, alt_text, media_type, file_size, tag, is_active, updated_at)
values ('${m.id}', '${escTitle}', '${m.category}', '${m.file_path}', '${escAlt}', '${m.media_type}', ${m.file_size}, '${escTag}', true, now())
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
`;
});

sql += `
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
`;

fs.writeFileSync('supabase-media-and-catalog.sql', sql);
console.log('Successfully written supabase-media-and-catalog.sql! File size:', (sql.length/1024).toFixed(1), 'KB');
