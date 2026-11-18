import { brandInfo } from '../data/products'
import useReveal from '../lib/useReveal'
import './AboutUs.css'

const AboutUs = () => {
  const sectionRef = useReveal([
    { selector: '.about-header', y: 30, duration: 0.7 },
    { selector: '.about-card', y: 50, duration: 0.75, stagger: 0.12, start: 'top 82%' },
  ])

  return (
    <section className="about-thenee" id="about" ref={sectionRef}>
      <div className="about-container">
        <div className="about-header">
          <span className="about-kicker">Our Heritage & Mission</span>
          <h2>Crafted by Women. Rooted in Nature.</h2>
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
            <div className="about-card-icon">👩‍🌾</div>
            <h3>Empowering Rural Women</h3>
            <p>
              THENEE is proudly driven by dedicated rural women entrepreneurs in Tamil Nadu.
              Every single batch is handcrafted with love and care, empowering local communities
              and sustaining traditional village livelihoods.
            </p>
          </div>

          <div className="about-card about-card--featured">
            <div className="about-card-badge">Zero Compromise</div>
            <div className="about-card-icon">🌿</div>
            <h3>100% Pure & Natural</h3>
            <p>
              We believe in zero compromises. Our products contain <strong>no preservatives</strong>,
              <strong>no artificial colors</strong>, <strong>no added sugar</strong>, and
              <strong>no raw material fillers</strong>. Only authentic, unadulterated botanical healing.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🪷</div>
            <h3>Time-Tested Botanical Wisdom</h3>
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
            <img
              src="/images/custom_thenee/fssai-certified-badge.svg"
              alt="FSSAI Certified"
              className="about-fssai-img"
            />
            <div className="about-trust-info">
              <strong>FSSAI Certified Unit</strong>
              <span>License No: {brandInfo.fssai}</span>
            </div>
          </div>

          <div className="about-trust-divider" />

          <div className="about-trust-col">
            <div className="about-trust-pin">📍</div>
            <div className="about-trust-info">
              <strong>The Roots Enterprises</strong>
              <span>{brandInfo.address}</span>
            </div>
          </div>

          <div className="about-trust-divider" />

          <div className="about-trust-col">
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

