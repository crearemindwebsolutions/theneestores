import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { individualPodis, products } from '../data/products'
import { useCart } from '../context/CartContext'
import { ImageWithSkeleton } from './Skeleton'
import './PagesShared.css'
import './FoodPodisPage.css'

const RICE_PAIRING_STEPS = [
  { step: '1', title: 'Hot Rice or Idli', desc: 'Serve warm steamed rice, idli, or dosa.' },
  { step: '2', title: 'Add Podi', desc: 'Sprinkle 1 to 2 spoonfuls of Thenee podi.' },
  { step: '3', title: 'Ghee or Sesame Oil', desc: 'Drizzle melted cow ghee or sesame oil.' },
  { step: '4', title: 'Mix & Savor!', desc: 'Mix well and enjoy authentic village flavor.' },
]

const FoodPodisPage = ({ onOpenAccount }) => {
  const { addToCart, setSelectedProduct, openCart } = useCart()

  // Value Combo from main products list
  const podiCombo = products.find((p) => p.id === 'food-podis')

  return (
    <div className="page-wrapper food-podis-page">
      <OfferMarquee />
      <header className="site-header-sticky">
        <Navbar onOpenAccount={onOpenAccount} currentRoute="podis" />
      </header>

      {/* Page Hero Header - Minimal */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Food Podis</span>
        </div>
        <h1>Traditional Food Podis</h1>
        <p className="page-hero-desc">
          Stone-ground in Tenkasi by rural women for hot steamed rice, ghee, idli & dosa.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">🪨 Stone-Ground</span>
          <span className="page-trust-pill">🍚 Hot Rice & Ghee Special</span>
          <span className="page-trust-pill">✨ 100% Chemical-Free</span>
          <span className="page-trust-pill">👩‍🌾 Rural Women Made</span>
        </div>
      </section>

      <main className="page-main-content">
        {/* Value Combo Pack Feature Card */}
        {podiCombo && (
          <div className="podis-combo-highlight">
            <div className="combo-left">
              <span className="combo-badge">BEST VALUE • SAVE 22%</span>
              <h2>Traditional Food Podis (Set of 4 Jars)</h2>
              <p>
                All 4 signature blends in reusable glass jars: Garlic, Curry Leaves, Moringa, and Pirandai.
              </p>
              <div className="combo-price-row">
                <span className="combo-price">₹{podiCombo.price}</span>
                <span className="combo-mrp">₹{podiCombo.originalPrice}</span>
                <span className="combo-vol">4 × 100g Jars</span>
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
                  View Details
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
          <h2>Individual Handmade Podis</h2>
          <p>Hand-roasted in small batches in Tenkasi</p>
        </div>

        {/* 4 Individual Podis Grid - Clean & Minimal */}
        <div className="podis-cards-grid">
          {individualPodis.map((podi) => (
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
              </div>

              <div className="podi-details">
                <h3 className="podi-name" onClick={() => setSelectedProduct(podi)}>
                  {podi.name}
                </h3>

                <p className="podi-desc">
                  {podi.shortDesc || podi.benefits?.[0] || 'Handcrafted village recipe for daily wellness.'}
                </p>

                <div className="podi-price-row">
                  <div className="podi-price-group">
                    <span className="podi-price">₹{podi.price}</span>
                    <span className="podi-weight-chip">{podi.weight || '100g'}</span>
                  </div>
                  <span className="podi-rating">★ {podi.rating || 4.9} ({podi.reviews})</span>
                </div>

                <div className="podi-btn-row">
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
          ))}
        </div>

        {/* Visual Pairing Ritual Guide */}
        <div className="rice-pairing-section">
          <div className="pairing-header">
            <h3>How to Enjoy</h3>
            <p>Traditional village ritual for hot steamed rice & tiffin</p>
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
