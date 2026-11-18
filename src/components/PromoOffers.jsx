import { useState } from 'react'
import useReveal from '../lib/useReveal'
import { useCart } from '../context/CartContext'
import './PromoOffers.css'

const TILES = [
  {
    image: '/images/custom_thenee/herbal-tea-scene.jpg',
    heading: '15% Off Your First Order',
    body: 'Use code THENEE15 at checkout or on WhatsApp.',
    cta: 'Claim Code: THENEE15',
    action: 'coupon',
    icon: (
      <path
        d="M4 12.5 12.5 4h6a1.5 1.5 0 0 1 1.5 1.5v6L11.5 20 4 12.5Z M15.5 8.5h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    image: '/images/custom_thenee/podis-scene.jpg',
    heading: 'Free Shipping Over ₹499',
    body: 'Free delivery across India on all orders above ₹499.',
    cta: 'Shop Now',
    action: 'shop',
    icon: (
      <path
        d="M2 7h11v9H2V7Zm11 3h4l3 3v3h-7v-6ZM5.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm12 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
]

const PromoOffers = () => {
  const { openCart } = useCart()
  const [copied, setCopied] = useState(false)
  const sectionRef = useReveal([
    { selector: '.promo-tile', y: 50, duration: 0.75, stagger: 0.14, start: 'top 82%' },
  ])

  return (
    <section className="promo-offers" ref={sectionRef}>
      <div className="promo-offers-grid">
        {TILES.map((t) => (
          <div className="promo-tile" key={t.heading} style={{ backgroundImage: `url('${t.image}')` }}>
            <div className="promo-tile-overlay" />
            <span className="promo-tile-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {t.icon}
              </svg>
            </span>
            <div className="promo-tile-content">
              <h3>{t.heading}</h3>
              <p>{t.body}</p>
              <button
                className="promo-tile-btn"
                onClick={() => {
                  if (t.action === 'coupon') {
                    navigator.clipboard?.writeText('THENEE15')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2500)
                    openCart()
                  } else {
                    window.location.hash = 'products'
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  }
                }}
              >
                {t.action === 'coupon' && copied ? '✓ Code Copied!' : t.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PromoOffers
