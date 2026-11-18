import useReveal from '../lib/useReveal'
import { ImageWithSkeleton } from './Skeleton'
import './OfferGallery.css'

const LEFT_CARDS = [
  {
    image: '/images/custom_thenee/bliss-tea-scene.jpg',
    offer: '100% Caffeine-Free',
    sub: 'Sangu Poo & Hibiscus Bliss Tea',
  },
  {
    image: '/images/custom_thenee/rural-women-artisans.jpg',
    offer: '16,000+ Strong Family',
    sub: 'Crafted by Women • Rooted in Nature',
  },
]

const MIDDLE_CARDS = [
  {
    image: '/images/custom_thenee/moringa-scene.jpg',
    offer: 'Pure Moringa Superfood',
    sub: 'Gently shade-dried village leaves',
  },
  {
    image: '/images/custom_thenee/herbal-tea-scene.jpg',
    offer: 'Daily Natural Healing',
    sub: 'Blood sugar, gut & immunity balance',
  },
  {
    image: '/images/custom_thenee/podis-scene.jpg',
    offer: 'Authentic Village Podis',
    sub: 'Garlic, Curry Leaf, Moringa & Ellu',
  },
]

const RIGHT_CARDS = [
  {
    image: '/images/custom_thenee/herbal-harvest-village.jpg',
    offer: 'Kadayam, Tenkasi',
    sub: 'The Roots Enterprises Heritage',
  },
  {
    image: '/images/custom_thenee/whatsapp-order-qr.svg',
    offer: 'Order via WhatsApp',
    sub: 'Direct support & custom combos',
  },
]

const GalleryCard = ({ card, tall }) => (
  <div className={`gallery-card ${tall ? 'is-tall' : 'is-wide'}`}>
    <ImageWithSkeleton
      src={card.image}
      alt=""
      className="gallery-card-img"
      skeletonBorderRadius="16px"
    />
    <div className="gallery-card-overlay">
      <span className="gallery-card-offer">{card.offer}</span>
      <span className="gallery-card-sub">{card.sub}</span>
    </div>
  </div>
)

const OfferGallery = () => {
  const sectionRef = useReveal([
    { selector: '.offer-gallery-header', y: 30, duration: 0.7 },
    { selector: '.offer-gallery-col:first-child .gallery-card', x: -80, duration: 0.8, stagger: 0.12, start: 'top 78%' },
    { selector: '.offer-gallery-col--wide .gallery-card', y: -50, scale: 0.9, duration: 0.8, stagger: 0.1, start: 'top 78%' },
    { selector: '.offer-gallery-col:last-child .gallery-card', x: 80, duration: 0.8, stagger: 0.12, start: 'top 78%' },
  ])

  return (
    <section className="offer-gallery" ref={sectionRef}>
      <svg
        className="offer-gallery-top-wave"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,42.7C672,32,768,32,864,42.7C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
          fill="#FAF9F6"
        />
      </svg>
      <div className="offer-gallery-header">
        <span className="offer-gallery-kicker">Village Heritage & Pure Botanicals</span>
        <h2>Rooted In Nature, Crafted With Care</h2>
      </div>

      <div className="offer-gallery-grid">
        <div className="offer-gallery-col">
          {LEFT_CARDS.map((card, i) => (
            <GalleryCard card={card} tall key={i} />
          ))}
        </div>
        <div className="offer-gallery-col offer-gallery-col--wide">
          {MIDDLE_CARDS.map((card, i) => (
            <GalleryCard card={card} key={i} />
          ))}
        </div>
        <div className="offer-gallery-col">
          {RIGHT_CARDS.map((card, i) => (
            <GalleryCard card={card} tall key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default OfferGallery
