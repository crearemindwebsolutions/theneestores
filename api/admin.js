import { createClient } from '@supabase/supabase-js'

export default async function adminHandler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://fdfqtfocdqvontrwkclf.supabase.co'

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    ''

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'sb_publishable_Vg1laRvRoaPpk_ZMLdgT0A_jIe6yOoO'

  // Extract query parameters and body
  const query = req.url ? new URL(req.url, 'http://localhost').searchParams : new URLSearchParams()
  const action = req.body?.action || query.get('action') || 'get-users'

  // --------------------------------------------------------------------------
  // ACTION: get-users (Fetch all registered users directly from Supabase Auth & DB)
  // --------------------------------------------------------------------------
  if (action === 'get-users') {
    try {
      // 1. If Service Role Key is present: use Supabase Admin API for 100% direct Auth access
      if (serviceKey) {
        const adminClient = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })

        const [usersRes, profilesRes] = await Promise.all([
          adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
          adminClient.from('profiles').select('*'),
        ])

        const authUsers = usersRes.data?.users || []
        const profiles = profilesRes.data || []

        const merged = authUsers.map((u) => {
          const prof = profiles.find((p) => p.id === u.id) || {}
          return {
            id: u.id,
            name:
              prof.full_name ||
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              (u.email ? u.email.split('@')[0] : 'Member Patron'),
            email: u.email || prof.email || '',
            phone: prof.phone || u.phone || u.user_metadata?.phone || '',
            greenPoints: prof.reward_points !== undefined ? prof.reward_points : 100,
            city: prof.addresses && prof.addresses[0]?.city ? prof.addresses[0].city : '',
            createdAt: u.created_at || prof.created_at,
            profileCompleted: Boolean(prof.profile_completed || u.user_metadata?.profile_completed),
            authProvider: u.app_metadata?.provider || 'google',
          }
        })

        return res.status(200).json({ success: true, source: 'supabase-admin', users: merged })
      }

      // 2. Client / Anon key fallback: query public.profiles table
      const client = createClient(supabaseUrl, anonKey)
      const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(200).json({
          success: false,
          error: error.message,
          code: error.code,
          hint: error.hint,
          users: [],
        })
      }

      const formatted = (profiles || []).map((p) => ({
        id: p.id,
        name: p.full_name || p.email?.split('@')[0] || 'Member Patron',
        email: p.email || '',
        phone: p.phone || '',
        greenPoints: p.reward_points !== undefined ? p.reward_points : 100,
        city: p.addresses && p.addresses[0]?.city ? p.addresses[0].city : '',
        createdAt: p.created_at,
        profileCompleted: Boolean(p.profile_completed),
        authProvider: 'database',
      }))

      return res.status(200).json({ success: true, source: 'supabase-profiles', users: formatted })
    } catch (err) {
      console.error('API admin get-users error:', err)
      return res.status(500).json({ success: false, error: err.message, users: [] })
    }
  }

  // --------------------------------------------------------------------------
  // ACTION: update-points (Update user reward points in Supabase profile)
  // --------------------------------------------------------------------------
  if (action === 'update-points') {
    const { userId, newPoints } = req.body || {}
    if (!userId || newPoints === undefined) {
      return res.status(400).json({ success: false, error: 'Missing userId or newPoints' })
    }

    try {
      const activeKey = serviceKey || anonKey
      const client = createClient(supabaseUrl, activeKey)
      const { error } = await client
        .from('profiles')
        .update({ reward_points: Number(newPoints) })
        .eq('id', userId)

      if (error) {
        return res.status(400).json({ success: false, error: error.message })
      }
      return res.status(200).json({ success: true, newPoints: Number(newPoints) })
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  return res.status(400).json({ success: false, error: `Unknown action: ${action}` })
}
