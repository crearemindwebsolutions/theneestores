import crypto from 'crypto'
import { Resend } from 'resend'

function generate4DigitOtp() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function getSecret() {
  return (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    'thenee_secure_auth_salt_kadayam_2026'
  )
}

function signOtpToken(email, otp, expiresAt) {
  const secret = getSecret()
  const payload = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${expiresAt}.${hash}`
}

function verifyOtpToken(email, otp, otpToken) {
  if (!email || !otp || !otpToken || !otpToken.includes('.')) {
    return { valid: false, reason: 'Invalid token structure' }
  }

  const [expiresAtStr, hash] = otpToken.split('.')
  const expiresAt = Number(expiresAtStr)

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, reason: 'Verification code has expired. Please request a new code.' }
  }

  const secret = getSecret()
  const payload = `${email.toLowerCase().trim()}:${otp.trim()}:${expiresAtStr}`
  const expectedHash = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  if (expectedHash !== hash) {
    return { valid: false, reason: 'Incorrect 4-digit verification code. Please check your email and try again.' }
  }

  return { valid: true }
}

function buildOtpEmailHtml({ otp, purpose = 'signup', recipientName = 'Customer' }) {
  const isSignup = purpose === 'signup'
  const title = isSignup ? 'Verify Your Email Address' : 'Reset Your Account Password'
  const actionLabel = isSignup ? 'verify your THENEE account' : 'reset your THENEE account password'
  const subtitle = isSignup
    ? 'Welcome to THENEE! Your verification code is:'
    : 'We received a request to reset your password. Your verification code is:'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${otp} is your THENEE verification code</title>
      </head>
      <body style="margin: 0; padding: 24px 12px; background-color: #F6F8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <!-- Invisible Preheader for Gmail auto-detection -->
        <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 0px; line-height: 0px; opacity: 0; color: transparent; height: 0; width: 0;">
          Your verification code is ${otp}. Use code ${otp} to ${actionLabel}. Valid for 10 minutes.
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2EADF; box-shadow: 0 4px 16px rgba(39, 76, 55, 0.05);">
          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color: #274C37; padding: 26px 20px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.2em; text-transform: uppercase;">THENEE</div>
              <div style="font-size: 11px; color: #C6A15B; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">Crafted by Women • Rooted in Nature</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #1E392A; font-weight: 700;">
                ${title}
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #445548;">
                Hello <strong>${recipientName}</strong>,<br />
                ${subtitle}
              </p>

              <!-- OTP CODE BOX (Single contiguous string with letter-spacing for guaranteed single-line display) -->
              <div style="margin: 24px 0 28px; text-align: center;">
                <div style="display: inline-block; background-color: #F8FAF7; border: 2px solid #274C37; border-radius: 14px; padding: 18px 36px; text-align: center; box-shadow: 0 2px 8px rgba(39, 76, 55, 0.08);">
                  <div style="font-size: 11px; font-weight: 700; color: #6C8271; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">
                    YOUR VERIFICATION CODE
                  </div>
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #274C37; line-height: 1; padding-left: 12px; white-space: nowrap;">
                    ${otp}
                  </div>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #445548;">
                  Your verification code is <strong>${otp}</strong>
                </div>
              </div>

              <!-- TIMER NOTICE -->
              <div style="background-color: #F8FAF7; border-left: 4px solid #C6A15B; border-radius: 4px; padding: 12px 14px; margin-bottom: 24px; font-size: 13px; color: #556658; line-height: 1.4;">
                ⏱️ <strong>Valid for 10 minutes:</strong> This code will expire soon. If you did not request this, please safely ignore this email.
              </div>

              <p style="margin: 0; font-size: 12px; color: #7A8C7D; line-height: 1.5;">
                For your security, never share this code with anyone. THENEE support will never ask for your verification code.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color: #F8FAF7; padding: 18px 24px; border-top: 1px solid #E4ECE3; text-align: center; font-size: 11px; color: #8A9A8C;">
              <div>The Roots Enterprises • Kadayam, Tenkasi District, Tamil Nadu</div>
              <div style="margin-top: 4px;">Direct Support: <a href="mailto:rootsenterprises2025@gmail.com" style="color: #274C37; text-decoration: none; font-weight: 600;">rootsenterprises2025@gmail.com</a></div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { action, email, otp, otpToken, name, password, newPassword } = req.body || {}

  const apiKey =
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    ''

  const normalizedEmail = (email || '').toLowerCase().trim()

  // --------------------------------------------------------------------------
  // ACTION: send-signup-otp (Sends 4-digit code for account registration)
  // --------------------------------------------------------------------------
  if (action === 'send-signup-otp') {
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' })
    }

    const otpCode = generate4DigitOtp()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    const token = signOtpToken(normalizedEmail, otpCode, expiresAt)

    const supportSender =
      process.env.RESEND_SUPPORT_FROM_EMAIL ||
      process.env.VITE_RESEND_SUPPORT_FROM_EMAIL ||
      'THENEE Support <support@theneestores.com>'

    if (!apiKey) {
      // In dev fallback or missing key
      console.warn('Resend key not set in auth serverless function. Dev OTP:', otpCode)
      return res.status(200).json({
        success: true,
        otpToken: token,
        devOtp: otpCode,
        message: `Verification code sent to ${normalizedEmail}`,
      })
    }

    try {
      const resend = new Resend(apiKey)
      const { error } = await resend.emails.send({
        from: supportSender,
        to: [normalizedEmail],
        reply_to: 'rootsenterprises2025@gmail.com',
        subject: `${otpCode} is your THENEE verification code`,
        headers: {
          'X-Entity-Ref-ID': String(Date.now()),
          'OTP-Token': `"${otpCode}"; origin="https://theneestores.com"`,
        },
        html: buildOtpEmailHtml({ otp: otpCode, purpose: 'signup', recipientName: name || 'Valued Member' }),
        text: `Your verification code is: ${otpCode}\n\nUse code ${otpCode} to complete your account registration with THENEE. This code is valid for 10 minutes.\n\nTHENEE Support\nrootsenterprises2025@gmail.com`,
      })

      if (error) {
        console.error('Resend OTP send error:', error)
        return res.status(400).json({ success: false, error: error.message || 'Failed to dispatch verification email.' })
      }

      return res.status(200).json({
        success: true,
        otpToken: token,
        message: `4-digit verification code sent to ${normalizedEmail}`,
      })
    } catch (err) {
      console.error('Auth OTP dispatch error:', err)
      return res.status(500).json({ success: false, error: err.message || 'Server error sending verification code.' })
    }
  }

  // --------------------------------------------------------------------------
  // ACTION: verify-signup-otp (Verifies 4-digit code on registration)
  // --------------------------------------------------------------------------
  if (action === 'verify-signup-otp') {
    if (!normalizedEmail || !otp || !otpToken) {
      return res.status(400).json({ success: false, error: 'Missing required verification fields.' })
    }

    const result = verifyOtpToken(normalizedEmail, otp, otpToken)
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.reason })
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    })
  }

  // --------------------------------------------------------------------------
  // ACTION: send-forgot-password-otp (Sends 4-digit code for password reset)
  // --------------------------------------------------------------------------
  if (action === 'send-forgot-password-otp') {
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' })
    }

    const otpCode = generate4DigitOtp()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    const token = signOtpToken(normalizedEmail, otpCode, expiresAt)

    const supportSender =
      process.env.RESEND_SUPPORT_FROM_EMAIL ||
      process.env.VITE_RESEND_SUPPORT_FROM_EMAIL ||
      'THENEE Support <support@theneestores.com>'

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        otpToken: token,
        devOtp: otpCode,
        message: `Password reset code sent to ${normalizedEmail}`,
      })
    }

    try {
      const resend = new Resend(apiKey)
      const { error } = await resend.emails.send({
        from: supportSender,
        to: [normalizedEmail],
        reply_to: 'rootsenterprises2025@gmail.com',
        subject: `${otpCode} is your THENEE password reset code`,
        headers: {
          'X-Entity-Ref-ID': String(Date.now()),
          'OTP-Token': `"${otpCode}"; origin="https://theneestores.com"`,
        },
        html: buildOtpEmailHtml({ otp: otpCode, purpose: 'forgot', recipientName: name || 'Valued Member' }),
        text: `Your password reset code is: ${otpCode}\n\nUse code ${otpCode} to reset your THENEE account password. This code is valid for 10 minutes.\n\nTHENEE Support\nrootsenterprises2025@gmail.com`,
      })

      if (error) {
        console.error('Resend reset OTP error:', error)
        return res.status(400).json({ success: false, error: error.message || 'Failed to dispatch reset code.' })
      }

      return res.status(200).json({
        success: true,
        otpToken: token,
        message: `4-digit reset code sent to ${normalizedEmail}`,
      })
    } catch (err) {
      console.error('Auth reset OTP dispatch error:', err)
      return res.status(500).json({ success: false, error: err.message || 'Server error sending reset code.' })
    }
  }

  // --------------------------------------------------------------------------
  // ACTION: reset-password (Verifies 4-digit code & approves password reset)
  // --------------------------------------------------------------------------
  if (action === 'reset-password') {
    if (!normalizedEmail || !otp || !otpToken || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing required fields for password reset.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' })
    }

    const result = verifyOtpToken(normalizedEmail, otp, otpToken)
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.reason })
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset verified successfully!',
    })
  }

  return res.status(400).json({ success: false, error: `Unknown action: ${action}` })
}
