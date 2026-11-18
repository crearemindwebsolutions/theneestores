import useReveal from '../lib/useReveal'
import './Testimonial.css'

const Star = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#C6A15B">
    <path d="M12 2.5l2.9 6.4 7 .7-5.3 4.7 1.6 6.9-6.2-3.7-6.2 3.7 1.6-6.9L2.1 9.6l7-.7L12 2.5Z" />
  </svg>
)

const Testimonial = () => {
  const sectionRef = useReveal([
    { selector: '.testimonial-quote', x: -60, duration: 0.8 },
    { selector: '.testimonial-visual', x: 80, duration: 0.8, start: 'top 75%' },
  ])

  return (
    <section className="testimonial" ref={sectionRef}>
      <div className="testimonial-inner">
        <div className="testimonial-quote">
          <svg className="testimonial-mark" width="52" height="40" viewBox="0 0 36 28" fill="none">
            <path
              d="M10.6 0C4.7 3.4 0 9.6 0 16.6 0 22.9 4.4 28 10.6 28c5.2 0 9-4 9-9 0-4.7-3.4-8.4-7.8-8.4-.9 0-1.7.1-2.3.4C10.2 6.4 13.8 2.6 18.6 0h-8ZM28 0c-5.9 3.4-10.6 9.6-10.6 16.6 0 6.3 4.4 11.4 10.6 11.4 5.2 0 9-4 9-9 0-4.7-3.4-8.4-7.8-8.4-.9 0-1.7.1-2.3.4C27.6 6.4 31.2 2.6 36 0h-8Z"
              fill="currentColor"
            />
          </svg>

          <div className="testimonial-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} />
            ))}
          </div>

          <p>
            &ldquo;THENEE Herbal Tea and Bliss Tea have completely transformed our family&apos;s daily routine.
            The aroma is authentic, our digestion and morning energy have improved drastically, and knowing
            it empowers hard-working rural women in Tamil Nadu makes every sip truly meaningful.&rdquo;
          </p>

          <div className="testimonial-person">
            <span className="testimonial-avatar">RK</span>
            <div>
              <span className="testimonial-name">Rajeshwari K.</span>
              <span className="testimonial-role">Verified Buyer • Chennai</span>
            </div>
          </div>

          <div className="testimonial-stats">
            <div className="testimonial-stat">
              <strong>4.9★</strong>
              <span>Average rating</span>
            </div>
            <div className="testimonial-stat">
              <strong>16,000+</strong>
              <span>Happy Families</span>
            </div>
            <div className="testimonial-stat">
              <strong>100%</strong>
              <span>Village Handcrafted</span>
            </div>
          </div>
        </div>

        <div className="testimonial-visual">
          <img
            src="/images/custom_thenee/rural-women-artisans.jpg"
            alt="THENEE Rural Women Artisans"
            className="testimonial-photo"
          />
          <div className="testimonial-badge-over">
            <span>Rooted in Nature</span>
            <strong>Handcrafted by Rural Women in Tenkasi</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
