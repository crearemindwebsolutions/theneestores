import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || ''
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || ''

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

  // Update order status, courier and Speed Post Tracking AWB (supports both object updates and positional args)
  async updateOrder(orderIdentifier, updates = {}) {
    const patch = {}
    if (updates.order_status || updates.status) patch.order_status = updates.order_status || updates.status
    if (updates.tracking_awb !== undefined || updates.awb !== undefined) {
      patch.tracking_awb = updates.tracking_awb !== undefined ? updates.tracking_awb : updates.awb
    }
    if (updates.courier || updates.partner || updates.courier_partner) {
      patch.courier = updates.courier || updates.partner || updates.courier_partner
    }

    // 1. Update in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update(patch)
          .or(`order_number.eq.${orderIdentifier},id.eq.${orderIdentifier}`)
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
          if (num === orderIdentifier || item.id === orderIdentifier) {
            return {
              ...item,
              ...patch,
              status: patch.order_status || item.status,
              order_status: patch.order_status || item.order_status || item.status,
              awb: patch.tracking_awb !== undefined ? patch.tracking_awb : item.awb,
              tracking_awb: patch.tracking_awb !== undefined ? patch.tracking_awb : item.tracking_awb,
              tracking_number: patch.tracking_awb !== undefined ? patch.tracking_awb : item.tracking_number,
              courier: patch.courier || item.courier,
              courier_partner: patch.courier || item.courier_partner,
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

  // Alias for updateOrder with positional parameters used by fulfillment modals
  async updateOrderStatus(orderId, order_status, tracking_awb, courier) {
    return this.updateOrder(orderId, { order_status, tracking_awb, courier })
  },

  // Fetch all customer inquiries (Real live customer submissions only - zero demo data)
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

    const inqMap = new Map()
    localInquiries.forEach((i) => {
      const key = i.id || (i.name + (i.created_at || ''))
      if (key) inqMap.set(key, i)
    })
    dbInquiries.forEach((i) => {
      const key = i.id || (i.name + (i.created_at || ''))
      if (key) inqMap.set(key, i)
    })

    const list = Array.from(inqMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
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

  // Fetch all real patrons from Supabase profiles + auth API + orders + local registries
  async getAllCustomers() {
    let dbProfiles = []

    // 1. Try fetching directly via backend admin endpoint (lists Supabase auth users & profiles)
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/admin?action=get-users')
        if (res.ok) {
          const json = await res.json()
          if (json.users && Array.isArray(json.users) && json.users.length > 0) {
            dbProfiles = json.users
          }
        }
      } catch (apiErr) {
        // Fallback to client-side Supabase query
      }
    }

    // 2. Query Supabase profiles table directly if API returned empty
    if (dbProfiles.length === 0 && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && Array.isArray(data) && data.length > 0) {
          dbProfiles = data
        }
      } catch (e) {}
    }

    // 3. Collect registered users from local registries
    let localRegUsers = []
    let currentAuthUser = null
    try {
      localRegUsers = JSON.parse(localStorage.getItem('thenee_registered_users') || '[]')
      currentAuthUser = JSON.parse(localStorage.getItem('thenee_auth_user') || localStorage.getItem('thenee_user') || 'null')
    } catch {}

    // 4. Fetch all orders to compute lifetime spend and order history
    const { data: allOrders } = await this.getAllOrders()
    const customerMap = new Map()

    const normalizeKey = (cust) => {
      return (cust.email || cust.phone || cust.name || cust.id || '').toLowerCase().trim()
    }

    // Index DB Profiles
    dbProfiles.forEach((p) => {
      const key = normalizeKey(p)
      if (!key) return
      customerMap.set(key, {
        id: p.id,
        name: p.full_name || p.name || 'Member Patron',
        phone: p.phone || '',
        email: p.email || '',
        ordersCount: 0,
        totalSpent: 0,
        city: (p.addresses && p.addresses[0]?.city) || p.city || '',
        lastOrderDate: p.created_at || p.createdAt,
        greenPoints: Number(p.greenPoints || p.reward_points) || 100,
      })
    })

    // Index Locally Registered Users
    localRegUsers.forEach((lr) => {
      const key = normalizeKey(lr)
      if (!key) return
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: lr.id || `reg-${Date.now()}`,
          name: lr.name || (lr.email ? lr.email.split('@')[0] : 'Member Patron'),
          phone: lr.phone || lr.contact || '',
          email: lr.email || '',
          ordersCount: 0,
          totalSpent: 0,
          city: lr.city || '',
          lastOrderDate: lr.createdAt || lr.created_at,
          greenPoints: Number(lr.points) || 100,
        })
      } else {
        const existing = customerMap.get(key)
        if (!existing.phone && (lr.phone || lr.contact)) existing.phone = lr.phone || lr.contact
        if ((!existing.name || existing.name === 'Member Patron') && lr.name) existing.name = lr.name
      }
    })

    // Index Current Session User if logged in
    if (currentAuthUser) {
      const key = normalizeKey(currentAuthUser)
      if (key) {
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: currentAuthUser.id || 'curr-session',
            name: currentAuthUser.name || 'Member Patron',
            phone: currentAuthUser.contact || currentAuthUser.phone || '',
            email: currentAuthUser.email || '',
            ordersCount: 0,
            totalSpent: 0,
            city: currentAuthUser.city || '',
            lastOrderDate: new Date().toISOString(),
            greenPoints: Number(currentAuthUser.points) || 100,
          })
        } else {
          const existing = customerMap.get(key)
          if (!existing.phone && (currentAuthUser.contact || currentAuthUser.phone)) {
            existing.phone = currentAuthUser.contact || currentAuthUser.phone
          }
          if ((!existing.name || existing.name === 'Member Patron') && currentAuthUser.name) {
            existing.name = currentAuthUser.name
          }
        }
      }
    }

    // Merge Real Orders Placed
    ;(allOrders || []).forEach((o) => {
      const key = (o.customer_email || o.customer_phone || o.customer_name || '').toLowerCase().trim()
      if (!key) return
      const amount = Number(o.total_amount) || 0
      const orderCity = o.shipping_address?.city || o.shipping_city || ''

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: o.user_id || `cust-${Date.now()}`,
          name: o.customer_name || 'Guest Patron',
          phone: o.customer_phone || '',
          email: o.customer_email || '',
          ordersCount: 1,
          totalSpent: amount,
          city: orderCity,
          lastOrderDate: o.created_at,
          greenPoints: Math.floor(amount / 10),
        })
      } else {
        const cust = customerMap.get(key)
        cust.ordersCount += 1
        cust.totalSpent += amount
        if (!cust.phone && o.customer_phone) cust.phone = o.customer_phone
        if (!cust.city && orderCity) cust.city = orderCity
        if (new Date(o.created_at).getTime() > new Date(cust.lastOrderDate || 0).getTime()) {
          cust.lastOrderDate = o.created_at
        }
      }
    })

    const result = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastOrderDate || 0).getTime() - new Date(a.lastOrderDate || 0).getTime()
    )

    return { data: result, error: null }
  },

  // Update customer reward points in Supabase profile and local storage
  async updateCustomerPoints(customer, pointsDelta, reason = 'Admin Adjustment') {
    const newTotal = Math.max(0, (Number(customer.greenPoints) || 0) + Number(pointsDelta))
    if (isSupabaseConfigured && supabase && customer.id && !customer.id.startsWith('cust-')) {
      try {
        await supabase
          .from('profiles')
          .update({ reward_points: newTotal })
          .eq('id', customer.id)
      } catch (err) {
        console.warn('Supabase update reward points error:', err)
      }
    }
    // Update local profile if it matches current signed-in user
    try {
      const currentUser = JSON.parse(localStorage.getItem('thenee_user_profile') || '{}')
      if (currentUser && (currentUser.id === customer.id || currentUser.email === customer.email)) {
        currentUser.reward_points = newTotal
        localStorage.setItem('thenee_user_profile', JSON.stringify(currentUser))
        window.dispatchEvent(new Event('storage'))
      }
    } catch {}

    return { success: true, newPoints: newTotal }
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
