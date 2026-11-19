import { useState } from 'react'
import { updateUserProfile } from '../lib/authApi'
import { profileService, isSupabaseConfigured, supabase } from '../lib/supabase'

export default function ProfileCompletionModal({ currentUser, onComplete }) {
  const [name, setName] = useState(
    currentUser?.name && !currentUser.name.includes('@') ? currentUser.name : ''
  )
  const [phone, setPhone] = useState(
    currentUser?.contact ? currentUser.contact.replace(/\D/g, '').slice(-10) : ''
  )
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const cleanPassword = password.trim()

    if (!cleanName) {
      setErrorMessage('Please enter your full name.')
      return
    }
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for order delivery.')
      return
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }
    if (cleanPassword !== confirmPassword.trim()) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setIsSubmitting(true)
    const fullPhone = `+91 ${cleanPhone}`

    // 1. Update in Supabase Auth user password AND metadata so user can sign in via email & password
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: passErr } = await supabase.auth.updateUser({
          password: cleanPassword,
          data: {
            full_name: cleanName,
            name: cleanName,
            phone: fullPhone,
            profile_completed: true,
            has_password: true,
          },
        })
        if (passErr) {
          console.warn('Supabase updateUser password notice:', passErr)
        }
      } catch (err) {
        console.warn('Supabase updateUser error:', err)
      }
    }

    // 2. Update in local registry & session with hashed password
    await updateUserProfile({
      email: currentUser.email,
      name: cleanName,
      phone: fullPhone,
      password: cleanPassword,
    })

    // 3. Update in Supabase profile database table
    if (isSupabaseConfigured && currentUser.id) {
      profileService.updateProfile(currentUser.id, {
        full_name: cleanName,
        phone: fullPhone,
        email: currentUser.email,
        profile_completed: true,
      }).catch((err) => {
        console.warn('Profile Supabase update notice:', err)
      })
    }

    // 4. Mark account permanently in prompted accounts so it NEVER shows again
    try {
      const cleanEmail = (currentUser.email || '').toLowerCase().trim()
      const rawPrompted = localStorage.getItem('thenee_google_prompted_accounts')
      const promptedList = rawPrompted ? JSON.parse(rawPrompted) : []
      if (cleanEmail && !promptedList.includes(cleanEmail)) {
        promptedList.push(cleanEmail)
        localStorage.setItem('thenee_google_prompted_accounts', JSON.stringify(promptedList))
      }
    } catch {}

    setIsSubmitting(false)
    if (onComplete) {
      onComplete({
        ...currentUser,
        name: cleanName,
        contact: fullPhone,
        hasPassword: true,
        profilePrompted: true,
        profileCompleted: true,
      })
    }
  }

  return (
    <div className="pro-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="pro-profile-complete-modal">
        <div className="pro-profile-complete-hero">
          <span className="pro-profile-badge">Required Account Setup</span>
          <h3 id="modal-title">Complete Your Profile & Set Password</h3>
          <p>
            Please provide your delivery contact number and set an account password to continue. You can use this password to log in directly with your email anytime.
          </p>
        </div>

        {errorMessage && (
          <div className="pro-alert-error" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pro-form">
          <div className="pro-input-group">
            <label htmlFor="compulsory-name">Full Name *</label>
            <input
              id="compulsory-name"
              type="text"
              placeholder="e.g. Anitha Meenakshi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="pro-input-group">
            <label htmlFor="compulsory-phone">Mobile Number (for delivery SMS & AWB tracking) *</label>
            <div className="pro-phone-field">
              <span className="pro-phone-prefix">+91</span>
              <input
                id="compulsory-phone"
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <span className="pro-field-hint">Required for Speed Post tracking updates</span>
          </div>

          <div className="pro-input-group">
            <div className="pro-label-row">
              <label htmlFor="compulsory-password">Set Account Password (min 6 chars) *</label>
              <button
                type="button"
                className="pro-link-btn"
                onClick={() => setShowPassword(!showPassword)}
                style={{ fontSize: '0.74rem' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="pro-password-field">
              <input
                id="compulsory-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pro-input-group">
            <label htmlFor="compulsory-confirm-password">Confirm Password *</label>
            <div className="pro-password-field">
              <input
                id="compulsory-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <span className="pro-field-hint">
              Use this password to log into THENEE using {currentUser?.email || 'your email'}
            </span>
          </div>

          <button
            type="submit"
            className="pro-submit-btn"
            disabled={isSubmitting}
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Saving Account Credentials...' : 'Save & Set Password ➔'}
          </button>
        </form>
      </div>
    </div>
  )
}
