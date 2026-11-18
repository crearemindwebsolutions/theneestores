import { brandInfo } from '../data/products.js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {})
const resendApiKey = env.VITE_RESEND_API_KEY || env.RESEND_API_KEY || ''
const defaultFromEmail = env.VITE_RESEND_FROM_EMAIL || env.RESEND_FROM_EMAIL || 'THENEE Herbal <orders@theneestores.com>'
const adminNotificationEmail = env.VITE_ADMIN_NOTIFICATION_EMAIL || env.ADMIN_NOTIFICATION_EMAIL || 'rootsenterprises2025@gmail.com'

export const isResendConfigured = Boolean(
  resendApiKey &&
  resendApiKey.trim() !== '' &&
  !resendApiKey.includes('your_api_key')
)

/* ==============================================================================
   CORE EMAIL DISPATCHER (Vercel Serverless / Client Fallback)
   ============================================================================== */

export async function sendEmail({ to, subject, html, text, from, reply_to }) {
  if (!to) {
    console.warn('Email dispatch skipped: Recipient address is empty.')
    return { success: false, skipped: true }
  }

  const payload = {
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    from: from || defaultFromEmail,
    reply_to: reply_to || env.VITE_REPLY_TO_EMAIL || env.REPLY_TO_EMAIL || 'rootsenterprises2025@gmail.com',
  }

  // 1. First attempt: Vercel Serverless API endpoint
  try {
    const apiRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (apiRes.ok) {
      const data = await apiRes.json()
      return data
    }

    // If serverless endpoint returned 404 (e.g. running in local Vite dev without Vercel CLI)
    // and a client-side key is available, attempt direct Resend API call
    if (apiRes.status === 404 && isResendConfigured) {
      const directRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const directData = await directRes.json()
      return { success: directRes.ok, data: directData }
    }

    const errData = await apiRes.json().catch(() => ({}))
    return { success: false, error: errData.error || `HTTP ${apiRes.status}` }
  } catch (netErr) {
    // If running in local dev and network/CORS or offline occurs
    if (isResendConfigured) {
      try {
        const directRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const directData = await directRes.json()
        return { success: directRes.ok, data: directData }
      } catch (directErr) {
        console.warn('Direct Resend dispatch notice:', directErr)
      }
    }
    console.warn('Resend email dispatch skipped/unreachable in current environment:', netErr.message)
    return { success: false, error: netErr.message }
  }
}

/* ==============================================================================
   HTML EMAIL TEMPLATES
   ============================================================================== */

// Generate luxury botanical HTML email for Customer Order Confirmation
function buildOrderConfirmationHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #EDF2EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1E2822;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #EDF2EB; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #556658;">
        ${item.qty || 1}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #EDF2EB; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1E392A; font-weight: 700;">
        Rs. ${item.price * (item.qty || 1)}
      </td>
    </tr>
  `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>THENEE Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F6F9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F6F9F5; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E9DF; overflow: hidden; box-shadow: 0 4px 20px rgba(49, 84, 58, 0.05);">
                
                <!-- BRAND HEADER -->
                <tr>
                  <td align="center" style="background-color: #274C37; padding: 28px 24px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.08em; margin: 0;">
                      THENEE
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: #D5E5D7; letter-spacing: 0.04em; margin-top: 4px;">
                      Roots of Nature • Handcrafted in Tenkasi
                    </div>
                  </td>
                </tr>

                <!-- MAIN BODY -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <div style="font-size: 20px; font-weight: 700; color: #1E392A; margin-bottom: 8px;">
                      Order Confirmed! 🌿
                    </div>
                    <p style="font-size: 14px; color: #556658; line-height: 1.5; margin: 0 0 24px;">
                      Dear <strong>${order.recipient || 'Valued Customer'}</strong>, thank you for supporting pure natural wellness. Your order has been placed successfully and is being prepared fresh by rural women artisans at our Tenkasi heritage unit.
                    </p>

                    <!-- ORDER HIGHLIGHT BOX -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAF7; border-radius: 12px; border: 1px solid #E4EDE1; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 13px; color: #6C8271;">Order Number:</td>
                              <td align="right" style="font-size: 14px; font-weight: 800; color: #274C37;">${order.id}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #6C8271; padding-top: 8px;">Order Date:</td>
                              <td align="right" style="font-size: 13px; font-weight: 600; color: #1E2822; padding-top: 8px;">${order.date}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #6C8271; padding-top: 8px;">Postal Courier:</td>
                              <td align="right" style="font-size: 13px; font-weight: 600; color: #1E2822; padding-top: 8px;">${order.courier || 'India Post Speed Post'}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #6C8271; padding-top: 8px;">Speed Post AWB:</td>
                              <td align="right" style="font-size: 13px; font-weight: 700; color: #2E7D32; padding-top: 8px;">${order.awb || 'Processing'}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #6C8271; padding-top: 8px;">Payment Method:</td>
                              <td align="right" style="font-size: 13px; font-weight: 600; color: #1E2822; padding-top: 8px;">Online Payment (Authorized)</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- ITEMS TABLE -->
                    <div style="font-size: 14px; font-weight: 700; color: #1E392A; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Items in Your Order
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <thead>
                        <tr style="border-bottom: 2px solid #E2E9DF;">
                          <th align="left" style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #6C8271; font-weight: 700;">Product</th>
                          <th align="center" style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #6C8271; font-weight: 700;">Qty</th>
                          <th align="right" style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #6C8271; font-weight: 700;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- PRICE TOTALS -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #556658;">Subtotal:</td>
                        <td align="right" style="padding: 4px 0; font-size: 13px; color: #1E2822; font-weight: 600;">Rs. ${order.subtotal || order.total}</td>
                      </tr>
                      ${
                        order.discount > 0
                          ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #2E7D32;">Coupon Discount:</td>
                        <td align="right" style="padding: 4px 0; font-size: 13px; color: #2E7D32; font-weight: 600;">- Rs. ${order.discount}</td>
                      </tr>
                      `
                          : ''
                      }
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #556658;">Delivery Fee (India Post):</td>
                        <td align="right" style="padding: 4px 0; font-size: 13px; color: #1E2822; font-weight: 600;">${order.deliveryFee === 0 ? 'FREE' : 'Rs. ' + (order.deliveryFee || 40)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0 4px; font-size: 16px; font-weight: 800; color: #1E392A; border-top: 2px solid #E4EDE1;">Total Amount Paid:</td>
                        <td align="right" style="padding: 10px 0 4px; font-size: 18px; font-weight: 800; color: #274C37; border-top: 2px solid #E4EDE1;">Rs. ${order.total}</td>
                      </tr>
                    </table>

                    <!-- DELIVERY ADDRESS -->
                    <div style="font-size: 14px; font-weight: 700; color: #1E392A; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Shipping Destination
                    </div>
                    <div style="background-color: #F8FAF7; border-radius: 10px; border: 1px solid #E4EDE1; padding: 14px; font-size: 13px; color: #445548; line-height: 1.5; margin-bottom: 24px;">
                      <strong>${order.recipient}</strong><br />
                      Phone: ${order.phone}<br />
                      ${order.address || order.destination}
                    </div>

                    <!-- COMMUNITY IMPACT NOTE -->
                    <div style="background-color: #EEF6F0; border-left: 4px solid #274C37; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #274C37; line-height: 1.4; margin-bottom: 24px;">
                      🌱 <strong>Direct Rural Impact:</strong> Thank you for choosing THENEE. Every pouch supports livelihood opportunities for women artisans in Kadayam, Tenkasi District.
                    </div>

                    <!-- SUPPORT INFO -->
                    <p style="font-size: 13px; color: #6C8271; line-height: 1.4; margin: 0;">
                      Questions or modifications? Reach our Tenkasi unit on WhatsApp at <strong>+91 75502 48005</strong> or email us at <strong>${brandInfo.email}</strong>.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td align="center" style="background-color: #F8FAF7; padding: 20px; border-top: 1px solid #E4ECE3; text-align: center; font-size: 11px; color: #8A9A8C;">
                    <div>© ${new Date().getFullYear()} The Roots Enterprises • FSSAI License: ${brandInfo.fssai}</div>
                    <div style="margin-top: 4px;">Manthiyoor, Kadayam, Tenkasi District, Tamil Nadu - 627415</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

// Generate Admin Notification HTML email when a new order arrives
function buildAdminOrderAlertHtml(order) {
  const itemsText = (order.items || [])
    .map((item) => `<li><strong>${item.name}</strong> × ${item.qty || 1} (Rs. ${item.price * (item.qty || 1)})</li>`)
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F6F9F5; padding: 20px;">
        <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #D5E2D2; padding: 24px;">
          <h2 style="color: #274C37; margin: 0 0 10px;">🔔 New Order Received: ${order.id}</h2>
          <p style="font-size: 14px; color: #445548; margin: 0 0 16px;">
            A new online payment order has been confirmed on THENEE Stores.
          </p>
          <div style="background: #F8FAF7; border: 1px solid #E2EADF; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6; color: #1E2822; margin-bottom: 16px;">
            <strong>Customer:</strong> ${order.recipient}<br />
            <strong>Phone:</strong> ${order.phone}<br />
            <strong>Total Amount Paid:</strong> Rs. ${order.total}<br />
            <strong>India Post Speed Post AWB:</strong> ${order.awb || 'Pending'}<br />
            <strong>Delivery Address:</strong> ${order.address || order.destination}
          </div>
          <h4 style="color: #274C37; margin: 0 0 8px;">Order Items:</h4>
          <ul style="font-size: 13px; color: #445548; padding-left: 20px; margin: 0 0 20px;">
            ${itemsText}
          </ul>
          <p style="font-size: 12px; color: #7A8C7D; margin: 0;">
            Please handcraft and pack this order at the Tenkasi unit for Speed Post dispatch.
          </p>
        </div>
      </body>
    </html>
  `
}

// Generate Contact / Inquiry HTML email
function buildInquiryHtml(inquiry, isAdminCopy = false) {
  if (isAdminCopy) {
    return `
      <div style="font-family: sans-serif; max-width: 560px; padding: 20px; background: #FFFFFF; border: 1px solid #E2EADF; border-radius: 10px;">
        <h3 style="color: #274C37; margin-top: 0;">📩 New Customer Inquiry: ${inquiry.type}</h3>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Email:</strong> ${inquiry.email || 'Not provided'}</p>
        <p><strong>Regarding:</strong> ${inquiry.type}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #F8FAF7; padding: 12px; border-radius: 6px; border: 1px solid #E4ECE3;">
          ${inquiry.message}
        </div>
      </div>
    `
  }

  return `
    <div style="font-family: sans-serif; max-width: 560px; padding: 24px; background: #FFFFFF; border: 1px solid #E2EADF; border-radius: 12px;">
      <h3 style="color: #274C37; margin-top: 0;">Thank You for Contacting THENEE 🌿</h3>
      <p style="font-size: 14px; color: #445548; line-height: 1.5;">
        Dear <strong>${inquiry.name}</strong>,<br /><br />
        We have received your message regarding <strong>${inquiry.type}</strong>. Our Tenkasi customer care team is reviewing your inquiry and will reach out to you within 2 hours.
      </p>
      <div style="background: #F8FAF7; padding: 12px 16px; border-radius: 8px; border: 1px solid #E4EDE1; font-size: 13px; color: #556658; margin: 16px 0;">
        <strong>Your Message:</strong><br />
        "${inquiry.message}"
      </div>
      <p style="font-size: 12px; color: #7A8C7D;">
        Need urgent assistance? Chat with us on WhatsApp at +91 75502 48005.
      </p>
    </div>
  `
}

// Generate Order Dispatch Notification HTML email
function buildOrderDispatchHtml(order, newStatus, awb) {
  return `
    <div style="font-family: sans-serif; max-width: 580px; padding: 24px; background: #FFFFFF; border: 1px solid #E2EADF; border-radius: 12px;">
      <h2 style="color: #274C37; margin-top: 0;">📦 Your Order Has Been Dispatched!</h2>
      <p style="font-size: 14px; color: #445548; line-height: 1.5;">
        Dear <strong>${order.recipient || 'Customer'}</strong>,<br />
        Your order <strong>${order.id}</strong> is now on its way to you via <strong>India Post Speed Post</strong>!
      </p>
      <div style="background: #EEF6F0; border: 1px solid #BFE2C7; border-radius: 8px; padding: 14px; margin: 16px 0;">
        <div style="font-size: 13px; color: #1E5E2F;"><strong>Speed Post Consignment / AWB:</strong></div>
        <div style="font-size: 18px; font-weight: 800; color: #274C37; margin-top: 4px;">${awb || order.awb}</div>
        <div style="font-size: 12px; color: #556658; margin-top: 6px;">
          Track live at <a href="https://www.indiapost.gov.in" target="_blank" style="color: #274C37; font-weight: 700;">indiapost.gov.in</a>
        </div>
      </div>
      <p style="font-size: 13px; color: #556658;">
        Estimated delivery across Tamil Nadu is 2-3 business days. Thank you for choosing THENEE! 🌿
      </p>
    </div>
  `
}

/* ==============================================================================
   EXPORTED CONVENIENCE METHODS
   ============================================================================== */

// 1. Send Order Confirmation Email to Customer
export async function sendOrderConfirmationEmail(order, customerEmail) {
  const targetEmail = customerEmail || order.email || order.shipping_address?.email
  if (!targetEmail) {
    console.info('Order confirmation email skipped: No customer email provided for order', order.id)
    return { success: false, skipped: true }
  }

  return await sendEmail({
    to: targetEmail,
    subject: `Your THENEE Herbal Order Confirmation ${order.id} 🌿`,
    html: buildOrderConfirmationHtml(order),
    text: `Your THENEE Herbal Order ${order.id} is confirmed. Total: Rs. ${order.total}. Postal Courier: ${order.courier || 'India Post Speed Post'} (${order.awb}). Thank you for supporting rural women artisans in Tenkasi!`,
  })
}

// 2. Send Admin Notification Email for New Order
export async function sendAdminOrderAlertEmail(order) {
  return await sendEmail({
    to: adminNotificationEmail,
    subject: `🔔 New Order Received: ${order.id} (Rs. ${order.total})`,
    html: buildAdminOrderAlertHtml(order),
    text: `New order ${order.id} from ${order.recipient} (${order.phone}). Total: Rs. ${order.total}. Address: ${order.address || order.destination}`,
  })
}

// 3. Send Inquiry Emails (Customer confirmation + Admin notification)
export async function sendInquiryEmails(inquiry) {
  const results = { admin: null, customer: null }

  // Send Admin Notification
  results.admin = await sendEmail({
    to: adminNotificationEmail,
    subject: `📩 New Customer Inquiry from ${inquiry.name} (${inquiry.type})`,
    html: buildInquiryHtml(inquiry, true),
    text: `New inquiry from ${inquiry.name} (${inquiry.phone}, ${inquiry.email || 'no email'}): ${inquiry.message}`,
  })

  // If customer provided an email address, send them an acknowledgment
  if (inquiry.email && inquiry.email.includes('@')) {
    results.customer = await sendEmail({
      to: inquiry.email,
      subject: `We received your inquiry regarding ${inquiry.type} - THENEE Herbal 🌿`,
      html: buildInquiryHtml(inquiry, false),
      text: `Dear ${inquiry.name}, thank you for contacting THENEE. We received your message regarding ${inquiry.type} and will reply within 2 hours.`,
    })
  }

  return results
}

// 4. Send Order Dispatched Notification Email to Customer
export async function sendOrderStatusUpdateEmail(order, newStatus, awb, customerEmail) {
  const targetEmail = customerEmail || order.email || order.shipping_address?.email
  if (!targetEmail) return { success: false, skipped: true }

  return await sendEmail({
    to: targetEmail,
    subject: `Dispatch Update: Your THENEE Order ${order.id} is on the way! 📦`,
    html: buildOrderDispatchHtml(order, newStatus, awb),
    text: `Your THENEE order ${order.id} has been dispatched via India Post Speed Post. Consignment AWB: ${awb || order.awb}.`,
  })
}
