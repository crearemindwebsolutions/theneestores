import { useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import { brandInfo } from '../data/products'
import './LegalPages.css'

const PrivacyPolicyPage = ({ onOpenAccount }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="legal-page-wrap">
      <OfferMarquee />
      <header className="site-header-sticky">
        <Navbar onOpenAccount={onOpenAccount} currentRoute="privacy" />
      </header>

      {/* Hero Banner */}
      <section className="legal-hero-banner">
        <div className="legal-breadcrumb">
          <a href="#home">Home</a>
          <span className="legal-breadcrumb-sep">/</span>
          <span>Legal</span>
          <span className="legal-breadcrumb-sep">/</span>
          <span>Privacy Policy</span>
        </div>

        <span className="legal-kicker">DATA PROTECTION & PATRON TRUST</span>
        <h1 className="legal-hero-title">Privacy Policy</h1>
        <p className="legal-hero-meta">
          Effective Date: January 1, 2026 • Last Reviewed: November 2026 • FSSAI Lic. {brandInfo.fssai || '22425278000320'}
        </p>

        {/* Tab switch to easily toggle between Privacy and Terms */}
        <div className="legal-tabs-switch">
          <a href="#privacy" className="legal-tab-btn is-active">
            Privacy Policy
          </a>
          <a href="#terms" className="legal-tab-btn">
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
            <li><a href="#sec-overview" className="legal-toc-link">1. Overview & Scope</a></li>
            <li><a href="#sec-collection" className="legal-toc-link">2. Information We Collect</a></li>
            <li><a href="#sec-usage" className="legal-toc-link">3. How We Use Data</a></li>
            <li><a href="#sec-payments" className="legal-toc-link">4. Payment Security (Razorpay)</a></li>
            <li><a href="#sec-sharing" className="legal-toc-link">5. Data Sharing & Logistics</a></li>
            <li><a href="#sec-cookies" className="legal-toc-link">6. Cookies & Local Storage</a></li>
            <li><a href="#sec-retention" className="legal-toc-link">7. Storage & Security</a></li>
            <li><a href="#sec-rights" className="legal-toc-link">8. Your Patron Rights</a></li>
            <li><a href="#sec-children" className="legal-toc-link">9. Children's Privacy</a></li>
            <li><a href="#sec-contact" className="legal-toc-link">10. Grievance Desk</a></li>
          </ul>

          <div className="legal-sidebar-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#274C37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>DPDPA & IT Act Compliant</span>
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
              <span>Our Privacy Commitment in Brief</span>
            </div>
            <p className="legal-callout-text">
              At <strong>THENEE (Roots of Nature)</strong>, handcrafted by rural women in Tenkasi, Tamil Nadu, we value your trust as much as the botanical purity of our herbs. We never sell, rent, or trade your personal data. Your contact and delivery details are used solely to fulfill your wellness orders and provide seamless shipment tracking.
            </p>
          </div>

          {/* Section 1 */}
          <section id="sec-overview" className="legal-section">
            <h2 className="legal-section-title">1. Overview & Scope</h2>
            <p className="legal-paragraph">
              This Privacy Policy explains how THENEE ("we", "us", or "our"), operating from Manthiyoor, Kadayam, Tenkasi District, Tamil Nadu, India, collects, processes, and protects the personal information of visitors and patrons ("you") who access our website (theneestores.com / thenee.in) or purchase our traditional herbal teas, botanical formulations, and authentic food podis.
            </p>
            <p className="legal-paragraph">
              By visiting our platform or placing an order, you acknowledge and agree to the practices outlined in this policy, formulated in compliance with the Digital Personal Data Protection Act, 2023 (DPDPA), the Information Technology Act, 2000, and consumer protection guidelines for Indian e-commerce.
            </p>
          </section>

          {/* Section 2 */}
          <section id="sec-collection" className="legal-section">
            <h2 className="legal-section-title">2. Information We Collect</h2>
            <p className="legal-paragraph">
              We collect only the essential information needed to prepare, pack, invoice, and safely deliver your wellness parcels:
            </p>

            <table className="legal-info-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Information Collected</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Identity & Contact</strong></td>
                  <td>Full Name, Mobile Number, Email Address, WhatsApp number</td>
                  <td>Account authentication, OTP verification, order confirmations, and dispatch notifications.</td>
                </tr>
                <tr>
                  <td><strong>Shipping Destination</strong></td>
                  <td>Door/Flat number, Street address, City, District, State, Pincode</td>
                  <td>Accurate parcel routing through postal and courier logistics partners.</td>
                </tr>
                <tr>
                  <td><strong>Order History</strong></td>
                  <td>Purchased botanical items, pack sizes, quantities, order date, invoice numbers</td>
                  <td>Accounting records, cashback reward calculation, and customer support.</td>
                </tr>
                <tr>
                  <td><strong>Technical Telemetry</strong></td>
                  <td>Device type, browser version, IP address, referral source</td>
                  <td>Site security, server load balancing, and browsing performance optimization.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Section 3 */}
          <section id="sec-usage" className="legal-section">
            <h2 className="legal-section-title">3. How We Use Your Information</h2>
            <p className="legal-paragraph">We utilize the data collected strictly for legitimate business and fulfillment purposes:</p>
            <ul className="legal-list">
              <li><strong>Order Processing & Fulfillment:</strong> Handcrafting your fresh herbal batches at our Tenkasi unit, printing official GST-compliant tax invoices, and generating consignment labels.</li>
              <li><strong>Live Delivery Tracking:</strong> Transmitting consignments to India Post Speed Post, BlueDart Express, or Shadowfax, and providing you with live Air Waybill (AWB) tracking numbers.</li>
              <li><strong>Customer Support:</strong> Assisting you via WhatsApp (+91 75502 48005) or email regarding order modifications, address corrections, delivery inquiries, or botanical usage guidance.</li>
              <li><strong>Cashback & Promotions:</strong> Calculating authentic patron cashback rewards and sending occasional seasonal harvest notices (you may opt out at any time).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="sec-payments" className="legal-section">
            <h2 className="legal-section-title">4. Payment Security & Financial Data</h2>
            <p className="legal-paragraph">
              Your financial security is paramount. All digital payment transactions (UPI, Google Pay, PhonePe, Debit Cards, Credit Cards, Net Banking) on THENEE are processed directly through <strong>Razorpay</strong>, an RBI-authorized payment aggregator certified under <strong>PCI-DSS Level 1</strong> (Payment Card Industry Data Security Standard).
            </p>
            <p className="legal-paragraph">
              <strong>We never store, capture, or have access to your raw credit/debit card numbers, CVV codes, bank passwords, or UPI PINs.</strong> All financial authentication occurs inside bank-grade encrypted tunnels managed by Razorpay and your issuing bank.
            </p>
          </section>

          {/* Section 5 */}
          <section id="sec-sharing" className="legal-section">
            <h2 className="legal-section-title">5. Data Sharing & Third-Party Service Providers</h2>
            <p className="legal-paragraph">
              THENEE does not rent, sell, or trade your personal details to any advertising or data brokers. We share minimal necessary information only with trusted operational partners:
            </p>
            <ul className="legal-list">
              <li><strong>Logistics Partners:</strong> India Post Speed Post, BlueDart, and regional delivery couriers receive your recipient name, destination address, and contact number strictly for final-mile package delivery.</li>
              <li><strong>Payment Aggregators:</strong> Razorpay receives order amounts and customer identifiers to authorize and settle transactions securely.</li>
              <li><strong>Cloud Infrastructure:</strong> Our secure database operates on Supabase with Row Level Security (RLS) and end-to-end TLS encryption to prevent unauthorized data access.</li>
              <li><strong>Statutory Authorities:</strong> Disclosed only if strictly required under Indian court orders or tax and regulatory investigations.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="sec-cookies" className="legal-section">
            <h2 className="legal-section-title">6. Cookies & Browser Storage</h2>
            <p className="legal-paragraph">
              We utilize browser cookies and HTML5 local storage strictly for functional, user-friendly shopping features:
            </p>
            <ul className="legal-list">
              <li><strong>Shopping Cart Persistence:</strong> Remembering the herbal items you have placed in your cart between visits.</li>
              <li><strong>Session Authentication:</strong> Keeping you logged into your THENEE patron account securely.</li>
              <li><strong>Address Convenience:</strong> Remembering your saved delivery addresses so you do not have to re-enter them on future checkouts.</li>
            </ul>
            <p className="legal-paragraph">
              You can disable cookies in your browser settings; however, doing so may prevent adding items to your cart or completing online checkouts.
            </p>
          </section>

          {/* Section 7 */}
          <section id="sec-retention" className="legal-section">
            <h2 className="legal-section-title">7. Data Storage, Retention & Security Measures</h2>
            <p className="legal-paragraph">
              All personal customer data is stored in enterprise-grade cloud databases with continuous automated backups. We implement standard encryption protocols (HTTPS / TLS 1.3), hashed password security, and restricted admin privileges.
            </p>
            <p className="legal-paragraph">
              We retain completed order records for the duration required by Indian accounting, GST, and tax compliance regulations (typically 7 years). Inactive marketing preferences can be cleared upon request.
            </p>
          </section>

          {/* Section 8 */}
          <section id="sec-rights" className="legal-section">
            <h2 className="legal-section-title">8. Your Rights & Choices as a Patron</h2>
            <p className="legal-paragraph">
              Under India's Digital Personal Data Protection Act (DPDPA), you hold full ownership of your personal information:
            </p>
            <ul className="legal-list">
              <li><strong>Right to Review & Correct:</strong> You can view and edit your profile, mobile number, and delivery addresses anytime in your Account Portal.</li>
              <li><strong>Right to Erasure:</strong> You may request the permanent deletion of your patron profile by contacting our support desk.</li>
              <li><strong>Right to Opt-Out:</strong> You can unsubscribe from promotional announcements by clicking the unsubscribe link or messaging our helpline.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="sec-children" className="legal-section">
            <h2 className="legal-section-title">9. Children's Privacy</h2>
            <p className="legal-paragraph">
              Our website and products are intended for general adult audiences and families. We do not knowingly collect personal information from individuals under 18 years of age without parental supervision. If you believe a minor has submitted personal data to us, please notify us immediately for prompt deletion.
            </p>
          </section>

          {/* Section 10 */}
          <section id="sec-contact" className="legal-section">
            <h2 className="legal-section-title">10. Grievance Officer & Contact Desk</h2>
            <p className="legal-paragraph">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please connect with our Grievance Desk:
            </p>

            <div className="legal-contact-card">
              <h4>THENEE Roots of Nature - Patron Care & Grievance Desk</h4>
              <p><strong>Producer & Brand:</strong> THENEE (Tenkasi Rural Women Artisans Initiative)</p>
              <p><strong>FSSAI Registration:</strong> {brandInfo.fssai || '22425278000320'}</p>
              <p><strong>Village Unit Address:</strong> Manthiyoor, Kadayam, Tenkasi District, Tamil Nadu - 627415, India.</p>
              <p><strong>Customer Helpline:</strong> <a href="tel:+917550248005">+91 75502 48005</a> (Mon - Sat, 10:00 AM to 7:00 PM IST)</p>
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

export default PrivacyPolicyPage
