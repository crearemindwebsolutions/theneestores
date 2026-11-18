import { useState } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { products, individualPodis } from '../data/products'
import { useCart } from '../context/CartContext'
import { ImageWithSkeleton } from './Skeleton'
import './PagesShared.css'
import './HealthGoalsPage.css'

const HEALTH_GOALS = [
  {
    id: 'sugar',
    emoji: '🩺',
    title: 'Blood Sugar & Metabolism',
    tamil: 'இரத்த சர்க்கரை கட்டுப்பாடு',
    desc: 'Targeted botanical herbs that slow glucose absorption, optimize insulin response, and curb sudden hunger spikes.',
    recommendedIds: ['herbal-tea', 'moringa-powder'],
    keyHerbs: ['Avaram Poo (Senna auriculata)', 'Fenugreek Seed', 'Jamun Seed Extract', 'Moringa Leaf'],
  },
  {
    id: 'gut',
    emoji: '🌿',
    title: 'Digestive Comfort & Gut Relief',
    tamil: 'செரிமானம் மற்றும் குடல் ஆரோக்கியம்',
    desc: 'Calm bloating, reduce acid reflux, and restore gut microflora with traditional dry-roasted culinary digestives.',
    recommendedIds: ['garlic-podi', 'pirandai-podi'],
    keyHerbs: ['Country Garlic', 'Pirandai (Cissus quadrangularis)', 'Roasted Cumin', 'Asafoetida'],
  },
  {
    id: 'cooling',
    emoji: '❄️',
    title: 'Internal Body Heat & Detox',
    tamil: 'உடல் சூடு தணித்தல் & நச்சு நீக்கம்',
    desc: 'Natural village refrigerants that lower core body temperature, clear skin redness, and soothe tired eyes.',
    recommendedIds: ['herbal-tea', 'bliss-tea'],
    keyHerbs: ['Vetiver (Khus root)', 'Rose Petals', 'Hibiscus (Semparuthi)', 'Butterfly Pea'],
  },
  {
    id: 'energy',
    emoji: '⚡',
    title: 'Clean Energy & Vitality',
    tamil: 'நீடித்த உடல் ஆற்றல் & சுறுசுறுப்பு',
    desc: 'Caffeine-free cellular nourishment packed with biodiverse iron, calcium, plant proteins, and antioxidants.',
    recommendedIds: ['moringa-powder', 'curry-leaves-podi'],
    keyHerbs: ['Pure Moringa Leaves', 'Karuveppilai (Curry Leaves)', 'Black Sesame', 'Country Urad'],
  },
  {
    id: 'sleep',
    emoji: '🌙',
    title: 'Restorative Sleep & De-Stress',
    tamil: 'ஆழ்ந்த தூக்கம் & மன அமைதி',
    desc: 'Melt away hectic workday anxiety and slip into deep, restorative REM sleep with tranquil botanical anthocyanins.',
    recommendedIds: ['bliss-tea'],
    keyHerbs: ['Butterfly Pea (Sangu Poo)', 'Crimson Hibiscus', 'Cardamom Pods', 'Chamomile Flowers'],
  },
]

const DAILY_ROUTINE = [
  { time: '07:00 AM', label: 'Morning Awakening', item: 'Thenee Herbal Tea', tip: 'Drink warm on an empty stomach to kickstart metabolism and gently lower body heat.' },
  { time: '01:00 PM', label: 'Wholesome Lunch', item: 'Poondu or Karuveppilai Podi', tip: 'Mix 1-2 spoons with steaming rice and country ghee for optimal digestion and iron absorption.' },
  { time: '05:30 PM', label: 'Evening Clean Energy', item: 'Pure Moringa Powder', tip: 'Whisk 1 teaspoon in warm water or coconut water for jitter-free mental alertness.' },
  { time: '09:30 PM', label: 'Nighttime Relaxation', item: 'Thenee Bliss Tea (Sangu Poo)', tip: 'Sip a warm blue cup 30 mins before bed for serene muscle relaxation and deep sleep.' },
]

const HealthGoalsPage = ({ onOpenAccount }) => {
  const [selectedGoalId, setSelectedGoalId] = useState('sugar')
  const { addToCart, setSelectedProduct, openCart } = useCart()

  const currentGoal = HEALTH_GOALS.find((g) => g.id === selectedGoalId) || HEALTH_GOALS[0]

  // Find matching items from all products + podis
  const allItems = [...products, ...individualPodis]
  const matchedProducts = currentGoal.recommendedIds
    .map((id) => allItems.find((p) => p.id === id || p.id.includes(id)))
    .filter(Boolean)

  return (
    <div className="page-wrapper health-goals-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
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
        <span className="page-hero-tamil-sub">உங்கள் நல்வாழ்வுக்கான பிரத்யேக மூலிகைத் தீர்வுகள்</span>
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
              <span className="goal-tab-emoji">{goal.emoji}</span>
              <span className="goal-tab-title">{goal.title}</span>
              <span className="goal-tab-tamil">{goal.tamil}</span>
            </button>
          ))}
        </div>

        {/* Selected Goal Spotlight Box */}
        <div className="goal-spotlight-box">
          <div className="goal-spotlight-header">
            <span className="spotlight-emoji">{currentGoal.emoji}</span>
            <div>
              <h2>{currentGoal.title}</h2>
              <span className="spotlight-tamil">{currentGoal.tamil}</span>
            </div>
          </div>

          <p className="goal-spotlight-desc">{currentGoal.desc}</p>

          <div className="goal-herbs-strip">
            <strong>Key Active Botanicals:</strong>
            <div className="herbs-pill-wrap">
              {currentGoal.keyHerbs.map((herb, i) => (
                <span className="herb-pill" key={i}>🌿 {herb}</span>
              ))}
            </div>
          </div>

          {/* Matched Products Row */}
          <div className="matched-products-section">
            <h3>Recommended Herbal Formulations for this Goal</h3>
            <div className="matched-products-grid">
              {matchedProducts.map((item) => (
                <div className="matched-prod-card" key={item.id}>
                  <ImageWithSkeleton
                    src={item.bottle || item.image}
                    alt={item.name}
                    className="matched-img"
                    skeletonBorderRadius="12px"
                  />
                  <div className="matched-info">
                    <h4>{item.name}</h4>
                    <p className="matched-vol">{item.volume || item.weight || '100g Pouch'}</p>
                    <span className="matched-price">₹{item.price}</span>
                    <div className="matched-btn-row">
                      <button
                        className="btn-matched-view"
                        onClick={() => setSelectedProduct(item)}
                      >
                        Quick View
                      </button>
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
            <h2>A Day in Natural Living (ஒரு நாள் மூலிகை பழக்கம்)</h2>
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
