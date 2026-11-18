import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-project')
)

// Initialize Supabase Client if keys are present, or a safe null client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/* ==============================================================================
   AUTHENTICATION HELPERS
   ============================================================================== */

export const authService = {
  // Sign up with Email and Password
  async signUp({ email, password, fullName, phone }) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured yet. Please add your API keys.') }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
        },
      },
    })
    return { data, error }
  },

  // Sign in with Email and Password
  async signInWithEmail({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured yet. Please add your API keys.') }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in / Sign up with Phone OTP (via SMS/WhatsApp)
  async signInWithOtp({ phone }) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured yet. Please add your API keys.') }
    }
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    })
    return { data, error }
  },

  // Verify Phone OTP
  async verifyOtp({ phone, token }) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured yet. Please add your API keys.') }
    }
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })
    return { data, error }
  },

  // Sign in with Google OAuth
  async signInWithGoogle(redirectTarget = 'account') {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured yet. Please add your API keys.') }
    }
    try {
      localStorage.setItem('thenee_oauth_pending', 'true')
      localStorage.setItem('thenee_auth_redirect', redirectTarget)
    } catch {}

    // Clean URL without hash fragment (RFC 6749 Section 3.1.2 forbids hash fragments in OAuth redirect_uri)
    const cleanOrigin = window.location.origin || `${window.location.protocol}//${window.location.host}`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: cleanOrigin,
      },
    })
    return { data, error }
  },

  // Exchange PKCE auth code for session
  async exchangeCodeForSession(code) {
    if (!isSupabaseConfigured || !supabase || !code) return { data: null, error: null }
    return await supabase.auth.exchangeCodeForSession(code)
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured || !supabase) {
      return { error: null }
    }
    return await supabase.auth.signOut()
  },

  // Get current session
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return null
    const { data } = await supabase.auth.getSession()
    return data?.session || null
  },

  // Get current user
  async getUser() {
    if (!isSupabaseConfigured || !supabase) return null
    const { data } = await supabase.auth.getUser()
    return data?.user || null
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(callback)
  },
}

/* ==============================================================================
   USER PROFILE SERVICES
   ============================================================================== */

export const profileService = {
  // Get user profile by Auth user ID
  async getProfile(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) return { data: null, error: null }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return { data, error }
  },

  // Update profile data
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !supabase || !userId) return { data: null, error: null }
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle()
    return { data, error }
  },
}

/* ==============================================================================
   ORDERS SERVICES
   ============================================================================== */

export const orderService = {
  // Create a new order in Supabase
  async createOrder(payload) {
    // Map order fields to match database schema flexibly
    const orderData = {
      order_number: payload.order_number || payload.order_id || payload.id,
      user_id: payload.user_id || null,
      customer_name: payload.customer_name || payload.shipping_address?.recipient || payload.recipient || 'Customer',
      customer_phone: payload.customer_phone || payload.shipping_address?.phone || payload.phone || '',
      customer_email: payload.customer_email || payload.email || '',
      items: payload.items || [],
      subtotal: payload.subtotal || payload.total || 0,
      discount: payload.discount || 0,
      delivery_fee: payload.delivery_fee || 0,
      total_amount: payload.total_amount || payload.total || 0,
      shipping_address: payload.shipping_address || {},
      payment_method: payload.payment_method || 'Online Payment',
      payment_status: payload.payment_status || 'paid',
      order_status: payload.order_status || payload.status || 'Confirmed',
      tracking_awb: payload.tracking_awb || payload.awb || null,
      courier: payload.courier || 'India Post Speed Post',
    }

    // Persist to local all-orders ledger for admin visibility
    try {
      const allOrders = JSON.parse(localStorage.getItem('thenee_all_orders') || '[]')
      const merged = [orderData, ...allOrders.filter((o) => (o.order_number || o.id) !== orderData.order_number)]
      localStorage.setItem('thenee_all_orders', JSON.stringify(merged))
    } catch {}

    if (!isSupabaseConfigured || !supabase) {
      try {
        const existing = JSON.parse(localStorage.getItem('thenee_user_orders') || '[]')
        const updated = [payload, ...existing]
        localStorage.setItem('thenee_user_orders', JSON.stringify(updated))
        return { data: payload, error: null }
      } catch (e) {
        return { data: payload, error: e }
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .maybeSingle()

    return { data: data || payload, error }
  },

  // Fetch orders for a user
  async getUserOrders(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) {
      try {
        const local = JSON.parse(localStorage.getItem('thenee_user_orders') || '[]')
        return { data: local, error: null }
      } catch {
        return { data: [], error: null }
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      try {
        const local = JSON.parse(localStorage.getItem('thenee_user_orders') || '[]')
        return { data: local, error }
      } catch {
        return { data: [], error }
      }
    }

    // Normalize database rows to match UI expectations
    const normalized = (data || []).map((row) => ({
      id: row.order_number || row.id,
      date: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: row.items || [],
      total: row.total_amount || row.total || 0,
      subtotal: row.subtotal || 0,
      discount: row.discount || 0,
      status: row.order_status || row.status || 'Confirmed',
      step: row.order_status === 'Delivered' ? 4 : row.order_status === 'Out for Delivery' ? 3 : 2,
      courier: row.courier || 'India Post Speed Post',
      awb: row.tracking_awb || '',
      destination: row.shipping_address ? `${row.shipping_address.city || ''}, ${row.shipping_address.state || ''}` : 'Tamil Nadu',
      address: row.shipping_address ? `${row.shipping_address.street || ''}, ${row.shipping_address.city || ''} - ${row.shipping_address.pincode || ''}` : '',
      timeline: [
        { title: 'Order Confirmed', time: new Date(row.created_at).toLocaleDateString('en-GB'), done: true },
        { title: 'Handcrafted at Tenkasi Rural Unit', time: 'In Progress', done: true },
        { title: 'Dispatched via Courier', time: row.tracking_awb ? `AWB: ${row.tracking_awb}` : 'Pending Dispatch', done: !!row.tracking_awb },
        { title: row.order_status || 'Out for Delivery', time: 'Estimated 2-3 Days', done: row.order_status === 'Delivered' },
      ],
    }))

    return { data: normalized, error: null }
  },
}

/* ==============================================================================
   INQUIRIES / CONTACT SERVICES
   ============================================================================== */

export const inquiryService = {
  async submitInquiry(inquiryData) {
    const formatted = {
      ...inquiryData,
      id: inquiryData.id || `inq-${Date.now().toString().slice(-6)}`,
      created_at: inquiryData.created_at || new Date().toISOString(),
      status: inquiryData.status || 'new',
    }

    try {
      const existing = JSON.parse(localStorage.getItem('thenee_all_inquiries') || '[]')
      localStorage.setItem('thenee_all_inquiries', JSON.stringify([formatted, ...existing]))
    } catch {}

    if (!isSupabaseConfigured || !supabase) {
      return { data: formatted, error: null }
    }
    return await supabase.from('inquiries').insert([formatted])
  },
}

/* ==============================================================================
   ADMIN CONSOLE & STORE BACKEND SERVICES
   ============================================================================== */

export const adminService = {
  // Check if current user has admin access
  isAdmin(user) {
    if (!user) {
      return typeof window !== 'undefined' && localStorage.getItem('thenee_admin_unlocked') === 'true'
    }
    const email = (user.email || '').toLowerCase()
    if (
      email.includes('admin') ||
      email === 'admin@thenee.com' ||
      email.endsWith('@theneestores.com') ||
      user.role === 'admin' ||
      (typeof window !== 'undefined' && localStorage.getItem('thenee_admin_unlocked') === 'true')
    ) {
      return true
    }
    return false
  },

  // Unlock admin with master store PIN
  unlockAdmin(pin) {
    const validPins = ['thenee2026', 'admin123', 'theneeadmin', '7550248005']
    if (validPins.includes((pin || '').trim().toLowerCase())) {
      localStorage.setItem('thenee_admin_unlocked', 'true')
      return true
    }
    return false
  },

  // Lock admin session
  lockAdmin() {
    localStorage.removeItem('thenee_admin_unlocked')
  },

  // Fetch all orders across store (combines Supabase database and local ledger)
  async getAllOrders() {
    let dbOrders = []
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && Array.isArray(data)) {
          dbOrders = data
        }
      } catch (err) {
        console.warn('Supabase fetch all orders error:', err)
      }
    }

    // Load locally saved orders (placed via CheckoutPage)
    let localOrders = []
    try {
      const all = JSON.parse(localStorage.getItem('thenee_all_orders') || '[]')
      const userList = JSON.parse(localStorage.getItem('thenee_user_orders') || '[]')
      localOrders = [...all, ...userList]
    } catch {}

    const orderMap = new Map()

    localOrders.forEach((lo) => {
      const num = lo.order_number || lo.order_id || lo.id
      if (num) {
        orderMap.set(num, {
          order_number: num,
          customer_name: lo.customer_name || lo.shipping_address?.recipient || lo.recipient || 'Customer',
          customer_phone: lo.customer_phone || lo.shipping_address?.phone || lo.phone || '',
          customer_email: lo.customer_email || lo.email || '',
          items: lo.items || [],
          subtotal: lo.subtotal || lo.total || 0,
          discount: lo.discount || 0,
          delivery_fee: lo.delivery_fee || 0,
          total_amount: lo.total_amount || lo.total || 0,
          shipping_address: lo.shipping_address || {},
          payment_method: lo.payment_method || 'Online Payment',
          payment_status: lo.payment_status || 'paid',
          order_status: lo.order_status || lo.status || 'Confirmed',
          tracking_awb: lo.tracking_awb || lo.awb || '',
          courier: lo.courier || 'India Post Speed Post',
          created_at: lo.created_at || new Date().toISOString(),
        })
      }
    })

    dbOrders.forEach((dbo) => {
      const num = dbo.order_number || dbo.id
      if (num) {
        orderMap.set(num, {
          ...dbo,
          order_number: num,
        })
      }
    })

    const all = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return { data: all, error: null }
  },

  // Update order status, courier and Speed Post Tracking AWB
  async updateOrder(orderNumber, { order_status, tracking_awb, courier }) {
    const updates = {}
    if (order_status) updates.order_status = order_status
    if (tracking_awb !== undefined) updates.tracking_awb = tracking_awb
    if (courier) updates.courier = courier

    // 1. Update in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update(updates)
          .eq('order_number', orderNumber)
      } catch (err) {
        console.warn('Supabase update order warning:', err)
      }
    }

    // 2. Sync in local storage
    try {
      const updateList = (key) => {
        const list = JSON.parse(localStorage.getItem(key) || '[]')
        const updated = list.map((item) => {
          const num = item.order_number || item.order_id || item.id
          if (num === orderNumber) {
            return {
              ...item,
              ...updates,
              status: updates.order_status || item.status,
              order_status: updates.order_status || item.order_status || item.status,
              awb: updates.tracking_awb !== undefined ? updates.tracking_awb : item.awb,
              tracking_awb: updates.tracking_awb !== undefined ? updates.tracking_awb : item.tracking_awb,
              courier: updates.courier || item.courier,
            }
          }
          return item
        })
        localStorage.setItem(key, JSON.stringify(updated))
      }
      updateList('thenee_all_orders')
      updateList('thenee_user_orders')
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.warn('Local update order warning:', e)
    }

    return { success: true }
  },

  // Fetch all customer inquiries
  async getAllInquiries() {
    let dbInquiries = []
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && Array.isArray(data)) {
          dbInquiries = data
        }
      } catch (e) {}
    }

    let localInquiries = []
    try {
      localInquiries = JSON.parse(localStorage.getItem('thenee_all_inquiries') || '[]')
    } catch {}

    const seedInquiries = [
      {
        id: 'inq-101',
        name: 'Dr. Selvamani Clinic',
        phone: '+91 94421 78900',
        email: 'drselva.ayur@gmail.com',
        inquiry_type: 'Clinic & Ayurvedic Wholesale',
        message: 'Requesting wholesale catalog and bulk pricing for 50 jars of Moringa Powder and 100 packs of Thenee Herbal Tea for our Coimbatore clinic.',
        status: 'new',
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'inq-102',
        name: 'Priya Venkatesh',
        phone: '+91 98840 22331',
        email: 'priya.v@gmail.com',
        inquiry_type: 'Retail Order & Tracking',
        message: 'Wanted to check delivery timeline for my order THN-884102 to Alwarpet, Chennai.',
        status: 'in-progress',
        created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
      {
        id: 'inq-103',
        name: 'Green Roots Corporate Gifts',
        phone: '+91 99001 44552',
        email: 'gifts@greenroots.in',
        inquiry_type: 'Corporate Gift Hampers',
        message: 'Looking for 200 custom herbal gift boxes containing Bliss Tea and Podis for our upcoming annual company celebration.',
        status: 'contacted',
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
    ]

    const inqMap = new Map()
    seedInquiries.forEach((i) => inqMap.set(i.id, i))
    localInquiries.forEach((i) => inqMap.set(i.id || i.name + i.created_at, i))
    dbInquiries.forEach((i) => inqMap.set(i.id, i))

    const list = Array.from(inqMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return { data: list, error: null }
  },

  // Update inquiry status
  async updateInquiryStatus(inquiryId, newStatus) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('inquiries')
          .update({ status: newStatus })
          .eq('id', inquiryId)
      } catch (e) {}
    }

    try {
      const list = JSON.parse(localStorage.getItem('thenee_all_inquiries') || '[]')
      const updated = list.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
      localStorage.setItem('thenee_all_inquiries', JSON.stringify(updated))
    } catch {}

    return { success: true }
  },

  // Export orders to CSV
  exportOrdersToCSV(orders) {
    if (!orders || orders.length === 0) return
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Items',
      'Total Amount (INR)',
      'Order Status',
      'Payment Method',
      'Tracking AWB',
      'Delivery Address',
    ]

    const rows = orders.map((o) => {
      const itemsStr = (o.items || []).map((it) => `${it.name} (x${it.quantity || 1})`).join('; ')
      const addrStr = o.shipping_address
        ? `${o.shipping_address.street || ''}, ${o.shipping_address.city || ''}, ${o.shipping_address.state || ''} - ${o.shipping_address.pincode || ''}`
        : ''
      return [
        o.order_number,
        new Date(o.created_at).toLocaleDateString('en-GB'),
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${o.customer_phone || ''}"`,
        `"${o.customer_email || ''}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.total_amount,
        `"${o.order_status || ''}"`,
        `"${o.payment_method || ''}"`,
        `"${o.tracking_awb || ''}"`,
        `"${addrStr.replace(/"/g, '""')}"`,
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `THENEE_Orders_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
