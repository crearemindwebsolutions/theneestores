import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { authService, isSupabaseConfigured } from '../lib/supabase'
import {
  signInWithEmailPassword,
  sendSignupOtp,
  verifySignupOtp,
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
} from '../lib/authApi'
import './LoginPage.css'

/* ==============================================================================
   4-DIGIT OTP INPUT COMPONENT (Auto-advance & Backspace)
   ============================================================================== */
const FourDigitOtpInput = ({ value, onChange, onComplete }) => {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const digits = [
    value[0] || '',
    value[1] || '',
    value[2] || '',
    value[3] || '',
  ]

  const handleDigitChange = (index, val) => {
    const char = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    const combined = newDigits.join('')
    onChange(combined)

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
    if (combined.length === 4 && onComplete) {
      onComplete(combined)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted) {
      onChange(pasted)
      const focusIndex = Math.min(pasted.length, 3)
      inputRefs[focusIndex].current?.focus()
      if (pasted.length === 4 && onComplete) {
        onComplete(pasted)
      }
    }
  }

  return (
    <div className="pro-otp-boxes-row" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((idx) => (
        <input
          key={idx}
          ref={inputRefs[idx]}
          type="tel"
          maxLength={1}
          inputMode="numeric"
          autoComplete="one-time-code"
          className={`pro-otp-digit-box ${digits[idx] ? 'is-filled' : ''}`}
          value={digits[idx]}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
        />
      ))}
    </div>
  )
}

/* ==============================================================================
   MAIN LOGIN PAGE
   ============================================================================== */
const LoginPage = ({ onLoginSuccess, onBack, redirectTarget }) => {
  const { loginUser, isLoggedIn } = useCart()

  // Views: 'signin' | 'signup' | 'verify-signup-otp' | 'forgot' | 'verify-forgot-otp'
  const [view, setView] = useState('signin')

  // Sign In States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign Up Form States
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  })

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI Feedback States
  const [errorMessage, setErrorMessage] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Central login completion
  const handleCompleteLogin = (userData) => {
    loginUser(userData)
    const stored = sessionStorage.getItem('thenee_login_redirect')
    sessionStorage.removeItem('thenee_login_redirect')
    const dest = redirectTarget || stored || 'account'
    window.location.hash = dest
    if (onLoginSuccess) {
      onLoginSuccess(dest)
    }
  }

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      const stored = sessionStorage.getItem('thenee_login_redirect')
      sessionStorage.removeItem('thenee_login_redirect')
      const dest = redirectTarget || stored || 'account'
      window.location.hash = dest
      if (onLoginSuccess) {
        onLoginSuccess(dest)
      }
    }
  }, [isLoggedIn, redirectTarget])

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null
    if ((view === 'verify-signup-otp' || view === 'verify-forgot-otp') && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [view, resendTimer])

  const clearAlerts = () => {
    setErrorMessage('')
    setErrorCode('')
    setSuccessMessage('')
  }

  // ----------------------------------------------------------------------------
  // 1. EMAIL SIGN IN (Registered users enter email & password)
  // ----------------------------------------------------------------------------
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    clearAlerts()

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsLoading(true)

    try {
      const result = await signInWithEmailPassword({ email, password })
      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error)
        setErrorCode(result.code || '')
        return
      }

      handleCompleteLogin(result.user)
    } catch (err) {
      setIsLoading(false)
      setErrorMessage('Login failed. Please try again.')
    }
  }

  // ----------------------------------------------------------------------------
  // 2. SIGN UP STEP 1 (Validate & send real-time 4-digit OTP)
  // ----------------------------------------------------------------------------
  const handleInitiateSignup = async (e) => {
    e.preventDefault()
    clearAlerts()

    if (!signupForm.name.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }
    const cleanPhone = signupForm.phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.')
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

    try {
      const result = await sendSignupOtp({
        email: signupForm.email,
        name: signupForm.name,
        phone: cleanPhone,
        password: signupForm.password,
      })

      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error)
        setErrorCode(result.code || '')
        return
      }

      setOtpToken(result.otpToken || '')
      setOtpCode('')
      setResendTimer(60)
      setCanResend(false)
      setView('verify-signup-otp')
      setSuccessMessage(`We have sent a 4-digit verification code to ${signupForm.email}`)
    } catch (err) {
      setIsLoading(false)
      setErrorMessage('Failed to send verification code. Please check your email or network.')
    }
  }

  // ----------------------------------------------------------------------------
  // 3. SIGN UP STEP 2 (Verify 4-digit OTP & complete signup)
  // ----------------------------------------------------------------------------
  const handleVerifySignupOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    clearAlerts()

    if (!otpCode || otpCode.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit verification code.')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifySignupOtp({
        email: signupForm.email,
        otp: otpCode,
        otpToken,
        name: signupForm.name,
        phone: signupForm.phone,
        password: signupForm.password,
      })

      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error)
        setErrorCode(result.code || '')
        return
      }

      handleCompleteLogin(result.user)
    } catch (err) {
      setIsLoading(false)
      setErrorMessage('Verification failed. Please try again.')
    }
  }

  // Resend Signup OTP
  const handleResendSignupOtp = async () => {
    if (!canResend) return
    clearAlerts()
    setIsLoading(true)

    try {
      const result = await sendSignupOtp({
        email: signupForm.email,
        name: signupForm.name,
        phone: signupForm.phone,
        password: signupForm.password,
      })
      setIsLoading(false)

      if (result.success) {
        setOtpToken(result.otpToken || '')
        setOtpCode('')
        setResendTimer(60)
        setCanResend(false)
        setSuccessMessage(`A fresh 4-digit code was sent to ${signupForm.email}`)
      } else {
        setErrorMessage(result.error)
      }
    } catch {
      setIsLoading(false)
      setErrorMessage('Failed to resend code. Please try again.')
    }
  }

  // ----------------------------------------------------------------------------
  // 4. FORGOT PASSWORD STEP 1 (Send 4-digit OTP)
  // ----------------------------------------------------------------------------
  const handleInitiateForgotPassword = async (e) => {
    e.preventDefault()
    clearAlerts()

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const result = await sendForgotPasswordOtp({ email: forgotEmail })
      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error)
        setErrorCode(result.code || '')
        return
      }

      setOtpToken(result.otpToken || '')
      setOtpCode('')
      setResendTimer(60)
      setCanResend(false)
      setView('verify-forgot-otp')
      setSuccessMessage(`Password reset code sent to ${forgotEmail}`)
    } catch {
      setIsLoading(false)
      setErrorMessage('Failed to dispatch reset code. Please try again.')
    }
  }

  // ----------------------------------------------------------------------------
  // 5. FORGOT PASSWORD STEP 2 (Verify OTP & save new password)
  // ----------------------------------------------------------------------------
  const handleCompletePasswordReset = async (e) => {
    e.preventDefault()
    clearAlerts()

    if (!otpCode || otpCode.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit code.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPasswordWithOtp({
        email: forgotEmail,
        otp: otpCode,
        otpToken,
        newPassword,
      })

      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error)
        setErrorCode(result.code || '')
        return
      }

      // Success: Switch to signin view with prefilled email
      setEmail(forgotEmail)
      setPassword('')
      setView('signin')
      setSuccessMessage('Your password has been reset successfully! Please sign in with your new password.')
    } catch {
      setIsLoading(false)
      setErrorMessage('Password reset failed. Please check the code and try again.')
    }
  }

  // Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    if (!canResend) return
    clearAlerts()
    setIsLoading(true)

    try {
      const result = await sendForgotPasswordOtp({ email: forgotEmail })
      setIsLoading(false)

      if (result.success) {
        setOtpToken(result.otpToken || '')
        setOtpCode('')
        setResendTimer(60)
        setCanResend(false)
        setSuccessMessage(`A fresh 4-digit reset code was sent to ${forgotEmail}`)
      } else {
        setErrorMessage(result.error)
      }
    } catch {
      setIsLoading(false)
      setErrorMessage('Failed to resend code.')
    }
  }

  // ----------------------------------------------------------------------------
  // 6. GOOGLE OAUTH LOGIN
  // ----------------------------------------------------------------------------
  const handleGoogleLogin = async () => {
    clearAlerts()
    setIsLoading(true)

    if (!isSupabaseConfigured) {
      setIsLoading(false)
      setErrorMessage('Database keys pending. Please add Supabase URL & Anon Key to .env to enable Google Login.')
      return
    }

    const stored = sessionStorage.getItem('thenee_login_redirect')
    const dest = redirectTarget || stored || 'account'
    const { error } = await authService.signInWithGoogle(dest)
    if (error) {
      setIsLoading(false)
      setErrorMessage(error.message || 'Google sign-in encountered an issue. Please try again.')
    }
  }

  // ----------------------------------------------------------------------------
  // QUICK ACTIONS FOR SMART ALERTS
  // ----------------------------------------------------------------------------
  const switchToSignupWithEmail = (presetEmail) => {
    clearAlerts()
    setSignupForm((prev) => ({ ...prev, email: presetEmail || email }))
    setView('signup')
  }

  const switchToSigninWithEmail = (presetEmail) => {
    clearAlerts()
    setEmail(presetEmail || signupForm.email)
    setView('signin')
  }

  const switchToForgotWithEmail = (presetEmail) => {
    clearAlerts()
    setForgotEmail(presetEmail || email)
    setView('forgot')
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
          {/* Card Hero */}
          <div className="pro-card-hero">
            <div className="pro-hero-icon-bubble">
              {view === 'verify-signup-otp' || view === 'verify-forgot-otp' ? (
                <span>✉️</span>
              ) : view === 'forgot' ? (
                <span>🔑</span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>

            <h2>
              {view === 'signin' && 'Sign In to THENEE'}
              {view === 'signup' && 'Create Your Account'}
              {view === 'verify-signup-otp' && 'Verify Your Email'}
              {view === 'forgot' && 'Reset Your Password'}
              {view === 'verify-forgot-otp' && 'Set New Password'}
            </h2>

            <p className="pro-card-subtitle">
              {view === 'signin' && 'Enter your registered email and password to access your account.'}
              {view === 'signup' && 'Enter your details. We will send a 4-digit code to verify your email.'}
              {view === 'verify-signup-otp' && `Enter the 4-digit code sent to ${signupForm.email}`}
              {view === 'forgot' && 'Enter your registered email to receive a 4-digit verification code.'}
              {view === 'verify-forgot-otp' && `Enter the code sent to ${forgotEmail} and choose a new password.`}
            </p>
          </div>

          {/* SMART ERROR ALERT WITH ONE-CLICK ACTION */}
          {errorMessage && (
            <div className="pro-alert-error-box" role="alert">
              <p className="pro-alert-error-text">{errorMessage}</p>

              {/* If no user found, provide quick 1-click Sign Up button */}
              {errorCode === 'USER_NOT_FOUND' && (
                <button
                  type="button"
                  className="pro-alert-action-btn"
                  onClick={() => switchToSignupWithEmail(email || forgotEmail)}
                >
                  Create New Account ➔
                </button>
              )}

              {/* If user is already registered, provide quick 1-click Sign In button */}
              {errorCode === 'ALREADY_REGISTERED' && (
                <button
                  type="button"
                  className="pro-alert-action-btn"
                  onClick={() => switchToSigninWithEmail(signupForm.email)}
                >
                  Sign In with Password ➔
                </button>
              )}

              {/* If incorrect password, provide quick Forgot Password link */}
              {errorCode === 'INVALID_PASSWORD' && (
                <button
                  type="button"
                  className="pro-alert-action-btn"
                  onClick={() => switchToForgotWithEmail(email)}
                >
                  Forgot Password? Reset Here ➔
                </button>
              )}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="pro-alert-success" role="status">
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================================================================
              VIEW 1: SIGN IN (Direct email & password login)
              ================================================================ */}
          {view === 'signin' && (
            <>
              <form onSubmit={handleEmailLogin} className="pro-form">
                <div className="pro-input-group">
                  <label htmlFor="pro-signin-email">Email Address</label>
                  <input
                    id="pro-signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="pro-input-group">
                  <div className="pro-label-row">
                    <label htmlFor="pro-signin-password">Password</label>
                    <button
                      type="button"
                      className="pro-link-btn"
                      onClick={() => {
                        setForgotEmail(email)
                        clearAlerts()
                        setView('forgot')
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="pro-password-field">
                    <input
                      id="pro-signin-password"
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
                  {isLoading ? 'Signing In...' : 'Sign In with Password'}
                </button>
              </form>

              <div className="pro-divider">
                <span>or</span>
              </div>

              {/* Google OAuth Login */}
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

              <div className="pro-card-footer">
                <span>New to THENEE?</span>{' '}
                <button
                  type="button"
                  className="pro-text-link"
                  onClick={() => {
                    clearAlerts()
                    setView('signup')
                  }}
                >
                  Create an account
                </button>
              </div>
            </>
          )}

          {/* ================================================================
              VIEW 2: SIGN UP (Enter details -> Send 4-digit OTP)
              ================================================================ */}
          {view === 'signup' && (
            <form onSubmit={handleInitiateSignup} className="pro-form">
              <div className="pro-input-group">
                <label htmlFor="reg-fullname">Full Name *</label>
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="e.g. Anitha Meenakshi"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="pro-input-group">
                <label htmlFor="reg-mobile">Mobile Number (10 digits) *</label>
                <div className="pro-phone-field">
                  <span className="pro-phone-prefix">+91</span>
                  <input
                    id="reg-mobile"
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
                <label htmlFor="reg-email">Email Address *</label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
                <span className="pro-field-hint">We will send a 4-digit verification code to this email</span>
              </div>

              <div className="pro-input-group">
                <label htmlFor="reg-pass">Create Password (minimum 6 characters) *</label>
                <input
                  id="reg-pass"
                  type="password"
                  placeholder="••••••••"
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
                {isLoading ? 'Sending Verification Code...' : 'Send 4-Digit Verification Code ➔'}
              </button>

              <div className="pro-divider">
                <span>or</span>
              </div>

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

              <div className="pro-card-footer">
                <span>Already have an account?</span>{' '}
                <button
                  type="button"
                  className="pro-text-link"
                  onClick={() => {
                    clearAlerts()
                    setView('signin')
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ================================================================
              VIEW 3: VERIFY SIGNUP 4-DIGIT OTP
              ================================================================ */}
          {view === 'verify-signup-otp' && (
            <form onSubmit={handleVerifySignupOtp} className="pro-form">
              <div className="pro-input-group" style={{ textAlign: 'center' }}>
                <label>Enter 4-Digit Verification Code</label>
                <FourDigitOtpInput
                  value={otpCode}
                  onChange={(val) => setOtpCode(val)}
                  onComplete={() => {}}
                />
              </div>

              <div className="pro-otp-helper-row">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  className="pro-otp-resend-btn"
                  onClick={handleResendSignupOtp}
                  disabled={!canResend || isLoading}
                >
                  {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                </button>
              </div>

              <button
                type="submit"
                className="pro-submit-btn"
                disabled={isLoading || otpCode.length !== 4}
              >
                {isLoading ? 'Verifying Code...' : 'Verify & Complete Signup ➔'}
              </button>

              <div className="pro-card-footer">
                <button
                  type="button"
                  className="pro-link-btn"
                  onClick={() => {
                    clearAlerts()
                    setView('signup')
                  }}
                >
                  ← Change email address
                </button>
              </div>
            </form>
          )}

          {/* ================================================================
              VIEW 4: FORGOT PASSWORD (Enter email -> Send 4-digit OTP)
              ================================================================ */}
          {view === 'forgot' && (
            <form onSubmit={handleInitiateForgotPassword} className="pro-form">
              <div className="pro-input-group">
                <label htmlFor="forgot-email">Registered Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <span className="pro-field-hint">We will send a 4-digit password reset code to this email</span>
              </div>

              <button
                type="submit"
                className="pro-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Reset Code...' : 'Send 4-Digit Reset Code ➔'}
              </button>

              <div className="pro-card-footer">
                <button
                  type="button"
                  className="pro-link-btn"
                  onClick={() => {
                    clearAlerts()
                    setView('signin')
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ================================================================
              VIEW 5: VERIFY FORGOT PASSWORD OTP & SET NEW PASSWORD
              ================================================================ */}
          {view === 'verify-forgot-otp' && (
            <form onSubmit={handleCompletePasswordReset} className="pro-form">
              <div className="pro-input-group" style={{ textAlign: 'center' }}>
                <label>Enter 4-Digit Reset Code</label>
                <FourDigitOtpInput
                  value={otpCode}
                  onChange={(val) => setOtpCode(val)}
                  onComplete={() => {}}
                />
              </div>

              <div className="pro-otp-helper-row">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  className="pro-otp-resend-btn"
                  onClick={handleResendForgotOtp}
                  disabled={!canResend || isLoading}
                >
                  {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                </button>
              </div>

              <div className="pro-input-group">
                <label htmlFor="new-pass">New Password (minimum 6 characters) *</label>
                <input
                  id="new-pass"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pro-input-group">
                <label htmlFor="confirm-pass">Confirm New Password *</label>
                <input
                  id="confirm-pass"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="pro-submit-btn"
                disabled={isLoading || otpCode.length !== 4}
              >
                {isLoading ? 'Updating Password...' : 'Reset Password & Proceed ➔'}
              </button>

              <div className="pro-card-footer">
                <button
                  type="button"
                  className="pro-link-btn"
                  onClick={() => {
                    clearAlerts()
                    setView('signin')
                  }}
                >
                  ← Cancel and return to Sign In
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

      {/* Powered by Watermark Footer */}
      <footer className="login-bottom-credits">
        <a
          href="https://www.crearemind.in"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-crearemind-link"
          title="Visit Creare Mind (opens in new tab)"
        >
          <span>POWERED BY</span> <strong>CREARE MIND</strong>
        </a>
      </footer>
    </div>
  )
}

export default LoginPage
