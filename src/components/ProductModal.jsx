import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { brandInfo } from '../data/products'
import { ImageWithSkeleton } from './Skeleton'
import { getProductImage } from '../lib/productService'
import './ProductModal.css'

const ProductModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const scrollRef = useRef(null)
  const touchStartY = useRef(0)

  useEffect(() => {
    if (selectedProduct) {
      const initialHash = window.location.hash
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      if (window.__lenis) window.__lenis.stop()

      // Prevent touch gestures on non-scrollable parts from scrolling the background window
      const handlePreventBackgroundTouch = (e) => {
        const scrollEl = scrollRef.current
        if (scrollEl && scrollEl.contains(e.target)) {
          return // Allow native scrolling inside the scrollable modal container
        }
        if (e.cancelable) {
          e.preventDefault()
        }
      }

      window.addEventListener('touchmove', handlePreventBackgroundTouch, { passive: false })

      return () => {
        window.removeEventListener('touchmove', handlePreventBackgroundTouch)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        // Only restore previous scroll position if route didn't change!
        if (window.location.hash === initialHash) {
          window.scrollTo(0, scrollY)
        } else {
          window.scrollTo(0, 0)
        }
        if (window.__lenis) {
          window.__lenis.start()
          if (window.location.hash !== initialHash) {
            window.__lenis.scrollTo(0, { immediate: true })
          }
        }
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

  const handleMediaTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleMediaTouchMove = (e) => {
    if (!scrollRef.current || !e.touches || !e.touches[0]) return
    const currentY = e.touches[0].clientY
    const deltaY = touchStartY.current - currentY
    touchStartY.current = currentY
    scrollRef.current.scrollTop += deltaY
    if (e.cancelable) {
      e.preventDefault()
    }
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
          <div
            className="pmodal-media-wrap"
            onTouchStart={handleMediaTouchStart}
            onTouchMove={handleMediaTouchMove}
          >
            <span className="pmodal-badge-clean">100% Organic & Chemical-Free</span>
            <div className="pmodal-media-bg">
              <ImageWithSkeleton
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                className="pmodal-img"
                skeletonBorderRadius="12px"
              />
            </div>
            <span className="pmodal-badge-fssai">FSSAI Certified: {brandInfo.fssai}</span>
          </div>

          {/* Right info - scrollable with sticky action bar */}
          <div className="pmodal-info">
            <div className="pmodal-info-scroll" ref={scrollRef} data-lenis-prevent>
              <div className="pmodal-header">
                <div className="pmodal-category-tag">{selectedProduct.categoryLabel || 'Herbal Wellness'}</div>
                <h2 className="pmodal-title">{selectedProduct.name}</h2>
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

              <p className="pmodal-desc">
                {selectedProduct.description || selectedProduct.desc || selectedProduct.shortDesc}
              </p>

              {/* Key benefits list */}
              {((selectedProduct.keyBenefits && selectedProduct.keyBenefits.length > 0) || (selectedProduct.benefits && selectedProduct.benefits.length > 0)) && (
                <div className="pmodal-section">
                  <h4>Key Health Benefits</h4>
                  <div className="pmodal-benefits-grid">
                    {(selectedProduct.keyBenefits || selectedProduct.benefits.map((b) => typeof b === 'string' ? { title: b, desc: '' } : b)).map((b, i) => (
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
              {((selectedProduct.howToUse && selectedProduct.howToUse.length > 0) || selectedProduct.shortDesc) && (
                <div className="pmodal-section">
                  <h4>How to Use</h4>
                  <ol className="pmodal-steps">
                    {(selectedProduct.howToUse || [selectedProduct.shortDesc || 'Mix 1–2 spoons with hot steamed rice and cow ghee or sesame oil.']).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Ingredients */}
              {(selectedProduct.ingredients || selectedProduct.tagline) && (
                <div className="pmodal-section pmodal-ingredients">
                  <strong>Ingredients:</strong> {selectedProduct.ingredients || selectedProduct.tagline || '100% Pure Natural Botanicals'}
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
