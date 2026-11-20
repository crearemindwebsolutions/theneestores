import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { brandInfo } from '../data/products'
import { orderService, isRealAwb } from '../lib/supabase'
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from '../lib/emailService'
import { getSavedAddresses, saveAddress, updateAddress } from '../lib/addressService'
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

  // Saved addresses list & selection state
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [saveForFuture, setSaveForFuture] = useState(true)
  const [validationPopup, setValidationPopup] = useState(null)

  const handleCloseValidationPopup = () => {
    setValidationPopup(null)
    const el = document.getElementById('checkout-shipping-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Shipping details state (pre-filled from user or saved address)
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    alt_mobile: '',
    email: currentUser?.email || '',
    line1: '',
    line2: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
  })

  // Load existing user & address data on mount
  useEffect(() => {
    try {
      const addrs = getSavedAddresses(currentUser?.email, currentUser?.id)
      setSavedAddresses(addrs)

      const savedUser = localStorage.getItem('thenee_user')
      let name = currentUser?.name || ''
      let phone = currentUser?.contact ? currentUser.contact.replace(/\D/g, '').slice(-10) : ''
      let alt_mobile = ''
      let email = currentUser?.email || ''
      let line1 = ''
      let line2 = ''
      let city = ''
      let district = ''
      let state = 'Tamil Nadu'
      let pincode = ''

      if (savedUser) {
        try {
          const u = JSON.parse(savedUser)
          if (u.name && !name) name = u.name
          if (u.contact && !phone) phone = u.contact.replace(/\D/g, '').slice(-10)
          if (u.alt_mobile && !alt_mobile) alt_mobile = u.alt_mobile
          if (u.email && !email) email = u.email
        } catch {}
      }

      if (Array.isArray(addrs) && addrs.length > 0) {
        const def = addrs.find((a) => a.isDefault) || addrs[0]
        if (def) {
          setSelectedAddressId(def.id)
          if (def.name || def.recipient) name = def.name || def.recipient
          if (def.phone) phone = def.phone
          if (def.alt_mobile) alt_mobile = def.alt_mobile
          if (def.email) email = def.email
          if (def.line1 || def.street) line1 = def.line1 || def.street
          if (def.line2) line2 = def.line2
          if (def.city) city = def.city
          if (def.district) district = def.district || def.city
          if (def.state) state = def.state
          if (def.pincode) pincode = def.pincode
          setIsAddingNewAddress(false)
          setIsEditingAddress(false)
        }
      } else {
        setIsAddingNewAddress(true)
        setIsEditingAddress(true)
      }

      setShippingForm({ name, phone, alt_mobile, email, line1, line2, city, district, state, pincode })
    } catch {
      setIsAddingNewAddress(true)
      setIsEditingAddress(true)
    }
  }, [currentUser])

  // Select an existing address
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id)
    setIsAddingNewAddress(false)
    setIsEditingAddress(false)
    setShippingForm({
      name: addr.name || addr.recipient || currentUser?.name || '',
      phone: addr.phone || currentUser?.contact || '',
      alt_mobile: addr.alt_mobile || '',
      email: addr.email || currentUser?.email || '',
      line1: addr.line1 || addr.street || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      district: addr.district || addr.city || '',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '',
    })
  }

  // Add a brand new address directly during checkout
  const handleStartAddNewAddress = () => {
    setSelectedAddressId(null)
    setIsAddingNewAddress(true)
    setIsEditingAddress(true)
    setShippingForm({
      name: currentUser?.name && !currentUser.name.includes('@') ? currentUser.name : '',
      phone: currentUser?.contact ? currentUser.contact.replace(/\D/g, '').slice(-10) : '',
      alt_mobile: '',
      email: currentUser?.email || '',
      line1: '',
      line2: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
    })
  }

  // Cancel adding new address and switch back to saved address
  const handleCancelAddNewAddress = () => {
    if (savedAddresses.length > 0) {
      const target = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0]
      handleSelectAddress(target)
    }
  }

  // Toggle editing fields for selected address
  const handleToggleEditAddress = () => {
    setIsEditingAddress((prev) => !prev)
  }

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

    if (
      !shippingForm.name.trim() ||
      !shippingForm.phone.trim() ||
      !shippingForm.line1.trim() ||
      !shippingForm.city.trim() ||
      !shippingForm.district.trim() ||
      !shippingForm.pincode.trim()
    ) {
      setValidationPopup({
        title: 'Delivery Details Required',
        message: 'Please fill in recipient name, mobile number, line 1 street address, city, district, and pincode.',
      })
      if (savedAddresses.length > 0 && !isAddingNewAddress && !isEditingAddress) {
        setIsEditingAddress(true)
      }
      return
    }

    const cleanPhone = shippingForm.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setValidationPopup({
        title: 'Valid Mobile Number Required',
        message: 'Please enter a valid 10-digit mobile number for courier dispatch updates.',
      })
      if (savedAddresses.length > 0 && !isAddingNewAddress && !isEditingAddress) {
        setIsEditingAddress(true)
      }
      return
    }

    const cleanPin = shippingForm.pincode.replace(/\D/g, '')
    if (cleanPin.length !== 6) {
      setValidationPopup({
        title: 'Valid 6-Digit Pincode Required',
        message: 'Please enter a valid 6-digit postal pincode for India Post Speed Post delivery.',
      })
      if (savedAddresses.length > 0 && !isAddingNewAddress && !isEditingAddress) {
        setIsEditingAddress(true)
      }
      return
    }

    setIsProcessingPayment(true)

    // Automatically store address in database / address book for future orders
    try {
      if (savedAddresses.length === 0 || isAddingNewAddress) {
        if (saveForFuture || savedAddresses.length === 0) {
          const updated = saveAddress(
            {
              name: shippingForm.name,
              recipient: shippingForm.name,
              phone: shippingForm.phone,
              alt_mobile: shippingForm.alt_mobile,
              email: shippingForm.email,
              line1: shippingForm.line1,
              line2: shippingForm.line2,
              street: shippingForm.line1,
              city: shippingForm.city,
              district: shippingForm.district,
              state: shippingForm.state,
              pincode: shippingForm.pincode,
              type: 'Home',
              isDefault: savedAddresses.length === 0,
            },
            currentUser?.email,
            currentUser?.id
          )
          if (Array.isArray(updated) && updated.length > 0) {
            setSavedAddresses(updated)
            setSelectedAddressId(updated[0].id)
          }
        }
      } else if (selectedAddressId && isEditingAddress && saveForFuture) {
        const updated = updateAddress(
          selectedAddressId,
          {
            name: shippingForm.name,
            recipient: shippingForm.name,
            phone: shippingForm.phone,
            alt_mobile: shippingForm.alt_mobile,
            email: shippingForm.email,
            line1: shippingForm.line1,
            line2: shippingForm.line2,
            street: shippingForm.line1,
            city: shippingForm.city,
            district: shippingForm.district,
            state: shippingForm.state,
            pincode: shippingForm.pincode,
          },
          currentUser?.email,
          currentUser?.id
        )
        if (Array.isArray(updated) && updated.length > 0) {
          setSavedAddresses(updated)
        }
      }
    } catch (saveErr) {
      console.warn('Address auto-save notice:', saveErr)
    }

    const orderId = `#THN-${Math.floor(80000 + Math.random() * 19000)}`
    const awbId = null
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const orderItems = cartItems.map((item) => ({
      name: `${item.name}${item.volume ? ` (${item.volume})` : ''}`,
      qty: item.quantity,
      price: item.price,
      image: item.cardImage,
    }))

    const destinationText = [shippingForm.city, shippingForm.district, shippingForm.state].filter(Boolean).join(', ')
    const fullAddressText = [
      shippingForm.line1,
      shippingForm.line2,
      shippingForm.city,
      shippingForm.district,
      `${shippingForm.state} - ${shippingForm.pincode}`,
    ].filter(Boolean).join(', ')

    const shippingAddressPayload = {
      recipient: shippingForm.name,
      recipient_name: shippingForm.name,
      name: shippingForm.name,
      phone: shippingForm.phone,
      alt_mobile: shippingForm.alt_mobile,
      email: shippingForm.email || currentUser?.email || '',
      line1: shippingForm.line1,
      line2: shippingForm.line2,
      street: shippingForm.line1,
      address: shippingForm.line1,
      area: shippingForm.line2,
      city: shippingForm.city,
      district: shippingForm.district,
      state: shippingForm.state,
      pincode: shippingForm.pincode,
    }

    const newOrder = {
      id: orderId,
      date: dateStr,
      items: orderItems,
      total: grandTotal,
      subtotal,
      discount: couponDiscount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      deliveryFee,
      status: 'Processing',
      order_status: 'Processing',
      step: 2,
      courier: 'India Post Speed Post',
      awb: null,
      tracking_awb: null,
      paymentMethod: 'Online Payment (UPI, Cards, NetBanking)',
      destination: destinationText || `${shippingForm.city || 'Tamil Nadu'}, ${shippingForm.state}`,
      address: fullAddressText,
      recipient: shippingForm.name,
      phone: shippingForm.phone,
      alt_mobile: shippingForm.alt_mobile,
      email: shippingForm.email || currentUser?.email || '',
      shipping_address: shippingAddressPayload,
      timeline: [
        { title: 'Payment Authorized & Order Received', time: `${dateStr}, ${timeStr}`, done: true },
        { title: 'Processing & Handcrafting at Tenkasi Rural Unit', time: 'In Progress', done: true },
        { title: 'Dispatch via Courier', time: 'Updated soon', done: false },
        { title: 'Out for Delivery', time: 'Updated soon', done: false },
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
        status: 'Processing',
        order_status: 'Processing',
        courier: 'India Post Speed Post',
        awb: null,
        tracking_awb: null,
        payment_method: 'Online Payment (UPI, Cards, NetBanking)',
        shipping_address: shippingAddressPayload,
        timeline: newOrder.timeline,
      })
    } catch (dbErr) {
      console.warn('Supabase order creation skipped/errored:', dbErr)
    }

    // Trigger Resend automated emails (Customer receipt & Store owner alert)
    try {
      const targetCustomerEmail = shippingForm.email || currentUser?.email
      if (targetCustomerEmail && targetCustomerEmail.includes('@')) {
        sendOrderConfirmationEmail(newOrder, targetCustomerEmail).catch((mailErr) => {
          console.warn('Customer confirmation email notice:', mailErr)
        })
      }
      sendAdminOrderAlertEmail(newOrder).catch((adminMailErr) => {
        console.warn('Admin order alert notice:', adminMailErr)
      })
    } catch (emailNotice) {
      console.warn('Resend email trigger skipped:', emailNotice)
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
              <span className="back-arrow">←</span>
              <span className="back-text-full">Return to Store</span>
              <span className="back-text-short">Store</span>
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
            <span className="back-arrow">←</span>
            <span className="back-text-full">Return to Store</span>
            <span className="back-text-short">Store</span>
          </button>

          <div className="checkout-brand-logo">
            <span className="logo-main">THENEE</span>
            <span className="logo-sub">Roots of Nature</span>
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
                  {isRealAwb(confirmedOrder.awb || confirmedOrder.tracking_awb) ? (
                    <>📦 {confirmedOrder.courier || 'India Post Speed Post'} ({confirmedOrder.awb || confirmedOrder.tracking_awb})</>
                  ) : (
                    <span style={{ color: '#854D0E', background: '#FEF9C3', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                      Updated soon
                    </span>
                  )}
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
              <section className="checkout-card-section" id="checkout-shipping-section">
                <div className="checkout-section-header">
                  <span className="section-step-num">1</span>
                  <div>
                    <h3>Delivery & Shipping Address</h3>
                    <p>Enter the postal address where you would like your package delivered.</p>
                  </div>
                </div>

                {/* SAVED ADDRESS SELECTOR (When saved addresses exist) */}
                {savedAddresses.length > 0 && (
                  <div className="checkout-saved-addresses-block">
                    <div className="checkout-addresses-header-row">
                      <span className="checkout-saved-badge">
                        📍 Saved in your Address Book ({savedAddresses.length})
                      </span>
                      {!isAddingNewAddress ? (
                        <button
                          type="button"
                          className="checkout-add-new-pill-btn"
                          onClick={handleStartAddNewAddress}
                        >
                          + Add New Address
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="checkout-cancel-new-btn"
                          onClick={handleCancelAddNewAddress}
                        >
                          ← Use Saved Address
                        </button>
                      )}
                    </div>

                    {!isAddingNewAddress && (
                      <div className="checkout-address-cards-grid">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id
                          return (
                            <div
                              key={addr.id}
                              className={`checkout-addr-card ${isSelected ? 'is-selected' : ''}`}
                              onClick={() => handleSelectAddress(addr)}
                            >
                              <div className="checkout-addr-card-top">
                                <div className="checkout-addr-radio-wrap">
                                  <span className={`checkout-addr-radio ${isSelected ? 'checked' : ''}`} />
                                  <span className="checkout-addr-type-chip">{addr.type || 'Home'}</span>
                                  {addr.isDefault && <span className="checkout-addr-def-chip">Default</span>}
                                </div>
                                {isSelected && (
                                  <button
                                    type="button"
                                    className="checkout-addr-edit-btn"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToggleEditAddress()
                                    }}
                                  >
                                    {isEditingAddress ? 'Done Editing' : '✏️ Modify for this order'}
                                  </button>
                                )}
                              </div>

                              <div className="checkout-addr-card-body">
                                <strong className="checkout-addr-name">{addr.name || addr.recipient}</strong>
                                <p className="checkout-addr-line">{addr.line1 || addr.street}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                                <p className="checkout-addr-line">
                                  {addr.city}, {addr.district ? `${addr.district}, ` : ''}{addr.state} - <strong>{addr.pincode}</strong>
                                </p>
                                <p className="checkout-addr-phone">📞 +91 {addr.phone}{addr.alt_mobile ? ` · Alt: +91 ${addr.alt_mobile}` : ''}</p>
                              </div>

                              {isSelected && !isEditingAddress && (
                                <div className="checkout-addr-selected-tag">
                                  ✓ Selected for Delivery
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* FORM FIELDS: Shown when adding new, editing selected, or no saved addresses */}
                {(savedAddresses.length === 0 || isAddingNewAddress || isEditingAddress) && (
                  <div className="checkout-form-grid animated-fade-in">
                    {isAddingNewAddress && savedAddresses.length > 0 && (
                      <div className="checkout-adding-new-header">
                        <div className="checkout-adding-new-title">
                          <strong>➕ Entering New Delivery Address</strong>
                          <span>This order will be dispatched to this new address.</span>
                        </div>
                      </div>
                    )}

                    {isEditingAddress && !isAddingNewAddress && (
                      <div className="checkout-editing-hint">
                        <span>✏️ You are modifying the delivery details for this order:</span>
                      </div>
                    )}

                    <div className="form-field">
                      <label>Recipient Name *</label>
                      <input
                        type="text"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        placeholder="Recipient Name"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Line 1 (Street) *</label>
                      <input
                        type="text"
                        value={shippingForm.line1}
                        onChange={(e) => setShippingForm({ ...shippingForm, line1: e.target.value })}
                        placeholder="Door / Flat, Building, Street"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Line 2 (Area/Apt)</label>
                      <input
                        type="text"
                        value={shippingForm.line2}
                        onChange={(e) => setShippingForm({ ...shippingForm, line2: e.target.value })}
                        placeholder="Area / Landmark"
                      />
                    </div>

                    <div className="form-field-row three-cols">
                      <div className="form-field">
                        <label>City *</label>
                        <input
                          type="text"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>District *</label>
                        <input
                          type="text"
                          value={shippingForm.district}
                          onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })}
                          placeholder="District"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>State *</label>
                        <input
                          type="text"
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field-row three-cols">
                      <div className="form-field">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={shippingForm.pincode}
                          onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value.replace(/\D/g, '') })}
                          placeholder="Pincode"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>Mobile *</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="+91 75502..."
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>Alt Mobile</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={shippingForm.alt_mobile}
                          onChange={(e) => setShippingForm({ ...shippingForm, alt_mobile: e.target.value.replace(/\D/g, '') })}
                          placeholder="Alternate"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Email Address (For Order Tracking Receipt)</label>
                      <input
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                      />
                    </div>

                    <div className="checkout-save-address-row">
                      <label className="checkout-save-checkbox-label">
                        <input
                          type="checkbox"
                          checked={saveForFuture}
                          onChange={(e) => setSaveForFuture(e.target.checked)}
                        />
                        <span>
                          {savedAddresses.length === 0
                            ? 'Save this address in my account for 1-tap reordering'
                            : isAddingNewAddress
                            ? 'Save this new address in my account for future orders'
                            : 'Save these updates to my address book for future orders'}
                        </span>
                      </label>
                      {savedAddresses.length === 0 && (
                        <span className="checkout-auto-save-hint">
                          🌿 Because this is your first delivery address, it will be automatically remembered so your future checkouts are instant. You can also add or edit addresses anytime in your Account page.
                        </span>
                      )}
                    </div>
                  </div>
                )}
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

      {/* SMALL IN-WEBSITE VALIDATION POPUP */}
      {validationPopup && (
        <div
          className="checkout-validation-backdrop"
          onClick={handleCloseValidationPopup}
          data-lenis-prevent
        >
          <div
            className="checkout-validation-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="checkout-validation-header">
              <div className="checkout-validation-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <button
                type="button"
                className="checkout-validation-close-btn"
                onClick={handleCloseValidationPopup}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <h3 className="checkout-validation-title">
              {validationPopup.title || 'Delivery Details Required'}
            </h3>

            <p className="checkout-validation-msg">
              {validationPopup.message}
            </p>

            <div className="checkout-validation-actions">
              <button
                type="button"
                className="checkout-validation-btn"
                onClick={handleCloseValidationPopup}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
