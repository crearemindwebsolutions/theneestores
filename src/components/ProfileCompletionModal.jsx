import { useState } from 'react'
import { updateUserProfile } from '../lib/authApi'
import { profileService, isSupabaseConfigured } from '../lib/supabase'

export default function ProfileCompletionModal({ currentUser, onComplete, onClose }) {
  const [name, setName] = useState(
    currentUser?.name && !currentUser.name.includes('@') ? currentUser.name : ''
  )
  const [phone, setPhone] = useState(
    currentUser?.contact ? currentUser.contact.replace(/\D/g, '').slice(-10) : ''
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)

    if (!cleanName) {
      setErrorMessage('Please enter your full name.')
      return
    }
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for order delivery.')
      return
    }

    setIsSubmitting(true)
    const fullPhone = `+91 ${cleanPhone}`

    // 1. Update in local registry & session
    updateUserProfile({
      email: currentUser.email,
      name: cleanName,
      phone: fullPhone,
    })

    // 2. Update in Supabase profile if configured
    if (isSupabaseConfigured && currentUser.id) {
      profileService.updateProfile(currentUser.id, {
        full_name: cleanName,
        phone: fullPhone,
        email: currentUser.email,
      }).catch((err) => {
        console.warn('Profile Supabase update notice:', err)
      })
    }

    setIsSubmitting(false)
    if (onComplete) {
      onComplete({
        ...currentUser,
        name: cleanName,
        contact: fullPhone,
      })
    }
  }

  return (
    <div className="pro-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="pro-profile-complete-modal">
        {onClose && (
          <button
            type="button"
            className="pro-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="pro-profile-complete-hero">
          <span className="pro-profile-badge">Required Information</span>
          <h3 id="modal-title">Complete Your Profile</h3>
          <p>
            Welcome to THENEE! Because you signed in with Google, please provide your contact details for India Post Speed Post deliveries.
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

          <button
            type="submit"
            className="pro-submit-btn"
            disabled={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Enter Store ➔'}
          </button>

          {onClose && (
            <button
              type="button"
              className="pro-skip-btn"
              onClick={onClose}
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
