import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { brandInfo } from '../data/products'
import { ImageWithSkeleton } from './Skeleton'
import './PagesShared.css'
import './OurStoryPage.css'

const STORY_PILLARS = [
  {
    icon: '🌿',
    title: 'Western Ghats Direct Sourcing',
    tamil: 'மேற்கு தொடர்ச்சி மலை மூலிகைகள்',
    desc: 'Harvested from natural fertile soils along the foothills of Tenkasi, enriched by fresh mountain streams and clean village air.',
  },
  {
    icon: '☀️',
    title: 'Traditional Sun-Shade Drying',
    tamil: 'பாரம்பரிய நிழல் உலர்த்தல்',
    desc: 'We never apply artificial high-temperature industrial blowers. Shade-drying preserves volatile floral oils, natural green chlorophyll, and delicate antioxidants.',
  },
  {
    icon: '🪨',
    title: 'Slow Stone-Ground Craft',
    tamil: 'பாரம்பரிய உரல் & அம்மியில் அரைத்தல்',
    desc: 'Spices and leaves are gently stone-ground at low RPM to ensure zero friction heat, retaining grandmother’s authentic aroma and curative potency.',
  },
  {
    icon: '🛡️',
    title: 'Zero Preservatives & FSSAI Certified',
    tamil: '100% தூய இயற்கை & FSSAI தரச்சான்று',
    desc: 'No artificial flavors, colors, maltodextrin, or anti-caking agents. Certified under Central FSSAI License #22425278000320.',
  },
]

const IMPACT_NUMS = [
  { num: '16,000+', lbl: 'Families Healed Naturally Across India' },
  { num: '100%', lbl: 'Women-Led Artisanal Rural Processing' },
  { num: '0%', lbl: 'Chemicals, Preservatives or Synthetic Additives' },
  { num: 'FSSAI', lbl: 'Officially Certified Food Safety Standards' },
]

const OurStoryPage = ({ onOpenAccount }) => {
  return (
    <div className="page-wrapper our-story-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
        <Navbar onOpenAccount={onOpenAccount} currentRoute="about" />
      </header>

      {/* Hero */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Our Story</span>
        </div>
        <h1>Rooted in Kadayam, Tenkasi</h1>
        <span className="page-hero-tamil-sub">தேனீ • கிராமத்து பெண்களின் உழைப்பும் பாரம்பரிய மூலிகையின் ஆற்றலும்</span>
        <p className="page-hero-desc">
          How a humble village initiative in Manthiyoor, Tamil Nadu blossomed into a trusted household
          symbol of pure botanicals and daily wellness.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">🌾 Kadayam, Tenkasi Roots</span>
          <span className="page-trust-pill">👩‍🌾 100% Women Artisans</span>
          <span className="page-trust-pill">🏺 Heirloom Recipes</span>
          <span className="page-trust-pill">✨ The Roots Enterprises</span>
        </div>
      </section>

      <main className="page-main-content">
        {/* Story Intro Card with Village Image */}
        <div className="story-hero-card">
          <div className="story-hero-text">
            <span className="story-kicker">OUR HUMBLE ORIGINS</span>
            <h2>Where Healing Begins in the Village Soil</h2>
            <p>
              In the serene shadow of the Western Ghats lies Kadayam, an agricultural haven blessed with
              nutrient-rich black and red soil. For generations, village households here maintained unshakeable
              health through homegrown botanical concoctions—hibiscus petals dried under verandah eaves,
              country garlic roasted over slow wood fires, and wild moringa picked fresh at dawn.
            </p>
            <p>
              In 2024, <strong>The Roots Enterprises</strong> was founded with a singular conviction: to rescue
              these profound Tamil herbal traditions from corporate industrialization, and to place them in your hands
              with uncompromising purity.
            </p>
            <div className="story-quote-box">
              <p>
                "We don't manufacture tea in automated factories. Our mothers and sisters in Manthiyoor sort each flower,
                shade-dry every leaf, and blend each jar with prayer and dignity."
              </p>
              <span>— Founder, THENEE The Roots Enterprises</span>
            </div>
          </div>

          <div className="story-hero-media">
            <ImageWithSkeleton
              src="/images/custom_thenee/rural-women-artisans.jpg"
              alt="Rural Women Artisans of THENEE"
              className="story-main-img"
              skeletonBorderRadius="16px"
            />
            <span className="img-caption">Our artisan self-help team hand-sorting botanicals in Tenkasi</span>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="story-pillars-section">
          <div className="pillars-header">
            <h2>The 4 Sacred Pillars of THENEE Purity</h2>
            <p>Why every cup and spoonful tastes and heals distinctly better:</p>
          </div>

          <div className="pillars-grid">
            {STORY_PILLARS.map((p, idx) => (
              <div className="pillar-card" key={idx}>
                <div className="pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <span className="pillar-tamil">{p.tamil}</span>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="story-impact-strip">
          {IMPACT_NUMS.map((item, idx) => (
            <div className="impact-num-item" key={idx}>
              <span className="impact-big-val">{item.num}</span>
              <span className="impact-big-lbl">{item.lbl}</span>
            </div>
          ))}
        </div>

        {/* Women Empowerment Narrative */}
        <div className="empowerment-narrative-card">
          <div className="empowerment-media">
            <ImageWithSkeleton
              src="/images/custom_thenee/herbal-harvest-village.jpg"
              alt="Village Harvest"
              className="empowerment-img"
              skeletonBorderRadius="16px"
            />
          </div>
          <div className="empowerment-content">
            <span className="story-kicker">COMMUNITY EMPOWERMENT</span>
            <h2>Dignity & Fair Livelihoods for Rural Women</h2>
            <p>
              Every product you purchase has a face and a heartbeat behind it. In rural Tenkasi, access to dignified,
              flexible employment for women has historically been limited.
            </p>
            <p>
              By establishing our processing and blending center directly within the village of Manthiyoor, THENEE
              provides over a dozen local homemakers with reliable monthly incomes, safe working conditions, and
              leadership opportunities. When you enjoy a cup of Thenee Herbal Tea, you are actively supporting a rural family’s
              children education and self-reliance.
            </p>
            <div className="empowerment-buttons">
              <a href="#products" className="btn-story-explore">
                Explore Handcrafted Products →
              </a>
              <a
                href={`https://wa.me/${brandInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20THENEE%2C%20I%20want%20to%20learn%20more%20about%20your%20story.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-story-wa"
              >
                💬 Chat With Tenkasi Unit
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default OurStoryPage
