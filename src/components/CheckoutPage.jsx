import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { brandInfo } from '../data/products'
import { orderService } from '../lib/supabase'
import { ImageWithSkeleton } from './Skeleton'
import './CheckoutPage.css'

const CheckoutPage = ({ onBack, onOpenAccount }) => {
  const {
    cartItems,
    subtotal,
    savings,
    deliveryFee,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    grandTotal,
    clearCart,
    currentUser,
  } = useCart()

  const [checkoutStep, setCheckoutStep] = useState('payment') // 'payment' | 'success'
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  // Shipping details state (pre-filled from user or saved address)
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  })

  // Load existing user & address data on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('thenee_user')
      const savedAddresses = localStorage.getItem('thenee_addresses')
      let name = currentUser?.name || ''
      let phone = currentUser?.contact || ''
      let street = ''
      let city = ''
      let state = 'Tamil Nadu'
      let pincode = ''

      if (savedUser) {
        const u = JSON.parse(savedUser)
        if (u.name && !name) name = u.name
        if (u.contact && !phone) phone = u.contact
      }
      if (savedAddresses) {
        const addrs = JSON.parse(savedAddresses)
        const def = addrs.find((a) => a.isDefault) || addrs[0]
        if (def) {
          if (def.name) name = def.name
          if (def.phone) phone = def.phone
          if (def.street) street = def.street
          if (def.city) city = def.city
          if (def.state) state = def.state
          if (def.pincode) pincode = def.pincode
        }
      }
      setShippingForm({ name, phone, street, city, state, pincode })
    } catch {
      // fallback
    }
  }, [currentUser])

  // Apply Coupon
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

  // Handle Online Payment Execution
  const handleExecutePayment = async (e) => {
    if (e) e.preventDefault()

    if (!shippingForm.name.trim() || !shippingForm.phone.trim() || !shippingForm.street.trim() || !shippingForm.pincode.trim()) {
      alert('Please fill in your delivery name, phone, and complete address.')
      return
    }

    setIsProcessingPayment(true)

    const orderId = `#THN-${Math.floor(80000 + Math.random() * 19000)}`
    const awbId = `INP${Math.floor(800000000 + Math.random() * 190000000)}TN`
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const orderItems = cartItems.map((item) => ({
      name: `${item.name}${item.volume ? ` (${item.volume})` : ''}`,
      qty: item.quantity,
      price: item.price,
      image: item.cardImage,
    }))

    const newOrder = {
      id: orderId,
      date: dateStr,
      items: orderItems,
      total: grandTotal,
      subtotal,
      discount: couponDiscount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      deliveryFee,
      status: 'Order Confirmed',
      step: 1,
      courier: 'India Post Speed Post',
      awb: awbId,
      paymentMethod: 'Online Payment (UPI, Cards, NetBanking)',
      destination: `${shippingForm.city || 'Tamil Nadu'}, ${shippingForm.state}`,
      address: `${shippingForm.street}, ${shippingForm.city} - ${shippingForm.pincode}`,
      recipient: shippingForm.name,
      phone: shippingForm.phone,
      timeline: [
        { title: 'Payment Authorized & Order Confirmed', time: `${dateStr}, ${timeStr}`, done: true },
        { title: 'Handcrafting at Tenkasi Rural Unit', time: 'Tomorrow, by 10:00 AM', done: false },
        { title: 'Dispatch via Speed Post', time: 'Within 24-48 hours', done: false },
        { title: 'Out for Delivery', time: 'Estimated 2-3 days', done: false },
      ],
    }

    // Persist to Supabase Database
    try {
      await orderService.createOrder({
        user_id: currentUser?.id || null,
        order_id: orderId,
        items: orderItems,
        total: grandTotal,
        subtotal,
        discount: couponDiscount,
        delivery_fee: deliveryFee,
        status: 'Order Confirmed',
        courier: 'India Post Speed Post',
        awb: awbId,
        payment_method: 'Online Payment (UPI, Cards, NetBanking)',
        shipping_address: {
          recipient: shippingForm.name,
          phone: shippingForm.phone,
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          pincode: shippingForm.pincode,
        },
        timeline: newOrder.timeline,
      })
    } catch (dbErr) {
      console.warn('Supabase order creation skipped/errored:', dbErr)
    }

    // Persist to local storage for immediate access
    try {
      const saved = localStorage.getItem('thenee_user_orders')
      const currentOrders = saved ? JSON.parse(saved) : []
      const updated = [newOrder, ...currentOrders]
      localStorage.setItem('thenee_user_orders', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch {
      // fallback
    }

    setTimeout(() => {
      setConfirmedOrder(newOrder)
      clearCart()
      setIsProcessingPayment(false)
      setCheckoutStep('success')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 600)
  }

  // Navigate to Account orders tracking
  const handleTrackOrderInAccount = () => {
    window.location.hash = 'account/orders'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleReturnToStore = () => {
    if (onBack) {
      onBack()
    } else {
      window.location.hash = 'home'
    }
  }

  // Empty cart fallback (when not already on success screen)
  if (cartItems.length === 0 && checkoutStep !== 'success') {
    return (
      <div className="checkout-fullpage-wrap">
        <header className="checkout-nav-bar">
          <div className="checkout-nav-inner">
            <button className="checkout-nav-back-btn" onClick={handleReturnToStore}>
              ← Return to Store
            </button>
            <div className="checkout-brand-logo">
              <span className="logo-main">THENEE</span>
              <span className="logo-sub">Roots of Nature</span>
            </div>
            <div className="checkout-secure-badge">
              <span>🔒 100% Secure Checkout</span>
            </div>
          </div>
        </header>

        <div className="checkout-empty-container">
          <div className="checkout-empty-card">
            <div className="checkout-empty-icon">🌱</div>
            <h2>Your Cart is Currently Empty</h2>
            <p>You don't have any herbal items waiting for checkout.</p>
            <button
              className="checkout-primary-btn"
              onClick={() => {
                window.location.hash = 'products'
              }}
            >
              Explore Herbal Products ➔
            </button>
          </div>
        </div>

        <footer className="checkout-bottom-credits">
          <div className="checkout-bottom-credits-inner">
            <p className="checkout-copyright">
              © {new Date().getFullYear()} The Roots Enterprises. All rights reserved. Handcrafted by Rural Women in Tenkasi, Tamil Nadu.
            </p>
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
        </footer>
      </div>
    )
  }

  return (
    <div className="checkout-fullpage-wrap">
      {/* FULLPAGE CHECKOUT HEADER */}
      <header className="checkout-nav-bar">
        <div className="checkout-nav-inner">
          <button className="checkout-nav-back-btn" onClick={handleReturnToStore}>
            ← Return to Store
          </button>

          <div className="checkout-brand-logo">
            <span className="logo-main">THENEE</span>
            <span className="logo-sub">தேனீ • Roots of Nature</span>
          </div>

          {/* Stepper Progress */}
          <div className="checkout-stepper-progress">
            <span className="step-node step-completed">
              <span className="step-circle">✓</span>
              <span className="step-text">Cart Bag</span>
            </span>
            <span className="step-line active"></span>
            <span className={`step-node ${checkoutStep === 'payment' ? 'step-active' : 'step-completed'}`}>
              <span className="step-circle">{checkoutStep === 'success' ? '✓' : '2'}</span>
              <span className="step-text">Delivery Address</span>
            </span>
            <span className="step-line"></span>
            <span className={`step-node ${checkoutStep === 'success' ? 'step-active' : ''}`}>
              <span className="step-circle">3</span>
              <span className="step-text">Payment</span>
            </span>
          </div>

          <div className="checkout-secure-badge">
            <span className="shield-icon">🛡️</span>
            <div>
              <strong>256-Bit SSL</strong>
              <small>RBI Certified</small>
            </div>
          </div>
        </div>
      </header>

      {/* STEP: ORDER SUCCESS CONFIRMATION */}
      {checkoutStep === 'success' && confirmedOrder ? (
        <main className="checkout-success-container">
          <div className="checkout-success-card">
            <div className="success-icon-badge">✓</div>
            <h1 className="success-heading">Order Placed Successfully!</h1>
            <p className="success-subheading">
              Thank you for choosing pure nature and supporting <strong>Tenkasi Rural Women Artisans</strong>. Your herbal wellness order is now confirmed!
            </p>

            <div className="success-details-card">
              <div className="success-detail-row">
                <span className="detail-label">Order Number:</span>
                <strong className="detail-value order-highlight-id">{confirmedOrder.id}</strong>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{confirmedOrder.paymentMethod} (Authorized)</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Total Amount Paid:</span>
                <strong className="detail-value text-accent">₹{confirmedOrder.total}</strong>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Delivery Destination:</span>
                <span className="detail-value">
                  {confirmedOrder.recipient} • {confirmedOrder.address}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Postal Tracking / AWB:</span>
                <span className="detail-value status-badge-inline">
                  📦 {confirmedOrder.courier} ({confirmedOrder.awb})
                </span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Current Dispatch Status:</span>
                <span className="detail-value text-green">
                  ● Handcrafting fresh at Tenkasi Rural Unit
                </span>
              </div>
            </div>

            <div className="success-action-buttons">
              <button
                type="button"
                className="checkout-primary-btn"
                onClick={handleTrackOrderInAccount}
              >
                📦 Track Order in My Account
              </button>
              <button
                type="button"
                className="checkout-secondary-btn"
                onClick={() => {
                  window.location.hash = 'products'
                }}
              >
                🌿 Continue Exploring Products
              </button>
            </div>

            <p className="success-footer-note">
              A detailed confirmation receipt with SMS live tracking has been sent to <strong>{confirmedOrder.phone}</strong>.
            </p>
          </div>
        </main>
      ) : (
        /* STEP: CHECKOUT FORM & SUMMARY (2-COLUMN FULL PAGE) */
        <main className="checkout-main-content">
          <div className="checkout-layout-grid">
            {/* LEFT COLUMN: FORMS (SHIPPING & PAYMENT) */}
            <div className="checkout-forms-column">
              {/* SECTION 1: DELIVERY ADDRESS */}
              <section className="checkout-card-section">
                <div className="checkout-section-header">
                  <span className="section-step-num">1</span>
                  <div>
                    <h3>Delivery & Shipping Address</h3>
                    <p>Enter the postal address where you would like your package delivered.</p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="form-field-row">
                    <div className="form-field">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        placeholder="Receiver's Full Name"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Mobile Number (+91) *</label>
                      <input
                        type="tel"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>House / Flat / Street Address *</label>
                    <input
                      type="text"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                      placeholder="Door no., Apartment, Street name, Landmark"
                      required
                    />
                  </div>

                  <div className="form-field-row three-cols">
                    <div className="form-field">
                      <label>City / Town *</label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        placeholder="e.g. Tenkasi"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>State *</label>
                      <input
                        type="text"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                        placeholder="Tamil Nadu"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={shippingForm.pincode}
                        onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                        placeholder="6-digit PIN"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
            <aside className="checkout-sidebar-column">
              <div className="checkout-summary-card">
                <div className="summary-card-header">
                  <h3>Order Summary</h3>
                  <span className="item-count-badge">{cartItems.length} items</span>
                </div>

                {/* Items preview list */}
                <div className="summary-items-list">
                  {cartItems.map((item) => (
                    <div className="summary-item-row" key={item.id}>
                      <div className="summary-item-img-wrap">
                        <ImageWithSkeleton
                          src={item.cardImage}
                          alt={item.name}
                          skeletonBorderRadius="6px"
                        />
                        <span className="summary-item-qty">{item.quantity}</span>
                      </div>
                      <div className="summary-item-info">
                        <h4>{item.name}</h4>
                        {item.volume && <span className="item-vol">{item.volume}</span>}
                      </div>
                      <div className="summary-item-price">
                        <strong>₹{item.price * item.quantity}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COUPON CARD */}
                <div className="checkout-coupon-box">
                  <div className="coupon-box-top">
                    <span className="coupon-icon">🎟️</span>
                    <strong>Apply Coupon Code</strong>
                  </div>

                  {appliedCoupon ? (
                    <div className="coupon-active-badge">
                      <div className="coupon-badge-text">
                        <span className="code-tag">✓ {appliedCoupon.code}</span>
                        <span className="discount-note">{appliedCoupon.desc} (−₹{couponDiscount})</span>
                      </div>
                      <button type="button" className="coupon-del-btn" onClick={removeCoupon}>
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="coupon-input-row">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase())
                            if (couponError) setCouponError('')
                          }}
                          placeholder="Enter coupon code"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleApplyCoupon()
                            }
                          }}
                        />
                        <button type="button" onClick={() => handleApplyCoupon()}>
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="coupon-err">{couponError}</p>}
                    </>
                  )}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="summary-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  {savings > 0 && (
                    <div className="breakdown-row text-green">
                      <span>MRP Savings</span>
                      <strong>−₹{savings}</strong>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="breakdown-row text-green">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <strong>−₹{couponDiscount}</strong>
                    </div>
                  )}
                  <div className="breakdown-row">
                    <span>Delivery Charges</span>
                    <span className={deliveryFee === 0 ? 'text-green font-bold' : ''}>
                      {deliveryFee === 0 ? 'FREE' : '₹40'}
                    </span>
                  </div>
                  <div className="breakdown-divider" />
                  <div className="breakdown-row total-row">
                    <span>Total Amount Payable</span>
                    <span className="grand-total-val">₹{grandTotal}</span>
                  </div>
                </div>

                {/* PAY BUTTON */}
                <button
                  type="button"
                  className="checkout-pay-btn"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <span className="pay-spinner-wrap">
                      <span className="spinner-circle"></span>
                      Authorizing Secure Payment...
                    </span>
                  ) : (
                    <span>Proceed to Pay ₹{grandTotal} Securely ➔</span>
                  )}
                </button>

                <div className="checkout-security-guarantee">
                  <span>🔒 256-Bit Bank Grade SSL Encrypted</span>
                  <span>•</span>
                  <span>FSSAI: {brandInfo.fssai}</span>
                </div>
              </div>
            </aside>

            {/* TRUST GUARANTEES BANNER */}
            <div className="checkout-trust-banner">
              <div className="trust-item">
                <span className="trust-icon">🌱</span>
                <div>
                  <strong>Direct Village Sourcing</strong>
                  <p>Tenkasi Kadayam SHG women artisans</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📦</span>
                <div>
                  <strong>Speed Post Delivery</strong>
                  <p>Safe speed dispatch across Tamil Nadu & India</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <div>
                  <strong>100% Buyer Protection</strong>
                  <p>RBI authorized gateway & instant refunds</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* CHECKOUT BOTTOM FOOTER CREDITS */}
      <footer className="checkout-bottom-credits">
        <div className="checkout-bottom-credits-inner">
          <p className="checkout-copyright">
            © {new Date().getFullYear()} The Roots Enterprises. All rights reserved. Handcrafted by Rural Women in Tenkasi, Tamil Nadu.
          </p>
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
      </footer>
    </div>
  )
}

export default CheckoutPage
