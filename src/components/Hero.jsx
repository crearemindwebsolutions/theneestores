import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './Navbar'
import OfferMarquee from './OfferMarquee'
import { products, brandInfo } from '../data/products'
import { useCart } from '../context/CartContext'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)
if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.config) {
  ScrollTrigger.config({ ignoreMobileResize: true })
}

const BG_TRANSITION = { duration: 0.6, ease: 'easeInOut' }

const Hero = ({ onOpenAccount }) => {
  const [index, setIndex] = useState(0)
  const heroRef = useRef(null)
  const bottleFlyRefs = useRef({})
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const touchStartTime = useRef(0)
  const len = products.length
  const current = products[index]
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

  // Flies the currently active bottle down out of the hero and into its
  // matching card slot as the user scrolls (Both Desktop & Mobile)
  useLayoutEffect(() => {
    let cancelled = false
    let rafId
    const mm = gsap.matchMedia()

    const setupFlight = (isMobile) => {
      const flyEl = bottleFlyRefs.current[current.id]
      const cardImg = document.querySelector(
        `.bs-card-img[data-perfume-id="${current.id}"]`
      )
      const card = cardImg?.closest('.bs-card')

      if (!flyEl || !cardImg || !card) {
        rafId = requestAnimationFrame(() => {
          if (!cancelled) setupFlight(isMobile)
        })
        return
      }

      document.querySelectorAll('.bs-card-img').forEach((img) => {
        img.style.opacity = ''
      })
      cardImg.style.opacity = '0'

      const heroImg = flyEl.querySelector('.hero-bottle-img')
      const visualEl = flyEl.closest('.hero-visual') || heroRef.current

      const waitForImg = (img) => {
        if (!img) return Promise.resolve()
        if (img.complete && img.naturalWidth > 0) return Promise.resolve()
        return new Promise((resolve) => {
          const onDone = () => {
            img.removeEventListener('load', onDone)
            img.removeEventListener('error', onDone)
            resolve()
          }
          img.addEventListener('load', onDone)
          img.addEventListener('error', onDone)
        })
      }

      Promise.all([
        new Promise((resolve) => setTimeout(resolve, 150)),
        document.fonts?.ready ?? Promise.resolve(),
        waitForImg(cardImg),
        waitForImg(heroImg),
      ]).then(() => {
        if (cancelled) return

        ScrollTrigger.refresh()

        let cachedTransform = null
        const calcTransform = () => {
          const vRect = visualEl.getBoundingClientRect()
          const cRect = cardImg.getBoundingClientRect()

          if (!vRect.width || !cRect.width) return { x: 0, y: 0, scale: 1 }

          // Compute centers in page coordinates (invariant to current scroll position)
          const vCenterX = vRect.left + window.scrollX + vRect.width / 2
          const vCenterY = vRect.top + window.scrollY + vRect.height / 2

          const cCenterX = cRect.left + window.scrollX + cRect.width / 2
          const cCenterY = cRect.top + window.scrollY + cRect.height / 2

          const targetX = cCenterX - vCenterX
          const targetY = cCenterY - vCenterY

          const heroH = heroImg?.offsetHeight || vRect.height * 0.9
          const cardH = cardImg.offsetHeight || cRect.height
          const targetScale = heroH > 0 && cardH > 0 ? cardH / heroH : 0.5

          return { x: targetX, y: targetY, scale: targetScale }
        }

        cachedTransform = calcTransform()
        gsap.set(flyEl, {
          zIndex: 300,
          opacity: 1,
          transformOrigin: '50% 50%',
          willChange: 'transform',
        })

        gsap.to(flyEl, {
          x: () => (cachedTransform ? cachedTransform.x : 0),
          y: () => (cachedTransform ? cachedTransform.y : 0),
          scale: () => (cachedTransform ? cachedTransform.scale : 1),
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: isMobile ? 'top 10px' : 'top top',
            endTrigger: card,
            end: isMobile ? 'top 80px' : 'top 140px',
            scrub: isMobile ? 0.15 : true,
            invalidateOnRefresh: true,
            onRefresh: () => {
              cachedTransform = calcTransform()
            },
            onUpdate: (self) => {
              const isMidFlight = self.progress > 0 && self.progress < 1
              heroRef.current.style.zIndex = isMidFlight ? '30' : '10'

              if (heroImg && !isMobile) {
                heroImg.style.animationPlayState =
                  self.progress > 0 ? 'paused' : 'running'
              }

              if (self.progress >= 1) {
                cardImg.style.opacity = '1'
                flyEl.style.opacity = '0'
              } else {
                cardImg.style.opacity = '0'
                flyEl.style.opacity = '1'
              }
            },
            onLeave: () => {
              cardImg.style.opacity = '1'
              flyEl.style.opacity = '0'
              heroRef.current.style.zIndex = '10'
            },
            onEnterBack: () => {
              cardImg.style.opacity = '0'
              flyEl.style.opacity = '1'
              heroRef.current.style.zIndex = '30'
            },
          },
        })
      })
    }

    mm.add('(max-width: 860px)', () => {
      setupFlight(true)
    })

    mm.add('(min-width: 861px)', () => {
      setupFlight(false)
    })

    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
      mm.revert()
      const flyEl = bottleFlyRefs.current[current.id]
      const cardImg = document.querySelector(
        `.bs-card-img[data-perfume-id="${current.id}"]`
      )
      if (cardImg) cardImg.style.opacity = ''
      if (flyEl) {
        flyEl.style.opacity = ''
        gsap.set(flyEl, { zIndex: '', x: 0, y: 0, scale: 1, willChange: '' })
      }
      if (heroRef.current) heroRef.current.style.zIndex = ''
    }
  }, [index, current.id])

  return (
    <section id="home" className="hero" ref={heroRef}>
      <motion.div
        className="hero-bg-layer"
        animate={{ backgroundColor: current.bgColor }}
        transition={BG_TRANSITION}
      >
        <motion.div
          className="hero-circle hero-circle--left"
          animate={{ backgroundColor: current.circleColor }}
          transition={BG_TRANSITION}
        />
        <motion.div
          className="hero-circle hero-circle--right"
          animate={{ backgroundColor: current.circleColor }}
          transition={BG_TRANSITION}
        />
      </motion.div>

      <OfferMarquee />
      <Navbar onOpenAccount={onOpenAccount} currentRoute="home" />

      <div className="hero-main">
        <div className="hero-body">
          <motion.div
            className="hero-text"
            animate={{ color: current.textColor }}
            transition={BG_TRANSITION}
          >
            <h1>
              <span className="hero-title-word">
                THENEE
                <svg className="hero-title-leaf" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20c0-8 6-14 14-14 0 8-6 14-14 14Z" fill="#C6A15B" />
                </svg>
              </span>
              <br />
              <span className="hero-title-subtext">{current.name}</span>
            </h1>

            {current.tamilName && (
              <div className="hero-tamil-pill">{current.tamilName}</div>
            )}

            <motion.p animate={{ color: current.subTextColor }} transition={BG_TRANSITION}>
              {current.description}
            </motion.p>

            {/* Quick pricing & benefits summary */}
            <div className="hero-price-tag">
              <span className="hero-price-now">₹{current.price}</span>
              <span className="hero-price-orig">₹{current.originalPrice}</span>
              <span className="hero-volume-badge">{current.volume}</span>
              <span className="hero-rating-badge">★ {current.rating} ({current.reviews}+)</span>
            </div>

            <div className="hero-actions">
              <button
                className="btn btn-cream"
                onClick={() => {
                  addToCart(current)
                  openCart()
                }}
              >
                Add to Cart • ₹{current.price}
              </button>
            </div>

            <div className="hero-nav">
              <button className="hero-arrow" onClick={prev} aria-label="Previous product">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="hero-nav-count">
                {String(index + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
              </span>
              <button className="hero-arrow" onClick={next} aria-label="Next product">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="hero-family-count">
                Trusted by <strong>16,000+</strong> families
              </span>
            </div>
          </motion.div>

          <div className="hero-right">
            <div
              className="hero-visual"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="Product image carousel - swipe left or right"
            >
              <div className="hero-visual-bottle-layer">
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="hero-bottle-fly"
                    data-perfume-id={p.id}
                    ref={(el) => (bottleFlyRefs.current[p.id] = el)}
                  >
                    <motion.img
                      src={p.bottle}
                      alt={p.name}
                      className="hero-bottle-img"
                      animate={{ opacity: i === index ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-badges">
              <div className="hero-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20c0-8 6-14 14-14 0 8-6 14-14 14Z" className="hero-badge-icon-leaf" />
                </svg>
                <span>
                  100%
                  <br />
                  Organic
                </span>
              </div>
              <div className="hero-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    className="hero-badge-icon-drop"
                  />
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
