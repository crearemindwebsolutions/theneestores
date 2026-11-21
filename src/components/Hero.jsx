import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brandInfo } from '../data/products'
import { cmsService } from '../lib/cmsService'
import { useCart } from '../context/CartContext'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)
if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.config) {
  ScrollTrigger.config({ ignoreMobileResize: true })
}

const BG_TRANSITION = { duration: 0.6, ease: 'easeInOut' }

const Hero = ({ onOpenAccount }) => {
  const [productList, setProductList] = useState(() => cmsService.getProducts())
  const [index, setIndex] = useState(0)
  const heroRef = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const touchStartTime = useRef(0)

  useEffect(() => {
    const handleCmsUpdate = () => {
      setProductList([...cmsService.getProducts()])
    }
    window.addEventListener('thenee_cms_updated', handleCmsUpdate)
    window.addEventListener('storage', handleCmsUpdate)
    return () => {
      window.removeEventListener('thenee_cms_updated', handleCmsUpdate)
      window.removeEventListener('storage', handleCmsUpdate)
    }
  }, [])

  const len = productList.length || 1
  const current = productList[index] || productList[0] || {}
  const { addToCart, setSelectedProduct, openCart } = useCart()

  const prev = () => setIndex((index - 1 + len) % len)
  const next = () => setIndex((index + 1) % len)

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const touch = e.changedTouches?.[0]
    if (!touch) return

    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    const elapsedTime = Date.now() - touchStartTime.current

    // Trigger swipe if horizontal movement is at least 35px, dominates vertical, and within 600ms
    if (
      Math.abs(deltaX) > 35 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2 &&
      elapsedTime < 600
    ) {
      if (deltaX < 0) {
        next()
      } else {
        prev()
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  // Ensure card images in catalog are always visible without any scroll flight interference
  useLayoutEffect(() => {
    document.querySelectorAll('.bs-card-img').forEach((img) => {
      img.style.opacity = '1'
    })
  }, [index, current.id])

  return (
    <section id="home" className="hero" ref={heroRef}>
      {/* Decorative Botanical Background Watermark */}
      <div className="hero-botanical-bg" aria-hidden="true">
        <svg viewBox="0 0 1440 800" fill="none" preserveAspectRatio="xMidYMid slice" className="hero-botanical-svg">
          <g opacity="0.32" stroke="#BDCBBF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Center-left botanical foliage */}
            <path d="M420 780 C440 620 510 480 620 380 C680 320 740 280 820 250" />
            <path d="M540 450 C520 400 480 380 430 390 C460 420 490 440 540 450 Z" fill="#D6E0D7" fillOpacity="0.4" />
            <path d="M580 410 C610 370 650 360 690 380 C660 400 620 410 580 410 Z" fill="#D6E0D7" fillOpacity="0.4" />
            <path d="M640 360 C640 310 610 280 560 280 C580 320 600 340 640 360 Z" fill="#D6E0D7" fillOpacity="0.4" />
            <path d="M700 310 C740 270 780 270 820 290 C780 310 740 310 700 310 Z" fill="#D6E0D7" fillOpacity="0.4" />
            <path d="M750 270 C760 220 740 190 700 180 C710 220 730 250 750 270 Z" fill="#D6E0D7" fillOpacity="0.4" />
            <path d="M800 240 C840 200 890 210 920 240 C880 250 840 250 800 240 Z" fill="#D6E0D7" fillOpacity="0.4" />
            {/* Left subtle background leaves */}
            <path d="M80 820 C140 680 240 560 380 480" />
            <path d="M220 600 C190 560 150 550 110 560 C140 590 180 600 220 600 Z" fill="#D6E0D7" fillOpacity="0.3" />
            <path d="M280 540 C310 490 350 480 390 500 C360 520 320 530 280 540 Z" fill="#D6E0D7" fillOpacity="0.3" />
            <path d="M340 490 C340 430 310 400 260 400 C280 440 310 470 340 490 Z" fill="#D6E0D7" fillOpacity="0.3" />
            {/* Right subtle background leaves */}
            <path d="M1120 760 C1160 580 1240 420 1380 320" />
            <path d="M1190 540 C1160 490 1110 480 1060 490 C1100 520 1150 540 1190 540 Z" fill="#D6E0D7" fillOpacity="0.3" />
            <path d="M1250 460 C1290 410 1340 410 1380 430 C1340 450 1300 460 1250 460 Z" fill="#D6E0D7" fillOpacity="0.3" />
          </g>
        </svg>
      </div>

      <div className="hero-main">
        <div className="hero-body">
          <div className="hero-text">
            <div className="hero-title-group">
              <span className="hero-brand-name">THENEE</span>
              <h1 className="hero-product-heading">{current.name}</h1>
            </div>

            <p className="hero-desc">
              {current.description}
            </p>

            {/* Quick pricing & specifications row */}
            <div className="hero-meta-row">
              <div className="hero-price-wrap">
                <span className="hero-price-now">₹{current.price}</span>
                {current.originalPrice > current.price && (
                  <span className="hero-price-orig">₹{current.originalPrice}</span>
                )}
              </div>
              <span className="hero-pill-badge">{current.volume || '75g Floral Blend'}</span>
              <span className="hero-rating-badge">★ {current.rating || 4.95} ({current.reviews || 620}+)</span>
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-hero-outline"
                onClick={() => {
                  addToCart(current)
                  openCart()
                }}
              >
                Add to Cart • ₹{current.price}
              </button>
            </div>

            <div className="hero-nav">
              <button type="button" className="hero-arrow-btn" onClick={prev} aria-label="Previous product">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="hero-nav-counter">
                {String(index + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
              </span>
              <button type="button" className="hero-arrow-btn" onClick={next} aria-label="Next product">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <span className="hero-family-trust">
                Trusted by <strong>16,000+</strong> families
              </span>
            </div>
          </div>

          <div className="hero-right">
            {/* Large Circular Backdrop */}
            <div className="hero-center-circle-backdrop">
              <div
                className="hero-visual"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                role="region"
                aria-label="Product image carousel - swipe left or right"
              >
                <div className="hero-visual-bottle-layer">
                  {productList.map((p, i) => (
                    <div
                      key={p.id}
                      className={`hero-bottle-wrap hero-bottle-wrap--${p.id}`}
                      style={{ display: i === index ? 'flex' : 'none' }}
                    >
                      <motion.img
                        src={p.cardImage || p.image || p.bottle}
                        alt={p.name}
                        className={`hero-bottle-img hero-bottle-img--${p.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Circular Outline Badges */}
            <div className="hero-trust-badges-vertical">
              <div className="hero-circle-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
                <span>
                  100%
                  <br />
                  Organic
                </span>
              </div>

              <div className="hero-circle-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>
                  Handmade
                  <br />
                  With Love
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
