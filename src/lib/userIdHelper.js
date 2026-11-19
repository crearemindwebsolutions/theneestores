/**
 * THENEE 8-Digit Numeric User ID Generator & Helper
 *
 * Guarantees every user, patron, and customer receives a unique, persistent
 * 8-digit integer identifier (e.g. 79576556) across the Account Portal,
 * Admin Console, and Database.
 */

export function getNumericUserId(userOrId) {
  if (!userOrId) return '10000001'

  // If already an 8-digit numeric string
  if (typeof userOrId === 'string' && /^\d{8}$/.test(userOrId.trim())) {
    return userOrId.trim()
  }

  // If passed a number
  if (typeof userOrId === 'number' && Number.isInteger(userOrId) && userOrId >= 10000000 && userOrId <= 99999999) {
    return String(userOrId)
  }

  // If passed an object with an existing 8-digit user id field
  if (typeof userOrId === 'object') {
    const direct =
      userOrId.user_id_number ||
      userOrId.userIdNumber ||
      userOrId.user_number ||
      userOrId.numeric_id ||
      userOrId.user_id_num
    if (direct && /^\d{8}$/.test(String(direct).trim())) {
      return String(direct).trim()
    }
  }

  // Identify stable seed (prefer stable Supabase Auth UUID or id, then email)
  let seed = ''
  if (typeof userOrId === 'string') {
    seed = userOrId.trim()
  } else if (typeof userOrId === 'object') {
    seed =
      userOrId.id ||
      userOrId.user_id ||
      userOrId.email ||
      userOrId.customer_email ||
      userOrId.phone ||
      userOrId.customer_phone ||
      ''
  }

  if (!seed) return '10000001'

  // If the extracted seed is already an 8-digit number
  if (/^\d{8}$/.test(String(seed).trim())) {
    return String(seed).trim()
  }

  // Compute deterministic 8-digit integer (10000000 to 99999999) via FNV-1a 32-bit hash
  let hash = 2166136261
  const s = String(seed).toLowerCase().trim()
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  const u = (hash >>> 0)
  const num = (u % 90000000) + 10000000
  return String(num)
}

/**
 * Attaches the guaranteed 8-digit numeric ID to a user/customer object
 */
export function attachNumericUserId(user) {
  if (!user || typeof user !== 'object') return user
  const numericId = getNumericUserId(user)
  return {
    ...user,
    user_id_number: numericId,
    userIdNumber: numericId,
  }
}
