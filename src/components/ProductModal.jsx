import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { brandInfo } from '../data/products'
import { ImageWithSkeleton } from './Skeleton'
import './ProductModal.css'

const ProductModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useCart()
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [selectedProduct])

  if (!selectedProduct) return null

  const handleClose = () => {
    setSelectedProduct(null)
    setQty(1)
  }

  const handleAdd = () => {
    addToCart(selectedProduct, qty)
    handleClose()
  }

  const discountPercent = selectedProduct.originalPrice
    ? Math.round(
        ((selectedProduct.originalPrice - selectedProduct.price) /
          selectedProduct.originalPrice) *
          100
      )
    : 0

  return (
    <div className="pmodal-backdrop" onClick={handleClose}>
      <div
        className="pmodal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        data-lenis-prevent
      >
        <div className="pmodal-grid">
          {/* Left media */}
          <div className="pmodal-media-wrap">
            <span className="pmodal-badge-clean">100% Organic & Chemical-Free</span>
            <div className="pmodal-media-bg">
              <ImageWithSkeleton
                src={selectedProduct.bottle || selectedProduct.cardImage || selectedProduct.image}
                alt={selectedProduct.name}
                className="pmodal-img"
                skeletonBorderRadius="12px"
              />
            </div>
            <span className="pmodal-badge-fssai">FSSAI Certified: {brandInfo.fssai}</span>
          </div>

          {/* Right info - scrollable with sticky action bar */}
          <div className="pmodal-info">
            <div className="pmodal-info-scroll" data-lenis-prevent>
              <div className="pmodal-header">
                <div className="pmodal-category-tag">{selectedProduct.categoryLabel || 'Herbal Wellness'}</div>
                <h2 className="pmodal-title">{selectedProduct.name}</h2>
                {selectedProduct.tamilName && (
                  <div className="pmodal-tamil">{selectedProduct.tamilName}</div>
                )}
                {selectedProduct.tagline && (
                  <p className="pmodal-tagline">{selectedProduct.tagline}</p>
                )}
              </div>

              <div className="pmodal-rating-row">
                <div className="pmodal-stars">
                  {'★'.repeat(5)}
                </div>
                <span className="pmodal-rating-val">{selectedProduct.rating || 4.9}</span>
                <span className="pmodal-rating-count">({selectedProduct.reviews || 450}+ verified reviews)</span>
              </div>

              <div className="pmodal-price-row">
                <span className="pmodal-price">₹{selectedProduct.price}</span>
                {selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="pmodal-original">₹{selectedProduct.originalPrice}</span>
                )}
                {discountPercent > 0 && (
                  <span className="pmodal-save-pill">Save {discountPercent}%</span>
                )}
                <span className="pmodal-volume-tag">{selectedProduct.volume}</span>
              </div>

              <p className="pmodal-desc">{selectedProduct.description}</p>

              {/* Key benefits list */}
              {selectedProduct.keyBenefits && selectedProduct.keyBenefits.length > 0 && (
                <div className="pmodal-section">
                  <h4>Key Health Benefits</h4>
                  <div className="pmodal-benefits-grid">
                    {selectedProduct.keyBenefits.map((b, i) => (
                      <div className="pmodal-benefit-item" key={i}>
                        <span className="pmodal-benefit-check">✓</span>
                        <div>
                          <strong>{b.title}</strong>
                          {b.desc && <p>{b.desc}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How to use */}
              {selectedProduct.howToUse && selectedProduct.howToUse.length > 0 && (
                <div className="pmodal-section">
                  <h4>How to Use</h4>
                  <ol className="pmodal-steps">
                    {selectedProduct.howToUse.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Ingredients */}
              {selectedProduct.ingredients && (
                <div className="pmodal-section pmodal-ingredients">
                  <strong>Ingredients:</strong> {selectedProduct.ingredients}
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="pmodal-footer">
              <div className="pmodal-action-row">
                <div className="pmodal-qty-selector">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button className="pmodal-add-btn" onClick={handleAdd}>
                  Add to Cart • ₹{selectedProduct.price * qty}
                </button>
              </div>

              <div className="pmodal-guarantees">
                <span>🌾 Tenkasi Roots</span>
                <span>👩‍🌾 Handcrafted by Women</span>
                <span>✨ 100% Chemical-Free</span>
              </div>
            </div>
          </div>
        </div>

        <button className="pmodal-close" onClick={handleClose} aria-label="Close modal">
          ✕
        </button>
      </div>
    </div>
  )
}

export default ProductModal
