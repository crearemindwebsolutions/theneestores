-- =============================================================================
-- THENEE STORES - DATABASE SCHEMA & PRODUCT CATALOG SETUP
-- Run this in your Supabase Project -> SQL Editor -> Click 'Run'
-- =============================================================================

-- 1. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT,
  category TEXT DEFAULT 'tea',
  category_label TEXT DEFAULT 'Botanical Teas',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  volume TEXT,
  badge TEXT,
  tagline TEXT,
  description TEXT,
  ingredients TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 50,
  card_image TEXT,
  bottle TEXT,
  image TEXT,
  poster TEXT,
  scene TEXT,
  key_benefits JSONB DEFAULT '[]'::jsonb,
  how_to_use JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT DEFAULT 'flat',
  discount_value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  expiry_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE STORE SETTINGS & SITE CONTENT TABLES
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 5. CREATE CLEAN RLS POLICIES FOR FULL STORE OPERATION
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Insert Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Update Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Delete Products" ON public.products;

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Products" ON public.products FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow All Insert Coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow All Update Coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow All Delete Coupons" ON public.coupons;

CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Coupons" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Coupons" ON public.coupons FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Coupons" ON public.coupons FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow All Upsert Settings" ON public.store_settings;
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow All Upsert Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Site Content" ON public.site_content;
DROP POLICY IF EXISTS "Allow All Upsert Site Content" ON public.site_content;
CREATE POLICY "Public Read Site Content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Allow All Upsert Site Content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);

-- 6. SEED INITIAL PRODUCTS (UPSERT SO IT NEVER OVERWRITES CUSTOM CHANGES)
INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'bliss-tea', 'Thenee Bliss Tea', 'Bliss Tea', 'tea', 'Botanical Teas', 349, 449, '75g Floral Blend', '100% Caffeine-Free', 'Sangu Poo & Sembaruthi Poo Herbal Floral Infusion', 'THENEE''s Bliss Tea is a premium herbal floral infusion of sangu poo (Butterfly Pea Flower) & sembaruthi poo (Hibiscus Flower) blending traditional herbal wisdom with the pure benefits of natural flowers. Crafted from a vibrant mix of butterfly pea flower, hibiscus, and aromatic botanicals.', 'Natural Butterfly Pea Flower (Sangu Poo), Hibiscus (Sembaruthi Poo), Aromatic Botanicals', true, 50, '/images/custom_thenee/bliss-tea-product.jpg', '/images/custom_thenee/bliss-tea-bottle.png', '/images/custom_thenee/bliss-tea-product.jpg', '/images/custom_thenee/bliss-tea-product.jpg', '[{"title":"Natural Antioxidants","desc":"Loaded with plant polyphenols and anthocyanins for deep cellular repair."},{"title":"Calm & Stress Relief","desc":"Restores natural calm and sustained energy for both body and mind."},{"title":"Skin & Hair Health","desc":"Traditionally cherished in Tamil medicine to nourish glowing skin and hair follicles."},{"title":"Aromatic & Caffeine-Free","desc":"Delicate floral aroma with a premium taste, zero artificial colors, preservatives, or added sugar."}]'::jsonb, '["Boil 150ml water and take off flame.","Add 1 teaspoon of Bliss Tea petals.","Cover and infuse for 3–5 minutes until vibrant blue-purple hues bloom.","Strain and sip warm or chilled. Add a dash of lemon for a magical violet color shift!"]'::jsonb, 4.95, 620
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'herbal-tea', 'Thenee Herbal Tea', 'Herbal Tea', 'tea', 'Botanical Teas', 299, 399, '100g Pouch & Jar', 'Best Seller', '100% Organic Traditional Healing Blend', 'Thenee Herbal Tea is a 100% organic, traditional blend handcrafted by rural women in Tamil Nadu. Inspired by natural healing, it restores balance, aids digestion, and boosts daily immunity.', 'Traditional herbal blend, roots, botanical leaves, spices', true, 50, '/images/custom_thenee/herbal-tea-product.jpg', '/images/custom_thenee/herbal-tea-bottle.png', '/images/custom_thenee/herbal-tea-product.jpg', '/images/custom_thenee/herbal-tea-product.jpg', '[{"title":"Blood Sugar & Metabolism","desc":"Helps control blood sugar levels and supports natural weight management."},{"title":"Digestive & Gut Health","desc":"Promotes smooth digestion and improves overall gut comfort."},{"title":"Body Balance & Immunity","desc":"Balances internal body heat, boosts immunity, and lowers bad cholesterol."},{"title":"Detox & Radiance","desc":"Purifies the blood to support clear, glowing skin from within."}]'::jsonb, '["Boil 150ml of clean drinking water.","Add 1 teaspoon of Thenee Herbal Tea.","Brew gently for 2–3 minutes to release active botanicals.","Strain and enjoy warm. (Optional: Add pure honey or palm jaggery)."]'::jsonb, 4.9, 840
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'moringa-powder', 'Pure Moringa Powder', 'Moringa Powder', 'superfood', 'Superfood Powders', 249, 320, '150g Natural Pouch', 'Village Superfood', '100% Pure Village Sourced Moringa Leaves', 'THENEE''s Pure Moringa Powder is a natural superfood made from 100% pure moringa leaves. Carefully sourced from villages in Tamil Nadu and gently shade-dried and processed to retain maximum nutrients, vitamins, and minerals.', '100% Pure Shade-Dried Moringa Oleifera Leaves', true, 50, '/images/custom_thenee/moringa-powder-product.jpg', '/images/custom_thenee/moringa-powder-bottle.png', '/images/custom_thenee/moringa-powder-product.jpg', '/images/custom_thenee/moringa-powder-product.jpg', '[{"title":"Rich in Essential Nutrients","desc":"Abundant in natural vitamins A & C, calcium, iron, and plant-based complete protein."},{"title":"Energy & Daily Stamina","desc":"Provides natural, clean, long-lasting energy throughout the day without caffeine crash."},{"title":"Immunity & Body Defenses","desc":"High in bioflavonoids and antioxidants to strengthen immune defenses naturally."},{"title":"Gut Health & Digestion","desc":"High natural dietary fiber supports smooth digestion and healthy gut flora."}]'::jsonb, '["Mix 1/2 to 1 teaspoon into warm water, morning smoothie, or buttermilk.","Can also be mixed directly into warm cooked rice with ghee or stirred into dal and soups."]'::jsonb, 4.88, 510
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'food-podis-collection', 'Traditional Food Podis', 'Traditional Podis', 'podi', 'Food Podis', 699, 850, 'Set of 4 Varieties (400g total)', 'Heritage Flavors', 'Handcrafted Poondu, Karuveppilai, Murungai & Ellu Podis', 'THENEE offers a traditional range of nutrient-rich podi varieties handcrafted by rural women in Tamil Nadu. Made with 100% natural ingredients, zero preservatives, and zero artificial additives, these versatile powders add authentic flavor and wellness to everyday meals like rice, idli, dosa, and curd rice.', 'Hand-picked herbs, seeds, lentils, rock salt, traditional spices (No additives)', true, 50, '/images/custom_thenee/food-podis-product.jpg', '/images/custom_thenee/food-podis-bottle.png', '/images/custom_thenee/food-podis-product.jpg', '/images/custom_thenee/food-podis-product.jpg', '[{"title":"Poondu Podi (Garlic)","desc":"Rich in natural allicin & antioxidants; supports gut comfort and heart wellness."},{"title":"Karuveppilai Podi (Curry Leaves)","desc":"Loaded with bio-available iron and vitamin A to improve eyesight and healthy hair."},{"title":"Murungakeerai Podi (Moringa)","desc":"Mineral-rich green superfood to balance body heat and boost metabolic vitality."},{"title":"Ellu Podi (Sesame)","desc":"Premium roasted sesame packed with bone-strengthening calcium and healthy fats."}]'::jsonb, '["Mix 1-2 spoons with hot steamed rice and add sesame oil or cow ghee.","Serve as a flavorful side dip for idli, dosa, adai, or sprinkle over curd rice."]'::jsonb, 4.92, 730
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'garlic-podi', 'Garlic Powder', 'Garlic Powder', 'podi', 'Traditional Food Podi', 180, 220, '100g', 'Heart & Gut', '', 'THENEE Garlic Powder is a traditional hand-roasted digestive blend made from authentic village garlic and spices. Slow-roasted over firewood in Kadayam, it protects gut microflora, reduces acidity, and brings authentic South Indian home aroma to hot steamed rice with country ghee.', 'Country Garlic, Roasted Gram (Urad Dal, Chana Dal), Red Chilies, Cumin, Asafoetida (Hing), Himalayan Rock Salt', true, 50, '/images/custom_thenee/garlic-podi.jpg', '/images/custom_thenee/garlic-podi-float.png', '/images/custom_thenee/garlic-podi.jpg', '/images/custom_thenee/garlic-podi.jpg', '[{"title":"Supports Gut & Digestive Health","desc":"Natural allicin in roasted garlic calms acid reflux, reduces bloating, and improves gut microflora."},{"title":"Lowers Bad Cholesterol","desc":"Promotes heart health and healthy lipid profiles when consumed as part of daily meals."},{"title":"Boosts Natural Immunity","desc":"Rich in sulfur compounds and plant antioxidants to protect against seasonal infections."},{"title":"Savory & Comforting Kick","desc":"Aromatic roasted garlic flavor that pairs perfectly with hot rice, idli, dosai, or curries."}]'::jsonb, '[]'::jsonb, 4.9, 430
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'curry-leaves-podi', 'Curry Leaves Powder', 'Curry Leaves Powder', 'podi', 'Traditional Food Podi', 180, 220, '100g', 'Hair & Vision', '', 'THENEE Curry Leaves Powder is handcrafted from fresh, tender village curry leaves harvested from the foothills of the Western Ghats. Sun-dried and gently roasted with traditional pulses, it is naturally loaded with plant-based iron, essential vitamins, and potent antioxidants to nurture hair growth, vision, and iron levels.', 'Fresh Mountain Curry Leaves, Urad Dal, Bengal Gram, Black Pepper, Cumin Seeds, Dry Red Chilies, Asafoetida, Rock Salt', true, 50, '/images/custom_thenee/curry-leaves-podi.jpg', '/images/custom_thenee/curry-leaves-podi-float.png', '/images/custom_thenee/curry-leaves-podi.jpg', '/images/custom_thenee/curry-leaves-podi.jpg', '[{"title":"Rich in Natural Plant Iron","desc":"Naturally combats iron deficiency and improves hemoglobin without synthetic supplements."},{"title":"Promotes Dense Hair Growth","desc":"High beta-carotene and amino acid content nourish hair follicles and prevent premature graying."},{"title":"Enhances Vision & Eye Health","desc":"Packed with natural Vitamin A to protect eye cells and relieve screen strain."},{"title":"Aids Smooth Daily Digestion","desc":"Carminative properties stimulate digestive enzymes and soothe intestinal walls."}]'::jsonb, '[]'::jsonb, 4.85, 390
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'moringa-podi', 'Moringa Leaves Podi', 'Moringa Leaves Podi', 'podi', 'Traditional Food Podi', 190, 240, '100g', 'Energy Superfood', '', 'THENEE Moringa Leaves Podi is made from tender, shade-dried drumstick tree leaves sourced from pesticide-free village groves in Tenkasi. Renowned as nature’s most complete botanical multivitamin, it provides bioavailable calcium, plant protein, and essential minerals to balance core body heat and sustain day-long vitality.', 'Shade-Dried Moringa Leaves, Split Urad Dal, Chana Dal, Cumin, Pepper, Dry Red Chilies, Asafoetida, Rock Salt', true, 50, '/images/custom_thenee/moringa-podi.jpg', '/images/custom_thenee/moringa-podi-float.png', '/images/custom_thenee/moringa-podi.jpg', '/images/custom_thenee/moringa-podi.jpg', '[{"title":"Complete Green Multivitamin","desc":"Loaded with 7x the Vitamin C of oranges and 4x the calcium of milk in natural plant form."},{"title":"Balances Internal Body Heat","desc":"Gently cools the internal digestive tract and relieves heat-induced fatigue."},{"title":"Sustained Metabolic Energy","desc":"Plant-based amino acids and chlorophyll provide clean stamina without caffeine."},{"title":"Joint & Bone Density Support","desc":"High bio-calcium and phosphorus nurture bone strength and ease joint stiffness."}]'::jsonb, '[]'::jsonb, 4.9, 470
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

INSERT INTO public.products (
  id, name, tag, category, category_label, price, original_price, volume, badge, tagline, description, ingredients, in_stock, stock_count, card_image, bottle, image, poster, key_benefits, how_to_use, rating, reviews
) VALUES (
  'sesame-podi', 'Sesame Powder', 'Sesame Powder', 'podi', 'Traditional Food Podi', 180, 220, '100g', 'Bone Strength', '', 'THENEE Sesame Powder (Ellu Podi) is crafted from heritage black sesame seeds, slow-roasted in iron pans to preserve natural lignans and healthy fats. Revered in traditional village nutrition for building bone density, hormone balance, and deep cellular strength.', 'Heritage Black Sesame Seeds, Roasted Urad Dal, Dry Red Chilies, Cumin, Pure Asafoetida, Sea Salt', true, 50, '/images/custom_thenee/sesame-podi.jpg', '/images/custom_thenee/sesame-podi-float.png', '/images/custom_thenee/sesame-podi.jpg', '/images/custom_thenee/sesame-podi.jpg', '[{"title":"Highest Natural Plant Calcium","desc":"One of the richest botanical sources of calcium, vital for bone density and joint mobility."},{"title":"Hormonal Balance & Vitality","desc":"Natural sesamin lignans support healthy estrogen balance and cyclical wellness."},{"title":"Healthy Fats for Heart & Skin","desc":"Monounsaturated and polyunsaturated fats nourish radiant skin and support cardiovascular flow."},{"title":"Rich Nutty Roasted Flavor","desc":"Deep, earthy aroma and crunchy texture that elevates any simple traditional meal."}]'::jsonb, '[]'::jsonb, 4.8, 310
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price;

