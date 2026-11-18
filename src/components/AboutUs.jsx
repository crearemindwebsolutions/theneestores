import { brandInfo } from '../data/products'
import useReveal from '../lib/useReveal'
import './AboutUs.css'

const AboutUs = () => {
  const sectionRef = useReveal([
    { selector: '.about-header', y: 20, duration: 0.6 },
    { selector: '.about-pillars-grid', y: 20, duration: 0.65, start: 'top 85%' },
    { selector: '.about-trust-banner', y: 20, duration: 0.65, start: 'top 88%' },
  ])

  return (
    <section className="about-thenee" id="about" ref={sectionRef}>
      {/* Decorative Botanical Background Watermark */}
      <div className="about-botanical-bg" aria-hidden="true">
        <svg viewBox="0 0 1440 600" fill="none" preserveAspectRatio="xMidYMid slice" className="about-botanical-svg">
          <g opacity="0.32" stroke="#BAC8BB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Top-Right foliage */}
            <path d="M1460 -30 C1380 60 1310 150 1260 260" />
            <path d="M1360 60 C1330 20 1280 20 1240 40 C1270 70 1310 80 1360 60 Z" fill="#D3DDD4" fillOpacity="0.4" />
            <path d="M1320 120 C1350 160 1390 160 1430 140 C1400 120 1360 110 1320 120 Z" fill="#D3DDD4" fillOpacity="0.4" />
            <path d="M1290 200 C1250 180 1210 190 1180 220 C1210 240 1260 230 1290 200 Z" fill="#D3DDD4" fillOpacity="0.4" />

            {/* Top-Left foliage */}
            <path d="M-20 -30 C60 60 130 150 180 260" />
            <path d="M80 60 C110 20 160 20 200 40 C170 70 130 80 80 60 Z" fill="#D3DDD4" fillOpacity="0.4" />
            <path d="M120 120 C90 160 50 160 10 140 C40 120 80 110 120 120 Z" fill="#D3DDD4" fillOpacity="0.4" />
          </g>
        </svg>
      </div>

      <div className="about-container">
        <div className="about-header">
          <span className="about-kicker">Our Heritage & Mission</span>
          <h2 className="about-title">Crafted by Women. Rooted in Nature.</h2>
          <p className="about-intro">
            At <strong>THENEE</strong>, we believe true wellness comes straight from nature&apos;s roots.
            Based in the serene village landscapes of Kadayam, Tenkasi District in Tamil Nadu, our mission
            is to deliver pure, traditional, and unadulterated herbal blends, health mixes, and gourmet food
            podis directly from village roots to your kitchen and cup.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="about-pillars-grid">
          <div className="about-card">
            <div className="about-card-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C4A468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 21v-2c0-3.3 2.7-6 6-6s6 2.7 6 6v2" />
                <path d="M7 11.5C7 8 9.2 5 12 5s5 3 5 6.5c0 2-.8 3.5-2 4.5" />
                <circle cx="12" cy="10" r="2.8" />
              </svg>
            </div>
            <h3 className="about-card-title">Empowering Rural Women</h3>
            <p>
              THENEE is proudly driven by dedicated rural women entrepreneurs in Tamil Nadu.
              Every single batch is handcrafted with love and care, empowering local communities
              and sustaining traditional village livelihoods.
            </p>
          </div>

          <div className="about-card about-card--featured">
            <div className="about-card-badge">Zero Compromise</div>
            <div className="about-card-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C4A468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20C8 16 12 12 20 4" />
                <path d="M20 4c-4 0-7 2-8 5 3 1 6 0 8-5Z" />
                <path d="M12 9c-3 0-5 2-6 4 2.5.8 5 0 6-4Z" />
                <path d="M16 11c0 3-2 5-4 6 .8-2.5 0-5 4-6Z" />
                <path d="M9 14c0 2.5-1.5 4-3 5 .6-2 0-4 3-5Z" />
              </svg>
            </div>
            <h3 className="about-card-title">100% Pure & Natural</h3>
            <p>
              We believe in zero compromises. Our products contain <strong>no preservatives</strong>,
              <strong>no artificial colors</strong>, <strong>no added sugar</strong>, and
              <strong>no raw material fillers</strong>. Only authentic, unadulterated botanical healing.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C4A468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4c-1.5 3-2 6-2 9 0 2 .8 4 2 5 1.2-1 2-3 2-5 0-3-.5-6-2-9Z" />
                <path d="M10 13c-2.5-2-5-1.5-6.5.5 1.5 3 4.5 4 6.5 4.5" />
                <path d="M14 13c2.5-2 5-1.5 6.5.5-1.5 3-4.5 4-6.5 4.5" />
                <path d="M6 18c2 2 4.5 2 6 2s4 0 6-2" />
              </svg>
            </div>
            <h3 className="about-card-title">Time-Tested Botanical Wisdom</h3>
            <p>
              From exquisite botanical floral brews like Bliss Tea to classic home-style stone-ground
              podis, our formulations honor centuries-old natural wellness routines passed down through
              generations.
            </p>
          </div>
        </div>

        {/* Brand Authenticity & FSSAI Trust Banner */}
        <div className="about-trust-banner">
          <div className="about-trust-col">
            <div className="about-fssai-wrap" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#BAC8BB" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 2.4L18 3.5l1 3.3L22 8l-1.5 3.1L22 14.5l-3 1.2-1 3.3-3.6-.9L12 20.5l-2.4-2.4L6 19l-1-3.3L2 14.5l1.5-3.1L2 8l3-1.2 1-3.3 3.6.9L12 2z" />
              </svg>
            </div>
            <div className="about-trust-info">
              <strong>FSSAI Certified Unit</strong>
              <span className="about-fssai-label">FSSAI</span>
              <span>License No: {brandInfo.fssai}</span>
            </div>
          </div>

          <div className="about-trust-divider" />

          <div className="about-trust-col">
            <div className="about-trust-pin" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4A468" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M12 13v9" />
              </svg>
            </div>
            <div className="about-trust-info">
              <strong>The Roots Enterprises</strong>
              <span>{brandInfo.address}</span>
            </div>
          </div>

          <div className="about-trust-divider" />

          <div className="about-trust-col about-trust-col--stat">
            <div className="about-trust-stat">
              <strong>16,000+</strong>
              <span>Happy Customer Families</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
