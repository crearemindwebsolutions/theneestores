import { useState } from 'react'
import { brandInfo, products } from '../data/products'
import useReveal from '../lib/useReveal'
import './Footer.css'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const sectionRef = useReveal([
    { selector: '.footer-newsletter-card', y: 30, duration: 0.7, start: 'top 95%' },
    { selector: '.footer-column', y: 30, duration: 0.6, stagger: 0.1, start: 'top 95%' },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  return (
    <footer className="footer-theme-wrap" id="contact" ref={sectionRef}>
      {/* Floating Newsletter Rounded Card */}
      <div className="footer-newsletter-section">
        <div className="footer-newsletter-card">
          <p className="footer-newsletter-headline">
            Get traditional wellness tips, seasonal herbal harvest alerts, and 15% off your first order.
          </p>
          <form className="footer-newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit" className="footer-subscribe-btn">
              {subscribed ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main 4-Column Footer Area */}
      <div className="footer-main-container">
        {/* Col 1: Brand Info & FSSAI */}
        <div className="footer-column footer-brand-column">
          <a href="#home" className="footer-brand-title-wrap">
            <span className="footer-brand-name">THENEE</span>
            <span className="footer-brand-sub">Roots of Nature</span>
          </a>

          <p className="footer-brand-tagline">Crafted by Women. Rooted in Nature.</p>
          <p className="footer-brand-motto">
            Delivering unadulterated herbal blends and traditional food podis straight from village roots in Tenkasi, Tamil Nadu.
          </p>

          <div className="footer-fssai-pill">
            <svg className="fssai-shield-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div className="fssai-pill-text">
              <span className="fssai-pill-title">GOVT. FSSAI LICENSED</span>
              <span className="fssai-pill-code">{brandInfo.fssai || '22425278000320'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Herbal Catalog */}
        <div className="footer-column footer-catalog-column">
          <h4 className="footer-column-heading">HERBAL CATALOG</h4>
          <ul className="footer-bullet-list">
            {products.map((p) => (
              <li key={p.id}>
                <a href="#catalog">
                  <span className="bullet-dot">•</span> {p.name}
                </a>
              </li>
            ))}
            <li>
              <a href="#podis">
                <span className="bullet-dot">•</span> Garlic Powder (Poondu Podi)
              </a>
            </li>
            <li>
              <a href="#podis">
                <span className="bullet-dot">•</span> Curry Leaves Powder (Karuveppilai)
              </a>
            </li>
            <li>
              <a href="#podis">
                <span className="bullet-dot">•</span> Moringa & Sesame Podis
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Our Mission */}
        <div className="footer-column footer-mission-column">
          <h4 className="footer-column-heading">OUR MISSION</h4>
          <ul className="footer-mission-list">
            <li>
              <a href="#about">About THENEE</a>
            </li>
            <li>
              <a href="#about">Women Empowerment</a>
            </li>
            <li>
              <a href="#wellness">Health Goals & Routines</a>
            </li>
            <li>
              <a href="#reviews">16,000+ Customer Reviews</a>
            </li>
            <li>
              <a href="#catalog">100% Chemical-Free Promise</a>
            </li>
            <li>
              <a href="#about">Village Direct Sourcing</a>
            </li>
          </ul>
        </div>

        {/* Col 4: Instant Mobile Connect & Preserved Operations */}
        <div className="footer-column footer-connect-column">
          <h4 className="footer-column-heading">INSTANT MOBILE CONNECT</h4>

          <div className="footer-pill-actions">
            <a
              href={`https://wa.me/917550248005?text=${encodeURIComponent(
                'Hello THENEE team! I would like to order your authentic products.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-connect-pill footer-pill-whatsapp"
            >
              <svg className="pill-social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.17 8.17 0 0 1-1.25-4.47c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.59.2-1.09.14-1.19-.05-.1-.22-.16-.47-.28Z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href="https://instagram.com/theneeroots"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-connect-pill footer-pill-instagram"
            >
              <svg className="pill-social-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span>Follow on Instagram</span>
            </a>
          </div>

          {/* Simple Contact Note */}
          <div className="footer-simple-contact">
            <span className="footer-simple-loc">Manthiyoor, Kadayam, Tenkasi</span>
            <a href="tel:+917550248005" className="footer-simple-call">
              Helpline: +91 75502 48005
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Made in India & Powered by Creare Mind */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-bar-inner">
          <span className="footer-bottom-copy">
            © {new Date().getFullYear()} THENEE. All rights reserved.
          </span>
          <div className="footer-bottom-credits">
            <span className="footer-made-in-india">Made in India</span>
            <span className="footer-credit-sep">•</span>
            <a
              href="https://www.crearemind.in"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-crearemind-credit"
              title="Visit Creare Mind (opens in new tab)"
            >
              POWERED BY <strong>CREARE MIND</strong>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer