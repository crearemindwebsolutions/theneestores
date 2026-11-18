import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { authService, isSupabaseConfigured } from '../lib/supabase'
import './LoginPage.css'

const LoginPage = ({ onLoginSuccess, onBack, redirectTarget }) => {
  const { loginUser } = useCart()

  const isCheckoutRedirect =
    redirectTarget === 'checkout' ||
    (typeof window !== 'undefined' && sessionStorage.getItem('thenee_login_redirect') === 'checkout')

  // Primary view: 'signin' | 'signup'
  const [view, setView] = useState('signin')

  // Auth method under signin: 'email' | 'phone'
  const [authMethod, setAuthMethod] = useState('email')

  // Email States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Phone OTP States
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  // Registration Form
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle Google OAuth Login via Supabase
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!isSupabaseConfigured) {
      setIsLoading(false)
      setErrorMessage('Database keys pending. Please add your Supabase URL & Anon Key to .env to enable Google Login.')
      return
    }

    const { error } = await authService.signInWithGoogle()
    if (error) {
      setIsLoading(false)
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.')
    }
  }

  // Handle Email & Password Sign In
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    if (isSupabaseConfigured) {
      const { data, error } = await authService.signInWithEmail({ email, password })
      setIsLoading(false)

      if (error) {
        setErrorMessage(error.message || 'Invalid email or password.')
        return
      }

      if (data?.user) {
        const u = data.user
        const userData = {
          id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Member',
          email: u.email,
          contact: u.phone || u.user_metadata?.phone || '',
          joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          points: 100,
        }
        loginUser(userData)
        if (onLoginSuccess) onLoginSuccess()
      }
    } else {
      // Fallback local session if Supabase keys not provided yet
      setIsLoading(false)
      const namePart = email.split('@')[0]
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1)
      const user = {
        name: capitalized,
        email,
        contact: '',
        joinedDate: 'Today',
        points: 100,
      }
      loginUser(user)
      if (onLoginSuccess) onLoginSuccess()
    }
  }

  // Handle Send Phone OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const clean = phoneNumber.replace(/\D/g, '')
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsLoading(true)

    if (isSupabaseConfigured) {
      const fullPhone = `+91${clean.slice(-10)}`
      const { error } = await authService.signInWithOtp({ phone: fullPhone })
      setIsLoading(false)

      if (error) {
        setErrorMessage(error.message || 'Failed to send OTP. Please check your number or try email login.')
        return
      }

      setOtpSent(true)
      setSuccessMessage(`Verification code sent to +91 ${clean.slice(-10)}`)
    } else {
      setIsLoading(false)
      setErrorMessage('SMS service requires Supabase Twilio/MessageBird setup. Please use Email login.')
    }
  }

  // Handle Verify Phone OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.')
      return
    }

    setIsLoading(true)

    if (isSupabaseConfigured) {
      const clean = phoneNumber.replace(/\D/g, '').slice(-10)
      const fullPhone = `+91${clean}`
      const { data, error } = await authService.verifyOtp({ phone: fullPhone, token: otpCode.trim() })
      setIsLoading(false)

      if (error) {
        setErrorMessage(error.message || 'Invalid or expired verification code.')
        return
      }

      if (data?.user) {
        const u = data.user
        const userData = {
          id: u.id,
          name: u.user_metadata?.full_name || `Member (${clean.slice(-4)})`,
          contact: fullPhone,
          email: u.email || '',
          joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          points: 100,
        }
        loginUser(userData)
        if (onLoginSuccess) onLoginSuccess()
      }
    }
  }

  // Handle User Registration (Sign Up)
  const handleSignup = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!signupForm.name.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }
    if (!signupForm.email || !signupForm.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!signupForm.password || signupForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    if (isSupabaseConfigured) {
      const cleanPhone = signupForm.phone.replace(/\D/g, '').slice(-10)
      const fullPhone = cleanPhone ? `+91 ${cleanPhone}` : ''

      const { data, error } = await authService.signUp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        fullName: signupForm.name.trim(),
        phone: fullPhone,
      })

      setIsLoading(false)

      if (error) {
        setErrorMessage(error.message || 'Registration failed. Please try again.')
        return
      }

      if (data?.user) {
        // If Supabase has email confirmation enabled
        if (data.user.identities && data.user.identities.length === 0) {
          setErrorMessage('An account with this email already exists. Please sign in.')
          return
        }

        const userData = {
          id: data.user.id,
          name: signupForm.name.trim(),
          contact: fullPhone,
          email: signupForm.email.trim(),
          joinedDate: 'Today',
          points: 100,
        }
        loginUser(userData)
        if (onLoginSuccess) onLoginSuccess()
      }
    } else {
      setIsLoading(false)
      const cleanPhone = signupForm.phone.replace(/\D/g, '').slice(-10)
      const user = {
        name: signupForm.name.trim(),
        contact: cleanPhone ? `+91 ${cleanPhone}` : '',
        email: signupForm.email.trim(),
        joinedDate: 'Today',
        points: 100,
      }
      loginUser(user)
      if (onLoginSuccess) onLoginSuccess()
    }
  }

  return (
    <div className="pro-login-wrapper">
      {/* Top Header */}
      <header className="pro-login-header">
        <button className="pro-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Store</span>
        </button>

        <div className="pro-brand-lockup">
          <img
            src="/images/custom_thenee/thenee-brand-logo.png"
            alt="THENEE"
            className="pro-brand-logo"
          />
          <div className="pro-brand-text">
            <span className="pro-brand-name">THENEE</span>
            <span className="pro-brand-tag">Roots of Nature</span>
          </div>
        </div>

        <div className="pro-header-spacer" />
      </header>

      {/* Main Login Card */}
      <main className="pro-login-main">
        <div className="pro-card">
          {/* Badge & Icon */}
          <div className="pro-card-hero">
            <div className="pro-hero-icon-bubble">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2>{view === 'signin' ? 'Sign In to THENEE' : 'Create an Account'}</h2>
            <p className="pro-card-subtitle">
              {isCheckoutRedirect
                ? 'Please sign in to complete your speed delivery order from Tenkasi.'
                : view === 'signin'
                ? 'Manage your orders, track consignments & redeem pure herbal perks.'
                : 'Join 16,000+ happy families enjoying handcrafted herbal wellness.'}
            </p>
          </div>

          {/* Database configuration reminder if keys not yet added */}
          {!isSupabaseConfigured && (
            <div className="pro-db-notice" role="alert">
              <span>⚡ Database Ready: Connect Supabase URL & Key in <code>.env</code></span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="pro-alert-error" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="pro-alert-success" role="status">
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {view === 'signin' && (
            <>
              {/* Tab Selector: Email vs Phone */}
              <div className="pro-tabs" role="tablist">
                <button
                  type="button"
                  className={`pro-tab ${authMethod === 'email' ? 'is-active' : ''}`}
                  onClick={() => {
                    setAuthMethod('email')
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                  role="tab"
                  aria-selected={authMethod === 'email'}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`pro-tab ${authMethod === 'phone' ? 'is-active' : ''}`}
                  onClick={() => {
                    setAuthMethod('phone')
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                  role="tab"
                  aria-selected={authMethod === 'phone'}
                >
                  Mobile OTP
                </button>
              </div>

              {/* Email & Password Form */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="pro-form">
                  <div className="pro-input-group">
                    <label htmlFor="pro-email-input">Email Address</label>
                    <input
                      id="pro-email-input"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="pro-input-group">
                    <div className="pro-label-row">
                      <label htmlFor="pro-password-input">Password</label>
                    </div>
                    <div className="pro-password-field">
                      <input
                        id="pro-password-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="pro-show-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="pro-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In with Email'}
                  </button>
                </form>
              )}

              {/* Phone OTP Form */}
              {authMethod === 'phone' && (
                !otpSent ? (
                  <form onSubmit={handleSendOtp} className="pro-form">
                    <div className="pro-input-group">
                      <label htmlFor="pro-phone-input">Mobile Number</label>
                      <div className="pro-phone-field">
                        <span className="pro-phone-prefix">+91</span>
                        <input
                          id="pro-phone-input"
                          type="tel"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          required
                          autoFocus
                        />
                      </div>
                      <span className="pro-field-hint">We will send a verification code via SMS</span>
                    </div>

                    <button
                      type="submit"
                      className="pro-submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending Code...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="pro-form">
                    <div className="pro-otp-meta">
                      <span>Code sent to <strong>+91 {phoneNumber}</strong></span>
                      <button
                        type="button"
                        className="pro-link-btn"
                        onClick={() => {
                          setOtpSent(false)
                          setOtpCode('')
                        }}
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="pro-input-group">
                      <label htmlFor="pro-otp-input">Enter Verification Code</label>
                      <input
                        id="pro-otp-input"
                        type="text"
                        maxLength={6}
                        placeholder="• • • • • •"
                        className="pro-otp-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="pro-submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                  </form>
                )
              )}

              {/* Divider */}
              <div className="pro-divider">
                <span>or</span>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                className="pro-google-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Toggle to Signup */}
              <div className="pro-card-footer">
                <span>Don&apos;t have an account?</span>{' '}
                <button
                  type="button"
                  className="pro-text-link"
                  onClick={() => {
                    setView('signup')
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                >
                  Create account
                </button>
              </div>
            </>
          )}

          {/* SIGN UP VIEW */}
          {view === 'signup' && (
            <form onSubmit={handleSignup} className="pro-form">
              <div className="pro-input-group">
                <label htmlFor="reg-name-input">Full Name *</label>
                <input
                  id="reg-name-input"
                  type="text"
                  placeholder="e.g. Meenakshi Sundaram"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="pro-input-group">
                <label htmlFor="reg-phone-input">Mobile Number *</label>
                <div className="pro-phone-field">
                  <span className="pro-phone-prefix">+91</span>
                  <input
                    id="reg-phone-input"
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, '') })
                    }
                    required
                  />
                </div>
              </div>

              <div className="pro-input-group">
                <label htmlFor="reg-email-input">Email Address *</label>
                <input
                  id="reg-email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="pro-input-group">
                <label htmlFor="reg-password-input">Password (minimum 6 characters) *</label>
                <input
                  id="reg-password-input"
                  type="password"
                  placeholder="Create a secure password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="pro-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="pro-divider">
                <span>or</span>
              </div>

              {/* Google Sign In in Signup View */}
              <button
                type="button"
                className="pro-google-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              {/* Toggle to Sign In */}
              <div className="pro-card-footer">
                <span>Already have an account?</span>{' '}
                <button
                  type="button"
                  className="pro-text-link"
                  onClick={() => {
                    setView('signin')
                    setErrorMessage('')
                    setSuccessMessage('')
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* Trust Badges */}
          <div className="pro-trust-footer">
            <span>🔒 256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>FSSAI Certified</span>
            <span>•</span>
            <span>Zero Spam</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage