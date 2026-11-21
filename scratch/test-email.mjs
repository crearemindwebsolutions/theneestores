import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'

const envContent = fs.readFileSync(path.resolve('.env'), 'utf8')
let apiKey = ''
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (trimmed.startsWith('VITE_RESEND_API_KEY=')) {
    apiKey = trimmed.split('=')[1].trim()
  }
})

console.log('Using Resend Key:', apiKey ? 'Loaded' : 'Missing')

const resend = new Resend(apiKey)

async function test() {
  const otp = '8492'
  const res = await resend.emails.send({
    from: 'THENEE Support <support@theneestores.com>',
    to: ['gowthamandharshan4@gmail.com'],
    reply_to: 'rootsenterprises2025@gmail.com',
    subject: `${otp} is your THENEE verification code`,
    headers: {
      'X-Entity-Ref-ID': String(Date.now()),
      'OTP-Token': `"${otp}"; origin="https://theneestores.com"`,
    },
    text: `Your verification code is: ${otp}\n\nUse code ${otp} to complete your account registration with THENEE.\nValid for 10 minutes.\n\nTHENEE Support\nrootsenterprises2025@gmail.com`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${otp} is your THENEE verification code</title>
        </head>
        <body style="margin: 0; padding: 24px 12px; background-color: #F6F8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <!-- Preheader for Gmail auto-detection -->
          <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 0px; line-height: 0px; opacity: 0; color: transparent; height: 0; width: 0;">
            Your verification code is ${otp}. Use code ${otp} to verify your THENEE account. Valid for 10 minutes.
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2EADF; box-shadow: 0 4px 16px rgba(39, 76, 55, 0.05);">
            <tr>
              <td align="center" style="background-color: #274C37; padding: 26px 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.2em; text-transform: uppercase;">THENEE</div>
                <div style="font-size: 11px; color: #C6A15B; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">Crafted by Women • Rooted in Nature</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 28px;">
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #1E392A; font-weight: 700;">
                  Verify Your Email Address
                </h2>
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #445548;">
                  Hello <strong>Gowtham</strong>,<br />
                  Welcome to THENEE! Your verification code is:
                </p>

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
                    Enter code <strong>${otp}</strong> in your verification window.
                  </div>
                </div>

                <div style="background-color: #F8FAF7; border-left: 4px solid #C6A15B; border-radius: 4px; padding: 12px 14px; margin-bottom: 24px; font-size: 13px; color: #556658; line-height: 1.4;">
                  ⏱️ <strong>Valid for 10 minutes:</strong> This code will expire soon. If you did not request this, please safely ignore this email.
                </div>

                <p style="margin: 0; font-size: 12px; color: #7A8C7D; line-height: 1.5;">
                  For your security, never share this code with anyone. THENEE support will never ask for your verification code.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="background-color: #F8FAF7; padding: 18px 24px; border-top: 1px solid #E4ECE3; text-align: center; font-size: 11px; color: #8A9A8C;">
                <div>The Roots Enterprises • Kadayam, Tenkasi District, Tamil Nadu</div>
                <div style="margin-top: 4px;">Direct Support: <a href="mailto:rootsenterprises2025@gmail.com" style="color: #274C37; text-decoration: none; font-weight: 600;">rootsenterprises2025@gmail.com</a></div>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })

  console.log('Result:', res)
}

test().catch(console.error)
