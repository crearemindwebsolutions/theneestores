import useReveal from '../lib/useReveal'
import './Reviews.css'

const REVIEWS = [
  {
    image: '/images/custom_thenee/herbal-tea-scene.jpg',
    name: 'Kavitha Sundaram',
    location: 'Madurai',
    product: 'Thenee Herbal Tea',
    rating: 5,
    text: "Thenee Herbal Tea is now our family's morning sacred ritual. Our digestion feels so light, internal body heat is balanced, and knowing it is handcrafted by rural women in Tamil Nadu makes it so special.",
  },
  {
    image: '/images/custom_thenee/bliss-tea-scene.jpg',
    name: 'Aarthi Natarajan',
    location: 'Bengaluru',
    product: 'Thenee Bliss Tea',
    rating: 5,
    text: "The vibrant color of butterfly pea & hibiscus flowers is mesmerizing! It's completely caffeine-free, and drinking a warm cup before bed melts away all workday stress.",
  },
  {
    image: '/images/custom_thenee/moringa-scene.jpg',
    name: 'Dr. Senthil Kumar',
    location: 'Coimbatore',
    product: 'Pure Moringa Powder',
    rating: 5,
    text: 'You can immediately tell how freshly shade-dried the leaves are by the rich green color and clean aroma. It provides clean, non-jittery stamina throughout my long hospital shifts.',
  },
  {
    image: '/images/custom_thenee/podis-scene.jpg',
    name: 'Meenakshi Raman',
    location: 'Chennai',
    product: 'Traditional Podis (Poondu & Karuveppilai)',
    rating: 5,
    text: "The Garlic Podi and Curry Leaves Podi bring back memories of my grandmother's cooking in Tirunelveli. Authentic flavors, zero preservatives, and heavenly with hot rice and ghee!",
  },
]

const Star = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#C6A15B' : 'none'}>
    <path
      d="M12 2.5l2.9 6.4 7 .7-5.3 4.7 1.6 6.9-6.2-3.7-6.2 3.7 1.6-6.9L2.1 9.6l7-.7L12 2.5Z"
      stroke="#C6A15B"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
)

const Reviews = () => {
  const sectionRef = useReveal([
    { selector: '.reviews-kicker, .reviews-heading', y: 40, duration: 0.8 },
    { selector: '.review-card', y: 60, scale: 0.9, duration: 0.7, stagger: 0.1, start: 'top 78%' },
  ])

  return (
    <section className="reviews" id="reviews" ref={sectionRef}>
      <span className="reviews-kicker">16,000+ Customer Family</span>
      <h2 className="reviews-heading">Loved By Health-Conscious Homes Across India</h2>
      <div className="reviews-grid">
        {REVIEWS.map((r) => (
          <div className="review-card" key={r.name}>
            <img src={r.image} alt={r.name} className="review-photo" />
            <div className="review-body">
              <div className="review-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} filled={i < r.rating} />
                ))}
              </div>
              <span className="review-product-tag">{r.product}</span>
              <p className="review-text">&ldquo;{r.text}&rdquo;</p>
              <span className="review-name">{r.name}</span>
              <span className="review-role">Verified Buyer • {r.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Reviews
