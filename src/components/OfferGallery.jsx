import useReveal from '../lib/useReveal'
import { ImageWithSkeleton } from './Skeleton'
import './OfferGallery.css'

const LEFT_IMAGES = [
  {
    image: '/images/custom_thenee/bliss-tea-scene.jpg',
    alt: 'Botanical tea petals, dried herbs and spices',
  },
  {
    image: '/images/custom_thenee/rural-women-artisans.jpg',
    alt: 'Rural women artisans handcrafting herbs in Tenkasi',
  },
]

const MIDDLE_IMAGES = [
  {
    image: '/images/custom_thenee/moringa-scene.jpg',
    alt: 'Fresh green moringa leaves with morning dew',
  },
  {
    image: '/images/custom_thenee/herbal-tea-scene.jpg',
    alt: 'Herbal tea plantation with natural honey dipper',
  },
  {
    image: '/images/custom_thenee/podis-scene.jpg',
    alt: 'Hot idli and food podis with ghee on banana leaf',
  },
]

const RIGHT_IMAGES = [
  {
    image: '/images/custom_thenee/herbal-harvest-village.jpg',
    alt: 'Western Ghats hills and village paddy fields in Tenkasi',
  },
  {
    image: '/images/custom_thenee/food-podis-product.jpg',
    alt: 'THENEE traditional food podi jars and pouches',
  },
]

const GalleryCard = ({ card, className = '' }) => (
  <div className={`gallery-photo-card ${className}`}>
    <ImageWithSkeleton
      src={card.image}
      alt={card.alt}
      className="gallery-photo-img"
      skeletonBorderRadius="18px"
    />
  </div>
)

const OfferGallery = () => {
  const sectionRef = useReveal([
    { selector: '.offer-gallery-header', y: 30, duration: 0.7 },
    { selector: '.gallery-col-left .gallery-photo-card', x: -60, duration: 0.8, stagger: 0.12, start: 'top 80%' },
    { selector: '.gallery-col-middle .gallery-photo-card', y: 40, scale: 0.95, duration: 0.8, stagger: 0.1, start: 'top 80%' },
    { selector: '.gallery-col-right .gallery-photo-card', x: 60, duration: 0.8, stagger: 0.12, start: 'top 80%' },
  ])

  return (
    <section className="offer-gallery" ref={sectionRef}>
      {/* Decorative Botanical Background Watermark */}
      <div className="gallery-botanical-bg" aria-hidden="true">
        <svg viewBox="0 0 1440 700" fill="none" preserveAspectRatio="xMidYMid slice" className="gallery-botanical-svg">
          <g opacity="0.35" stroke="#BAC8BB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Top-Right cascading leaves */}
            <path d="M1480 -30 C1400 70 1320 170 1250 290 C1200 380 1170 480 1180 590" />
            <path d="M1380 70 C1340 30 1290 30 1250 50 C1285 85 1330 95 1380 70 Z" fill="#D3DDD4" fillOpacity="0.45" />
            <path d="M1340 130 C1370 175 1415 175 1455 150 C1420 130 1375 120 1340 130 Z" fill="#D3DDD4" fillOpacity="0.45" />
            <path d="M1295 210 C1255 190 1210 200 1175 235 C1210 255 1260 245 1295 210 Z" fill="#D3DDD4" fillOpacity="0.45" />
            <path d="M1260 295 C1295 335 1340 335 1380 310 C1345 290 1300 280 1260 295 Z" fill="#D3DDD4" fillOpacity="0.45" />
            <path d="M1220 390 C1180 375 1145 395 1120 430 C1155 450 1200 435 1220 390 Z" fill="#D3DDD4" fillOpacity="0.45" />

            {/* Left & Bottom-Left subtle foliage */}
            <path d="M-40 680 C40 540 110 400 130 260 C140 170 120 80 80 -20" />
            <path d="M60 540 C95 505 130 505 160 535 C130 555 95 560 60 540 Z" fill="#D3DDD4" fillOpacity="0.4" />
            <path d="M95 420 C60 390 25 395 5 425 C35 440 70 440 95 420 Z" fill="#D3DDD4" fillOpacity="0.4" />
            <path d="M120 300 C155 270 190 275 220 305 C190 320 155 320 120 300 Z" fill="#D3DDD4" fillOpacity="0.4" />
            <path d="M125 180 C95 155 60 160 40 190 C70 205 105 200 125 180 Z" fill="#D3DDD4" fillOpacity="0.4" />
          </g>
        </svg>
      </div>

      <div className="offer-gallery-header">
        <span className="offer-gallery-kicker">Village Heritage & Pure Botanicals</span>
        <h2 className="offer-gallery-title">Rooted In Nature, Crafted With Care</h2>
      </div>

      <div className="offer-gallery-grid">
        <div className="offer-gallery-col gallery-col-left">
          {LEFT_IMAGES.map((card, i) => (
            <GalleryCard card={card} className="card-left" key={i} />
          ))}
        </div>
        <div className="offer-gallery-col gallery-col-middle">
          {MIDDLE_IMAGES.map((card, i) => (
            <GalleryCard card={card} className="card-middle" key={i} />
          ))}
        </div>
        <div className="offer-gallery-col gallery-col-right">
          {RIGHT_IMAGES.map((card, i) => (
            <GalleryCard card={card} className="card-right" key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default OfferGallery
