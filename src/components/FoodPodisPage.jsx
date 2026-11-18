import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { individualPodis, products } from '../data/products'
import { useCart } from '../context/CartContext'
import { SkeletonPodiCard, ImageWithSkeleton } from './Skeleton'
import './PagesShared.css'
import './FoodPodisPage.css'

const RICE_PAIRING_STEPS = [
  { step: '1', title: 'Hot Steamed Rice', desc: 'Take 1 cup of hot Ponni, Seeraga Samba, or red rice.' },
  { step: '2', title: 'Generous Spoonful', desc: 'Add 1 to 2 tablespoons of freshly roasted Thenee Podi.' },
  { step: '3', title: 'Country Ghee / Nallennai', desc: 'Drizzle pure cow ghee or cold-pressed sesame oil.' },
  { step: '4', title: 'Mix & Savor', desc: 'Mix thoroughly with hands and experience authentic Tirunelveli village taste.' },
]

const FoodPodisPage = ({ onOpenAccount }) => {
  const { addToCart, setSelectedProduct, openCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Value Combo from main products list
  const podiCombo = products.find((p) => p.id === 'food-podis')

  return (
    <div className="page-wrapper food-podis-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
        <Navbar onOpenAccount={onOpenAccount} currentRoute="podis" />
      </header>

      {/* Page Hero Header */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Food Podis</span>
        </div>
        <h1>Traditional Handmade Food Podis</h1>
        <span className="page-hero-tamil-sub">சுவையான கிராமத்து பாரம்பரிய இட்லி & சாத பொடிகள்</span>
        <p className="page-hero-desc">
          Prepared with heirloom recipes from Tenkasi & Tirunelveli. Stone-ground by rural women with dry-roasted
          spices, cold-pressed oils, and 0% artificial chemicals or flavor enhancers.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">🪨 Stone-Ground Heritage</span>
          <span className="page-trust-pill">🍚 Hot Rice & Country Ghee Special</span>
          <span className="page-trust-pill">✨ No MSG or Colors</span>
          <span className="page-trust-pill">👩‍🌾 100% Women Artisan Made</span>
        </div>
      </section>

      <main className="page-main-content">
        {/* Value Combo Pack Feature Card */}
        {podiCombo && (
          <div className="podis-combo-highlight">
            <div className="combo-left">
              <span className="combo-badge">BEST VALUE • SAVE 22%</span>
              <h2>Traditional Food Podis (Set of 4 Jars)</h2>
              <span className="combo-tamil">4-இன்-1 பாரம்பரிய உணவு பொடி காம்போ</span>
              <p>
                Get all four signature handmade blends in airtight reusable jars: Poondu Podi, Karuveppilai Podi,
                Murungai Podi, and Pirandai Podi. Perfect for family lunches and tiffin.
              </p>
              <div className="combo-price-row">
                <span className="combo-price">₹{podiCombo.price}</span>
                <span className="combo-mrp">₹{podiCombo.originalPrice}</span>
                <span className="combo-vol">4 × 100g Glass Jars</span>
              </div>
              <div className="combo-actions">
                <button
                  className="btn-combo-add"
                  onClick={() => {
                    addToCart(podiCombo)
                    openCart()
                  }}
                >
                  Add Combo to Cart • ₹{podiCombo.price}
                </button>
                <button
                  className="btn-combo-view"
                  onClick={() => setSelectedProduct(podiCombo)}
                >
                  View Details & Ingredients
                </button>
              </div>
            </div>

            <div className="combo-right">
              <ImageWithSkeleton
                src={podiCombo.bottle}
                alt={podiCombo.name}
                className="combo-img"
                skeletonBorderRadius="16px"
              />
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="podis-section-title">
          <h2>Explore Individual Handmade Podis</h2>
          <p>Hand-roasted in small batches at our Kadayam processing unit:</p>
        </div>

        {/* 4 Individual Podis Grid */}
        <div className="podis-cards-grid">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonPodiCard key={i} />)
          ) : (
            individualPodis.map((podi) => (
              <div className="podi-card" key={podi.id}>
                <div
                  className="podi-media"
                  onClick={() => setSelectedProduct(podi)}
                  title="Click for full benefits & ingredients"
                >
                  <ImageWithSkeleton
                    src={podi.image || podi.bottle}
                    alt={podi.name}
                    className="podi-img"
                    skeletonBorderRadius="12px"
                  />
                  <span className="podi-tag">{podi.weight || '100g Pouch'}</span>
                </div>

              <div className="podi-details">
                {podi.tamilName && <span className="podi-tamil">{podi.tamilName}</span>}
                <h3 className="podi-name" onClick={() => setSelectedProduct(podi)}>
                  {podi.name}
                </h3>

                <p className="podi-desc">{podi.desc}</p>

                <div className="podi-benefits-list">
                  {podi.benefits &&
                    podi.benefits.map((b, i) => (
                      <span className="podi-benefit-pill" key={i}>
                        ✓ {b}
                      </span>
                    ))}
                </div>

                <div className="podi-price-row">
                  <span className="podi-price">₹{podi.price}</span>
                  <span className="podi-rating">★★★★★ 4.9 ({podi.reviews})</span>
                </div>

                <div className="podi-btn-row">
                  <button
                    className="btn-podi-quick"
                    onClick={() => setSelectedProduct(podi)}
                  >
                    Quick View
                  </button>
                  <button
                    className="btn-podi-cart"
                    onClick={() => {
                      addToCart({
                        id: podi.id,
                        name: podi.name,
                        price: podi.price,
                        bottle: podi.image || podi.bottle,
                        volume: podi.weight || '100g Pouch',
                      })
                      openCart()
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

        {/* Visual Pairing Ritual Guide */}
        <div className="rice-pairing-section">
          <div className="pairing-header">
            <h3>How to Enjoy Traditional Podis (சாப்பிடும் முறை)</h3>
            <p>The authentic South Indian village tradition for lunch & breakfast:</p>
          </div>

          <div className="pairing-steps-grid">
            {RICE_PAIRING_STEPS.map((s) => (
              <div className="pairing-step-card" key={s.step}>
                <div className="step-num-badge">{s.step}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default FoodPodisPage
