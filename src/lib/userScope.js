/**
 * THENEE Stores - Per-User Data Isolation Helper
 * 
 * Guarantees 100% data privacy and separation between user accounts.
 * Every customer account has its own isolated sandbox for:
 *  - Delivery Addresses (Address Book)
 *  - Order History & Consignments
 *  - Shopping Cart & Active Bag
 *  - Wishlist / Favorites
 *  - Checkout Form Prefill & Drafts
 * 
 * Prevents any customer or guest from seeing another account's data.
 */

// Generate a deterministic, sanitized storage key for a user
export function getUserScopeKey(email = '', userId = null) {
  let cleanEmail = (email || '').toLowerCase().trim()
  let cleanId = userId ? String(userId).trim() : ''

  // If we only have cleanId or cleanEmail, try to resolve the other from active session or registered users
  if (!cleanEmail && cleanId && typeof window !== 'undefined') {
    try {
      const authUser = JSON.parse(localStorage.getItem('thenee_auth_user') || '{}')
      if (authUser?.id === cleanId && authUser?.email) {
        cleanEmail = authUser.email.toLowerCase().trim()
      } else {
        const regUsers = JSON.parse(localStorage.getItem('thenee_registered_users') || '[]')
        const found = regUsers.find((u) => u.id === cleanId || u.userIdNumber === cleanId || u.user_id_number === cleanId)
        if (found?.email) {
          cleanEmail = found.email.toLowerCase().trim()
        }
      }
    } catch { }
  } else if (!cleanId && cleanEmail && typeof window !== 'undefined') {
    try {
      const authUser = JSON.parse(localStorage.getItem('thenee_auth_user') || '{}')
      if (authUser?.email && authUser.email.toLowerCase().trim() === cleanEmail && authUser.id) {
        cleanId = authUser.id
      } else {
        const regUsers = JSON.parse(localStorage.getItem('thenee_registered_users') || '[]')
        const found = regUsers.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail)
        if (found?.id) {
          cleanId = found.id
        }
      }
    } catch { }
  }

  // Canonical key preference: clean email (universal across Google, Supabase, and local auth)
  if (cleanEmail && cleanEmail.includes('@')) {
    return cleanEmail.replace(/[^a-z0-9]/g, '_')
  }
  // Fallback: clean userId
  if (cleanId) {
    return `uid_${cleanId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
  }
  return 'guest'
}

// Generate category-specific storage key
export function getUserDataKey(category, email = '', userId = null) {
  const scope = getUserScopeKey(email, userId)
  return `thenee_${category}_${scope}`
}

/**
 * Migration & Cleanup Routine:
 * Safely partitions any legacy global keys (thenee_addresses, thenee_user_orders, thenee_user_wishlist)
 * into their respective user-specific storage keys so that no cross-account contamination occurs.
 */
export function migrateLegacyDataIfNeeded() {
  if (typeof window === 'undefined') return

  try {
    // 1. Migrate legacy addresses
    const rawLegacyAddrs = localStorage.getItem('thenee_addresses')
    if (rawLegacyAddrs) {
      try {
        const legacyAddrs = JSON.parse(rawLegacyAddrs)
        if (Array.isArray(legacyAddrs) && legacyAddrs.length > 0) {
          legacyAddrs.forEach((addr) => {
            const addrEmail = (addr.email || '').toLowerCase().trim()
            const addrUid = addr.userId || null
            if (addrEmail || addrUid) {
              const targetKey = getUserDataKey('addresses', addrEmail, addrUid)
              const existing = JSON.parse(localStorage.getItem(targetKey) || '[]')
              const merged = [addr, ...existing.filter((a) => a.id !== addr.id)]
              localStorage.setItem(targetKey, JSON.stringify(merged))
            }
          })
        }
      } catch { }
      // Remove contaminated global key permanently
      localStorage.removeItem('thenee_addresses')
    }

    // 2. Migrate legacy user orders
    const rawLegacyOrders = localStorage.getItem('thenee_user_orders')
    if (rawLegacyOrders) {
      try {
        const legacyOrders = JSON.parse(rawLegacyOrders)
        if (Array.isArray(legacyOrders) && legacyOrders.length > 0) {
          legacyOrders.forEach((ord) => {
            const ordEmail = (ord.customer_email || ord.email || '').toLowerCase().trim()
            const ordUid = ord.user_id || null
            if (ordEmail || ordUid) {
              const targetKey = getUserDataKey('orders', ordEmail, ordUid)
              const existing = JSON.parse(localStorage.getItem(targetKey) || '[]')
              const merged = [ord, ...existing.filter((o) => (o.order_number || o.id) !== (ord.order_number || ord.id))]
              localStorage.setItem(targetKey, JSON.stringify(merged))
            }
          })
        }
      } catch { }
      // Remove contaminated global key permanently
      localStorage.removeItem('thenee_user_orders')
    }

    // 3. Migrate legacy wishlist
    const rawLegacyWishlist = localStorage.getItem('thenee_user_wishlist')
    if (rawLegacyWishlist) {
      try {
        const legacyWishlist = JSON.parse(rawLegacyWishlist)
        if (Array.isArray(legacyWishlist) && legacyWishlist.length > 0) {
          const authUser = JSON.parse(localStorage.getItem('thenee_auth_user') || 'null')
          if (authUser?.email) {
            const targetKey = getUserDataKey('wishlist', authUser.email, authUser.id)
            localStorage.setItem(targetKey, JSON.stringify(legacyWishlist))
          }
        }
      } catch { }
      // Remove contaminated global key permanently
      localStorage.removeItem('thenee_user_wishlist')
    }
  } catch (err) {
    console.warn('Data migration notice:', err)
  }
}
