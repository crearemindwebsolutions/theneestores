import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { cmsService } from '../lib/cmsService'
import { useCart } from '../context/CartContext'
import { ImageWithSkeleton } from './Skeleton'
import './PagesShared.css'
import './HealthGoalsPage.css'

const HEALTH_GOALS = [
  {
    id: 'sugar',
    emoji: '🩺',
    title: 'Blood Sugar & Metabolism',
    desc: 'Targeted botanical herbs that slow glucose absorption, optimize insulin response, and curb sudden hunger spikes.',
    recommendedIds: ['herbal-tea', 'moringa-powder'],
    keyHerbs: ['Avaram Poo (Senna auriculata)', 'Fenugreek Seed', 'Jamun Seed Extract', 'Moringa Leaf'],
  },
  {
    id: 'gut',
    emoji: '🌿',
    title: 'Digestive Comfort & Gut Relief',
    desc: 'Calm bloating, reduce acid reflux, and restore gut microflora with traditional dry-roasted culinary digestives.',
    recommendedIds: ['garlic-podi', 'herbal-tea'],
    keyHerbs: ['Country Garlic', 'Pirandai (Cissus quadrangularis)', 'Roasted Cumin', 'Asafoetida'],
  },
  {
    id: 'cooling',
    emoji: '❄️',
    title: 'Internal Body Heat & Detox',
    desc: 'Natural village refrigerants that lower core body temperature, clear skin redness, and soothe tired eyes.',
    recommendedIds: ['herbal-tea', 'bliss-tea'],
    keyHerbs: ['Vetiver (Khus root)', 'Rose Petals', 'Hibiscus (Semparuthi)', 'Butterfly Pea'],
  },
  {
    id: 'energy',
    emoji: '⚡',
    title: 'Clean Energy & Vitality',
    desc: 'Caffeine-free cellular nourishment packed with biodiverse iron, calcium, plant proteins, and antioxidants.',
    recommendedIds: ['moringa-powder', 'curry-leaves-podi'],
    keyHerbs: ['Pure Moringa Leaves', 'Karuveppilai (Curry Leaves)', 'Black Sesame', 'Country Urad'],
  },
  {
    id: 'sleep',
    emoji: '🌙',
    title: 'Restorative Sleep & De-Stress',
    desc: 'Melt away hectic workday anxiety and slip into deep, restorative REM sleep with tranquil botanical anthocyanins.',
    recommendedIds: ['bliss-tea', 'herbal-tea'],
    keyHerbs: ['Butterfly Pea (Sangu Poo)', 'Crimson Hibiscus', 'Cardamom Pods', 'Chamomile Flowers'],
  },
]

const DAILY_ROUTINE = [
  { time: '07:00 AM', label: 'Morning Awakening', item: 'Thenee Herbal Tea', tip: 'Drink warm on an empty stomach to kickstart metabolism and gently lower body heat.' },
  { time: '01:00 PM', label: 'Wholesome Lunch', item: 'Poondu or Karuveppilai Podi', tip: 'Mix 1-2 spoons with steaming rice and country ghee for optimal digestion and iron absorption.' },
  { time: '05:30 PM', label: 'Evening Clean Energy', item: 'Pure Moringa Powder', tip: 'Whisk 1 teaspoon in warm water or coconut water for jitter-free mental alertness.' },
  { time: '09:30 PM', label: 'Nighttime Relaxation', item: 'Thenee Bliss Tea (Sangu Poo)', tip: 'Sip a warm blue cup 30 mins before bed for serene muscle relaxation and deep sleep.' },
]

const renderGoalIcon = (id, size = 24) => {
  switch (id) {
    case 'sugar':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
          <path d="M9 12.5v2a4.5 4.5 0 0 0 9 0v-2" />
          <circle cx="18" cy="10.5" r="2" />
          <circle cx="4.5" cy="3" r="1.5" />
          <circle cx="13.5" cy="3" r="1.5" />
        </svg>
      )
    case 'gut':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22v-9" />
          <path d="M9 13a4.5 4.5 0 0 1 3-4.24V4a8 8 0 0 0-8 8c0 1 .5 1.5 1.5 1.5H9z" />
          <path d="M15 13a4.5 4.5 0 0 0-3-4.24V4a8 8 0 0 1 8 8c0 1-.5 1.5-1.5 1.5H15z" />
        </svg>
      )
    case 'cooling':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="20" y1="12" x2="4" y2="12" />
          <line x1="17.66" y1="6.34" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="17.66" x2="6.34" y2="6.34" />
          <polyline points="9 3 12 6 15 3" />
          <polyline points="9 21 12 18 15 21" />
          <polyline points="21 9 18 12 21 15" />
          <polyline points="3 9 6 12 3 15" />
        </svg>
      )
    case 'energy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#EA580C" stroke="#EA580C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    case 'sleep':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    default:
      return null
  }
}

const HealthGoalsPage = ({ onOpenAccount }) => {
  const [productList, setProductList] = useState(() => cmsService.getProducts())
  const [podisList, setPodisList] = useState(() => cmsService.getPodis())
  const [selectedGoalId, setSelectedGoalId] = useState('sugar')
  const { addToCart, setSelectedProduct, openCart } = useCart()

  useEffect(() => {
    const handleCmsUpdate = () => {
      setProductList([...cmsService.getProducts()])
      setPodisList([...cmsService.getPodis()])
    }
    window.addEventListener('thenee_cms_updated', handleCmsUpdate)
    window.addEventListener('storage', handleCmsUpdate)
    return () => {
      window.removeEventListener('thenee_cms_updated', handleCmsUpdate)
      window.removeEventListener('storage', handleCmsUpdate)
    }
  }, [])

  const currentGoal = HEALTH_GOALS.find((g) => g.id === selectedGoalId) || HEALTH_GOALS[0]

  // Find matching items from all products + podis
  const allItems = [...productList, ...podisList]
  const matchedProducts = currentGoal.recommendedIds
    .map((id) => allItems.find((p) => p.id === id || p.id.includes(id)))
    .filter(Boolean)

  return (
    <div className="page-wrapper health-goals-page">
      <OfferMarquee />
      <header className="site-header-sticky">
        <Navbar onOpenAccount={onOpenAccount} currentRoute="wellness" />
      </header>

      {/* Hero */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Health Goals</span>
        </div>
        <h1>Ayurvedic Health & Wellness Goals</h1>
        <p className="page-hero-desc">
          Select your primary body and lifestyle priority. Discover targeted remedies handcrafted with
          unadulterated botanicals from the foothills of Tenkasi.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">🌿 Personalized Remedies</span>
          <span className="page-trust-pill">🍵 100% Caffeine-Free</span>
          <span className="page-trust-pill">☀️ Daily Ayurvedic Routine</span>
          <span className="page-trust-pill">✨ No Chemical Extracts</span>
        </div>
      </section>

      <main className="page-main-content">
        {/* Interactive Goal Tabs */}
        <div className="goals-selector-strip">
          {HEALTH_GOALS.map((goal) => (
            <button
              key={goal.id}
              className={`goal-tab-card ${selectedGoalId === goal.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedGoalId(goal.id)}
            >
              <div className="goal-tab-icon">{renderGoalIcon(goal.id, 24)}</div>
              <span className="goal-tab-title">{goal.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Goal Spotlight Box */}
        <div className="goal-spotlight-box">
          <div className="goal-spotlight-header">
            <div className="spotlight-icon-box">{renderGoalIcon(currentGoal.id, 24)}</div>
            <h2 className="spotlight-title">{currentGoal.title}</h2>
          </div>

          <p className="goal-spotlight-desc">{currentGoal.desc}</p>

          <div className="goal-herbs-strip">
            <span className="goal-herbs-label">Key Active Botanicals:</span>
            <div className="herbs-pill-wrap">
              {currentGoal.keyHerbs.map((herb, i) => (
                <span className="herb-pill" key={i}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="herb-leaf-icon"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                  {herb}
                </span>
              ))}
            </div>
          </div>

          {/* Matched Products Row */}
          <div className="matched-products-section">
            <h3 className="matched-section-heading">Recommended Herbal Formulations for this Goal</h3>
            <div className="matched-products-grid">
              {matchedProducts.map((item) => (
                <div className="matched-prod-card" key={item.id}>
                  <div
                    className="matched-img-wrap"
                    onClick={() => setSelectedProduct(item)}
                    title="Click for full benefits & ingredients"
                  >
                    <ImageWithSkeleton
                      src={item.cardImage || item.image || item.bottle}
                      alt={item.name}
                      className="matched-img"
                      skeletonBorderRadius="12px"
                    />
                  </div>
                  <div className="matched-info">
                    <h4 onClick={() => setSelectedProduct(item)}>{item.name}</h4>
                    <p className="matched-vol">{item.volume || item.weight || '100g Pouch'}</p>
                    <div className="matched-price-action-row">
                      <span className="matched-price">₹{item.price}</span>
                      <button
                        className="btn-matched-add"
                        onClick={() => {
                          addToCart(item)
                          openCart()
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Routine Timetable */}
        <div className="wellness-routine-section">
          <div className="routine-header">
            <h2>A Day in Natural Living</h2>
            <p>Simple daily habits to nurture metabolism, digestive fire, and peaceful sleep:</p>
          </div>

          <div className="routine-cards-grid">
            {DAILY_ROUTINE.map((r, i) => (
              <div className="routine-step-card" key={i}>
                <span className="routine-clock">{r.time}</span>
                <span className="routine-label">{r.label}</span>
                <h4>{r.item}</h4>
                <p>{r.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HealthGoalsPage
