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
  async signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured yet. Please add your API keys.') }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#account`,
      },
    })
    return { data, error }
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

    if (error || !data || data.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('thenee_user_orders') || '[]')
        return { data: local, error }
      } catch {
        return { data: [], error }
      }
    }

    // Normalize database rows to match UI expectations
    const normalized = data.map((row) => ({
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
    if (!isSupabaseConfigured || !supabase) {
      return { data: inquiryData, error: null }
    }
    return await supabase.from('inquiries').insert([inquiryData])
  },
}
