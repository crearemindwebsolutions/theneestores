import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import { brandInfo } from '../data/products'
import { inquiryService, supabase, profileService } from '../lib/supabase'
import { sendInquiryEmails } from '../lib/emailService'
import './PagesShared.css'
import './ContactPage.css'


const INQUIRY_TYPES = [
  {
    id: 'Retail Order & Tracking',
    activeLabel: 'Order Tracking & Delivery Status',
    subLabel: 'Order Tracking & Delivery',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'Herbal Wellness Guidance',
    activeLabel: 'Herbal Wellness Guidance',
    subLabel: 'Herbal Wellness Guidance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  {
    id: 'Clinic & Ayurvedic Wholesale',
    activeLabel: 'Clinic & Ayurvedic Wholesale',
    subLabel: 'Clinic & Wholesale',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v6a6 6 0 0 0 12 0V2" />
        <line x1="9" y1="14" x2="9" y2="18" />
        <circle cx="12" cy="18" r="3" />
      </svg>
    ),
  },
  {
    id: 'Corporate Gift Hampers',
    activeLabel: 'Corporate Gift Hampers',
    subLabel: 'Corporate Gift Hampers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
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

  const activeType = INQUIRY_TYPES.find((t) => t.id === form.type) || INQUIRY_TYPES[0]
  const otherTypes = INQUIRY_TYPES.filter((t) => t.id !== activeType.id)

  // Prefill contact details if user is signed in
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user
      if (u) {
        profileService.getProfile(u.id).then(({ data: prof }) => {
          setForm((prev) => ({
            ...prev,
            name: prev.name || prof?.full_name || u.user_metadata?.full_name || '',
            phone: prev.phone || prof?.phone || '',
            email: prev.email || u.email || '',
          }))
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) return
    setIsSubmitting(true)
    try {
      await inquiryService.submitInquiry(form)
      sendInquiryEmails(form).catch((emailErr) => {
        console.warn('Inquiry email notice:', emailErr)
      })
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
      <OfferMarquee />
      <header className="site-header-sticky">
        <Navbar onOpenAccount={onOpenAccount} currentRoute="contact" />
      </header>

      {/* Main Container Styled According to Reference Design */}
      <main className="contact-theme-container">
        {/* Top Brand Header */}
        <div className="contact-brand-hero">
          <div className="contact-brand-logo-row">
            <svg className="contact-leaf-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 3.5 1.8 6.57 4.54 8.35C6.19 19.34 6 18.2 6 17c0-4.41 3.59-8 8-8 1.2 0 2.34.19 3.35.54C15.57 6.8 12.5 5 9 5c-.34 0-.67.02-1 .06C9.17 3.23 10.5 2 12 2z"
                fill="#163826"
              />
              <path
                d="M17 9c-3.86 0-7 3.14-7 7 0 1.29.35 2.5 1 3.53C12.54 20.35 14.18 21 16 21c3.86 0 7-3.14 7-7 0-1.82-.65-3.46-1.47-5-.84.6-1.92 1-3.53 1z"
                fill="#2E5C42"
              />
            </svg>
            <div className="contact-brand-title-wrap">
              <h1 className="contact-brand-title">THENEE</h1>
              <span className="contact-brand-subtitle">Ayurvedic herbal store</span>
            </div>
          </div>

          {/* 4 Trust Badges Strip (Responsive: Single Row on Desktop, Balanced 2x2 Grid on Mobile) */}
          <div className="contact-trust-pill-strip">
            <div className="trust-pill-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="trust-text-desktop">2-Hour Response Time</span>
              <span className="trust-text-mobile">2-Hour Response</span>
            </div>

            <div className="trust-pill-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="trust-text-desktop">WhatsApp Direct Support</span>
              <span className="trust-text-mobile">WhatsApp Support</span>
            </div>

            <div className="trust-pill-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span className="trust-text-desktop">All-India Daily Dispatch</span>
              <span className="trust-text-mobile">Daily Dispatch</span>
            </div>

            <div className="trust-pill-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <span className="trust-text-desktop">Foothills of Western Ghats</span>
              <span className="trust-text-mobile">Western Ghats</span>
            </div>
          </div>
        </div>

        {/* Center Contact Message Card */}
        <section className="contact-main-card">
          <div className="card-kicker">DIRECT ASSISTANCE</div>
          <h2 className="card-heading">Send Us a Message</h2>
          <p className="card-subheading">Choose an inquiry type</p>

          <form onSubmit={handleSubmit} className="contact-card-form">
            {/* Inquiry Type Box (Desktop: Exact Reference Design; Mobile: Balanced 2x2 Grid) */}
            <div className="inquiry-type-box">
              <span className="inquiry-box-label">Inquiry type</span>

              {/* Desktop Layout: Exact Reference Match */}
              <div className="inquiry-desktop-layout">
                <div className="inquiry-active-pill">
                  <div className="pill-left-content">
                    <span className="pill-icon">{activeType.icon}</span>
                    <span className="pill-label">{activeType.activeLabel}</span>
                  </div>
                  <div className="pill-check-circle" title="Selected">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <div className="inquiry-options-row">
                  {otherTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="inquiry-sub-pill"
                      onClick={() => setForm({ ...form, type: t.id })}
                      title={t.activeLabel}
                    >
                      <span className="sub-pill-icon">{t.icon}</span>
                      <span className="sub-pill-label">{t.subLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Layout: Balanced 2x2 Option Grid with Stable In-Place Selection */}
              <div className="inquiry-mobile-grid">
                {INQUIRY_TYPES.map((t) => {
                  const isSelected = form.type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`inquiry-grid-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setForm({ ...form, type: t.id })}
                    >
                      <div className="grid-card-main">
                        <span className="grid-card-icon">{t.icon}</span>
                        <span className="grid-card-label">{t.subLabel}</span>
                      </div>
                      {isSelected && (
                        <div className="grid-card-check">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Row 1: Full Name */}

            {/* Input Row 1: Full Name */}
            <div className="contact-input-field">
              <label className="input-label">Full Name *</label>
              <div className="input-wrap">
                <svg className="field-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="e.g. Meenakshi Sundaram"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Input Row 2: Phone */}
            <div className="contact-input-field">
              <label className="input-label">Phone *</label>
              <div className="input-wrap">
                <svg className="field-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  type="tel"
                  placeholder="+91 98XXX XXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Input Row 3: Email (Left) & Your Message (Right) */}
            <div className="contact-split-row">
              <div className="contact-input-field split-field email-field">
                <label className="input-label">Email address (optional)</label>
                <div className="input-wrap">
                  <svg className="field-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="contact-input-field split-field msg-field">
                <label className="input-label">Your Message *</label>
                <div className="input-wrap textarea-wrap">
                  <textarea
                    rows={3}
                    placeholder="Tell us about your inquiry..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Big Green Submit Button */}
            <button
              type="submit"
              className="contact-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </button>

            {/* Reassurance Footer */}
            <div className="contact-reassurance-note">
              <span className="reassurance-check-circle">✓</span>
              <span>We usually respond within 2 hours via WhatsApp</span>
            </div>
          </form>
        </section>

        {/* Supporting Heritage & Direct Channels Row */}
        <section className="contact-heritage-split">
          <div className="heritage-story-box">
            <span className="heritage-kicker">KADAYAM VILLAGE UNIT</span>
            <h3>Pure Western Ghats Botanicals</h3>
            <p>
              Handcrafted with devotion by rural women SHG artisans in Manthiyoor, Kadayam, Tenkasi District.
              We shade-dry fresh mountain botanicals at natural room temperatures and stone-mill them with zero artificial additives.
            </p>
            <div className="heritage-bullets">
              <div className="heritage-bullet-item">
                <span className="bullet-check">✓</span>
                <span>FSSAI Certified Unit (Lic: {brandInfo.fssai})</span>
              </div>
              <div className="heritage-bullet-item">
                <span className="bullet-check">✓</span>
                <span>Direct daily dispatch via Speed Post across all Indian PIN codes</span>
              </div>
              <div className="heritage-bullet-item">
                <span className="bullet-check">✓</span>
                <span>Doctor, clinic, and organic store wholesale supplies welcomed</span>
              </div>
            </div>
          </div>

          <div className="contact-channels-box">
            <span className="heritage-kicker">DIRECT CHANNELS</span>
            <h3>Need Instant Assistance?</h3>
            <p>You can also reach our Kadayam support desk directly via WhatsApp or phone:</p>
            <div className="direct-channels-list">
              <a href="https://wa.me/917550248005" target="_blank" rel="noopener noreferrer" className="channel-pill">
                <span className="channel-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
                  </svg>
                </span>
                <div>
                  <strong>WhatsApp Chat Support</strong>
                  <span>+91 75502 48005 (Immediate Reply)</span>
                </div>
              </a>
              <a href="tel:+917550248005" className="channel-pill">
                <span className="channel-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#123223" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div>
                  <strong>Direct Calling Desk</strong>
                  <span>+91 75502 48005 (10 AM - 7 PM)</span>
                </div>
              </a>
              <a href="mailto:crearemindwebsolutions@gmail.com" className="channel-pill">
                <span className="channel-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#123223" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <div>
                  <strong>Official Email Desk</strong>
                  <span>crearemindwebsolutions@gmail.com</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section in the Same Elegant Theme */}
        <section className="contact-faq-section">
          <div className="faq-header-center">
            <span className="card-kicker">HAVE QUESTIONS?</span>
            <h2 className="card-heading">Frequently Asked Questions</h2>
            <p className="card-subheading">Common queries on orders, delivery timelines, and botanical purity:</p>
          </div>

          <div className="faq-cards-stack">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-theme-card ${openFaq === idx ? 'is-open' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="faq-theme-card-top">
                  <h4>{faq.q}</h4>
                  <span className="faq-toggle-icon">{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <div className="faq-theme-card-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Ending Credit Bar */}
      <footer className="contact-credit-bar">
        <div className="contact-credit-inner">
          <span className="contact-copy-text">
            © {new Date().getFullYear()} THENEE. All rights reserved.
          </span>
          <div className="contact-credit-links">
            <span className="contact-made-in-india">Made in India</span>
            <span className="contact-credit-sep">•</span>
            <a
              href="https://www.crearemind.in"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-crearemind-link"
              title="Visit Creare Mind (opens in new tab)"
            >
              POWERED BY <strong>CREARE MIND</strong>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span className="cart-toast-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

export default ContactPage
