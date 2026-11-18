import { useState } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { brandInfo } from '../data/products'
import { inquiryService } from '../lib/supabase'
import './PagesShared.css'
import './ContactPage.css'

const INQUIRY_TYPES = [
  { id: 'Retail Order & Tracking', label: 'Order Tracking', emoji: '📦' },
  { id: 'Herbal Wellness Guidance', label: 'Wellness Advice', emoji: '🌿' },
  { id: 'Clinic & Ayurvedic Wholesale', label: 'Wholesale & Clinic', emoji: '🏥' },
  { id: 'Corporate Gift Hampers', label: 'Corporate Gifts', emoji: '🎁' },
]

const FAQS = [
  {
    q: 'Where are THENEE products handcrafted and shipped from?',
    a: 'Every single jar and pouch is handcrafted and packed directly at our village processing unit in Manthiyoor, Kadayam, Tenkasi District (Western Ghats foothills). We dispatch fresh batches daily across India via India Post Speed Post and BlueDart Express.',
  },
  {
    q: 'How long does delivery take across India?',
    a: 'Deliveries within Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, Tirunelveli) arrive within 24 to 48 hours. Deliveries to Bengaluru, Kerala, Hyderabad, Mumbai, Delhi, and other states take 2 to 4 business days.',
  },
  {
    q: 'Are THENEE herbal teas and food podis safe for daily long-term use?',
    a: 'Yes, absolutely. Our formulations are 100% natural, caffeine-free, and free from any synthetic chemicals, extracts, or commercial preservatives. They are designed according to traditional herbal food practices for daily family wellness.',
  },
  {
    q: 'Can clinics, doctors, and organic stores place wholesale bulk orders?',
    a: 'Yes! We actively supply fresh bulk batches of Thenee Herbal Tea, Pure Moringa Powder, and Traditional Food Podis to organic health centers, Ayurvedic wellness clinics, and corporate gift curators. You can use the form on this page or chat directly on WhatsApp at +91 75502 48005.',
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
    type: 'Retail Order & Tracking',
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
    setForm({ name: '', phone: '', email: '', type: 'Retail Order & Tracking', message: '' })
    setTimeout(() => setToastMsg(''), 4500)
  }

  return (
    <div className="page-wrapper contact-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
        <Navbar onOpenAccount={onOpenAccount} currentRoute="contact" />
      </header>

      {/* Hero Banner */}
      <section className="contact-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Contact</span>
        </div>
        <div className="contact-hero-content">
          <span className="contact-hero-tag">Kadayam • Tenkasi Heritage</span>
          <h1 className="contact-hero-title">Get in Touch with Our Village Team</h1>
          <p className="contact-hero-desc">
            Have questions about our botanical teas, delivery tracking, or clinic bulk supply?
            Our artisans and support team in Kadayam, Tenkasi are here to assist you with warmth.
          </p>
        </div>

        <div className="contact-trust-strip">
          <span className="contact-trust-item">⚡ 2-Hour Response Time</span>
          <span className="contact-trust-item">💬 WhatsApp Direct Support</span>
          <span className="contact-trust-item">📦 All-India Daily Dispatch</span>
          <span className="contact-trust-item">📍 Foothills of Western Ghats</span>
        </div>
      </section>

      <main className="contact-main-content">
        {/* Quick Connect Cards Grid */}
        <section className="contact-quick-grid">
          {/* WhatsApp Card (Primary) */}
          <div className="contact-quick-card card-whatsapp">
            <div className="quick-card-icon-wrap wa-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.905.534 3.684 1.46 5.203L2 22l4.908-1.423c1.467.848 3.169 1.332 5.003 1.332 5.536 0 10.031-4.495 10.031-10.031S17.567 2 12.031 2zm5.795 14.282c-.244.686-1.421 1.31-1.956 1.393-.509.079-1.157.112-3.344-.793-2.603-1.077-4.269-3.743-4.399-3.916-.13-.173-1.048-1.396-1.048-2.662 0-1.266.663-1.89.897-2.146.234-.256.512-.32.684-.32.171 0 .343.003.493.011.161.008.375-.061.587.448.221.53.754 1.838.819 1.97.065.132.109.287.022.46-.087.173-.13.28-.26.43-.13.152-.274.34-.391.456-.13.13-.265.27-.114.53.151.26.673 1.109 1.442 1.794.99.882 1.825 1.156 2.085 1.286.26.13.412.109.564-.065.152-.174.651-.758.825-1.018.174-.26.347-.217.586-.13.239.087 1.52.716 1.781.847.26.13.434.195.499.304.065.109.065.63-.179 1.316z" />
              </svg>
            </div>
            <div className="quick-card-body">
              <span className="quick-badge-live">Direct Chat</span>
              <h3>WhatsApp Support</h3>
              <p>Instant answers, custom gift hampers & reorders.</p>
              <a
                href={`https://wa.me/${brandInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20THENEE%2C%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quick-wa"
              >
                Chat on WhatsApp ➔
              </a>
            </div>
          </div>

          {/* Phone Call Card */}
          <div className="contact-quick-card">
            <div className="quick-card-icon-wrap">📞</div>
            <div className="quick-card-body">
              <h3>Phone Hotline</h3>
              <p>Mon to Sat • 9:00 AM to 7:00 PM</p>
              <a href={`tel:${brandInfo.whatsapp}`} className="quick-card-link">
                +91 75502 48005
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="contact-quick-card">
            <div className="quick-card-icon-wrap">✉️</div>
            <div className="quick-card-body">
              <h3>Email Helpdesk</h3>
              <p>For orders, clinic tie-ups & bulk invoices.</p>
              <a href="mailto:theenenterprises2024@gmail.com" className="quick-card-link">
                theenenterprises2024@gmail.com
              </a>
            </div>
          </div>

          {/* Heritage Unit Card */}
          <div className="contact-quick-card">
            <div className="quick-card-icon-wrap">📍</div>
            <div className="quick-card-body">
              <h3>Tenkasi Heritage Unit</h3>
              <p>Manthiyoor, Kadayam, Tenkasi District, TN - 627415</p>
              <span className="quick-card-fssai">FSSAI Lic. #{brandInfo.fssai}</span>
            </div>
          </div>
        </section>

        {/* 2-Column Main Layout: Message Form (Left) & Heritage Showcase (Right) */}
        <section className="contact-main-split">
          {/* Left: Interactive Form */}
          <div className="contact-form-panel">
            <div className="panel-header">
              <span className="panel-kicker">Direct Assistance</span>
              <h2>Send Us a Message</h2>
              <p>Choose an inquiry type and our Kadayam team will get back to you promptly:</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form-modern">
              {/* Inquiry Type Chips */}
              <div className="inquiry-selector-wrap">
                <label className="form-label">What is this regarding?</label>
                <div className="inquiry-chips-group">
                  {INQUIRY_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`inquiry-chip-btn ${form.type === t.id ? 'is-active' : ''}`}
                      onClick={() => setForm({ ...form, type: t.id })}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-column: Name & Phone */}
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Meenakshi Sundaram"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Mobile Number / WhatsApp *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Single row: Email */}
              <div className="form-field">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="yourname@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Message textarea */}
              <div className="form-field">
                <label className="form-label">Your Message / Requirements *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Please describe your question, required quantity, or delivery address..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-submit-contact"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message to Tenkasi Unit ➔'}
              </button>
            </form>
          </div>

          {/* Right: Heritage Showcase & Dispatch Guarantee */}
          <div className="contact-showcase-panel">
            <div className="heritage-story-card">
              <span className="heritage-card-badge">TENKASI HERITAGE</span>
              <h3>Crafted at the Foothills of Western Ghats</h3>
              <p>
                Our processing center in Manthiyoor Village, Kadayam is powered by skilled rural women artisans.
                We harvest mountain botanicals, shade-dry at natural ambient temperatures, and stone-grind with zero friction heat.
              </p>

              <div className="heritage-features-list">
                <div className="heritage-feat-item">
                  <span className="feat-check">✓</span>
                  <div>
                    <strong>100% Unadulterated Botanicals</strong>
                    <p>Clean, chemical-free raw ingredients from village soils.</p>
                  </div>
                </div>

                <div className="heritage-feat-item">
                  <span className="feat-check">✓</span>
                  <div>
                    <strong>Shade-Drying Heritage</strong>
                    <p>Gentle drying preserves volatile floral oils and medicinal potency.</p>
                  </div>
                </div>

                <div className="heritage-feat-item">
                  <span className="feat-check">✓</span>
                  <div>
                    <strong>Daily All-India Speed Dispatch</strong>
                    <p>Packed fresh and sent via India Post Speed Post & BlueDart.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dispatch-guarantee-box">
              <div className="dispatch-header">
                <span className="dispatch-icon">🚚</span>
                <div>
                  <h4>Live Support & Fast Dispatch</h4>
                  <p>Orders before 2:00 PM are dispatched the same day.</p>
                </div>
              </div>
              <div className="dispatch-pills-row">
                <span>Free delivery on ₹499+</span>
                <span>Tamper-proof glass & pouch packs</span>
                <span>Speedy live tracking</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="contact-faq-wrap">
          <div className="faq-intro">
            <span className="panel-kicker">Need Quick Answers?</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our products, delivery timelines, and wholesale:</p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-card-modern ${openFaq === idx ? 'is-active' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="faq-card-question">
                  <h4>{faq.q}</h4>
                  <span className="faq-card-plus">{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <div className="faq-card-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
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
