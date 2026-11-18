import './OfferMarquee.css'

const OFFERS = [
  'CRAFTED BY RURAL WOMEN IN TAMIL NADU',
  '100% PURE & ORGANIC BOTANICALS',
  'FSSAI LICENSED: 22425278000320',
  '16,000+ STRONG HAPPY CUSTOMER FAMILY',
  'ZERO CHEMICALS, ZERO PRESERVATIVES, ZERO ADDED SUGAR',
  'DIRECT FROM KADAYAM, TENKASI VILLAGE ROOTS',
  'FREE SHIPPING ACROSS INDIA OVER ₹499',
]

const OfferMarqueeTrack = () => (
  <div className="offer-track">
    {OFFERS.map((offer) => (
      <span className="offer-item" key={offer}>
        {offer}
        <span className="offer-dot" aria-hidden="true">
          ✦
        </span>
      </span>
    ))}
  </div>
)

const OfferMarquee = () => (
  <div className="offer-marquee">
    <div className="offer-marquee-track">
      <OfferMarqueeTrack />
      <OfferMarqueeTrack aria-hidden="true" />
    </div>
  </div>
)

export default OfferMarquee
