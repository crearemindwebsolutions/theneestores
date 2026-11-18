import { useState } from 'react'
import { brandInfo, products } from '../data/products'
import useReveal from '../lib/useReveal'
import './Footer.css'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [showQR, setShowQR] = useState(null) // 'whatsapp' | 'instagram' | null

  const sectionRef = useReveal([
    { selector: '.footer-newsletter-inner', y: 40, duration: 0.8, start: 'top 92%' },
    { selector: '.footer-col', y: 40, duration: 0.7, stagger: 0.1, start: 'top 92%' },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  return (
    <footer className="footer" id="contact" ref={sectionRef}>
      <svg
        className="footer-top-border"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,42.7C672,32,768,32,864,42.7C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
          fill="#F2F5ED"
        />
      </svg>

      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div className="footer-newsletter-text">
            <h3>Join our 16,000+ Health Family</h3>
            <p>Get traditional wellness tips, seasonal herbal harvest alerts, and 15% off your first order.</p>
          </div>
          <form className="footer-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit">{subscribed ? 'Subscribed ✓' : 'Subscribe'}</button>
          </form>
        </div>
      </div>

      <div className="footer-main">
        {/* Brand Col */}
        <div className="footer-col footer-brand">
          <a href="#home" className="footer-logo">
            <img
              src="/images/custom_thenee/thenee-brand-logo.png"
              alt="THENEE"
              className="footer-logo-img"
            />
            <div className="footer-logo-text">
              <span className="footer-logo-title">THENEE</span>
              <span className="footer-logo-tamil">தேனீ • The Roots Enterprises</span>
            </div>
          </a>
          <p className="footer-brand-motto">
            Crafted by Women. Rooted in Nature. Delivering unadulterated herbal blends
            and traditional food podis straight from village roots in Tenkasi, Tamil Nadu.
          </p>

          <div className="footer-cert-badge">
            <img src="/images/custom_thenee/fssai-certified-badge.svg" alt="FSSAI" className="footer-fssai-mini" />
            <div className="footer-cert-text">
              <span className="footer-cert-label">Govt. FSSAI Licensed</span>
              <strong className="footer-cert-num">{brandInfo.fssai}</strong>
            </div>
          </div>

          <div className="footer-qr-section">
            <span className="footer-qr-heading">Instant Mobile Connect:</span>
            <div className="footer-social-qr-triggers">
              <button
                type="button"
                className={`footer-qr-pill ${showQR === 'whatsapp' ? 'is-active' : ''}`}
                onClick={() => setShowQR(showQR === 'whatsapp' ? null : 'whatsapp')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.17 8.17 0 0 1-1.25-4.47c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.59.2-1.09.14-1.19-.05-.1-.22-.16-.47-.28Z" />
                </svg>
                <span>WhatsApp QR</span>
              </button>
              <button
                type="button"
                className={`footer-qr-pill ${showQR === 'instagram' ? 'is-active' : ''}`}
                onClick={() => setShowQR(showQR === 'instagram' ? null : 'instagram')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Instagram QR</span>
              </button>
            </div>

            {showQR && (
              <div className="footer-qr-preview-box">
                <img
                  src={showQR === 'whatsapp' ? '/images/custom_thenee/whatsapp-order-qr.svg' : '/images/custom_thenee/instagram-connect-qr.svg'}
                  alt={`${showQR} QR`}
                  className="footer-qr-img"
                />
                <span>Scan with phone camera to connect on {showQR === 'whatsapp' ? 'WhatsApp Business' : 'Instagram (@THENEEROOTS)'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shop Col */}
        <div className="footer-col">
          <h4 className="footer-heading">Herbal Catalog</h4>
          <ul className="footer-links-list">
            {products.map((p) => (
              <li key={p.id}>
                <a href="#catalog">{p.name}</a>
              </li>
            ))}
            <li>
              <a href="#podis">Garlic Powder (Poondu Podi)</a>
            </li>
            <li>
              <a href="#podis">Curry Leaves Powder (Karuveppilai)</a>
            </li>
            <li>
              <a href="#podis">Moringa & Sesame Podis</a>
            </li>
          </ul>
        </div>

        {/* Story Col */}
        <div className="footer-col">
          <h4 className="footer-heading">Our Mission</h4>
          <ul className="footer-links-list">
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

        {/* Contact Col */}
        <div className="footer-col footer-contact-col">
          <h4 className="footer-heading">Visit & Contact</h4>

          <div className="footer-address-block">
            <div className="footer-address-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Manufacturing & Operations:</span>
            </div>
            <p className="footer-address-text">
              <strong>The Roots Enterprises</strong><br />
              2/224, South Street, Manthiyoor,<br />
              Kadayam - 627415,<br />
              Tenkasi District, Tamil Nadu.
            </p>
          </div>

          <div className="footer-phones-group">
            <span className="footer-group-title">Direct Helpline:</span>
            <div className="footer-phone-chips">
              <a href="tel:+917550248005" className="footer-phone-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 75502 48005
              </a>
              <a href="tel:+917338882473" className="footer-phone-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 73388 82473
              </a>
              <a href="tel:+917010285692" className="footer-phone-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 70102 85692
              </a>
            </div>
          </div>

          <div className="footer-channels-row">
            <a
              href={`https://wa.me/917550248005?text=${encodeURIComponent(
                'Hello THENEE team! I would like to order your authentic products.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-channel-link footer-channel-whatsapp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.17 8.17 0 0 1-1.25-4.47c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.59.2-1.09.14-1.19-.05-.1-.22-.16-.47-.28Z" />
              </svg>
              <span>WhatsApp Direct</span>
            </a>
            <a
              href="https://instagram.com/theneeroots"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-channel-link footer-channel-instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span>@THENEEROOTS</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <p className="footer-copy">
            © {new Date().getFullYear()} The Roots Enterprises. All rights reserved. Handcrafted by Rural Women in Tenkasi, Tamil Nadu.
          </p>
          <p className="footer-fssai-legal">
            Govt. Certified under Food Safety and Standards Authority of India (FSSAI Lic. No. 22425278000320)
          </p>
        </div>
        <div className="footer-bottom-right">
          <a
            href="https://www.crearemind.in"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-crearemind-link"
            title="Visit Creare Mind (opens in new tab)"
          >
            <span>POWERED BY</span> <strong>CREARE MIND</strong>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
