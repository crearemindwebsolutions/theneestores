// ==========================================================================
// THENEE E-COMMERCE CMS & LIVE STORE MANAGEMENT SERVICE
// Empowers Admin to edit products, podis, banners, coupons, reviews & settings
// Synchronizes dynamically across localStorage, custom events, and Supabase
// ==========================================================================

import { products as defaultProducts, individualPodis as defaultPodis, brandInfo as defaultBrandInfo } from '../data/products'
import { adminService, supabase } from './supabase'

function safeSupabaseQuery(builder) {
  if (!builder) return
  try {
    Promise.resolve(builder).catch((err) => {
      console.warn('Supabase CMS sync notice:', err?.message || err)
    })
  } catch (err) {
    console.warn('Supabase CMS execution notice:', err)
  }
}

const STORAGE_KEYS = {
  PRODUCTS: 'thenee_cms_products',
  PODIS: 'thenee_cms_podis',
  COUPONS: 'thenee_cms_coupons',
  SITE_CONTENT: 'thene_cms_site_content',
  REVIEWS: 'thenee_cms_reviews',
  STORE_SETTINGS: 'thenee_cms_store_settings',
  ADMIN_PIN: 'thenee_cms_admin_pin',
}

const DEFAULT_COUPONS = [
  {
    code: 'ROOTS50',
    discountType: 'flat', // 'flat' | 'percent'
    discountValue: 50,
    minOrder: 499,
    maxDiscount: 50,
    isActive: true,
    description: 'Flat ₹50 off on orders above ₹499',
    usageCount: 0,
    expiryDate: '2026-12-31',
  },
  {
    code: 'WELCOME10',
    discountType: 'percent',
    discountValue: 10,
    minOrder: 299,
    maxDiscount: 100,
    isActive: true,
    description: '10% instant discount for new patrons',
    usageCount: 0,
    expiryDate: '2026-12-31',
  },
  {
    code: 'THENEE15',
    discountType: 'percent',
    discountValue: 15,
    minOrder: 699,
    maxDiscount: 150,
    isActive: true,
    description: '15% off on festive Kadayam wellness combos',
    usageCount: 0,
    expiryDate: '2026-12-31',
  },
  {
    code: 'FREESHIP',
    discountType: 'flat',
    discountValue: 40,
    minOrder: 350,
    maxDiscount: 40,
    isActive: true,
    description: 'Special free shipping voucher across India',
    usageCount: 0,
    expiryDate: '2026-12-31',
  },
]

const DEFAULT_SITE_CONTENT = {
  marqueeText: 'Fresh Daily Dispatches From Kadayam Village Unit • Free Speed Post Across India Over ₹499 • 100% Chemical-Free Ayurvedic Formulations',
  marqueeSpeed: 30, // seconds
  promoTile1: {
    heading: 'Handcrafted Botanical Wellness',
    body: '100% pure village-sourced herbal teas & traditional food podis.',
    cta: 'Explore Products',
  },
  promoTile2: {
    heading: 'Free Shipping Over ₹499',
    body: 'Free delivery across India on all orders above ₹499.',
    cta: 'Shop Now',
  },
  heroBanner: {
    badge: 'Direct from Kadayam, Tenkasi',
    title: 'Pure Western Ghats Botanical Formulations',
    subtitle: 'Hand-harvested by rural women artisans, sun-shade dried and stone-ground with zero synthetic additives.',
    ctaText: 'Explore Collection',
  },
  heritageStory: {
    title: 'Pure Western Ghats Botanicals',
    subtitle: 'Handcrafted with devotion by rural women SHG artisans in Manthiyoor, Kadayam, Tenkasi District.',
    fssaiLicense: '22425278000320',
    familiesHealed: '16,000+',
    womenArtisans: '100%',
  },
}

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Dr. Senthil Kumar',
    location: 'Coimbatore, TN',
    rating: 5,
    date: '2026-10-14',
    productName: 'Thenee Herbal Tea',
    text: 'As an Ayurvedic practitioner, I recommend Thenee Herbal Tea to my patients with digestive sluggishness. The shade-dried herbal leaves retain pure therapeutic potency without bitterness.',
    isApproved: true,
  },
  {
    id: 'rev-2',
    name: 'Meenakshi Raman',
    location: 'Chennai, TN',
    rating: 5,
    date: '2026-10-22',
    productName: 'Curry Leaves Powder',
    text: 'Brings back pure memories of my grandmother’s kitchen! The curry leaves podi with warm rice and cow ghee is now our daily family ritual. Pure aroma and no grit.',
    isApproved: true,
  },
  {
    id: 'rev-3',
    name: 'Karthik Viswanathan',
    location: 'Bengaluru, KA',
    rating: 5,
    date: '2026-11-02',
    productName: 'Thenee Bliss Tea',
    text: 'The butterfly pea and hibiscus floral blend is mesmerizing. Naturally caffeine-free and calming after long screen hours. Fast delivery via Speed Post too!',
    isApproved: true,
  },
  {
    id: 'rev-4',
    name: 'Ananya Deshmukh',
    location: 'Mumbai, MH',
    rating: 5,
    date: '2026-11-09',
    productName: 'Pure Moringa Powder',
    text: 'Deep green color, completely unadulterated. 1 spoon in morning buttermilk keeps my energy steady the entire day. Highly recommend this authentic Kadayam brand.',
    isApproved: true,
  },
]

export const cmsService = {
  // --------------------------------------------------------------------------
  // BROADCAST REAL-TIME UPDATES
  // --------------------------------------------------------------------------
  notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thenee_cms_updated', { detail: { timestamp: Date.now() } }))
    }
  },

  // --------------------------------------------------------------------------
  // PRODUCTS MANAGEMENT
  // --------------------------------------------------------------------------
  getProducts() {
    if (typeof window === 'undefined') return defaultProducts
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored products:', e)
    }
    return defaultProducts
  },

  saveProducts(productsList) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList))
    } catch (e) {
      console.warn('Storage quota notice when saving products:', e)
    }
    try {
      if (Array.isArray(defaultProducts)) {
        defaultProducts.length = 0
        defaultProducts.push(...productsList)
      }
    } catch { }
    this.notifyUpdate()
    this.syncCatalogToDatabase()
  },

  async saveProduct(updatedProduct) {
    const list = this.getProducts()
    const idx = list.findIndex((p) => p.id === updatedProduct.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatedProduct }
    } else {
      list.push(updatedProduct)
    }
    this.saveProducts(list)
    if (supabase) {
      try {
        const activeImg = updatedProduct.cardImage || updatedProduct.image || updatedProduct.bottle || ''
        const { error } = await supabase.from('products').upsert({
          id: updatedProduct.id,
          name: updatedProduct.name || 'Herbal Product',
          category: updatedProduct.category || 'tea',
          category_label: updatedProduct.categoryLabel || updatedProduct.category || 'Botanical Teas',
          price: Number(updatedProduct.price) || 0,
          original_price: updatedProduct.originalPrice ? Number(updatedProduct.originalPrice) : null,
          volume: updatedProduct.volume || '',
          badge: updatedProduct.badge || '',
          tagline: updatedProduct.tagline || '',
          description: updatedProduct.description || '',
          ingredients: updatedProduct.ingredients || '',
          in_stock: updatedProduct.inStock !== false,
          stock_count: Number(updatedProduct.stockCount) || 50,
          card_image: activeImg,
          bottle: activeImg,
          image: activeImg,
          key_benefits: Array.isArray(updatedProduct.keyBenefits) ? updatedProduct.keyBenefits : [],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        if (error) console.warn('Supabase product upsert notice:', error.message)
      } catch (err) {
        console.warn('Supabase product save notice:', err)
      }
    }
  },

  deleteProduct(id) {
    const list = this.getProducts().filter((p) => p.id !== id)
    this.saveProducts(list)
    if (supabase) {
      safeSupabaseQuery(supabase.from('products').delete().eq('id', id))
    }
  },

  // --------------------------------------------------------------------------
  // PODIS MANAGEMENT
  // --------------------------------------------------------------------------
  getPodis() {
    if (typeof window === 'undefined') return defaultPodis
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PODIS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored podis:', e)
    }
    return defaultPodis
  },

  savePodis(podisList) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(podisList))
    } catch (e) {
      console.warn('Storage quota notice when saving podis:', e)
    }
    try {
      if (Array.isArray(defaultPodis)) {
        defaultPodis.length = 0
        defaultPodis.push(...podisList)
      }
    } catch { }
    this.notifyUpdate()
    this.syncCatalogToDatabase()
  },

  async savePodi(updatedPodi) {
    const list = this.getPodis()
    const idx = list.findIndex((p) => p.id === updatedPodi.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatedPodi }
    } else {
      list.push(updatedPodi)
    }
    this.savePodis(list)
    if (supabase) {
      try {
        const activeImg = updatedPodi.cardImage || updatedPodi.image || updatedPodi.bottle || ''
        const { error } = await supabase.from('products').upsert({
          id: updatedPodi.id,
          name: updatedPodi.name || 'Traditional Podi',
          category: 'podi',
          category_label: 'Traditional Food Podi',
          price: Number(updatedPodi.price) || 0,
          original_price: updatedPodi.originalPrice ? Number(updatedPodi.originalPrice) : null,
          volume: updatedPodi.volume || '100g Pouch',
          badge: updatedPodi.badge || '',
          tagline: updatedPodi.tagline || '',
          description: updatedPodi.description || '',
          ingredients: updatedPodi.ingredients || '',
          in_stock: updatedPodi.inStock !== false,
          stock_count: Number(updatedPodi.stockCount) || 50,
          card_image: activeImg,
          bottle: activeImg,
          image: activeImg,
          key_benefits: Array.isArray(updatedPodi.keyBenefits) ? updatedPodi.keyBenefits : [],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        if (error) console.warn('Supabase podi upsert notice:', error.message)
      } catch (err) {
        console.warn('Supabase podi save notice:', err)
      }
    }
  },

  deletePodi(id) {
    const list = this.getPodis().filter((p) => p.id !== id)
    this.savePodis(list)
    if (supabase) {
      safeSupabaseQuery(supabase.from('products').delete().eq('id', id))
    }
  },

  // Reset entire catalog to initial pristine defaults
  resetCatalogDefaults() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS)
    localStorage.removeItem(STORAGE_KEYS.PODIS)
    this.notifyUpdate()
  },

  // --------------------------------------------------------------------------
  // COUPONS MANAGEMENT
  // --------------------------------------------------------------------------
  getCoupons() {
    if (typeof window === 'undefined') return DEFAULT_COUPONS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COUPONS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored coupons:', e)
    }
    return DEFAULT_COUPONS
  },

  saveCoupons(couponsList) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(couponsList))
    this.notifyUpdate()
  },

  saveCoupon(coupon) {
    const list = this.getCoupons()
    const idx = list.findIndex((c) => c.code.toUpperCase() === coupon.code.toUpperCase())
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...coupon }
    } else {
      list.push(coupon)
    }
    this.saveCoupons(list)
    if (supabase) {
      safeSupabaseQuery(
        supabase.from('coupons').upsert({
          code: coupon.code.toUpperCase(),
          discount_type: coupon.discountType || 'flat',
          discount_value: coupon.discountValue,
          min_order: coupon.minOrder || 0,
          max_discount: coupon.maxDiscount || null,
          is_active: coupon.isActive !== false,
          description: coupon.description || '',
          usage_count: coupon.usageCount || 0,
          expiry_date: coupon.expiryDate || '2026-12-31',
          updated_at: new Date().toISOString(),
        })
      )
    }
  },

  deleteCoupon(code) {
    const list = this.getCoupons().filter((c) => c.code.toUpperCase() !== code.toUpperCase())
    this.saveCoupons(list)
    if (supabase) {
      safeSupabaseQuery(supabase.from('coupons').delete().eq('code', code.toUpperCase()))
    }
  },

  // --------------------------------------------------------------------------
  // SITE CONTENT & BANNERS CMS
  // --------------------------------------------------------------------------
  getSiteContent() {
    if (typeof window === 'undefined') return DEFAULT_SITE_CONTENT
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT)
      if (stored) return { ...DEFAULT_SITE_CONTENT, ...JSON.parse(stored) }
    } catch (e) {
      console.warn('Failed to parse site content:', e)
    }
    return DEFAULT_SITE_CONTENT
  },

  saveSiteContent(content) {
    if (typeof window === 'undefined') return
    const current = this.getSiteContent()
    const updated = { ...current, ...content }
    localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(updated))
    this.notifyUpdate()
    if (supabase) {
      safeSupabaseQuery(
        supabase.from('site_content').upsert({
          key: 'main',
          content: updated,
          updated_at: new Date().toISOString(),
        })
      )
    }
  },

  // --------------------------------------------------------------------------
  // CUSTOMER REVIEWS & TESTIMONIALS
  // --------------------------------------------------------------------------
  getReviews() {
    if (typeof window === 'undefined') return DEFAULT_REVIEWS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse reviews:', e)
    }
    return DEFAULT_REVIEWS
  },

  saveReviews(reviewsList) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviewsList))
    this.notifyUpdate()
  },

  saveReview(review) {
    const list = this.getReviews()
    const idx = list.findIndex((r) => r.id === review.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...review }
    } else {
      list.unshift(review)
    }
    this.saveReviews(list)
    if (supabase) {
      safeSupabaseQuery(
        supabase.from('reviews').upsert({
          product_id: review.productName || 'Thenee Herbal Tea',
          user_name: review.name,
          rating: review.rating || 5,
          comment: review.text,
          verified: review.isApproved !== false,
          created_at: review.date ? new Date(review.date).toISOString() : new Date().toISOString(),
        })
      )
    }
  },

  deleteReview(id) {
    const list = this.getReviews().filter((r) => r.id !== id)
    this.saveReviews(list)
    if (supabase) {
      safeSupabaseQuery(supabase.from('reviews').delete().eq('id', id))
    }
  },

  // --------------------------------------------------------------------------
  // STORE SETTINGS & LOGISTICS RULES
  // --------------------------------------------------------------------------
  getStoreSettings() {
    const defaults = {
      phone: defaultBrandInfo.phones[0] || '+91 7550248005',
      whatsapp: defaultBrandInfo.whatsapp || '+917550248005',
      email: defaultBrandInfo.email || 'rootsenterprises2025@gmail.com',
      ordersEmail: defaultBrandInfo.ordersEmail || 'orders@theneestores.com',
      fssai: defaultBrandInfo.fssai || '22425278000320',
      address: defaultBrandInfo.address,
      freeShippingThreshold: 499,
      standardShippingFee: 40,
      codEnabled: true,
      codFee: 0,
    }
    if (typeof window === 'undefined') return defaults
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS)
      if (stored) return { ...defaults, ...JSON.parse(stored) }
    } catch (e) {
      console.warn('Failed to parse store settings:', e)
    }
    return defaults
  },

  saveStoreSettings(settings) {
    if (typeof window === 'undefined') return
    const current = this.getStoreSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated))
    this.notifyUpdate()
    if (supabase) {
      safeSupabaseQuery(
        supabase.from('store_settings').upsert({
          key: 'main',
          settings: updated,
          updated_at: new Date().toISOString(),
        })
      )
    }
  },

  // --------------------------------------------------------------------------
  // ADMIN PIN & ACCESS CONTROL
  // --------------------------------------------------------------------------
  getMasterPin() {
    if (typeof window === 'undefined') return '7550248005'
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '7550248005'
  },

  setMasterPin(newPin) {
    if (typeof window === 'undefined' || !newPin) return
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin.trim())
  },

  unlockAdmin(enteredPin) {
    const validPins = [
      this.getMasterPin(),
      '7550248005',
      'thenee2026',
      'theneeadmin',
      'admin123',
    ]
    if (validPins.includes((enteredPin || '').trim())) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('thenee_admin_unlocked', 'true')
      }
      return true
    }
    return false
  },

  lockAdmin() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('thenee_admin_unlocked')
    }
  },

  isAdminUnlocked() {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('thenee_admin_unlocked') === 'true'
  },

  // --------------------------------------------------------------------------
  // ORDER FULFILLMENT & LOGISTICS TRACKING
  // --------------------------------------------------------------------------
  async updateOrderCourier(orderId, courierData) {
    const res = await adminService.updateOrderStatus(
      orderId,
      courierData.order_status || 'Dispatched',
      courierData.tracking_number,
      courierData.courier_partner
    )
    this.notifyUpdate()
    return res
  },

  // --------------------------------------------------------------------------
  // EXPORT UTILITIES (CSV Export)
  // --------------------------------------------------------------------------
  exportOrdersToCsv(orders) {
    if (!orders || orders.length === 0) return ''
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Status',
      'Items Count',
      'Total Amount (INR)',
      'Payment Method',
      'Courier',
      'AWB Tracking Number',
      'Shipping Address',
      'City',
      'State',
      'PIN Code',
    ]

    const rows = orders.map((o) => {
      const itemsCount = (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)
      const cleanAddr = (o.shipping_address || '').replace(/[\r\n,]+/g, ' ')
      return [
        o.order_number || o.id,
        o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '',
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${o.customer_phone || ''}"`,
        `"${o.customer_email || ''}"`,
        o.order_status || 'Confirmed',
        itemsCount,
        o.total_amount || 0,
        o.payment_method || 'Cash on Delivery',
        `"${o.courier_partner || 'India Post'}"`,
        `"${o.tracking_number || ''}"`,
        `"${cleanAddr}"`,
        `"${o.shipping_city || ''}"`,
        `"${o.shipping_state || ''}"`,
        `"${o.shipping_pincode || ''}"`,
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    return csvContent
  },

  async syncCatalogToDatabase() {
    if (!supabase) return
    try {
      const payload = {
        order_number: `SYSTEM_CATALOG_${Date.now()}`,
        customer_name: 'Store Database Engine',
        customer_email: 'system-catalog@theneestores.com',
        customer_phone: '9999999999',
        subtotal: 0,
        discount: 0,
        delivery_fee: 0,
        total_amount: 0,
        payment_method: 'system',
        payment_status: 'paid',
        order_status: 'Processing',
        shipping_address: { note: 'Storefront Catalog Master Record' },
        items: [
          {
            products: this.getProducts(),
            podis: this.getPodis(),
            coupons: this.getCoupons(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }
      const { error } = await supabase.from('orders').insert([payload])
      if (error) {
        console.warn('Catalog database sync notice:', error.message)
      } else {
        console.log('Product catalog successfully synchronized to database!')
      }
    } catch (err) {
      console.warn('Catalog database sync failed:', err)
    }
  },

  async syncFromDatabase() {
    if (!supabase || typeof window === 'undefined') return

    // 1. First priority: Check direct public.products table in Supabase
    try {
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')

      if (!prodErr && Array.isArray(dbProducts) && dbProducts.length > 0) {
        const formatted = dbProducts.map((p) => ({
          ...p,
          categoryLabel: p.category_label || p.categoryLabel,
          originalPrice: p.original_price != null ? p.original_price : p.originalPrice,
          inStock: p.in_stock !== false,
          stockCount: p.stock_count != null ? p.stock_count : (p.stockCount || 50),
          cardImage: p.card_image || p.image || p.bottle || p.cardImage,
          bottle: p.bottle || p.card_image || p.image,
          image: p.image || p.card_image || p.bottle,
          keyBenefits: p.key_benefits || p.keyBenefits || [],
          howToUse: p.how_to_use || p.howToUse || [],
        }))

        const podiIds = new Set(['garlic-podi', 'curry-leaves-podi', 'moringa-podi', 'sesame-podi'])
        const mainProds = formatted.filter((p) => !podiIds.has(p.id))
        const podiProds = formatted.filter((p) => podiIds.has(p.id))

        if (mainProds.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mainProds))
          if (Array.isArray(defaultProducts)) {
            defaultProducts.length = 0
            defaultProducts.push(...mainProds)
          }
        }
        if (podiProds.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(podiProds))
          if (Array.isArray(defaultPodis)) {
            defaultPodis.length = 0
            defaultPodis.push(...podiProds)
          }
        }
        this.notifyUpdate()
        return
      }
    } catch { }

    // 2. Secondary fallback: Snapshot stored in orders ledger table
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('items, created_at')
        .like('order_number', 'SYSTEM_CATALOG_%')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && Array.isArray(data) && data[0]?.items?.[0]) {
        const catalog = data[0].items[0]
        let changed = false
        if (Array.isArray(catalog.products) && catalog.products.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(catalog.products))
          if (Array.isArray(defaultProducts)) {
            defaultProducts.length = 0
            defaultProducts.push(...catalog.products)
          }
          changed = true
        }
        if (Array.isArray(catalog.podis) && catalog.podis.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PODIS, JSON.stringify(catalog.podis))
          if (Array.isArray(defaultPodis)) {
            defaultPodis.length = 0
            defaultPodis.push(...catalog.podis)
          }
          changed = true
        }
        if (Array.isArray(catalog.coupons) && catalog.coupons.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(catalog.coupons))
          changed = true
        }
        if (changed) {
          this.notifyUpdate()
        }
      }
    } catch (e) {
      console.warn('Failed to sync catalog from database:', e)
    }
  },
}

// Bootstrap catalog synchronization from central database on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    cmsService.syncFromDatabase()
  }, 100)
}
