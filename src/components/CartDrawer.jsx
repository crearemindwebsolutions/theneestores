import { useState, useEffect, useRef } from 'react'
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
    addToCart,
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
  const itemsListRef = useRef(null)

  // Lock body scroll and pause smooth scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const initialHash = window.location.hash
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      if (window.__lenis) window.__lenis.stop()

      // Prevent background home page scroll when touching drawer, footer, or non-scrollable list
      const handlePreventBackgroundTouch = (e) => {
        const listEl = itemsListRef.current
        if (listEl && listEl.contains(e.target)) {
          if (listEl.scrollHeight > listEl.clientHeight) {
            return
          }
        }
        if (e.cancelable) {
          e.preventDefault()
        }
      }

      window.addEventListener('touchmove', handlePreventBackgroundTouch, { passive: false })

      return () => {
        window.removeEventListener('touchmove', handlePreventBackgroundTouch)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        // Only restore previous scroll position if route didn't change!
        // If user proceeded to checkout or another page, start at top (0, 0)
        if (window.location.hash === initialHash) {
          window.scrollTo(0, scrollY)
        } else {
          window.scrollTo(0, 0)
        }
        if (window.__lenis) {
          window.__lenis.start()
          if (window.location.hash !== initialHash) {
            window.__lenis.scrollTo(0, { immediate: true })
          }
        }
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
        {/* Mobile bottom sheet grab handle */}
        <div className="cart-sheet-handle" />

        {/* HEADER */}
        <div className="cart-header">
          <div className="cart-header-title">
            <h3>Your Herbal Cart</h3>
            <span className="cart-count-pill">{totalCount} {totalCount === 1 ? 'item' : 'items'}</span>
          </div>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Free delivery progress bar */}
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
            <div className="cart-items-list" ref={itemsListRef} data-lenis-prevent>
              {cartItems.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <div className="cart-item-card-left">
                    <div className="cart-item-img-box">
                      <ImageWithSkeleton
                        src={item.cardImage}
                        alt={item.name}
                        className="cart-item-card-img"
                        skeletonBorderRadius="8px"
                      />
                    </div>
                  </div>

                  <div className="cart-item-card-right">
                    <div className="cart-item-card-header">
                      <h4 className="cart-item-card-name">{item.name}</h4>
                      <button
                        className="cart-item-delete-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>

                    <div className="cart-item-card-sub">
                      <span className="cart-item-vol-pill">{item.volume}</span>
                    </div>

                    <div className="cart-item-card-footer">
                      <div className="cart-stepper">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          type="button"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-pricing">
                        <span className="cart-item-now-price">₹{item.price * item.quantity}</span>
                        {item.originalPrice > item.price && (
                          <span className="cart-item-was-price">
                            ₹{item.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Purity Guarantee Strip */}
              <div className="cart-purity-strip">
                <span>🌾 Tenkasi Heritage</span>
                <span>•</span>
                <span>👩‍🌾 Handcrafted by Women</span>
                <span>•</span>
                <span>✨ 100% Pure</span>
              </div>
            </div>

            <div className="cart-footer">
              {/* COMPACT SLEEK PROMO SECTION */}
              <div className="cart-promo-section">
                {appliedCoupon ? (
                  <div className="cart-promo-applied">
                    <div className="cart-promo-applied-info">
                      <span className="cart-promo-tag-icon">🏷️</span>
                      <strong className="cart-promo-code">{appliedCoupon.code}</strong>
                      <span className="cart-promo-savings">−₹{couponDiscount}</span>
                    </div>
                    <button
                      type="button"
                      className="cart-promo-remove-btn"
                      onClick={removeCoupon}
                      title="Remove coupon"
                      aria-label="Remove coupon"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-promo-input-row">
                      <div className="cart-promo-input-wrap">
                        <span className="cart-promo-icon">🎟️</span>
                        <input
                          type="text"
                          className="cart-promo-input"
                          placeholder="Coupon code"
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
                      </div>
                      <button
                        type="button"
                        className="cart-promo-apply-btn"
                        onClick={() => handleApplyCoupon()}
                        disabled={!couponInput.trim()}
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && <p className="cart-promo-error">⚠️ {couponError}</p>}
                  </>
                )}
              </div>

              {/* PRICING BREAKDOWN */}
              <div className="cart-summary-box">
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
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'cart-free-tag' : ''}>
                    {deliveryFee === 0 ? 'FREE' : '₹40'}
                  </span>
                </div>
                <div className="cart-summary-total">
                  <span>Total Payable</span>
                  <span className="cart-total-price">₹{grandTotal}</span>
                </div>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                type="button"
                className="cart-checkout-next-btn"
                onClick={handleProceedToCheckout}
              >
                <span>Proceed to Checkout</span>
                <span className="cart-checkout-pill-price">₹{grandTotal}</span>
                <span className="cart-checkout-next-arrow">➔</span>
              </button>

              <div className="cart-security-badge-row">
                <span>🔒 100% Safe Payments</span>
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
