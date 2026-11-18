import { useState } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { brandInfo } from '../data/products'
import { inquiryService } from '../lib/supabase'
import './PagesShared.css'
import './ContactPage.css'

const FAQS = [
  {
    q: 'Where are THENEE products handcrafted and shipped from?',
    a: 'Every single jar and pouch is handcrafted and packed directly at our processing unit located in Manthiyoor Village, Kadayam, Tenkasi District, Tamil Nadu (Western Ghats foothills). We dispatch fresh batches daily across India via India Post Speed Post and BlueDart Express.',
  },
  {
    q: 'How long does delivery take across Tamil Nadu and other states?',
    a: 'Deliveries within Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, Tirunelveli) arrive within 24 to 48 hours. Deliveries to Bengaluru, Kerala, Hyderabad, Mumbai, Delhi, and other states take 2 to 4 business days.',
  },
  {
    q: 'Are THENEE herbal teas and food podis safe for daily long-term use?',
    a: 'Yes, absolutely. Our formulations are 100% natural, caffeine-free, and free from any synthetic chemicals, extracts, or commercial preservatives. They are designed according to traditional Tamil food practices for daily family wellness.',
  },
  {
    q: 'Can clinics, doctors, and organic stores place wholesale bulk orders?',
    a: 'Yes! We actively supply bulk batches of Thenee Herbal Tea, Pure Moringa Powder, and Traditional Food Podis to organic health centers, Ayurvedic wellness clinics, and corporate gift curators. You can use the form below or chat directly on WhatsApp at +91 75502 48005.',
  },
  {
    q: 'What is the shelf life and recommended storage?',
    a: 'Our products have a natural shelf life of 9 to 12 months. Since we add zero artificial preservatives, please store them in a cool, dry place away from direct sunlight, and always use a clean dry spoon.',
  },
]

const ContactPage = ({ onOpenAccount }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'Retail Customer Inquiry',
    message: '',
  })
  const [openFaq, setOpenFaq] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) return
    setIsSubmitting(true)
    try {
      await inquiryService.submitInquiry(form)
    } catch (err) {
      console.warn('Inquiry submission fallback:', err)
    } finally {
      setIsSubmitting(false)
    }
    setToastMsg(`Thank you, ${form.name}! Your message has been sent to our Tenkasi team. We will reply within 2 hours.`)
    setForm({ name: '', phone: '', email: '', type: 'Retail Customer Inquiry', message: '' })
    setTimeout(() => setToastMsg(''), 4500)
  }

  return (
    <div className="page-wrapper contact-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
        <Navbar onOpenAccount={onOpenAccount} currentRoute="contact" />
      </header>

      {/* Hero */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Contact</span>
        </div>
        <h1>Get in Touch with Our Tenkasi Unit</h1>
        <span className="page-hero-tamil-sub">எங்களை தொடர்பு கொள்ளவும் • நேரடி வாடிக்கையாளர் உதவி & மொத்த கொள்முதல்</span>
        <p className="page-hero-desc">
          Have questions about our botanical teas, order tracking, or wholesale clinic supply?
          Our team in Kadayam, Tenkasi is here to assist you with warmth.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">⚡ 2-Hour Response Time</span>
          <span className="page-trust-pill">💬 WhatsApp Direct Support</span>
          <span className="page-trust-pill">📦 Wholesale & Bulk Supplies</span>
          <span className="page-trust-pill">📍 Kadayam, Tenkasi Unit</span>
        </div>
      </section>

      <main className="page-main-content">
        {/* Message Form & Unit Location Showcase */}
        <div className="contact-form-layout">
          <div className="contact-form-box">
            <h2>Send Us a Direct Message</h2>
            <p>Fill out this form and our support team will reach out via WhatsApp or phone call:</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group-2">
                <div>
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Meenakshi Sundaram"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Mobile Number / WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-2">
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label>Inquiry Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="Retail Customer Inquiry">Retail Order & Consignment Tracking</option>
                    <option value="Clinic & Ayurvedic Wholesale">Clinic & Ayurvedic Wholesale Supply</option>
                    <option value="Corporate Gift Hampers">Corporate Gift Hampers</option>
                    <option value="Feedback & Product Query">General Feedback & Health Questions</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Your Message / Requirements *</label>
                <textarea
                  rows="4"
                  placeholder="How can we assist you today? Please share your question or wholesale quantity..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-contact-submit">
                Send Message to Tenkasi Unit ➔
              </button>
            </form>
          </div>

          <div className="contact-side-info">
            <div className="unit-card">
              <h3>Kadayam, Tenkasi Heritage Unit</h3>
              <p>
                Nestled in the lush western plains of Tamil Nadu, our unit is run with clean hygiene,
                organic solar drying beds, and slow stone grinders.
              </p>
              <div className="unit-badge-row">
                <span>🌾 Tenkasi District Roots</span>
                <span>🌿 Manthiyoor Village</span>
                <span>👩‍🌾 Women Artisan Hub</span>
              </div>
            </div>

            <div className="cod-trust-box">
              <h4>📦 Fast Shipping & Safe Payment</h4>
              <ul>
                <li>✓ Dispatched daily via Speed Post & Express Courier</li>
                <li>✓ Free shipping on orders above ₹399</li>
                <li>✓ Tamper-proof food-grade moisture protection</li>
                <li>✓ Full live tracking from Tenkasi to your doorstep</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="contact-cards-grid">
          {/* WhatsApp Card */}
          <div className="contact-info-card card-whatsapp">
            <span className="contact-card-icon">💬</span>
            <h3>WhatsApp Support</h3>
            <p>Instant answers, custom gift hampers, and direct reorders.</p>
            <a
              href={`https://wa.me/${brandInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20THENEE%2C%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-wa"
            >
              Chat on WhatsApp →
            </a>
          </div>

          {/* Telephone Card */}
          <div className="contact-info-card">
            <span className="contact-card-icon">📞</span>
            <h3>Phone Call Support</h3>
            <p>Monday to Saturday • 9:00 AM to 7:00 PM</p>
            <a href={`tel:${brandInfo.whatsapp}`} className="contact-link-pill">
              +91 75502 48005
            </a>
          </div>

          {/* Email Card */}
          <div className="contact-info-card">
            <span className="contact-card-icon">✉️</span>
            <h3>Email Helpdesk</h3>
            <p>For order queries, invoices, and clinic tie-ups.</p>
            <a href="mailto:theenenterprises2024@gmail.com" className="contact-link-pill">
              theenenterprises2024@gmail.com
            </a>
          </div>

          {/* Address Card */}
          <div className="contact-info-card">
            <span className="contact-card-icon">📍</span>
            <h3>Farm & Processing Unit</h3>
            <p>The Roots Enterprises, 1/48, Pillaiyar Kovil Street, Manthiyoor, Kadayam, Tenkasi District, TN - 627415</p>
            <span className="contact-license-badge">FSSAI Lic. #{brandInfo.fssai}</span>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="contact-faq-section">
          <div className="faq-header">
            <h2>Frequently Asked Questions (அடிக்கடி கேட்கப்படும் கேள்விகள்)</h2>
            <p>Everything you need to know about our products, delivery, and quality guarantee:</p>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaq === idx ? 'is-open' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="faq-question">
                  <h4>{faq.q}</h4>
                  <span className="faq-toggle">{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span className="cart-toast-icon">🌿</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ContactPage
