// =============================================================================
// THENEE E-COMMERCE - UNIFIED PRODUCT & CATALOG SERVICE
// Single authoritative source of truth connected to Supabase 'products' table
// Synchronizes dynamically across Supabase Cloud, localStorage, and React DOM
// =============================================================================

import { supabase, isSupabaseConfigured } from './supabase'

export const DEFAULT_PRICE_MAP = {
  'herbal-tea': 299,
  'bliss-tea': 349,
  'moringa-powder': 249,
  'food-podis-collection': 699,
  'garlic-podi': 180,
  'curry-leaves-podi': 180,
  'moringa-podi': 190,
  'sesame-podi': 180,
}

export const DEFAULT_PRODUCTS = [
  {
    id: 'bliss-tea',
    name: 'Thenee Bliss Tea',
    tag: 'Bliss Tea',
    category: 'tea',
    categoryLabel: 'Botanical Teas',
    price: 349,
    originalPrice: 449,
    rating: 4.95,
    reviews: 620,
    volume: '75g Floral Blend',
    badge: '100% Caffeine-Free',
    tagline: 'Sangu Poo & Sembaruthi Poo Herbal Floral Infusion',
    description: "THENEE's Bliss Tea is a premium herbal floral infusion of sangu poo (Butterfly Pea Flower) & sembaruthi poo (Hibiscus Flower) blending traditional herbal wisdom with the pure benefits of natural flowers.",
    ingredients: 'Natural Butterfly Pea Flower (Sangu Poo), Hibiscus (Sembaruthi Poo), Aromatic Botanicals',
    image: '/images/custom_thenee/bliss-tea-product.jpg',
    cardImage: '/images/custom_thenee/bliss-tea-product.jpg',
    bottle: '/images/custom_thenee/bliss-tea-bottle.png',
    poster: '/images/custom_thenee/bliss-tea-product.jpg',
    inStock: true,
    stockCount: 50,
    keyBenefits: [
      { title: 'Natural Antioxidants', desc: 'Loaded with plant polyphenols for cellular repair.' },
      { title: 'Calm & Stress Relief', desc: 'Restores natural calm and sustained energy.' },
      { title: 'Skin & Hair Health', desc: 'Traditionally cherished in Tamil medicine.' },
      { title: 'Caffeine-Free', desc: 'Delicate floral aroma with zero artificial flavors.' },
    ],
  },
  {
    id: 'herbal-tea',
    name: 'Thenee Herbal Tea',
    tag: 'Herbal Tea',
    category: 'tea',
    categoryLabel: 'Botanical Teas',
    price: 299,
    originalPrice: 399,
    rating: 4.9,
    reviews: 840,
    volume: '100g Pouch & Jar',
    badge: 'Best Seller',
    tagline: '100% Organic Traditional Healing Blend',
    description: 'Thenee Herbal Tea is a 100% organic, traditional blend handcrafted by rural women in Tamil Nadu. Inspired by natural healing, it restores balance, aids digestion, and boosts daily immunity.',
    ingredients: 'Traditional herbal blend, roots, botanical leaves, spices',
    image: '/images/custom_thenee/herbal-tea-product.jpg',
    cardImage: '/images/custom_thenee/herbal-tea-product.jpg',
    bottle: '/images/custom_thenee/herbal-tea-bottle.png',
    poster: '/images/custom_thenee/herbal-tea-product.jpg',
    inStock: true,
    stockCount: 45,
    keyBenefits: [
      { title: 'Blood Sugar & Metabolism', desc: 'Helps control blood sugar and support weight balance.' },
      { title: 'Digestive & Gut Health', desc: 'Promotes smooth digestion and gut comfort.' },
      { title: 'Body Balance & Immunity', desc: 'Balances internal heat and boosts immunity.' },
      { title: 'Detox & Radiance', desc: 'Purifies blood for clear, radiant skin.' },
    ],
  },
  {
    id: 'moringa-powder',
    name: 'Pure Moringa Powder',
    tag: 'Moringa Powder',
    category: 'superfood',
    categoryLabel: 'Superfood Powders',
    price: 249,
    originalPrice: 320,
    rating: 4.88,
    reviews: 430,
    volume: '150g Natural Pouch',
    badge: 'Village Superfood',
    tagline: '100% Pure Village Sourced Moringa Leaves',
    description: 'Freshly harvested organic moringa leaves, shade-dried and pulverized to preserve natural chlorophyll, plant protein, iron, and active antioxidants.',
    ingredients: '100% Pure Organic Moringa Oleifera Leaves',
    image: '/images/custom_thenee/moringa-powder-product.jpg',
    cardImage: '/images/custom_thenee/moringa-powder-product.jpg',
    bottle: '/images/custom_thenee/moringa-powder-bottle.png',
    poster: '/images/custom_thenee/moringa-powder-product.jpg',
    inStock: true,
    stockCount: 50,
    keyBenefits: [
      { title: 'Rich in Natural Iron & Calcium', desc: 'Supports hemoglobin and bone strength.' },
      { title: 'Daily Cellular Energy', desc: 'Jitter-free stamina for morning and evening.' },
      { title: 'Immunity & Immunity Defense', desc: 'Powerhouse of Vitamin C, A, and essential amino acids.' },
      { title: 'Pure Single-Origin', desc: 'Grown in Kadayam farm soil, pesticide-free.' },
    ],
  },
  {
    id: 'food-podis-collection',
    name: 'Traditional Food Podis',
    tag: 'Food Podis Set',
    category: 'combo',
    categoryLabel: 'Traditional Food Podis',
    price: 699,
    originalPrice: 850,
    rating: 4.92,
    reviews: 510,
    volume: 'Set of 4 Varieties (400g total)',
    badge: 'Heritage Flavors',
    tagline: 'Handcrafted Poondu, Karuveppilai, Murungai & Ellu Podis',
    description: 'Four authentic South Indian village spice powders handcrafted with sun-dried botanicals, cold-pressed spices, and stone-ground recipes.',
    ingredients: 'Garlic, Curry Leaves, Moringa, Sesame, Urad Dal, Chana Dal, Red Chillies, Salt',
    image: '/images/custom_thenee/food-podis-product.jpg',
    cardImage: '/images/custom_thenee/food-podis-product.jpg',
    bottle: '/images/custom_thenee/food-podis-bottle.png',
    poster: '/images/custom_thenee/food-podis-product.jpg',
    inStock: true,
    stockCount: 50,
    keyBenefits: [
      { title: 'Stone-Ground in Small Batches', desc: 'Traditional aroma and crunch retained.' },
      { title: 'Zero Preservatives or Chemicals', desc: 'Natural dry-roasted spices.' },
      { title: 'Perfect with Ghee & Hot Rice', desc: 'Classic Tenkasi village recipe.' },
      { title: 'Digestive & Nutrient-Dense', desc: 'Wholesome nutrition for everyday meals.' },
    ],
  },
]

export const DEFAULT_PODIS = [
  {
    id: 'garlic-podi',
    name: 'Garlic Powder',
    tag: 'Poondu Podi',
    category: 'podi',
    categoryLabel: 'Traditional Food Podi',
    price: 180,
    originalPrice: 220,
    rating: 4.95,
    reviews: 310,
    volume: '100g Pouch',
    badge: 'Heart & Gut',
    tagline: 'Dry-Roasted Country Garlic Spice Podi',
    description: 'Slow-roasted country garlic crushed with roasted lentils and aromatic spices. Excellent for digestive wellness and heart vitality.',
    ingredients: 'Country Garlic, Urad Dal, Chana Dal, Dry Red Chilli, Asafoetida, Rock Salt',
    image: '/images/custom_thenee/garlic-podi.jpg',
    cardImage: '/images/custom_thenee/garlic-podi.jpg',
    bottle: '/images/custom_thenee/garlic-podi-float.png',
    poster: '/images/custom_thenee/garlic-podi.jpg',
    inStock: true,
    stockCount: 50,
  },
  {
    id: 'curry-leaves-podi',
    name: 'Curry Leaves Powder',
    tag: 'Karuveppilai Podi',
    category: 'podi',
    categoryLabel: 'Traditional Food Podi',
    price: 180,
    originalPrice: 220,
    rating: 4.88,
    reviews: 245,
    volume: '100g Pouch',
    badge: 'Hair & Vision',
    tagline: 'Shade-Dried Iron-Rich Kadayam Curry Leaf Podi',
    description: 'Hand-picked tender curry leaves roasted with black pepper and cumin. Cherished in Tamil tradition for healthy hair roots and natural hemoglobin.',
    ingredients: 'Shade-Dried Curry Leaves, Urad Dal, Pepper, Cumin, Red Chilli, Salt',
    image: '/images/custom_thenee/curry-leaves-podi.jpg',
    cardImage: '/images/custom_thenee/curry-leaves-podi.jpg',
    bottle: '/images/custom_thenee/curry-leaves-podi-float.png',
    poster: '/images/custom_thenee/curry-leaves-podi.jpg',
    inStock: true,
    stockCount: 50,
  },
  {
    id: 'moringa-podi',
    name: 'Moringa Leaves Podi',
    tag: 'Murungai Keerai Podi',
    category: 'podi',
    categoryLabel: 'Traditional Food Podi',
    price: 190,
    originalPrice: 240,
    rating: 4.9,
    reviews: 280,
    volume: '100g Pouch',
    badge: 'Energy Superfood',
    tagline: 'Village Moringa Leaf Daily Table Podi',
    description: 'Fresh moringa leaves gently roasted with protein-packed pulses. A daily dietary powerhouse of calcium, iron, and cellular rejuvenation.',
    ingredients: 'Sun-Dried Moringa Leaves, Gram Dal, Coriander Seeds, Pepper, Chilli, Salt',
    image: '/images/custom_thenee/moringa-podi.jpg',
    cardImage: '/images/custom_thenee/moringa-podi.jpg',
    bottle: '/images/custom_thenee/moringa-podi-float.png',
    poster: '/images/custom_thenee/moringa-podi.jpg',
    inStock: true,
    stockCount: 50,
  },
  {
    id: 'sesame-podi',
    name: 'Sesame Powder',
    tag: 'Ellu Podi',
    category: 'podi',
    categoryLabel: 'Traditional Food Podi',
    price: 180,
    originalPrice: 220,
    rating: 4.85,
    reviews: 190,
    volume: '100g Pouch',
    badge: 'Bone Strength',
    tagline: 'Toasted Black Sesame & Lentil Blend',
    description: 'Nutritious black sesame seeds slow-roasted to bring out rich aroma and bone-strengthening natural calcium and healthy fatty acids.',
    ingredients: 'Black Sesame Seeds, Red Chilli, Asafoetida, Rock Salt, Urad Dal',
    image: '/images/custom_thenee/sesame-podi.jpg',
    cardImage: '/images/custom_thenee/sesame-podi.jpg',
    bottle: '/images/custom_thenee/sesame-podi-float.png',
    poster: '/images/custom_thenee/sesame-podi.jpg',
    inStock: true,
    stockCount: 50,
  },
]

const PODI_IDS = new Set(['garlic-podi', 'curry-leaves-podi', 'moringa-podi', 'sesame-podi'])

const STORAGE_KEYS = {
  PRODUCTS: 'thenee_products_master',
  PODIS: 'thenee_podis_master',
}

export const getProductImage = (p) => {
  if (!p) return '/images/custom_thenee/herbal-tea-product.jpg'
  return p.cardImage || p.image || p.card_image || p.bottle || '/images/custom_thenee/herbal-tea-product.jpg'
}

export const getProductBottle = (p) => {
  if (!p) return '/images/custom_thenee/herbal-tea-bottle.png'
  return p.bottle || p.cardImage || p.image || '/images/custom_thenee/herbal-tea-bottle.png'
}

// Sanitize product items so price is NEVER 0 and image properties are unified
const sanitizeProductList = (items, isPodiList = false) => {
  if (!Array.isArray(items)) return isPodiList ? [...DEFAULT_PODIS] : [...DEFAULT_PRODUCTS]
  return items.map((item) => {
    const fallbackPrice = DEFAULT_PRICE_MAP[item.id] || (isPodiList ? 180 : 299)
    const cleanPrice = Number(item.price) > 0 ? Number(item.price) : fallbackPrice
    const activeImg = item.cardImage || item.image || item.card_image || item.bottle || ''
    const defaultImg = isPodiList ? '/images/custom_thenee/garlic-podi.jpg' : '/images/custom_thenee/herbal-tea-product.jpg'
    const finalImg = activeImg || defaultImg

    return {
      ...item,
      price: cleanPrice,
      cardImage: finalImg,
      image: finalImg,
      bottle: item.bottle || finalImg,
      poster: item.poster || finalImg,
      inStock: item.inStock !== false,
      stockCount: Number(item.stockCount) > 0 ? Number(item.stockCount) : 50,
    }
  })
}

// Map database snake_case fields to clean camelCase application objects
const formatProductFromDb = (row) => {
  const isPodi = PODI_IDS.has(row.id) || row.category === 'podi'
  const fallbackPrice = DEFAULT_PRICE_MAP[row.id] || (isPodi ? 180 : 299)
  const cleanPrice = Number(row.price) > 0 ? Number(row.price) : fallbackPrice
  const activeImg = row.card_image || row.image || row.bottle || (isPodi ? '/images/custom_thenee/garlic-podi.jpg' : '/images/custom_thenee/herbal-tea-product.jpg')

  return {
    id: row.id,
    name: row.name || 'Herbal Product',
    tag: row.tag || row.name,
    category: row.category || (isPodi ? 'podi' : 'tea'),
    categoryLabel: row.category_label || (isPodi ? 'Traditional Food Podi' : 'Botanical Teas'),
    price: cleanPrice,
    originalPrice: row.original_price ? Number(row.original_price) : null,
    rating: Number(row.rating) || 5.0,
    reviews: Number(row.reviews) || 0,
    volume: row.volume || (isPodi ? '100g Pouch' : '100g Pouch & Jar'),
    badge: row.badge || '',
    tagline: row.tagline || '',
    description: row.description || '',
    ingredients: row.ingredients || '',
    image: activeImg,
    cardImage: activeImg,
    bottle: row.bottle || activeImg,
    poster: row.poster || activeImg,
    inStock: row.in_stock !== false,
    stockCount: Number(row.stock_count) > 0 ? Number(row.stock_count) : 50,
    keyBenefits: Array.isArray(row.key_benefits) ? row.key_benefits : [],
    howToUse: Array.isArray(row.how_to_use) ? row.how_to_use : [],
  }
}

// In-memory runtime cache
let memoryProducts = null
let memoryPodis = null
let realtimeChannel = null

export const productService = {
  // Synchronous read (used for instant render without flash of empty content)
  getProducts() {
    if (memoryProducts && memoryProducts.length > 0) {
      return memoryProducts
    }

    if (typeof window !== 'undefined') {
      try {
        // Clear any old legacy cache keys that contained corrupt price: 0
        localStorage.removeItem('thenee_cms_products')

        const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeProductList(parsed, false)
            memoryProducts = sanitized
            return sanitized
          }
        }
      } catch (e) {
        console.warn('ProductService localStorage read notice:', e)
      }
    }

    memoryProducts = sanitizeProductList(DEFAULT_PRODUCTS, false)
    return memoryProducts
  },

  getPodis() {
    if (memoryPodis && memoryPodis.length > 0) {
      return memoryPodis
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thenee_cms_podis')

        const stored = localStorage.getItem(STORAGE_KEYS.PODIS)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeProductList(parsed, true)
            memoryPodis = sanitized
            return sanitized
          }
        }
      } catch (e) {
        console.warn('ProductService podis read notice:', e)
      }
    }

    memoryPodis = sanitizeProductList(DEFAULT_PODIS, true)
    return memoryPodis
  },

  // Notify all open components and windows that products updated
  notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thenee_products_updated', { detail: { timestamp: Date.now() } }))
      window.dispatchEvent(new CustomEvent('thenee_cms_updated', { detail: { timestamp: Date.now() } }))
      window.dispatchEvent(new Event('storage'))
    }
  },

  // Central fetch from Supabase database (Single Source of Truth)
  async syncFromDatabase() {
    if (!isSupabaseConfigured || !supabase) return false

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('Supabase products fetch notice:', error.message)
        return false
      }

      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(formatProductFromDb)
        const mainProds = sanitizeProductList(formatted.filter((p) => !PODI_IDS.has(p.id)), false)
        const podiProds = sanitizeProductList(formatted.filter((p) => PODI_IDS.has(p.id)), true)

        if (mainProds.length > 0) {
          memoryProducts = mainProds
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mainProds))
            } catch { }
          }
        }

        if (podiProds.length > 0) {
          memoryPodis = podiProds
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(podiProds))
            } catch { }
          }
        }

        this.notifyUpdate()
        return true
      }
    } catch (err) {
      console.warn('Product database sync failed:', err)
    }

    return false
  },

  // Save product directly to Supabase and update local state
  async saveProduct(productData) {
    if (!productData || !productData.name) {
      throw new Error('Product name is required')
    }

    const isPodi = PODI_IDS.has(productData.id) || productData.category === 'podi'
    const fallbackPrice = DEFAULT_PRICE_MAP[productData.id] || (isPodi ? 180 : 299)
    const cleanPrice = Number(productData.price) > 0 ? Number(productData.price) : fallbackPrice
    const activeImg = productData.cardImage || productData.image || productData.card_image || productData.bottle || (isPodi ? '/images/custom_thenee/garlic-podi.jpg' : '/images/custom_thenee/herbal-tea-product.jpg')

    const formattedProduct = {
      ...productData,
      id: productData.id || `custom-prod-${Date.now()}`,
      name: productData.name.trim(),
      price: cleanPrice,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      stockCount: Number(productData.stockCount) > 0 ? Number(productData.stockCount) : 50,
      inStock: productData.inStock !== false,
      image: activeImg,
      cardImage: activeImg,
      card_image: activeImg,
      bottle: productData.bottle || activeImg,
      poster: productData.poster || activeImg,
    }

    // 1. Update in-memory and localStorage immediately for instant UI responsiveness
    if (isPodi) {
      const list = [...this.getPodis()]
      const idx = list.findIndex((p) => p.id === formattedProduct.id)
      if (idx >= 0) {
        list[idx] = formattedProduct
      } else {
        list.push(formattedProduct)
      }
      memoryPodis = sanitizeProductList(list, true)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(memoryPodis))
        } catch { }
      }
    } else {
      const list = [...this.getProducts()]
      const idx = list.findIndex((p) => p.id === formattedProduct.id)
      if (idx >= 0) {
        list[idx] = formattedProduct
      } else {
        list.push(formattedProduct)
      }
      memoryProducts = sanitizeProductList(list, false)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(memoryProducts))
        } catch { }
      }
    }

    this.notifyUpdate()

    // 2. Persist to Supabase Database
    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = {
          id: formattedProduct.id,
          name: formattedProduct.name,
          tag: formattedProduct.tag || formattedProduct.name,
          category: formattedProduct.category || (isPodi ? 'podi' : 'tea'),
          category_label: formattedProduct.categoryLabel || (isPodi ? 'Traditional Food Podi' : 'Botanical Teas'),
          price: formattedProduct.price,
          original_price: formattedProduct.originalPrice,
          volume: formattedProduct.volume || (isPodi ? '100g Pouch' : '100g Pouch & Jar'),
          badge: formattedProduct.badge || '',
          tagline: formattedProduct.tagline || '',
          description: formattedProduct.description || '',
          ingredients: formattedProduct.ingredients || '',
          image: activeImg,
          card_image: activeImg,
          bottle: formattedProduct.bottle || activeImg,
          poster: formattedProduct.poster || activeImg,
          in_stock: formattedProduct.inStock,
          stock_count: formattedProduct.stockCount,
          key_benefits: Array.isArray(formattedProduct.keyBenefits) ? formattedProduct.keyBenefits : [],
          how_to_use: Array.isArray(formattedProduct.howToUse) ? formattedProduct.howToUse : [],
          rating: Number(formattedProduct.rating) || 5.0,
          reviews: Number(formattedProduct.reviews) || 0,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('products').upsert(dbRow, { onConflict: 'id' })
        if (error) {
          console.warn('Supabase product upsert warning:', error.message)
        } else {
          console.log(`Product "${formattedProduct.name}" successfully committed to cloud database!`)
        }
      } catch (err) {
        console.warn('Supabase saveProduct error:', err)
      }
    }

    return formattedProduct
  },

  // Delete product from Supabase and local cache
  async deleteProduct(productId) {
    if (!productId) return

    // Update local state
    memoryProducts = this.getProducts().filter((p) => p.id !== productId)
    memoryPodis = this.getPodis().filter((p) => p.id !== productId)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(memoryProducts))
        localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(memoryPodis))
      } catch { }
    }

    this.notifyUpdate()

    // Delete from Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId)
        console.log(`Product "${productId}" removed from database.`)
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err)
      }
    }
  },

  // Reset entire catalog back to clean pristine defaults
  async resetToDefaults() {
    memoryProducts = sanitizeProductList(DEFAULT_PRODUCTS, false)
    memoryPodis = sanitizeProductList(DEFAULT_PODIS, true)

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thenee_cms_products')
        localStorage.removeItem('thenee_cms_podis')
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(memoryProducts))
        localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(memoryPodis))
      } catch { }
    }

    this.notifyUpdate()

    if (isSupabaseConfigured && supabase) {
      const all = [...DEFAULT_PRODUCTS, ...DEFAULT_PODIS].map((p) => {
        const isPodi = PODI_IDS.has(p.id) || p.category === 'podi'
        const activeImg = p.cardImage || p.image || p.bottle
        return {
          id: p.id,
          name: p.name,
          tag: p.tag || p.name,
          category: p.category,
          category_label: p.categoryLabel,
          price: p.price,
          original_price: p.originalPrice || null,
          volume: p.volume,
          badge: p.badge || '',
          tagline: p.tagline || '',
          description: p.description || '',
          ingredients: p.ingredients || '',
          image: activeImg,
          card_image: activeImg,
          bottle: p.bottle || activeImg,
          poster: p.poster || activeImg,
          in_stock: true,
          stock_count: p.stockCount || 50,
          rating: p.rating || 5,
          reviews: p.reviews || 0,
          key_benefits: p.keyBenefits || [],
          how_to_use: p.howToUse || [],
          updated_at: new Date().toISOString(),
        }
      })

      try {
        for (const item of all) {
          await supabase.from('products').upsert(item, { onConflict: 'id' })
        }
        console.log('Database catalog reset to pristine defaults.')
      } catch (e) {
        console.warn('Database reset warning:', e)
      }
    }
  },
}

// Global real-time subscription for instant multi-user & multi-tab synchronization
export function initProductRealtimeSync() {
  if (typeof window === 'undefined' || !isSupabaseConfigured || !supabase || realtimeChannel) return

  try {
    realtimeChannel = supabase
      .channel('products_live_sync_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        productService.syncFromDatabase()
      })
      .subscribe()
  } catch (err) {
    console.warn('Realtime channel subscription notice:', err)
  }
}

// Automatically trigger initial database sync and realtime subscription on module boot
if (typeof window !== 'undefined') {
  productService.syncFromDatabase()
  initProductRealtimeSync()
}
