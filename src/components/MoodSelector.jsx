import { useEffect, useRef, useState, useCallback } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
} from 'react-icons/fa'
import { products, individualPodis } from '../data/products'
import { useCart } from '../context/CartContext'
import './MoodSelector.css'

const SHOWCASE_ITEMS = [
  {
    id: 'herbal-tea',
    name: 'Thenee Herbal Tea',
    packagingImage: '/images/custom_thenee/herbal-tea-bottle.png',
    cardImage: '/images/custom_thenee/herbal-tea-product.jpg',
    glowColor: 'rgba(196, 166, 106, 0.35)',
  },
  {
    id: 'bliss-tea',
    name: 'Thenee Bliss Tea',
    packagingImage: '/images/custom_thenee/bliss-tea-bottle.png',
    cardImage: '/images/custom_thenee/bliss-tea-product.jpg',
    glowColor: 'rgba(145, 163, 138, 0.35)',
  },
  {
    id: 'moringa-powder',
    name: 'Pure Moringa Powder',
    packagingImage: '/images/custom_thenee/moringa-powder-bottle.png',
    cardImage: '/images/custom_thenee/moringa-powder-product.jpg',
    glowColor: 'rgba(120, 160, 110, 0.35)',
  },
  {
    id: 'garlic-podi',
    name: 'Garlic Powder (Poondu)',
    packagingImage: '/images/custom_thenee/garlic-podi-float.png',
    cardImage: '/images/custom_thenee/garlic-podi.jpg',
    glowColor: 'rgba(196, 166, 106, 0.35)',
  },
  {
    id: 'curry-leaves-podi',
    name: 'Curry Leaves Powder',
    packagingImage: '/images/custom_thenee/curry-leaves-podi-float.png',
    cardImage: '/images/custom_thenee/curry-leaves-podi.jpg',
    glowColor: 'rgba(145, 163, 138, 0.35)',
  },
  {
    id: 'sesame-podi',
    name: 'Sesame Powder (Ellu)',
    packagingImage: '/images/custom_thenee/sesame-podi-float.png',
    cardImage: '/images/custom_thenee/sesame-podi.jpg',
    glowColor: 'rgba(196, 166, 106, 0.35)',
  },
  {
    id: 'moringa-podi',
    name: 'Moringa Leaves Podi',
    packagingImage: '/images/custom_thenee/moringa-podi-float.png',
    cardImage: '/images/custom_thenee/moringa-podi.jpg',
    glowColor: 'rgba(120, 160, 110, 0.35)',
  },
]

const MoodSelector = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef(null)
  const isInteracting = useRef(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const { setSelectedProduct } = useCart()

  const total = SHOWCASE_ITEMS.length

  const getMatchedProduct = useCallback((item) => {
    return (
      products.find((p) => p.id === item.id) ||
      individualPodis.find((p) => p.id === item.id) ||
      item
    )
  }, [])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total)
  }, [total])

  const handleProductClick = (index, offset, item) => {
    if (offset !== 0) {
      setActiveIndex(index)
      isInteracting.current = true
      setTimeout(() => {
        isInteracting.current = false
      }, 1000)
    } else {
      // Clicking the active featured product opens the product details modal
      const matched = getMatchedProduct(item)
      setSelectedProduct(matched)
    }
  }

  // Intersection Observer for section visibility
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-rotation: 7s interval with hover/touch/tab visibility pause
  useEffect(() => {
    if (!isAutoPlaying) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const timer = setInterval(() => {
      if (!isInteracting.current && document.visibilityState === 'visible') {
        setActiveIndex((prev) => (prev + 1) % total)
      }
    }, 7000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, total])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const visible = rect.top < window.innerHeight && rect.bottom > 0
      if (!visible) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  // Touch Swipe handlers
  const onTouchStart = (e) => {
    isInteracting.current = true
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    }
    setTimeout(() => {
      isInteracting.current = false
    }, 1000)
  }

  return (
    <section
      className={`depth-showcase-section ${isInView ? 'is-visible' : ''}`}
      id="wellness"
      ref={sectionRef}
      aria-label="THENEE 3D Product Showcase"
    >
      {/* Ambient background glows */}
      <div className="depth-bg-aura depth-bg-aura-top" />
      <div className="depth-bg-aura depth-bg-aura-bottom" />

      {/* Section Header */}
      <div className="depth-showcase-header">
        <span className="depth-showcase-eyebrow">THENEE COLLECTION</span>
        <h2 className="depth-showcase-title">Find Your Daily Herbal Ritual</h2>
        <p className="depth-showcase-subtitle">
          Explore traditional Tamil remedies handcrafted by rural women for holistic wellness.
        </p>
      </div>

      {/* 3D Depth Carousel Stage — Pure Product Images Only */}
      <div
        className="depth-carousel-wrapper"
        onMouseEnter={() => {
          isInteracting.current = true
        }}
        onMouseLeave={() => {
          isInteracting.current = false
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Navigation Arrow Left */}
        <button
          className="depth-nav-arrow depth-nav-prev"
          onClick={handlePrev}
          aria-label="Previous product"
          title="Previous product"
        >
          <FaChevronLeft />
        </button>

        {/* 3D Perspective Stage */}
        <div className="depth-stage">
          {SHOWCASE_ITEMS.map((item, index) => {
            // Circular offset calculation relative to activeIndex
            let offset = (index - activeIndex + total) % total
            if (offset > total / 2) {
              offset -= total
            }

            const isActive = offset === 0

            return (
              <div
                key={item.id}
                className={`depth-product-slot ${isActive ? 'is-active' : 'is-side'}`}
                data-offset={offset}
                onClick={() => handleProductClick(index, offset, item)}
                role="button"
                tabIndex={0}
                aria-label={item.name}
                title={isActive ? `${item.name} (Click to view details)` : item.name}
              >
                <div className="depth-product-stage">
                  {/* Radial backlight glow behind product bottle */}
                  <div
                    className="depth-product-glow"
                    style={{
                      background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* Pure Product Image */}
                  <img
                    src={item.packagingImage}
                    alt={item.name}
                    className="depth-product-img"
                    loading={isActive ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.currentTarget.src = item.cardImage
                    }}
                  />

                  {/* Stage shadow underneath bottle */}
                  <div className="depth-product-shadow" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Arrow Right */}
        <button
          className="depth-nav-arrow depth-nav-next"
          onClick={handleNext}
          aria-label="Next product"
          title="Next product"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Bottom Controls: Minimal Pagination Indicators + Autoplay Toggle */}
      <div className="depth-bottom-controls">
        <div className="depth-pagination" role="tablist" aria-label="Product slides">
          {SHOWCASE_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              className={`depth-pagination-dot ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => {
                setActiveIndex(idx)
                isInteracting.current = true
                setTimeout(() => {
                  isInteracting.current = false
                }, 1000)
              }}
              aria-label={`View ${item.name}`}
              title={item.name}
            />
          ))}
        </div>

        <button
          className={`depth-autoplay-toggle ${isAutoPlaying ? 'is-playing' : 'is-paused'}`}
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          aria-label={isAutoPlaying ? 'Pause rotation' : 'Start auto-rotation'}
          title={isAutoPlaying ? 'Pause 3D auto-rotation' : 'Start 3D auto-rotation'}
        >
          {isAutoPlaying ? <FaPause size={9} /> : <FaPlay size={9} />}
          <span>{isAutoPlaying ? 'Auto-Flow ON' : 'Paused'}</span>
        </button>
      </div>
    </section>
  )
}

export default MoodSelector