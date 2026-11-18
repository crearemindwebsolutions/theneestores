import { authService, isSupabaseConfigured } from './supabase'

const RESEND_KEY = import.meta.env.VITE_RESEND_API_KEY || import.meta.env.RESEND_API_KEY || ''
const STORAGE_KEY_USERS = 'thenee_registered_users'

// Client-side salted hash helper for secure local password verification
async function hashPassword(password, salt = 'thenee_salt_kadayam') {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(`${password}:${salt}`)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback simple hash
  let h = 0
  const str = `${password}:${salt}`
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return String(h)
}

// Get all registered users from storage
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Find user by email (case-insensitive)
export function findUserByEmail(email) {
  if (!email) return null
  const clean = email.toLowerCase().trim()
  const users = getRegisteredUsers()
  return users.find((u) => u.email.toLowerCase().trim() === clean) || null
}

// Check if email is already registered
export function isEmailRegistered(email) {
  return Boolean(findUserByEmail(email))
}

// Save or update user in storage
function saveUserToRegistry(userData) {
  try {
    const users = getRegisteredUsers()
    const cleanEmail = userData.email.toLowerCase().trim()
    const existingIdx = users.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail)

    if (existingIdx >= 0) {
      users[existingIdx] = { ...users[existingIdx], ...userData, updatedAt: new Date().toISOString() }
    } else {
      users.push({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))
    return true
  } catch (err) {
    console.warn('Failed to save user in local registry:', err)
    return false
  }
}

/* ==============================================================================
   1. SEND SIGNUP 4-DIGIT OTP
   ============================================================================== */
export async function sendSignupOtp({ email, name, phone, password }) {
  const cleanEmail = (email || '').toLowerCase().trim()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  // Check 1: User already registered check
  if (isEmailRegistered(cleanEmail)) {
    return {
      success: false,
      code: 'ALREADY_REGISTERED',
      error: 'An account with this email already exists. Please login instead.',
    }
  }

  // Request 4-digit OTP from serverless API
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-signup-otp',
        email: cleanEmail,
        name: name?.trim() || 'Valued Member',
        phone: phone || '',
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data
    }

    // If serverless endpoint returned 404 (e.g. running in local Vite dev without Vercel CLI)
    if (res.status === 404 && RESEND_KEY) {
      return await fallbackDirectOtpDispatch({ email: cleanEmail, name, purpose: 'signup' })
    }

    const errData = await res.json().catch(() => ({}))
    return { success: false, error: errData.error || `HTTP ${res.status} error sending verification code.` }
  } catch (netErr) {
    if (RESEND_KEY) {
      return await fallbackDirectOtpDispatch({ email: cleanEmail, name, purpose: 'signup' })
    }
    return { success: false, error: 'Network error. Please check your internet connection.' }
  }
}

/* ==============================================================================
   2. VERIFY SIGNUP 4-DIGIT OTP & COMPLETE REGISTRATION
   ============================================================================== */
export async function verifySignupOtp({ email, otp, otpToken, name, phone, password }) {
  const cleanEmail = (email || '').toLowerCase().trim()
  const cleanOtp = (otp || '').trim()

  if (!cleanOtp || cleanOtp.length !== 4) {
    return { success: false, error: 'Please enter the complete 4-digit verification code.' }
  }

  // Attempt verification via serverless API
  let isVerified = false
  let verifyError = ''

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify-signup-otp',
        email: cleanEmail,
        otp: cleanOtp,
        otpToken,
      }),
    })

    if (res.ok) {
      isVerified = true
    } else {
      const errData = await res.json().catch(() => ({}))
      verifyError = errData.error || 'Verification code is invalid or expired.'
    }
  } catch (e) {
    // Local dev fallback check
    if (otpToken && otpToken.includes('.')) {
      const [expiresAtStr] = otpToken.split('.')
      if (Date.now() <= Number(expiresAtStr)) {
        isVerified = true
      }
    }
  }

  if (!isVerified) {
    return {
      success: false,
      code: 'INVALID_OTP',
      error: verifyError || 'Incorrect 4-digit verification code. Please check your email or request a new code.',
    }
  }

  // Complete Registration
  const passwordHash = await hashPassword(password)
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10)
  const fullPhone = cleanPhone ? `+91 ${cleanPhone}` : ''

  const newUser = {
    id: 'thn_' + Math.random().toString(36).substring(2, 9),
    name: name?.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: fullPhone,
    passwordHash,
    points: 100,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }

  saveUserToRegistry(newUser)

  // Also sync in background with Supabase Auth if keys exist
  if (isSupabaseConfigured) {
    authService.signUp({ email: cleanEmail, password, fullName: name?.trim(), phone: fullPhone }).catch((e) => {
      console.warn('Background Supabase sync notice:', e)
    })
  }

  return {
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      contact: newUser.phone,
      points: newUser.points,
      joinedDate: newUser.joinedDate,
    },
    message: 'Signup completed successfully!',
  }
}

/* ==============================================================================
   3. EMAIL & PASSWORD SIGN-IN
   ============================================================================== */
export async function signInWithEmailPassword({ email, password }) {
  const cleanEmail = (email || '').toLowerCase().trim()

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' }
  }

  // Check 1: User existence check
  const existingUser = findUserByEmail(cleanEmail)
  if (!existingUser) {
    return {
      success: false,
      code: 'USER_NOT_FOUND',
      error: 'No account found with this email. Please sign up.',
    }
  }

  // Check 2: Password verification
  const inputHash = await hashPassword(password)
  if (existingUser.passwordHash !== inputHash) {
    return {
      success: false,
      code: 'INVALID_PASSWORD',
      error: 'Incorrect password. Please try again or use Forgot Password.',
    }
  }

  // Success
  return {
    success: true,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      contact: existingUser.phone || '',
      points: existingUser.points || 100,
      joinedDate: existingUser.joinedDate || 'Member',
    },
  }
}

/* ==============================================================================
   4. SEND FORGOT PASSWORD 4-DIGIT OTP
   ============================================================================== */
export async function sendForgotPasswordOtp({ email }) {
  const cleanEmail = (email || '').toLowerCase().trim()

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  // Check: User must exist
  const existingUser = findUserByEmail(cleanEmail)
  if (!existingUser) {
    return {
      success: false,
      code: 'USER_NOT_FOUND',
      error: 'No account found with this email. Please sign up.',
    }
  }

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-forgot-password-otp',
        email: cleanEmail,
        name: existingUser.name || 'Valued Member',
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data
    }

    if (res.status === 404 && RESEND_KEY) {
      return await fallbackDirectOtpDispatch({ email: cleanEmail, name: existingUser.name, purpose: 'forgot' })
    }

    const errData = await res.json().catch(() => ({}))
    return { success: false, error: errData.error || 'Failed to dispatch password reset code.' }
  } catch (netErr) {
    if (RESEND_KEY) {
      return await fallbackDirectOtpDispatch({ email: cleanEmail, name: existingUser.name, purpose: 'forgot' })
    }
    return { success: false, error: 'Network error. Please check your internet connection.' }
  }
}

/* ==============================================================================
   5. RESET PASSWORD WITH 4-DIGIT OTP
   ============================================================================== */
export async function resetPasswordWithOtp({ email, otp, otpToken, newPassword }) {
  const cleanEmail = (email || '').toLowerCase().trim()
  const cleanOtp = (otp || '').trim()

  if (!cleanOtp || cleanOtp.length !== 4) {
    return { success: false, error: 'Please enter the complete 4-digit verification code.' }
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' }
  }

  const existingUser = findUserByEmail(cleanEmail)
  if (!existingUser) {
    return { success: false, code: 'USER_NOT_FOUND', error: 'No account found with this email.' }
  }

  // Verify OTP via serverless API
  let isVerified = false
  let verifyError = ''

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset-password',
        email: cleanEmail,
        otp: cleanOtp,
        otpToken,
        newPassword,
      }),
    })

    if (res.ok) {
      isVerified = true
    } else {
      const errData = await res.json().catch(() => ({}))
      verifyError = errData.error || 'Invalid or expired verification code.'
    }
  } catch (e) {
    if (otpToken && otpToken.includes('.')) {
      const [expiresAtStr] = otpToken.split('.')
      if (Date.now() <= Number(expiresAtStr)) {
        isVerified = true
      }
    }
  }

  if (!isVerified) {
    return {
      success: false,
      code: 'INVALID_OTP',
      error: verifyError || 'Incorrect 4-digit verification code. Please check your email and try again.',
    }
  }

  // Update password in registry
  const newHash = await hashPassword(newPassword)
  saveUserToRegistry({
    ...existingUser,
    passwordHash: newHash,
  })

  return {
    success: true,
    message: 'Password has been updated successfully! Please login with your new password.',
  }
}

/* ==============================================================================
   6. UPDATE USER PROFILE (Mandatory for Google Users without Name / Phone)
   ============================================================================== */
export function updateUserProfile({ email, name, phone }) {
  const cleanEmail = (email || '').toLowerCase().trim()
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10)
  const fullPhone = cleanPhone ? `+91 ${cleanPhone}` : ''

  const user = findUserByEmail(cleanEmail) || {
    id: 'thn_' + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
  }

  const updated = {
    ...user,
    name: name?.trim() || user.name || cleanEmail.split('@')[0],
    phone: fullPhone,
  }

  saveUserToRegistry(updated)
  return updated
}

/* ==============================================================================
   FALLBACK CLIENT-SIDE DIRECT RESEND DISPATCH (When local dev lacks Vercel CLI)
   ============================================================================== */
async function fallbackDirectOtpDispatch({ email, name, purpose }) {
  const otp = String(Math.floor(1000 + Math.random() * 9000))
  const expiresAt = Date.now() + 10 * 60 * 1000
  const otpToken = `${expiresAt}.${btoa(`${email}:${otp}`)}`

  const isSignup = purpose === 'signup'
  const title = isSignup ? 'Verify Your Email Address' : 'Reset Your Account Password'

  const subject = isSignup ? `${otp} is your THENEE verification code` : `${otp} is your THENEE password reset code`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'THENEE Support <support@theneestores.com>',
        to: [email],
        reply_to: 'rootsenterprises2025@gmail.com',
        subject,
        headers: {
          'X-Entity-Ref-ID': String(Date.now()),
          'OTP-Token': `"${otp}"; origin="https://theneestores.com"`,
        },
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>${subject}</title>
            </head>
            <body style="margin: 0; padding: 24px 12px; background-color: #F6F8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <!-- Invisible Preheader for Gmail auto-detection -->
              <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 0px; line-height: 0px; opacity: 0; color: transparent; height: 0; width: 0;">
                Your verification code is ${otp}. Use code ${otp} to verify your THENEE account. Valid for 10 minutes.
              </div>

              <div style="max-width: 500px; margin: 0 auto; padding: 28px 24px; border: 1px solid #E2EADF; border-radius: 14px; background: #FFFFFF; box-shadow: 0 4px 16px rgba(39, 76, 55, 0.05);">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="font-size: 22px; font-weight: 800; color: #274C37; letter-spacing: 0.2em;">THENEE</div>
                  <div style="font-size: 11px; color: #C6A15B; letter-spacing: 0.15em;">Crafted by Women • Rooted in Nature</div>
                </div>
                <h2 style="color: #1E392A; margin: 0 0 10px; font-size: 18px;">${title}</h2>
                <p style="color: #445548; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                  Hello <strong>${name || 'Member'}</strong>,<br />
                  Your verification code is:
                </p>

                <!-- OTP CODE BOX -->
                <div style="margin: 20px 0 24px; text-align: center;">
                  <div style="display: inline-block; background-color: #F8FAF7; border: 2px solid #274C37; border-radius: 12px; padding: 16px 32px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #6C8271; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px;">
                      YOUR VERIFICATION CODE
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #274C37; line-height: 1; padding-left: 12px; white-space: nowrap;">
                      ${otp}
                    </div>
                  </div>
                  <div style="margin-top: 10px; font-size: 13px; color: #445548;">
                    Your verification code is <strong>${otp}</strong>
                  </div>
                </div>

                <div style="background-color: #F8FAF7; border-left: 4px solid #C6A15B; border-radius: 4px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #556658;">
                  ⏱️ <strong>Valid for 10 minutes:</strong> If you did not request this code, please safely ignore this email.
                </div>

                <p style="color: #7A8C7D; font-size: 11px; line-height: 1.5; margin: 0 0 16px;">
                  For security reasons, never share this code with anyone.
                </p>

                <div style="border-top: 1px solid #E4ECE3; padding-top: 14px; text-align: center; font-size: 11px; color: #8A9A8C;">
                  The Roots Enterprises • Kadayam, Tenkasi District, Tamil Nadu<br />
                  Direct Support: <a href="mailto:rootsenterprises2025@gmail.com" style="color: #274C37; text-decoration: none; font-weight: 600;">rootsenterprises2025@gmail.com</a>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Your verification code is: ${otp}\n\nUse code ${otp} to complete your verification with THENEE. This code is valid for 10 minutes.\n\nTHENEE Support\nrootsenterprises2025@gmail.com`,
      }),
    })
  } catch (err) {
    console.warn('Direct Resend dispatch notice:', err)
  }

  return {
    success: true,
    otpToken,
    message: `Verification code sent to ${email}`,
  }
}
