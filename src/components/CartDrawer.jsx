import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { ImageWithSkeleton } from './Skeleton'
import './CartDrawer.css'

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalCount,
    subtotal,
    savings,
    freeShippingThreshold,
    amountToFreeShipping,
    isFreeDelivery,
    deliveryFee,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    grandTotal,
    isLoggedIn,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  // Lock body scroll and pause smooth scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
      if (window.__lenis) window.__lenis.stop()
      return () => {
        document.body.style.overflow = ''
        if (window.__lenis) window.__lenis.start()
      }
    } else {
      setCouponError('')
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100)

  // Handle coupon apply
  const handleApplyCoupon = (codeToApply) => {
    const targetCode = (codeToApply || couponInput).trim()
    if (!targetCode) {
      setCouponError('Please enter a coupon code.')
      return
    }
    const result = applyCoupon(targetCode)
    if (result.success) {
      setCouponInput('')
      setCouponError('')
    } else {
      setCouponError(result.message)
    }
  }

  // Opens Checkout in Dedicated FULL PAGE (or redirects to Login if unauthenticated)
  const handleProceedToCheckout = () => {
    closeCart()
    if (!isLoggedIn) {
      sessionStorage.setItem('thenee_login_redirect', 'checkout')
      window.location.hash = 'login'
    } else {
      window.location.hash = 'checkout'
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div className="cart-backdrop" onClick={closeCart}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart Bag"
        data-lenis-prevent
      >
        {/* HEADER */}
        <div className="cart-header">
          <div className="cart-header-title">
            <h3>Your Herbal Cart</h3>
            <span className="cart-count-pill">{totalCount} items</span>
          </div>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Free delivery progress - shown when cart has items */}
        {cartItems.length > 0 && (
          <div className="cart-shipping-banner">
            <div className="cart-shipping-text">
              {isFreeDelivery ? (
                <span>🎉 You unlocked <strong>FREE Delivery</strong> across India!</span>
              ) : (
                <span>
                  Add <strong>₹{amountToFreeShipping}</strong> more to get <strong>FREE Delivery!</strong>
                </span>
              )}
            </div>
            <div className="cart-shipping-bar">
              <div
                className="cart-shipping-fill"
                style={{ width: `${isFreeDelivery ? 100 : progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🌱</div>
            <h4>Your cart is empty</h4>
            <p>Explore our organic herbal teas and traditional food podis.</p>
            <button
              className="cart-continue-btn"
              onClick={() => {
                closeCart()
                window.location.hash = 'products'
              }}
            >
              Explore Products
            </button>
            <span className="cart-empty-perk">✨ Free shipping on orders above ₹499</span>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-img-wrap">
                    <ImageWithSkeleton
                      src={item.cardImage}
                      alt={item.name}
                      className="cart-item-img"
                      skeletonBorderRadius="8px"
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                    {item.tamilName && (
                      <span className="cart-item-tamil">{item.tamilName}</span>
                    )}
                    <span className="cart-item-volume">{item.volume}</span>
                    <div className="cart-item-bottom">
                      <div className="cart-qty-ctrl">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-price">
                        <strong>₹{item.price * item.quantity}</strong>
                        {item.originalPrice > item.price && (
                          <span className="cart-item-original">
                            ₹{item.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              {/* COUPON CODE APPLICATION BOX */}
              <div className="cart-coupon-card">
                <div className="cart-coupon-header">
                  <span className="cart-coupon-icon">🎟️</span>
                  <span className="cart-coupon-title">Apply Coupon Code</span>
                </div>

                {appliedCoupon ? (
                  <div className="coupon-applied-pill">
                    <div className="coupon-applied-info">
                      <span className="coupon-tag-badge">✓ {appliedCoupon.code}</span>
                      <span className="coupon-desc-text">
                        {appliedCoupon.desc} (−₹{couponDiscount})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="coupon-remove-btn"
                      onClick={removeCoupon}
                      title="Remove coupon"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        className="coupon-text-input"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase())
                          if (couponError) setCouponError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyCoupon()
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="coupon-apply-action-btn"
                        onClick={() => handleApplyCoupon()}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="coupon-error-msg">⚠️ {couponError}</p>}
                  </>
                )}
              </div>

              {/* PRICING BREAKDOWN */}
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>
              {savings > 0 && (
                <div className="cart-summary-row cart-savings">
                  <span>MRP Savings</span>
                  <span className="cart-savings-val">−₹{savings}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="cart-summary-row cart-coupon-savings">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="cart-coupon-val">−₹{couponDiscount}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span>Delivery Charges</span>
                <span className={deliveryFee === 0 ? 'cart-free-tag' : ''}>
                  {deliveryFee === 0 ? 'FREE' : '₹40'}
                </span>
              </div>
              <div className="cart-summary-total">
                <span>Grand Total</span>
                <span className="cart-total-price">₹{grandTotal}</span>
              </div>

              {/* NEXT BUTTON: OPENS DEDICATED FULL CHECKOUT PAGE */}
              <button
                type="button"
                className="cart-checkout-next-btn"
                onClick={handleProceedToCheckout}
              >
                <span>Next: Shipping & Online Payment</span>
                <span className="cart-checkout-next-arrow">➔</span>
              </button>

              <div className="cart-security-badge-row">
                <span>🔒 100% Safe & Secure Online Payment</span>
                <span>•</span>
                <span>UPI / Cards / NetBanking</span>
              </div>

              <div className="cart-drawer-credits">
                <a
                  href="https://www.crearemind.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-crearemind-link"
                  title="Visit Creare Mind (opens in new tab)"
                >
                  <span>POWERED BY</span> <strong>CREARE MIND</strong>
                </a>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
