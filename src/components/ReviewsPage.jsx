import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { SkeletonReviewCard } from './Skeleton'
import './PagesShared.css'
import './ReviewsPage.css'

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Kavitha Sundaram',
    location: 'Madurai, Tamil Nadu',
    product: 'Thenee Herbal Tea',
    rating: 5,
    date: '14 Nov 2026',
    verified: true,
    title: 'Transformative morning ritual for our whole family!',
    text: 'Thenee Herbal Tea has replaced morning filter coffee in our house. My husband’s digestion feels completely light, my internal body heat is balanced, and knowing it is handcrafted by rural women in Tamil Nadu makes it so precious. Taste is earthy and refreshing without bitter aftertaste.',
    helpfulCount: 42,
  },
  {
    id: 2,
    name: 'Aarthi Natarajan',
    location: 'Bengaluru, Karnataka',
    product: 'Thenee Bliss Tea',
    rating: 5,
    date: '10 Nov 2026',
    verified: true,
    title: 'Mesmerizing deep blue hue & natural sleep aid',
    text: 'The vibrant indigo color of butterfly pea & hibiscus flowers is pure magic! It is completely caffeine-free, and drinking a warm cup 30 minutes before bed melts away all my IT workday stress. I wake up completely rejuvenated without grogginess.',
    helpfulCount: 38,
  },
  {
    id: 3,
    name: 'Dr. Senthil Kumar',
    location: 'Coimbatore, Tamil Nadu',
    product: 'Pure Moringa Powder',
    rating: 5,
    date: '02 Nov 2026',
    verified: true,
    title: 'Clean non-jittery stamina throughout long hospital shifts',
    text: 'As a medical practitioner, I inspect shade-drying quality carefully. You can immediately tell how freshly shade-dried the leaves are by the rich vivid green color and clean aroma. It provides lasting, non-jittery stamina throughout my long hospital rounds. Outstanding purity.',
    helpfulCount: 56,
  },
  {
    id: 4,
    name: 'Meenakshi Raman',
    location: 'Tirunelveli / Chennai',
    product: 'Traditional Food Podis',
    rating: 5,
    date: '28 Oct 2026',
    verified: true,
    title: 'Takes me straight back to my grandmother’s kitchen in Kadayam',
    text: 'The Garlic Podi and Curry Leaves Podi bring back memories of my grandmother’s cooking in Tirunelveli. Authentic stone-ground aroma, zero artificial preservatives, and heavenly with hot rice and melted country ghee! My kids love it on idlis too.',
    helpfulCount: 31,
  },
  {
    id: 5,
    name: 'Ramesh Balakrishnan',
    location: 'Chennai, Tamil Nadu',
    product: 'Thenee Herbal Tea',
    rating: 5,
    date: '19 Oct 2026',
    verified: true,
    title: 'Noticeable drop in fasting blood sugar levels',
    text: 'My doctor recommended natural Avaram poo and fenugreek herbs for borderline sugar. After 3 weeks of taking Thenee Herbal Tea twice daily, my fasting glucose dropped from 138 to 112. Natural, chemical-free and very gentle on the stomach.',
    helpfulCount: 64,
  },
  {
    id: 6,
    name: 'Deepa Muthukrishnan',
    location: 'Salem, Tamil Nadu',
    product: 'Traditional Food Podis',
    rating: 5,
    date: '12 Oct 2026',
    verified: true,
    title: 'Pirandai & Moringa Podis are our daily lunch staple',
    text: 'Joint stiffness in my knees has reduced visibly after using the Pirandai Podi regularly with lunch. Packed very neatly in moisture-proof packaging. Highly recommend to anyone seeking authentic village wellness.',
    helpfulCount: 27,
  },
]

const REVIEW_PRODUCTS = [
  'All Reviews',
  'Thenee Herbal Tea',
  'Thenee Bliss Tea',
  'Pure Moringa Powder',
  'Traditional Food Podis',
]

const ReviewsPage = ({ onOpenAccount }) => {
  const [filter, setFilter] = useState('All Reviews')
  const [isLoading, setIsLoading] = useState(false)
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS)
  const [helpfulMap, setHelpfulMap] = useState({})
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 250)
    return () => clearTimeout(timer)
  }, [filter])

  // Form State
  const [form, setForm] = useState({
    name: '',
    city: '',
    product: 'Thenee Herbal Tea',
    rating: 5,
    title: '',
    text: '',
  })

  const filteredReviews =
    filter === 'All Reviews'
      ? reviewsList
      : reviewsList.filter((r) => r.product === filter)

  const handleHelpful = (id) => {
    if (helpfulMap[id]) return
    setHelpfulMap((prev) => ({ ...prev, [id]: true }))
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    )
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.text) return
    const newEntry = {
      id: Date.now(),
      name: form.name,
      location: form.city ? `${form.city}, Tamil Nadu` : 'Tamil Nadu',
      product: form.product,
      rating: Number(form.rating),
      date: 'Just now',
      verified: true,
      title: form.title || 'Wonderful natural product',
      text: form.text,
      helpfulCount: 0,
    }
    setReviewsList([newEntry, ...reviewsList])
    setForm({ name: '', city: '', product: 'Thenee Herbal Tea', rating: 5, title: '', text: '' })
    setToastMsg('Thank you! Your verified review has been published.')
    setTimeout(() => setToastMsg(''), 4000)
  }

  return (
    <div className="page-wrapper reviews-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
        <Navbar onOpenAccount={onOpenAccount} currentRoute="reviews" />
      </header>

      {/* Hero */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Reviews</span>
        </div>
        <h1>Loved by 16,000+ Health-Conscious Homes</h1>
        <span className="page-hero-tamil-sub">வாடிக்கையாளர்களின் உண்மையான அனுபவங்கள் & நல்வாழ்த்துகள்</span>
        <p className="page-hero-desc">
          Real stories from families across Tamil Nadu and India who turned to Kadayam village botanicals
          for sugar balance, deep sleep, clean stamina, and wholesome meals.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">★ 4.9 / 5 Overall Rating</span>
          <span className="page-trust-pill">✓ 840+ Verified Reviews</span>
          <span className="page-trust-pill">🔄 98% Reorder Rate</span>
          <span className="page-trust-pill">🇮🇳 Delivered All Over India</span>
        </div>
      </section>

      <main className="page-main-content">
        {/* Rating Breakdown Strip */}
        <div className="reviews-score-card">
          <div className="score-primary">
            <span className="score-num">4.9</span>
            <div className="score-stars">★★★★★</div>
            <span className="score-total">Based on 840+ verified purchases</span>
          </div>

          <div className="score-bars">
            <div className="bar-row">
              <span>5 Stars</span>
              <div className="bar-bg"><div className="bar-fill" style={{ width: '92%' }} /></div>
              <span>92%</span>
            </div>
            <div className="bar-row">
              <span>4 Stars</span>
              <div className="bar-bg"><div className="bar-fill" style={{ width: '7%' }} /></div>
              <span>7%</span>
            </div>
            <div className="bar-row">
              <span>3 Stars</span>
              <div className="bar-bg"><div className="bar-fill" style={{ width: '1%' }} /></div>
              <span>1%</span>
            </div>
          </div>

          <div className="score-highlights">
            <div className="score-pill">
              <strong>99.4%</strong>
              <span>Natural taste rating</span>
            </div>
            <div className="score-pill">
              <strong>98.2%</strong>
              <span>Digestion satisfaction</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="reviews-filter-bar">
          {REVIEW_PRODUCTS.map((prod) => (
            <button
              key={prod}
              className={`rev-filter-btn ${filter === prod ? 'is-active' : ''}`}
              onClick={() => setFilter(prod)}
            >
              {prod}
            </button>
          ))}
        </div>

        {/* Reviews Cards List */}
        <div className="reviews-cards-grid">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonReviewCard key={i} />)
          ) : (
            filteredReviews.map((rev) => (
              <div className="customer-review-card" key={rev.id}>
              <div className="review-card-top">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{rev.name.charAt(0)}</div>
                  <div>
                    <h4>{rev.name}</h4>
                    <span className="reviewer-meta">{rev.location} • {rev.date}</span>
                  </div>
                </div>
                {rev.verified && (
                  <span className="verified-badge">✓ Verified Buyer</span>
                )}
              </div>

              <div className="review-product-tag">
                <span>Ordered: <strong>{rev.product}</strong></span>
                <span className="review-stars">{'★'.repeat(rev.rating)}</span>
              </div>

              <h5 className="review-headline">{rev.title}</h5>
              <p className="review-content-text">"{rev.text}"</p>

              <div className="review-footer-action">
                <button
                  className={`btn-helpful ${helpfulMap[rev.id] ? 'is-helped' : ''}`}
                  onClick={() => handleHelpful(rev.id)}
                >
                  👍 Helpful ({rev.helpfulCount})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

        {/* Write a Review Section */}
        <div className="write-review-card">
          <div className="write-review-header">
            <h3>Share Your THENEE Experience</h3>
            <p>Your honest feedback helps us uplift rural artisan mothers and inspires other families to choose natural health.</p>
          </div>

          <form onSubmit={handleReviewSubmit} className="review-form-grid">
            <div className="form-row-2">
              <div>
                <label>Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anand / Priya"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Tenkasi, Chennai, Madurai"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label>Product Purchased</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                >
                  <option value="Thenee Herbal Tea">Thenee Herbal Tea</option>
                  <option value="Thenee Bliss Tea">Thenee Bliss Tea</option>
                  <option value="Pure Moringa Powder">Pure Moringa Powder</option>
                  <option value="Traditional Food Podis">Traditional Food Podis</option>
                </select>
              </div>
              <div>
                <label>Your Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                >
                  <option value="5">★★★★★ (5 - Excellent)</option>
                  <option value="4">★★★★☆ (4 - Good)</option>
                  <option value="3">★★★☆☆ (3 - Average)</option>
                </select>
              </div>
            </div>

            <div>
              <label>Review Headline</label>
              <input
                type="text"
                placeholder="Sum up your experience in one line"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label>Your Review Message *</label>
              <textarea
                rows="4"
                placeholder="Tell us about the taste, how you prepared it, or changes you felt..."
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-submit-review">
              Submit Verified Review 🌿
            </button>
          </form>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span className="cart-toast-icon">🌿</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ReviewsPage
