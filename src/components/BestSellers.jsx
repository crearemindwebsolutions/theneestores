import { useState, useEffect } from 'react'
import { products, individualPodis } from '../data/products'
import { useCart } from '../context/CartContext'
import useReveal from '../lib/useReveal'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BestSellers.css'

const CATEGORIES = [
  { id: 'all', label: 'All Herbal Products' },
  { id: 'tea', label: 'Botanical Teas' },
  { id: 'superfood', label: 'Superfood Powders' },
  { id: 'podi', label: 'Traditional Podis' },
]

const BestSellers = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const { addToCart, setSelectedProduct, openCart } = useCart()

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [activeCategory])

  const sectionRef = useReveal([
    { selector: '.bestsellers-top', y: 30, duration: 0.7 },
    { selector: '.bs-card', y: 60, scale: 0.94, duration: 0.7, stagger: 0.1, start: 'top 80%' },
  ])

  // Filter products
  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <section className="bestsellers" id="catalog" ref={sectionRef}>
      <div className="bestsellers-top">
        <div>
          <div className="bs-section-kicker">100% Pure & Village Sourced</div>
          <h2>Our Signature Herbal Blends</h2>
        </div>

        {/* Category Filters */}
        <div className="bestsellers-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`bs-filter-pill ${activeCategory === cat.id ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flagship Hero Grid (includes the 4 GSAP landing slots) */}
      <div className="bestsellers-grid">
        {filteredProducts.map((p) => (
          <div className="bs-card" key={p.id}>
            {p.badge && <span className="bs-card-badge">{p.badge}</span>}

            <div
              className="bs-card-media"
              onClick={() => setSelectedProduct(p)}
              title="Click for full benefits & ingredients"
            >
              <img
                src={p.bottle}
                alt={p.name}
                className="bs-card-img"
                data-perfume-id={p.id}
              />
            </div>

            <div className="bs-card-info">
              {p.tamilName && <p className="bs-card-tamil">{p.tamilName}</p>}
              <h3 className="bs-card-name" onClick={() => setSelectedProduct(p)}>
                {p.name}
              </h3>

              <div className="bs-card-rating">
                {'★'.repeat(5)} <span>({p.reviews})</span>
              </div>

              <div className="bs-card-price-row">
                <span className="bs-card-price">₹{p.price}</span>
                {p.originalPrice > p.price && (
                  <span className="bs-card-orig">₹{p.originalPrice}</span>
                )}
                <span className="bs-card-vol">{p.volume}</span>
              </div>

              <div className="bs-card-actions">
                <button
                  className="bs-card-quickview"
                  onClick={() => setSelectedProduct(p)}
                >
                  Quick View
                </button>
                <button
                  className="bs-card-add"
                  onClick={() => {
                    addToCart(p)
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

      {/* Traditional Food Podis Shelf */}
      <div className="podis-shelf-header" id="podis">
        <div className="podis-shelf-badge">Stone-Ground & Chemical Free</div>
        <h3>Traditional Food Podis for Everyday Meals</h3>
        <p>
          Handcrafted by rural women in Tamil Nadu for hot steamed rice, ghee, idli, and dosa.
        </p>
      </div>

      <div className="bestsellers-grid">
        {individualPodis.map((podi) => (
          <div className="bs-card" key={podi.id}>
            {podi.badge && <span className="bs-card-badge">{podi.badge}</span>}

            <div
              className="bs-card-media"
              onClick={() => setSelectedProduct(podi)}
              title="Click for full benefits & ingredients"
            >
              <img
                src={podi.bottle || podi.image}
                alt={podi.name}
                className="bs-card-img"
              />
            </div>

            <div className="bs-card-info">
              {podi.tamilName && <p className="bs-card-tamil">{podi.tamilName}</p>}
              <h3 className="bs-card-name" onClick={() => setSelectedProduct(podi)}>
                {podi.name}
              </h3>

              <div className="bs-card-rating">
                {'★'.repeat(5)} <span>({podi.reviews})</span>
              </div>

              <div className="bs-card-price-row">
                <span className="bs-card-price">₹{podi.price}</span>
                {podi.originalPrice > podi.price && (
                  <span className="bs-card-orig">₹{podi.originalPrice}</span>
                )}
                <span className="bs-card-vol">{podi.volume}</span>
              </div>

              <div className="bs-card-actions">
                <button
                  className="bs-card-quickview"
                  onClick={() => setSelectedProduct(podi)}
                >
                  Quick View
                </button>
                <button
                  className="bs-card-add"
                  onClick={() => {
                    addToCart(podi)
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
    </section>
  )
}

export default BestSellers
