import { profileService, isSupabaseConfigured } from './supabase'
import { getUserDataKey, migrateLegacyDataIfNeeded } from './userScope'

// Retrieve saved addresses strictly isolated for the active user account
export function getSavedAddresses(email = '', userId = null) {
  try {
    // Clean up any old unpartitioned storage
    migrateLegacyDataIfNeeded()

    const cleanEmail = (email || '').toLowerCase().trim()
    const cleanUserId = userId ? String(userId).trim() : ''

    // If unauthenticated guest, only check isolated guest storage
    if (!cleanEmail && !cleanUserId) {
      const guestKey = getUserDataKey('addresses', '', null)
      const rawGuest = localStorage.getItem(guestKey)
      return rawGuest ? JSON.parse(rawGuest) : []
    }

    const storageKey = getUserDataKey('addresses', cleanEmail, cleanUserId)
    const raw = localStorage.getItem(storageKey)
    let addresses = raw ? JSON.parse(raw) : []

    // If local list is empty, fallback to registered user record in local registry
    if (addresses.length === 0 && cleanEmail) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const users = JSON.parse(rawUsers)
          const found = users.find(
            (u) =>
              (u.email || '').toLowerCase().trim() === cleanEmail ||
              (cleanUserId && (u.id === cleanUserId || u.userIdNumber === cleanUserId))
          )
          if (found && Array.isArray(found.addresses) && found.addresses.length > 0) {
            addresses = found.addresses
            localStorage.setItem(storageKey, JSON.stringify(addresses))
          }
        }
      } catch { }
    }

    // Proactively sync from Supabase if configured & authenticated
    if (cleanUserId && isSupabaseConfigured) {
      profileService
        .getProfile(cleanUserId)
        .then(({ data }) => {
          if (data && Array.isArray(data.addresses) && data.addresses.length > 0) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(data.addresses))
            } catch { }
          }
        })
        .catch(() => { })
    }

    // Strict privacy filter: Ensure no address belonging to another account is ever returned
    const userAddresses = (Array.isArray(addresses) ? addresses : []).filter((a) => {
      const aEmail = (a.email || '').toLowerCase().trim()
      const aUid = a.userId ? String(a.userId).trim() : ''
      if (cleanEmail && aEmail && aEmail !== cleanEmail) return false
      if (cleanUserId && aUid && aUid !== cleanUserId) return false
      return true
    })

    return userAddresses
  } catch {
    return []
  }
}

// Save a new address or update if it exists for the specific user account
export function saveAddress(newAddr, email = '', userId = null) {
  if (!newAddr || (!newAddr.street && !newAddr.line1) || !newAddr.city) return []

  try {
    const cleanEmail = (email || newAddr.email || '').toLowerCase().trim()
    const cleanUserId = userId || newAddr.userId || null
    const storageKey = getUserDataKey('addresses', cleanEmail, cleanUserId)

    const currentList = getSavedAddresses(cleanEmail, cleanUserId)
    const addrId = newAddr.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const isFirst = currentList.length === 0
    const shouldBeDefault = Boolean(newAddr.isDefault || isFirst)

    const normalizedAddr = {
      id: addrId,
      userId: cleanUserId,
      email: cleanEmail,
      name: newAddr.name?.trim() || newAddr.recipient?.trim() || 'Receiver',
      recipient: newAddr.recipient?.trim() || newAddr.name?.trim() || 'Receiver',
      phone: newAddr.phone?.trim() || '',
      alt_mobile: newAddr.alt_mobile?.trim() || newAddr.altPhone?.trim() || '',
      line1: newAddr.line1?.trim() || newAddr.street?.trim() || '',
      line2: newAddr.line2?.trim() || newAddr.area?.trim() || '',
      street: newAddr.line1?.trim() || newAddr.street?.trim() || '',
      city: newAddr.city?.trim() || '',
      district: newAddr.district?.trim() || newAddr.city?.trim() || '',
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

    // Persist to user-scoped storage
    localStorage.setItem(storageKey, JSON.stringify(updatedList))

    // Persist to registered user profile in registry
    if (cleanEmail) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex(
            (u) =>
              (u.email || '').toLowerCase().trim() === cleanEmail ||
              (cleanUserId && (u.id === cleanUserId || u.userIdNumber === cleanUserId))
          )
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch { }
    }

    // Sync to Supabase profiles
    if (cleanUserId && isSupabaseConfigured) {
      profileService.updateProfile(cleanUserId, { addresses: updatedList }).catch((err) => {
        console.warn('Supabase address sync notice:', err)
      })
    }

    return updatedList
  } catch (err) {
    console.warn('Failed to save address:', err)
    return []
  }
}

// Update existing address for the specific user account
export function updateAddress(id, updates, email = '', userId = null) {
  try {
    const cleanEmail = (email || updates.email || '').toLowerCase().trim()
    const cleanUserId = userId || updates.userId || null
    const storageKey = getUserDataKey('addresses', cleanEmail, cleanUserId)

    const list = getSavedAddresses(cleanEmail, cleanUserId)
    const isDefault = Boolean(updates.isDefault)

    const updatedList = list.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          ...updates,
          email: cleanEmail || a.email,
          userId: cleanUserId || a.userId,
          isDefault: isDefault ? true : a.isDefault,
          updatedAt: new Date().toISOString(),
        }
      }
      return isDefault ? { ...a, isDefault: false } : a
    })

    localStorage.setItem(storageKey, JSON.stringify(updatedList))

    if (cleanEmail) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex(
            (u) =>
              (u.email || '').toLowerCase().trim() === cleanEmail ||
              (cleanUserId && (u.id === cleanUserId || u.userIdNumber === cleanUserId))
          )
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch { }
    }

    if (cleanUserId && isSupabaseConfigured) {
      profileService.updateProfile(cleanUserId, { addresses: updatedList }).catch(() => { })
    }

    return updatedList
  } catch {
    return []
  }
}

// Delete an address for the specific user account
export function deleteAddress(id, email = '', userId = null) {
  try {
    const cleanEmail = (email || '').toLowerCase().trim()
    const cleanUserId = userId || null
    const storageKey = getUserDataKey('addresses', cleanEmail, cleanUserId)

    const list = getSavedAddresses(cleanEmail, cleanUserId)
    let updatedList = list.filter((a) => a.id !== id)

    // Ensure at least one default remains if list is not empty
    if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
      updatedList[0].isDefault = true
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedList))

    if (cleanEmail) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex(
            (u) =>
              (u.email || '').toLowerCase().trim() === cleanEmail ||
              (cleanUserId && (u.id === cleanUserId || u.userIdNumber === cleanUserId))
          )
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch { }
    }

    if (cleanUserId && isSupabaseConfigured) {
      profileService.updateProfile(cleanUserId, { addresses: updatedList }).catch(() => { })
    }

    return updatedList
  } catch {
    return []
  }
}

// Set default address for the specific user account
export function setDefaultAddress(id, email = '', userId = null) {
  try {
    const cleanEmail = (email || '').toLowerCase().trim()
    const cleanUserId = userId || null
    const storageKey = getUserDataKey('addresses', cleanEmail, cleanUserId)

    const list = getSavedAddresses(cleanEmail, cleanUserId)
    const updatedList = list.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))

    localStorage.setItem(storageKey, JSON.stringify(updatedList))

    if (cleanEmail) {
      try {
        const rawUsers = localStorage.getItem('thenee_registered_users')
        if (rawUsers) {
          const users = JSON.parse(rawUsers)
          const uIdx = users.findIndex(
            (u) =>
              (u.email || '').toLowerCase().trim() === cleanEmail ||
              (cleanUserId && (u.id === cleanUserId || u.userIdNumber === cleanUserId))
          )
          if (uIdx >= 0) {
            users[uIdx].addresses = updatedList
            localStorage.setItem('thenee_registered_users', JSON.stringify(users))
          }
        }
      } catch { }
    }

    if (cleanUserId && isSupabaseConfigured) {
      profileService.updateProfile(cleanUserId, { addresses: updatedList }).catch(() => { })
    }

    return updatedList
  } catch {
    return []
  }
}
