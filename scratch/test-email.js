async function run() {
  const payload = {
    from: 'THENEE Herbal <orders@theneestores.com>',
    to: 'gowthamandharshan4@gmail.com',
    subject: 'THENEE Herbal Demo Order Confirmation #THN-82194 🌿',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F6F9F5; padding: 32px 16px;">
        <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E9DF; overflow: hidden; box-shadow: 0 4px 20px rgba(49, 84, 58, 0.06);">
          <div style="background: #274C37; padding: 24px; text-align: center; color: #FFFFFF;">
            <div style="font-size: 26px; font-weight: 800; letter-spacing: 0.08em;">THENEE</div>
            <div style="font-size: 12px; color: #D5E5D7; margin-top: 4px;">Roots of Nature • Handcrafted in Tenkasi</div>
          </div>
          <div style="padding: 28px 24px;">
            <h2 style="color: #1E392A; margin: 0 0 10px; font-size: 20px;">Order Confirmed! 🌿</h2>
            <p style="color: #556658; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
              Dear <strong>Gowthaman</strong>, your order #THN-82194 has been placed successfully and is being prepared fresh by rural women artisans at our Tenkasi heritage unit.
            </p>
            <div style="background: #F8FAF7; border: 1px solid #E4EDE1; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                <tr><td style="color:#6C8271;">Order Number:</td><td align="right" style="font-weight:800;color:#274C37;">#THN-82194</td></tr>
                <tr><td style="color:#6C8271;">Courier:</td><td align="right" style="font-weight:600;color:#1E2822;">India Post Speed Post</td></tr>
                <tr><td style="color:#6C8271;">Speed Post AWB:</td><td align="right" style="font-weight:700;color:#2E7D32;">INP821940321TN</td></tr>
                <tr><td style="color:#6C8271;">Items:</td><td align="right" style="font-weight:600;color:#1E2822;">Thenee Herbal Tea (100g) × 1</td></tr>
                <tr><td style="color:#6C8271;border-top:1px solid #E2E9DF;padding-top:8px;">Total Paid:</td><td align="right" style="font-weight:800;color:#274C37;font-size:16px;border-top:1px solid #E2E9DF;padding-top:8px;">Rs. 339</td></tr>
              </table>
            </div>
            <div style="background: #EEF6F0; border-left: 4px solid #274C37; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #274C37; line-height: 1.4;">
              🌱 <strong>Direct Rural Impact:</strong> Thank you for choosing THENEE. Every pouch supports livelihood opportunities for women artisans in Kadayam, Tenkasi District.
            </div>
          </div>
          <div style="background: #F8FAF7; padding: 16px; border-top: 1px solid #E4ECE3; text-align: center; font-size: 11px; color: #8A9A8C;">
            © 2026 The Roots Enterprises • Manthiyoor, Kadayam, Tenkasi, Tamil Nadu - 627415 • FSSAI: 22425278000320
          </div>
        </div>
      </div>
    `
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || ''}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  console.log('RESEND RESPONSE STATUS:', res.status)
  console.log('RESEND RESPONSE BODY:', JSON.stringify(data, null, 2))
}

run()
