import { Resend } from 'resend'

export default async function handler(req, res) {
  // Set CORS headers
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

  const apiKey =
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    ''

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key')) {
    return res.status(200).json({
      success: false,
      skipped: true,
      message: 'Resend API key is not configured in environment variables. Email sending skipped.',
    })
  }

  try {
    const { to, subject, html, text, from, reply_to } = req.body || {}

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required email fields (to, subject, html/text)' })
    }

    const defaultFrom =
      process.env.RESEND_FROM_EMAIL ||
      process.env.VITE_RESEND_FROM_EMAIL ||
      'THENEE Herbal <orders@theneestores.com>'

    const defaultReplyTo =
      process.env.REPLY_TO_EMAIL ||
      process.env.VITE_REPLY_TO_EMAIL ||
      'rootsenterprises2025@gmail.com'

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: from || defaultFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || undefined,
      text: text || undefined,
      reply_to: reply_to || defaultReplyTo,
    })

    if (error) {
      console.error('Resend delivery error:', error)
      return res.status(400).json({ success: false, error })
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    console.error('Server error sending email via Resend:', err)
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
}
