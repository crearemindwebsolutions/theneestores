import { profileService, isSupabaseConfigured } from './supabase'

const STORAGE_KEY = 'thenee_addresses'

// Retrieve all saved addresses
export function getSavedAddresses(email = '', userId = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let addresses = raw ? JSON.parse(raw) : []

    // If local list is empty, fallback to registered user record
    if (addresses.length === 0 && email) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const cleanEmail = email.toLowerCase().trim()
          const users = JSON.parse(rawUsers)
          const found = users.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail)
          if (found && Array.isArray(found.addresses) && found.addresses.length > 0) {
            addresses = found.addresses
            localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
          }
        }
      } catch {}
    }

    // Proactively sync from Supabase if configured & authenticated
    if (userId && isSupabaseConfigured) {
      profileService.getProfile(userId).then(({ data }) => {
        if (data && Array.isArray(data.addresses) && data.addresses.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.addresses))
          } catch {}
        }
      }).catch(() => {})
    }

    return Array.isArray(addresses) ? addresses : []
  } catch {
    return []
  }
}

// Save a new address or update if it exists
export function saveAddress(newAddr, email = '', userId = null) {
  if (!newAddr || !newAddr.street || !newAddr.city) return []

  try {
    const currentList = getSavedAddresses(email, userId)
    const addrId = newAddr.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const isFirst = currentList.length === 0
    const shouldBeDefault = Boolean(newAddr.isDefault || isFirst)

    const normalizedAddr = {
      id: addrId,
      name: newAddr.name?.trim() || 'Receiver',
      phone: newAddr.phone?.trim() || '',
      email: newAddr.email?.trim() || email || '',
      street: newAddr.street?.trim() || '',
      city: newAddr.city?.trim() || '',
      state: newAddr.state?.trim() || 'Tamil Nadu',
      pincode: newAddr.pincode?.trim() || '',
      type: newAddr.type || 'Home',
      isDefault: shouldBeDefault,
      updatedAt: new Date().toISOString(),
    }

    let updatedList
    const existingIdx = currentList.findIndex((a) => a.id === addrId)

    if (existingIdx >= 0) {
      updatedList = currentList.map((a, idx) => {
        if (idx === existingIdx) {
          return { ...a, ...normalizedAddr }
        }
        return shouldBeDefault ? { ...a, isDefault: false } : a
      })
    } else {
      const base = shouldBeDefault
        ? currentList.map((a) => ({ ...a, isDefault: false }))
        : currentList
      updatedList = [normalizedAddr, ...base]
    }

    // Persist to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))

    // Persist to registered user profile in registry
    if (email) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const cleanEmail = email.toLowerCase().trim()
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex((u) => (u.email || '').toLowerCase().trim() === cleanEmail)
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch {}
    }

    // Sync to Supabase profiles
    if (userId && isSupabaseConfigured) {
      profileService.updateProfile(userId, { addresses: updatedList }).catch((err) => {
        console.warn('Supabase address sync notice:', err)
      })
    }

    return updatedList
  } catch (err) {
    console.warn('Failed to save address:', err)
    return []
  }
}

// Update existing address
export function updateAddress(id, updates, email = '', userId = null) {
  try {
    const list = getSavedAddresses(email, userId)
    const isDefault = Boolean(updates.isDefault)

    const updatedList = list.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates, isDefault: isDefault ? true : a.isDefault, updatedAt: new Date().toISOString() }
      }
      return isDefault ? { ...a, isDefault: false } : a
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))

    if (email) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const cleanEmail = email.toLowerCase().trim()
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex((u) => (u.email || '').toLowerCase().trim() === cleanEmail)
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch {}
    }

    if (userId && isSupabaseConfigured) {
      profileService.updateProfile(userId, { addresses: updatedList }).catch(() => {})
    }

    return updatedList
  } catch {
    return []
  }
}

// Delete an address
export function deleteAddress(id, email = '', userId = null) {
  try {
    const list = getSavedAddresses(email, userId)
    let updatedList = list.filter((a) => a.id !== id)

    // Ensure at least one default remains if list is not empty
    if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
      updatedList[0].isDefault = true
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))

    if (email) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const cleanEmail = email.toLowerCase().trim()
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex((u) => (u.email || '').toLowerCase().trim() === cleanEmail)
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch {}
    }

    if (userId && isSupabaseConfigured) {
      profileService.updateProfile(userId, { addresses: updatedList }).catch(() => {})
    }

    return updatedList
  } catch {
    return []
  }
}

// Set default address
export function setDefaultAddress(id, email = '', userId = null) {
  try {
    const list = getSavedAddresses(email, userId)
    const updatedList = list.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))

    if (email) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const cleanEmail = email.toLowerCase().trim()
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex((u) => (u.email || '').toLowerCase().trim() === cleanEmail)
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch {}
    }

    if (userId && isSupabaseConfigured) {
      profileService.updateProfile(userId, { addresses: updatedList }).catch(() => {})
    }

    return updatedList
  } catch {
    return []
  }
}
