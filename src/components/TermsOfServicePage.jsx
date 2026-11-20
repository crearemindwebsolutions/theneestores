import { useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import { brandInfo } from '../data/products'
import './LegalPages.css'

const TermsOfServicePage = ({ onOpenAccount }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="legal-page-wrap">
      <OfferMarquee />
      <header className="site-header-sticky">
        <Navbar onOpenAccount={onOpenAccount} currentRoute="terms" />
      </header>

      {/* Hero Banner */}
      <section className="legal-hero-banner">
        <div className="legal-breadcrumb">
          <a href="#home">Home</a>
          <span className="legal-breadcrumb-sep">/</span>
          <span>Legal</span>
          <span className="legal-breadcrumb-sep">/</span>
          <span>Terms of Service</span>
        </div>

        <span className="legal-kicker">TERMS & CONDITIONS OF PATRONAGE</span>
        <h1 className="legal-hero-title">Terms of Service</h1>
        <p className="legal-hero-meta">
          Effective Date: January 1, 2026 • Last Reviewed: November 2026 • FSSAI Lic. {brandInfo.fssai || '22425278000320'}
        </p>

        {/* Tab switch */}
        <div className="legal-tabs-switch">
          <a href="#privacy" className="legal-tab-btn">
            Privacy Policy
          </a>
          <a href="#terms" className="legal-tab-btn is-active">
            Terms of Service
          </a>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="legal-main-content">
        {/* Sticky Sidebar Navigation */}
        <aside className="legal-sidebar">
          <h3 className="legal-sidebar-heading">Table of Contents</h3>
          <ul className="legal-toc-list">
            <li><a href="#sec-acceptance" className="legal-toc-link">1. Acceptance of Terms</a></li>
            <li><a href="#sec-disclaimer" className="legal-toc-link">2. Herbal Wellness Disclaimer</a></li>
            <li><a href="#sec-products" className="legal-toc-link">3. Products & Batch Crafting</a></li>
            <li><a href="#sec-orders" className="legal-toc-link">4. Orders & Payment Processing</a></li>
            <li><a href="#sec-shipping" className="legal-toc-link">5. Shipping & Dispatch</a></li>
            <li><a href="#sec-returns" className="legal-toc-link">6. Returns, Refunds & Cancellations</a></li>
            <li><a href="#sec-accounts" className="legal-toc-link">7. Patron Accounts</a></li>
            <li><a href="#sec-ip" className="legal-toc-link">8. Intellectual Property</a></li>
            <li><a href="#sec-liability" className="legal-toc-link">9. Limitation of Liability</a></li>
            <li><a href="#sec-governing" className="legal-toc-link">10. Governing Law (Tamil Nadu)</a></li>
            <li><a href="#sec-help" className="legal-toc-link">11. Patron Support</a></li>
          </ul>

          <div className="legal-sidebar-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#274C37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Fair Trade & Rural Empowerment</span>
          </div>
        </aside>

        {/* Reader Card */}
        <article className="legal-body-card">
          {/* Quick Summary Box */}
          <div className="legal-callout-box">
            <div className="legal-callout-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#274C37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Welcome to THENEE Roots of Nature</span>
            </div>
            <p className="legal-callout-text">
              These Terms of Service govern your use of the THENEE platform and the purchase of our village-crafted herbal teas, botanicals, and food podis. By browsing our website or placing an order, you agree to these fair terms crafted for transparent, respectful commerce.
            </p>
          </div>

          {/* Section 1 */}
          <section id="sec-acceptance" className="legal-section">
            <h2 className="legal-section-title">1. Acceptance of Terms</h2>
            <p className="legal-paragraph">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("Customer", "Patron", or "User") and THENEE ("Brand", "we", "us", or "our"), having its processing unit located at Manthiyoor, Kadayam, Tenkasi District, Tamil Nadu, PIN 627415, India.
            </p>
            <p className="legal-paragraph">
              By accessing our website (theneestores.com / thenee.in), creating an account, or purchasing any of our herbal formulations, you certify that you are at least 18 years of age and agree to be bound by these Terms and our Privacy Policy. If you do not agree to all provisions, please refrain from using our services.
            </p>
          </section>

          {/* Section 2 */}
          <section id="sec-disclaimer" className="legal-section">
            <h2 className="legal-section-title">2. Herbal Wellness & Food Safety Disclaimer</h2>
            <p className="legal-paragraph">
              THENEE formulations are traditional botanical food supplements, herbal teas, and regional spice podis prepared with unadulterated village ingredients under Government FSSAI License No. <strong>{brandInfo.fssai || '22425278000320'}</strong>.
            </p>
            <div className="legal-callout-box" style={{ background: '#FFFDF5', borderColor: '#ECC980', borderLeftColor: '#C69214' }}>
              <div className="legal-callout-title" style={{ color: '#8A5800' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C69214" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Important Botanical Wellness Notice</span>
              </div>
              <p className="legal-callout-text" style={{ color: '#6A4A00' }}>
                The information, ingredients, and lifestyle benefits described on this website are based on traditional South Indian botanical wellness and regional folklore. <strong>THENEE products are not pharmaceuticals or medical drugs and are not intended to diagnose, cure, mitigate, treat, or prevent any disease.</strong> Patrons who are pregnant, lactating, taking prescription medication, or undergoing clinical treatment should consult a licensed physician or Ayurvedic practitioner before incorporating new herbs into their daily routine.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="sec-products" className="legal-section">
            <h2 className="legal-section-title">3. Products, Small-Batch Crafting & Pricing</h2>
            <p className="legal-paragraph">
              Our herbs and spices are wild-harvested and gathered fresh from the foothills of the Western Ghats by Tenkasi rural women artisans:
            </p>
            <ul className="legal-list">
              <li><strong>Natural Batch Variations:</strong> Because we never use artificial colors, chemical flavor enhancers, or synthetic additives, minor natural variations in aroma, color, and texture may occur across harvest seasons.</li>
              <li><strong>Pricing & Taxes:</strong> All product prices displayed on the store are denominated in Indian Rupees (INR, ₹) and include applicable taxes unless specifically stated.</li>
              <li><strong>Availability:</strong> We reserve the right to limit order quantities or discontinue items based on seasonal crop availability without prior notice.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="sec-orders" className="legal-section">
            <h2 className="legal-section-title">4. Orders, Checkout & Payment Terms</h2>
            <p className="legal-paragraph">
              When you submit an order on THENEE, you offer to purchase the selected items under these Terms:
            </p>
            <ul className="legal-list">
              <li><strong>Order Confirmation:</strong> An order is finalized once payment authorization is confirmed through Razorpay or when a valid Cash on Delivery (COD) confirmation is registered.</li>
              <li><strong>Payment Modes:</strong> We accept UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, MasterCard, Net Banking, and select COD pincodes.</li>
              <li><strong>Order Verification:</strong> We reserve the right to decline or cancel orders containing invalid contact details, incomplete shipping addresses, or suspected fraudulent activity. In such events, any authorized amount will be promptly refunded.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="sec-shipping" className="legal-section">
            <h2 className="legal-section-title">5. Shipping, Dispatch & Delivery Timelines</h2>
            <p className="legal-paragraph">
              All parcels are dispatched directly from our village processing facility in Tenkasi District:
            </p>
            <table className="legal-info-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Estimated Delivery Window</th>
                  <th>Carrier Partners</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tamil Nadu</strong> (Chennai, Madurai, Coimbatore, Tirunelveli, etc.)</td>
                  <td>24 to 48 Hours</td>
                  <td>India Post Speed Post / Professional Couriers</td>
                </tr>
                <tr>
                  <td><strong>South India</strong> (Bengaluru, Kerala, Hyderabad, Andhra)</td>
                  <td>2 to 3 Business Days</td>
                  <td>India Post / BlueDart / Shadowfax</td>
                </tr>
                <tr>
                  <td><strong>Rest of India</strong> (Mumbai, Delhi, Kolkata, North & East)</td>
                  <td>3 to 5 Business Days</td>
                  <td>India Post Speed Post / Air Courier</td>
                </tr>
              </tbody>
            </table>
            <p className="legal-paragraph">
              Upon dispatch, a live consignment tracking number (AWB) will be assigned to your order. While we endeavor to ensure prompt delivery, THENEE is not responsible for postal delays caused by extreme weather, natural disasters, national holidays, or regional courier service interruptions.
            </p>
          </section>

          {/* Section 6 */}
          <section id="sec-returns" className="legal-section">
            <h2 className="legal-section-title">6. Cancellations, Returns & Refunds Policy</h2>
            <p className="legal-paragraph">
              We stand behind the authenticity of our village-crafted herbal goods:
            </p>
            <ul className="legal-list">
              <li><strong>Order Cancellations:</strong> You may cancel an order free of charge before it has been dispatched by calling our helpline (+91 75502 48005) or messaging us on WhatsApp. Once handed over to the courier, an order cannot be cancelled in transit.</li>
              <li><strong>Food Safety & Consumables:</strong> In accordance with Indian health and hygiene standards, edible botanicals, herbal teas, and spice podis with broken seals cannot be returned.</li>
              <li><strong>Damaged, Defective or Incorrect Parcels:</strong> If your package arrives damaged in transit, with leaking seal, or with incorrect items, notify us within <strong>48 hours of delivery</strong> with unboxing photographs or video. We will promptly dispatch a free replacement batch or issue a 100% refund.</li>
              <li><strong>Refund Processing:</strong> Approved refunds are credited back to the original source account (UPI / Bank Account) within 5 to 7 business days through Razorpay.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="sec-accounts" className="legal-section">
            <h2 className="legal-section-title">7. Patron Accounts & Security</h2>
            <p className="legal-paragraph">
              When creating an account on THENEE, you agree to supply true, accurate, and current information. You are responsible for maintaining the confidentiality of your credentials and agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          {/* Section 8 */}
          <section id="sec-ip" className="legal-section">
            <h2 className="legal-section-title">8. Intellectual Property & Brand Ownership</h2>
            <p className="legal-paragraph">
              The trademarks "THENEE", "Roots of Nature", logos, packaging graphics, custom product photographs, formulation descriptions, and software code on this website are the proprietary property of THENEE and its technology partners. No content may be copied, reproduced, or distributed for commercial purposes without prior written authorization.
            </p>
          </section>

          {/* Section 9 */}
          <section id="sec-liability" className="legal-section">
            <h2 className="legal-section-title">9. Limitation of Liability</h2>
            <p className="legal-paragraph">
              To the maximum extent permitted by Indian law, THENEE, its artisan collective, and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products or website. Our total aggregate liability for any claim arising out of an order shall not exceed the amount actually paid by you for that specific order.
            </p>
          </section>

          {/* Section 10 */}
          <section id="sec-governing" className="legal-section">
            <h2 className="legal-section-title">10. Governing Law & Dispute Resolution</h2>
            <p className="legal-paragraph">
              These Terms shall be governed by, interpreted, and construed in accordance with the laws of the Republic of India. Any controversy, claim, or dispute arising out of or relating to these Terms or transactions on THENEE shall be subject to the exclusive jurisdiction of the competent civil courts situated in <strong>Tenkasi / Tirunelveli District, Tamil Nadu, India</strong>.
            </p>
          </section>

          {/* Section 11 */}
          <section id="sec-help" className="legal-section">
            <h2 className="legal-section-title">11. Patron Support & Contact Desk</h2>
            <p className="legal-paragraph">
              For any clarification regarding these Terms of Service or your shopping experience, our patron care desk is at your service:
            </p>

            <div className="legal-contact-card">
              <h4>THENEE Roots of Nature - Customer Care</h4>
              <p><strong>Producer Unit:</strong> Manthiyoor, Kadayam, Tenkasi District, Tamil Nadu - 627415, India.</p>
              <p><strong>FSSAI License:</strong> {brandInfo.fssai || '22425278000320'}</p>
              <p><strong>Calling Helpline:</strong> <a href="tel:+917550248005">+91 75502 48005</a> (Mon - Sat, 10:00 AM to 7:00 PM IST)</p>
              <p><strong>Official Email:</strong> <a href="mailto:crearemindwebsolutions@gmail.com">crearemindwebsolutions@gmail.com</a></p>
              <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/917550248005" target="_blank" rel="noopener noreferrer">+91 75502 48005</a></p>
            </div>
          </section>
        </article>
      </main>

      {/* Credit Bar */}
      <footer className="legal-credit-bar">
        <div className="legal-credit-inner">
          <span>© {new Date().getFullYear()} THENEE. All rights reserved. Handcrafted in Tenkasi, Tamil Nadu.</span>
          <div className="legal-credit-links">
            <a href="#privacy" className="legal-crearemind-link">Privacy Policy</a>
            <span className="legal-credit-sep">•</span>
            <a href="#terms" className="legal-crearemind-link">Terms of Service</a>
            <span className="legal-credit-sep">•</span>
            <span>Made in India</span>
            <span className="legal-credit-sep">•</span>
            <a
              href="https://www.crearemind.in"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-crearemind-link"
            >
              POWERED BY <strong>CREARE MIND</strong>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TermsOfServicePage
