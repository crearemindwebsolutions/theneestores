import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { products, individualPodis, brandInfo } from '../data/products'
import { orderService, profileService } from '../lib/supabase'
import { SkeletonOrderCard, ImageWithSkeleton } from './Skeleton'
import LoginPage from './LoginPage'
import Footer from './Footer'
import './AccountPage.css'

const COUPONS = [
  { code: 'HERBALFIRST', discount: '15% OFF', desc: 'Valid on your first order above ₹399', minOrder: 399 },
  { code: 'ROOTS50', discount: 'Flat ₹50 OFF', desc: 'Flat discount on all herbal teas & podis', minOrder: 499 },
  { code: 'FREESHIP', discount: 'Free Shipping', desc: 'Zero delivery fee across Tamil Nadu', minOrder: 299 },
]

const TAB_TITLES = {
  orders: 'My Orders & Consignments',
  addresses: 'Saved Delivery Addresses',
  rewards: 'Green Rewards & Coupons',
  wishlist: 'My Herbal Wishlist',
  wellness: 'Wellness Health & Rural Impact',
  profile: 'Profile & Preferences',
}

const AccountPage = ({ onBack, onLogout }) => {
  const { totalCount, openCart, addToCart, currentUser, isLoggedIn, logoutUser } = useCart()

  // Track active sub-view ('hub' = main profile options view, or specific subpage)
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash.startsWith('account/')) {
      return hash.split('/')[1] || 'hub'
    }
    return 'hub'
  })

  const [isLoadingTab, setIsLoadingTab] = useState(false)
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null)
  const [copiedCoupon, setCopiedCoupon] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // Strictly guard: without login, no user can open account page!
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={() => setActiveTab('hub')}
        onBack={onBack}
      />
    )
  }

  useEffect(() => {
    setIsLoadingTab(true)
    const timer = setTimeout(() => setIsLoadingTab(false), 200)
    return () => clearTimeout(timer)
  }, [activeTab])

  // Orders State (loaded from Supabase / localStorage)
  const [ordersList, setOrdersList] = useState(() => {
    try {
      const saved = localStorage.getItem('thenee_user_orders')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // User State
  const [user, setUser] = useState(() => {
    return currentUser || {
      name: 'Valued Customer',
      contact: '',
      email: '',
      joinedDate: 'Nov 2026',
      points: 0,
      language: 'English',
      healthGoals: ['Blood Sugar Control', 'Internal Body Cooling', 'Gut Health'],
    }
  })

  // Fetch Supabase data on mount / auth change
  useEffect(() => {
    let isMounted = true
    const loadSupabaseData = async () => {
      if (currentUser?.id) {
        try {
          const res = await orderService.getUserOrders(currentUser.id)
          const dbOrders = res?.data || (Array.isArray(res) ? res : null)
          if (isMounted && dbOrders && dbOrders.length > 0) {
            setOrdersList(dbOrders)
            localStorage.setItem('thenee_user_orders', JSON.stringify(dbOrders))
          }
        } catch (e) {
          console.warn('Could not fetch orders from Supabase:', e)
        }

        try {
          const res = await profileService.getProfile(currentUser.id)
          const profile = res?.data || res
          if (isMounted && profile) {
            setUser((prev) => ({
              ...prev,
              ...profile,
              name: profile.full_name || prev.name,
              points: profile.reward_points ?? profile.green_points ?? prev.points,
            }))
          }
        } catch (e) {
          console.warn('Could not fetch profile from Supabase:', e)
        }
      }
    }
    loadSupabaseData()
    return () => {
      isMounted = false
    }
  }, [currentUser])

  // Re-sync orders when tab changes or storage updates
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('thenee_user_orders')
        if (saved) {
          setOrdersList(JSON.parse(saved))
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      setUser((prev) => ({
        ...prev,
        ...currentUser,
        name: currentUser.name || prev.name,
      }))
    }
  }, [currentUser])

  // Saved Addresses
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('thenee_addresses')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // New Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    type: 'Home',
  })

  // Wishlist State
  const [wishlist, setWishlist] = useState([
    products[1], // Thenee Bliss Tea
    individualPodis[0], // Garlic Podi
    individualPodis[2], // Moringa Podi
  ])

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    email: user.email || '',
    contact: user.contact || '',
    language: user.language || 'English',
  })

  useEffect(() => {
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      contact: user.contact || '',
      language: user.language || 'English',
    })
  }, [user])

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash.startsWith('account/')) {
        const sub = hash.split('/')[1]
        setActiveTab(sub || 'hub')
      } else if (hash === 'account') {
        setActiveTab('hub')
      }
    }

    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const navigateTab = (tab) => {
    setActiveTab(tab)
    if (tab === 'hub') {
      window.location.hash = 'account'
    } else {
      window.location.hash = `account/${tab}`
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    showToast(`Coupon code "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCoupon(''), 3000)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const updated = { ...user, ...profileForm }
    setUser(updated)
    localStorage.setItem('thenee_user', JSON.stringify(updated))
    if (currentUser?.id) {
      try {
        await profileService.updateProfile(currentUser.id, {
          full_name: profileForm.name,
          contact: profileForm.contact,
          email: profileForm.email,
          language: profileForm.language,
        })
      } catch (err) {
        console.warn('Supabase profile update warning:', err)
      }
    }
    showToast('Profile information saved successfully!')
  }

  const handleAddAddress = (e) => {
    e.preventDefault()
    if (!newAddr.name || !newAddr.phone || !newAddr.street || !newAddr.pincode) {
      alert('Please fill out all required address fields.')
      return
    }
    const created = {
      ...newAddr,
      id: 'addr-' + Date.now(),
      isDefault: addresses.length === 0,
    }
    const updated = [...addresses, created]
    setAddresses(updated)
    localStorage.setItem('thenee_addresses', JSON.stringify(updated))
    setShowAddressModal(false)
    setNewAddr({ name: '', phone: '', street: '', city: '', state: 'Tamil Nadu', pincode: '', type: 'Home' })
    showToast('New delivery address added!')
  }

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    setAddresses(updated)
    localStorage.setItem('thenee_addresses', JSON.stringify(updated))
    showToast('Default address updated.')
  }

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id)
    setAddresses(updated)
    localStorage.setItem('thenee_addresses', JSON.stringify(updated))
    showToast('Address removed.')
  }

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart({
        id: item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: item.name,
        price: item.price,
        bottle: item.image,
      })
    })
    openCart()
    showToast(`Items from ${order.id} added to cart!`)
  }

  const activeShipments = ordersList.filter(
    (o) => o.status === 'Out for Delivery' || o.status === 'In Transit' || o.status === 'Order Confirmed' || o.status === 'Processing'
  ).length

  return (
    <div className="account-page">
      {/* Top Navbar */}
      <header className="account-navbar">
        <div className="account-nav-left">
          {activeTab === 'hub' ? (
            <button className="account-back-btn" onClick={onBack} title="Back to Main Store">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Store</span>
            </button>
          ) : (
            <button className="account-back-btn" onClick={() => navigateTab('hub')} title="Back to Profile Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Profile Menu</span>
            </button>
          )}

          <div className="account-brand" onClick={onBack}>
            <img src="/images/custom_thenee/thenee-brand-logo.png" alt="THENEE" className="account-brand-logo" />
            <div>
              <span className="account-brand-title">THENEE</span>
              <span className="account-brand-tag">Customer Wellness Portal</span>
            </div>
          </div>
        </div>

        <div className="account-nav-right">
          <div className="account-user-chip" onClick={() => navigateTab('profile')}>
            <span className="user-chip-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</span>
            <span className="user-chip-name">{user.name || 'Member'}</span>
          </div>

          <button className="account-cart-btn" onClick={openCart} aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="21" r="1.4" fill="currentColor" />
              <circle cx="17" cy="21" r="1.4" fill="currentColor" />
            </svg>
            {totalCount > 0 && <span className="account-cart-badge">{totalCount}</span>}
          </button>
        </div>
      </header>

      {/* =========================================================================
          VIEW 1: PROFILE OPTIONS HUB (Shown initially when opening profile)
          ========================================================================= */}
      {activeTab === 'hub' ? (
        <div className="profile-hub-container">
          {/* Hero Profile Summary Card */}
          <div className="profile-hub-hero">
            <div className="profile-hub-user-left">
              <div className="profile-hub-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
              <div className="profile-hub-user-text">
                <h2>{user.name || 'Valued Customer'}</h2>
                <p>{user.contact || user.email || 'Tamil Nadu'}{user.email && user.contact ? ` • ${user.email}` : ''}</p>
                <div className="profile-hub-pill-row">
                  <span className="hub-badge-verified">🌿 Verified Wellness Member</span>
                  <span className="hub-badge-tenkasi">Tenkasi Rural Roots</span>
                </div>
              </div>
            </div>

            <div className="profile-hub-metrics-strip">
              <div className="hub-stat-item" onClick={() => navigateTab('rewards')}>
                <span className="hub-stat-val">{user.points || 0} <small>pts</small></span>
                <span className="hub-stat-lbl">Green Points (₹{Math.floor((user.points || 0) / 2)})</span>
              </div>
              <div className="hub-stat-divider" />
              <div className="hub-stat-item" onClick={() => navigateTab('orders')}>
                <span className="hub-stat-val">
                  {activeShipments > 0 ? `${activeShipments} Live` : `${ordersList.length} Total`}
                </span>
                <span className="hub-stat-lbl">
                  {activeShipments > 0 ? 'Shipment in Transit' : 'Orders Placed'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="profile-hub-section-header">
            <h3>Account & Management Options</h3>
            <p>Select any section below to manage your orders, addresses, rewards, and preferences:</p>
          </div>

          {/* Diff Style Layout: Tactile Options Grid */}
          <div className="profile-hub-options-grid">
            {/* OPTION 1: Orders */}
            <div className="hub-option-card" onClick={() => navigateTab('orders')}>
              <div className="hub-icon-box bg-box-green">📦</div>
              <div className="hub-option-info">
                <div className="hub-option-title-row">
                  <h4>My Orders & Live Tracking</h4>
                  <span className={`hub-badge-pill ${activeShipments > 0 ? 'pill-live' : ''}`}>
                    {activeShipments > 0 ? `${activeShipments} In Transit` : `${ordersList.length} Orders`}
                  </span>
                </div>
              </div>
              <span className="hub-arrow-chevron">➔</span>
            </div>

            {/* OPTION 2: Saved Addresses */}
            <div className="hub-option-card" onClick={() => navigateTab('addresses')}>
              <div className="hub-icon-box bg-box-blue">📍</div>
              <div className="hub-option-info">
                <div className="hub-option-title-row">
                  <h4>Saved Delivery Addresses</h4>
                  <span className="hub-badge-pill">{addresses.length} Addresses</span>
                </div>
              </div>
              <span className="hub-arrow-chevron">➔</span>
            </div>

            {/* OPTION 3: Rewards & Coupons */}
            <div className="hub-option-card" onClick={() => navigateTab('rewards')}>
              <div className="hub-icon-box bg-box-gold">🌿</div>
              <div className="hub-option-info">
                <div className="hub-option-title-row">
                  <h4>Green Rewards & Coupons</h4>
                  <span className="hub-badge-pill pill-gold">{user.points} pts</span>
                </div>
              </div>
              <span className="hub-arrow-chevron">➔</span>
            </div>

            {/* OPTION 4: Wishlist */}
            <div className="hub-option-card" onClick={() => navigateTab('wishlist')}>
              <div className="hub-icon-box bg-box-rose">❤️</div>
              <div className="hub-option-info">
                <div className="hub-option-title-row">
                  <h4>My Herbal Wishlist</h4>
                  <span className="hub-badge-pill">{wishlist.length} Items</span>
                </div>
              </div>
              <span className="hub-arrow-chevron">➔</span>
            </div>

            {/* OPTION 5: Wellness & Impact */}
            <div className="hub-option-card" onClick={() => navigateTab('wellness')}>
              <div className="hub-icon-box bg-box-teal">👩‍🌾</div>
              <div className="hub-option-info">
                <div className="hub-option-title-row">
                  <h4>Wellness Health & Rural Impact</h4>
                  <span className="hub-badge-pill">Tenkasi SHG</span>
                </div>
              </div>
              <span className="hub-arrow-chevron">➔</span>
            </div>

            {/* OPTION 6: Profile Settings */}
            <div className="hub-option-card" onClick={() => navigateTab('profile')}>
              <div className="hub-icon-box bg-box-slate">⚙️</div>
              <div className="hub-option-info">
                <div className="hub-option-title-row">
                  <h4>Profile & Preferences</h4>
                  <span className="hub-badge-pill">{user.language}</span>
                </div>
              </div>
              <span className="hub-arrow-chevron">➔</span>
            </div>
          </div>

          {/* Bottom Help Banner */}
          <div className="profile-hub-footer-help">
            <a
              href={`https://wa.me/${brandInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20Thenee%2C%20I%20need%20assistance%20with%20my%20account.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hub-whatsapp-btn"
            >
              <span className="hub-whatsapp-icon">💬</span>
              <div>
                <strong>Need Immediate Assistance?</strong>
                <p>Chat directly on WhatsApp with our Manthiyoor, Tenkasi team: {brandInfo.whatsapp}</p>
              </div>
              <span className="hub-whatsapp-arrow">→</span>
            </a>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: DEDICATED SUBPAGE (Opened when an option is clicked)
            ========================================================================= */
        <div className="profile-subpage-container">
          {/* Subpage Breadcrumb Header */}
          <div className="subpage-header-nav">
            <button className="subpage-back-button" onClick={() => navigateTab('hub')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Profile Menu</span>
            </button>
            <div className="subpage-title-box">
              <h2>{TAB_TITLES[activeTab] || 'Account Details'}</h2>
              <span className="subpage-crumb-tag">My Account ➔ {TAB_TITLES[activeTab]}</span>
            </div>
          </div>

          {/* SUBPAGE 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="subpage-content-box">
              {isLoadingTab ? (
                <div className="orders-list">
                  <SkeletonOrderCard />
                  <SkeletonOrderCard />
                </div>
              ) : ordersList.length === 0 ? (
                <div className="empty-state-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '10px' }}>📦</div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1B3524' }}>No orders placed yet</h3>
                  <p style={{ color: '#5C6E60', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 20px' }}>
                    Your order history and live Speed Post consignment tracking will appear here once you place an order.
                  </p>
                  <button className="btn-primary" onClick={onBack}>
                    Explore Herbal Products →
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {ordersList.map((order) => (
                    <div className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-card-id">{order.id}</span>
                          <span className="order-card-date">Ordered on {order.date}</span>
                        </div>
                        <div className="order-card-status-wrap">
                          <span className={`order-status-badge ${order.status === 'Out for Delivery' ? 'status-live' : 'status-done'}`}>
                            {order.status === 'Out for Delivery' ? '● ' : '✓ '} {order.status}
                          </span>
                          <strong className="order-total-amount">₹{order.total}</strong>
                        </div>
                      </div>

                      <div className="order-card-body">
                        {order.items.map((item, idx) => (
                          <div className="order-product-row" key={idx}>
                            <ImageWithSkeleton
                              src={item.image}
                              alt={item.name}
                              className="order-product-thumb"
                              skeletonBorderRadius="8px"
                            />
                            <div className="order-product-info">
                              <h4>{item.name}</h4>
                              <p>Qty: {item.qty} • ₹{item.price}</p>
                              <span className="order-courier-note">Carrier: {order.courier} (AWB: {order.awb})</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    <div className="order-card-actions">
                      <button
                        className="btn-outline-sm"
                        onClick={() => setActiveTrackingOrder(activeTrackingOrder?.id === order.id ? null : order)}
                      >
                        {activeTrackingOrder?.id === order.id ? 'Hide Tracking ▲' : 'Track Shipment ▼'}
                      </button>

                      <button className="btn-secondary-sm" onClick={() => handleReorder(order)}>
                        🔄 Reorder in 1-Click
                      </button>

                      <button
                        className="btn-ghost-sm"
                        onClick={() => showToast(`Invoice for ${order.id} downloaded.`)}
                      >
                        📄 Download Invoice
                      </button>
                    </div>

                    {/* Expandable Live Tracking Timeline */}
                    {activeTrackingOrder?.id === order.id && (
                      <div className="order-tracking-expanded">
                        <div className="expanded-track-head">
                          <h4>Live Delivery Timeline</h4>
                          <span>Destination: {order.destination}</span>
                        </div>
                        <div className="timeline-trail">
                          {order.timeline.map((step, sIdx) => (
                            <div className="timeline-node done" key={sIdx}>
                              <div className="node-marker">✓</div>
                              <div className="node-content">
                                <strong>{step.title}</strong>
                                <span>{step.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {/* SUBPAGE 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="subpage-content-box">
              <div className="pane-header">
                <div>
                  <p>Manage your saved shipping addresses for fast checkout.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddressModal(true)}>
                  + Add New Address
                </button>
              </div>

              <div className="addresses-grid">
                {addresses.length === 0 ? (
                  <div className="empty-state-card" style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '10px' }}>📍</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#1B3524' }}>No saved addresses</h3>
                    <p style={{ color: '#5C6E60', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 20px' }}>
                      Save your home or work delivery address for fast 1-click checkout.
                    </p>
                    <button className="btn-primary" onClick={() => setShowAddressModal(true)}>
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div className={`address-card ${addr.isDefault ? 'is-default' : ''}`} key={addr.id}>
                      <div className="addr-card-top">
                        <span className="addr-type-pill">{addr.type}</span>
                        {addr.isDefault && <span className="addr-default-badge">Default Address</span>}
                      </div>

                      <h4 className="addr-name">{addr.name}</h4>
                      <p className="addr-line">{addr.street}</p>
                      <p className="addr-line">{addr.city}, {addr.district || addr.state} - <strong>{addr.pincode}</strong></p>
                      <p className="addr-phone">Phone: {addr.phone}</p>

                      <div className="addr-actions">
                        {!addr.isDefault && (
                          <button className="btn-addr-link" onClick={() => handleSetDefaultAddress(addr.id)}>
                            Set as Default
                          </button>
                        )}
                        <button className="btn-addr-delete" onClick={() => handleDeleteAddress(addr.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Address Modal */}
              {showAddressModal && (
                <div className="modal-backdrop-custom">
                  <div className="modal-box-custom">
                    <div className="modal-head">
                      <h3>Add New Delivery Address</h3>
                      <button className="modal-close-x" onClick={() => setShowAddressModal(false)}>✕</button>
                    </div>
                    <form onSubmit={handleAddAddress} className="modal-form-custom">
                      <div className="form-group-row">
                        <div>
                          <label>Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Recipient Name"
                            value={newAddr.name}
                            onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>Mobile Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit mobile"
                            value={newAddr.phone}
                            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label>Street Address / House No / Landmark *</label>
                        <input
                          type="text"
                          required
                          placeholder="Door no, Street name, Area"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        />
                      </div>

                      <div className="form-group-row">
                        <div>
                          <label>City / Town / Village *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tenkasi"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>Pincode *</label>
                          <input
                            type="text"
                            required
                            placeholder="6-digit pincode"
                            value={newAddr.pincode}
                            onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div>
                          <label>Address Type</label>
                          <select
                            value={newAddr.type}
                            onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                          >
                            <option value="Home">Home (All-day delivery)</option>
                            <option value="Office">Office / Work (10 AM - 6 PM)</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="modal-footer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowAddressModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBPAGE 3: REWARDS */}
          {activeTab === 'rewards' && (
            <div className="subpage-content-box">
              <div className="rewards-wallet-card">
                <div className="wallet-left">
                  <span className="wallet-badge">🌿 Active Balance</span>
                  <div className="wallet-points-val">{user.points} <span className="pts-label">Green Points</span></div>
                  <p className="wallet-worth">Cash value: <strong>₹{Math.floor(user.points / 2)}.00</strong> (Redeemable at Checkout)</p>
                </div>
                <div className="wallet-right">
                  <button
                    className="btn-redeem-wallet"
                    onClick={() => {
                      onBack()
                      showToast(`₹${Math.floor(user.points / 2)} credit ready to use at checkout!`)
                    }}
                  >
                    Shop & Redeem Points →
                  </button>
                </div>
              </div>

              <div className="content-section">
                <h3>Active Herbal Vouchers & Coupons</h3>
                <div className="coupons-grid">
                  {COUPONS.map((c) => (
                    <div className="coupon-card" key={c.code}>
                      <div className="coupon-left">
                        <span className="coupon-discount">{c.discount}</span>
                        <strong className="coupon-code-pill">{c.code}</strong>
                        <p className="coupon-desc">{c.desc}</p>
                      </div>
                      <button
                        className={`btn-copy-code ${copiedCoupon === c.code ? 'copied' : ''}`}
                        onClick={() => handleCopyCoupon(c.code)}
                      >
                        {copiedCoupon === c.code ? '✓ Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="referral-banner">
                <div>
                  <h4>Gift Health to Friends & Family</h4>
                  <p>Share your personal link. When a friend places their first herbal tea order, both of you receive <strong>100 Green Points</strong>!</p>
                </div>
                <button
                  className="btn-referral-copy"
                  onClick={() => {
                    const refCode = `THN-${(user.name || 'MEMBER').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'MEMBER'}`
                    navigator.clipboard.writeText(`https://thenee-enterprises.vercel.app/ref?code=${refCode}`)
                    showToast('Referral link copied to clipboard!')
                  }}
                >
                  🔗 Copy Referral Link
                </button>
              </div>
            </div>
          )}

          {/* SUBPAGE 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="subpage-content-box">
              {wishlist.length === 0 ? (
                <div className="empty-state-card">
                  <p>Your wishlist is currently empty.</p>
                  <button className="btn-primary" onClick={onBack}>Explore Products</button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map((item) => (
                    <div className="wishlist-card" key={item.id}>
                      <img src={item.bottle || item.image} alt={item.name} className="wishlist-img" />
                      <div className="wishlist-info">
                        <h4>{item.name}</h4>
                        <span className="wishlist-tamil">{item.tamilName}</span>
                        <div className="wishlist-price-row">
                          <strong className="wishlist-price">₹{item.price}</strong>
                          {item.originalPrice > item.price && (
                            <span className="wishlist-orig">₹{item.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <div className="wishlist-actions">
                        <button
                          className="btn-primary-sm"
                          onClick={() => {
                            addToCart(item)
                            openCart()
                            showToast(`Added ${item.name} to cart!`)
                          }}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="btn-remove-sm"
                          onClick={() => {
                            setWishlist((prev) => prev.filter((p) => p.id !== item.id))
                            showToast(`Removed from wishlist.`)
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBPAGE 5: WELLNESS & RURAL IMPACT */}
          {activeTab === 'wellness' && (
            <div className="subpage-content-box">
              <div className="wellness-impact-banner">
                <div className="impact-badge-pill">Tenkasi Self-Help Women Initiative</div>
                <h3>Crafted by Women. Rooted in Nature.</h3>
                <p>
                  Every order you place with THENEE directly empowers rural women in Manthiyoor, Tenkasi District,
                  Tamil Nadu. Herbs are organically grown, handpicked, shade-dried, and traditionally stone-ground.
                </p>

                <div className="wellness-metrics-row">
                  <div className="wellness-metric-card">
                    <strong>4</strong>
                    <span>Rural Families Directly Supported</span>
                  </div>
                  <div className="wellness-metric-card">
                    <strong>100%</strong>
                    <span>Organic & Zero Chemicals</span>
                  </div>
                  <div className="wellness-metric-card">
                    <strong>22425278000320</strong>
                    <span>FSSAI License Certified</span>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h3>Recommended Herbal Health Routine</h3>
                <div className="routine-cards-grid">
                  <div className="routine-card">
                    <span className="routine-time">Morning 7:00 AM</span>
                    <h4>Thenee Herbal Tea (Original Blend)</h4>
                    <p>Balances internal heat, regulates blood sugar, and supports smooth digestion before breakfast.</p>
                  </div>
                  <div className="routine-card">
                    <span className="routine-time">Lunch 1:00 PM</span>
                    <h4>Murungai / Garlic Food Podi</h4>
                    <p>Mix with warm rice and pure country ghee for sustained energy and iron absorption.</p>
                  </div>
                  <div className="routine-card">
                    <span className="routine-time">Night 9:30 PM</span>
                    <h4>Thenee Bliss Tea (Sangu Poo)</h4>
                    <p>100% caffeine-free butterfly pea & hibiscus for restorative sleep and natural stress relief.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBPAGE 6: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="subpage-content-box">
              <div className="profile-settings-card">
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="form-group-row">
                    <div>
                      <label>Your Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        value={profileForm.contact}
                        onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div>
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="yourname@domain.com"
                      />
                    </div>
                    <div>
                      <label>Preferred Language</label>
                      <select
                        value={profileForm.language}
                        onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                      >
                        <option value="English">English</option>
                        <option value="Tamil">தமிழ் (Tamil)</option>
                      </select>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn-primary">
                      Save Profile Changes
                    </button>
                    <button
                      type="button"
                      className="btn-signout"
                      onClick={() => {
                        logoutUser()
                        if (onLogout) onLogout()
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer with Powered by Creare Mind Credits */}
      <Footer />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="account-toast-alert" role="status" aria-live="polite">
          <span>🌿</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

export default AccountPage
