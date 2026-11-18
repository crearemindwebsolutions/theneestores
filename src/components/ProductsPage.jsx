import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import Footer from './Footer'
import { products, individualPodis } from '../data/products'
import { useCart } from '../context/CartContext'
import { SkeletonProductCard, ImageWithSkeleton } from './Skeleton'
import './PagesShared.css'
import './ProductsPage.css'

const CATEGORIES = [
  { id: 'all', label: 'All Products (அனைத்தும்)' },
  { id: 'tea', label: 'Botanical Teas (மூலிகை டீ)' },
  { id: 'superfood', label: 'Superfood Powders (சூப்பர்ஃபுட்)' },
  { id: 'podi', label: 'Traditional Podis (உணவு பொடிகள்)' },
]

const ProductsPage = ({ onOpenAccount }) => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart, setSelectedProduct, openCart } = useCart()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [activeCategory])

  // Combine products
  const allCatalog = [
    ...products,
    ...individualPodis.map((podi) => ({
      ...podi,
      category: 'podi',
      volume: podi.weight || '100g Pouch',
      originalPrice: podi.price + 50,
      description: podi.desc || 'Authentic stone-ground village podi for daily wellness.',
      benefits: podi.benefits || ['Zero Preservatives', 'Traditional Village Recipe', 'Rich in Natural Nutrients'],
    })),
  ]

  const filtered = allCatalog.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tamilName && item.tamilName.includes(searchQuery)) ||
      (item.shortDesc && item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className="page-wrapper products-page">
      <header className="page-header-nav-wrap">
        <OfferMarquee />
        <Navbar onOpenAccount={onOpenAccount} currentRoute="products" />
      </header>

      {/* Page Hero Header */}
      <section className="page-hero-banner">
        <div className="page-breadcrumb">
          <a href="#home">Home</a>
          <span className="page-breadcrumb-sep">➔</span>
          <span>Products</span>
        </div>
        <h1>Signature Herbal Botanicals & Powders</h1>
        <span className="page-hero-tamil-sub">தேனீ • 100% இயற்கை பாரம்பரிய மூலிகைப் பொருட்கள்</span>
        <p className="page-hero-desc">
          Handcrafted by rural women artisans in Kadayam, Tenkasi. Gentle sun-shade dried, stone-ground,
          and chemical-free for natural balance and lasting vitality.
        </p>

        <div className="page-trust-strip">
          <span className="page-trust-pill">🌿 100% Organic & Pure</span>
          <span className="page-trust-pill">👩‍🌾 Handcrafted by Women</span>
          <span className="page-trust-pill">✨ Zero Preservatives</span>
          <span className="page-trust-pill">🏷️ FSSAI Lic. #22425278000320</span>
        </div>
      </section>

      {/* Main Catalog Body */}
      <main className="page-main-content">
        {/* Search & Category Filter Strip */}
        <div className="products-controls-bar">
          <div className="products-cat-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`prod-filter-btn ${activeCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="products-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search teas, moringa, podis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>

        {/* Product Count & Active Status */}
        <div className="products-status-row">
          <span className="prod-count-note">Showing <strong>{filtered.length}</strong> items in our herbal catalog</span>
        </div>

        {/* Product Grid */}
        <div className="products-catalog-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonProductCard key={i} />)
          ) : (
            filtered.map((item) => (
              <div className="prod-catalog-card" key={item.id}>
                <div
                  className="prod-card-media"
                  onClick={() => setSelectedProduct(item)}
                  title="Click for full benefits & ingredients"
                >
                  <ImageWithSkeleton
                    src={item.bottle || item.image}
                    alt={item.name}
                    className="prod-card-img"
                    skeletonBorderRadius="12px"
                  />
                  {item.originalPrice > item.price && (
                    <span className="prod-discount-tag">
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

              <div className="prod-card-body">
                {item.tamilName && <span className="prod-tamil-title">{item.tamilName}</span>}
                <h3 className="prod-card-title" onClick={() => setSelectedProduct(item)}>
                  {item.name}
                </h3>

                <div className="prod-rating-strip">
                  <span className="stars">★★★★★</span>
                  <span className="rating-count">({item.reviews || 840}+ reviews)</span>
                </div>

                <p className="prod-short-benefit">
                  {item.shortDesc || (item.benefits && item.benefits[0]) || 'Daily wellness handcrafted by Tenkasi women.'}
                </p>

                <div className="prod-price-strip">
                  <div>
                    <span className="prod-current-price">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="prod-mrp-price">₹{item.originalPrice}</span>
                    )}
                  </div>
                  <span className="prod-volume-badge">{item.volume}</span>
                </div>

                <div className="prod-card-buttons">
                  <button
                    className="btn-prod-quickview"
                    onClick={() => setSelectedProduct(item)}
                  >
                    Quick View
                  </button>
                  <button
                    className="btn-prod-add"
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
          ))
        )}
      </div>

        {/* Bottom Purity Promise Callout */}
        <div className="products-guarantee-banner">
          <div className="guarantee-icon">🌿</div>
          <div className="guarantee-text">
            <h3>Direct From Kadayam, Tenkasi Rural Foothills</h3>
            <p>Every purchase directly sustains rural women self-help artisan groups in Tamil Nadu. We pack each batch fresh without chemicals or commercial preservatives.</p>
          </div>
          <a
            href="https://wa.me/917550248005?text=Hello%20THENEE%2C%20I%20would%20like%20to%20order%20custom%20herbal%20packs."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-order"
          >
            💬 Custom WhatsApp Order
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
