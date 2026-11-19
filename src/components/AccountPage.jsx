import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { products, individualPodis, brandInfo } from '../data/products'
import { orderService, profileService, adminService, inquiryService, supabase, isSupabaseConfigured, isRealAwb } from '../lib/supabase'
import { updateUserProfile } from '../lib/authApi'
import { getNumericUserId } from '../lib/userIdHelper'
import { sendOrderStatusUpdateEmail } from '../lib/emailService'
import { getSavedAddresses, saveAddress, updateAddress, deleteAddress, setDefaultAddress } from '../lib/addressService'
import { SkeletonOrderCard, ImageWithSkeleton } from './Skeleton'
import LoginPage from './LoginPage'
import './AccountPage.css'

// Active coupon vouchers (demo codes removed until store owner creates active campaigns)
const COUPONS = []

const TAB_TITLES = {
  orders: 'My Orders & Consignments',
  addresses: 'Saved Delivery Addresses',
  rewards: 'Green Rewards & Coupons',
  wishlist: 'My Herbal Wishlist',
  wellness: 'Wellness Health & Rural Impact',
  profile: 'Profile & Preferences',
  admin: 'Store Admin Console & Orders Backend',
}

const AccountPage = ({ onBack, onLogout, initialTab = 'hub' }) => {
  const { totalCount, openCart, addToCart, currentUser, isLoggedIn, logoutUser, authLoading } = useCart()

  // Track active sub-view ('hub' = main profile options view, or specific subpage)
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab && initialTab !== 'hub') return initialTab
    const hash = window.location.hash.replace('#', '')
    if (hash === 'admin' || hash === 'account/admin') return 'admin'
    if (hash.startsWith('account/')) {
      return hash.split('/')[1] || 'hub'
    }
    return 'hub'
  })

  const [isLoadingTab, setIsLoadingTab] = useState(false)
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null)
  const [copiedCoupon, setCopiedCoupon] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // If authenticating (e.g. returning from Google OAuth), show clean loader
  if (authLoading) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3.5px solid rgba(49, 84, 58, 0.15)',
          borderTopColor: '#274C37',
          borderRadius: '50%',
          animation: 'authSpin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes authSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontFamily: 'var(--font-heading, serif)', color: 'var(--color-primary, #1e392a)', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
          Signing you into your THENEE Account...
        </p>
      </div>
    )
  }

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
      if (!saved) return []
      const parsed = JSON.parse(saved)
      const cleaned = Array.isArray(parsed)
        ? parsed
          .filter(
            (o) =>
              !['THN-884102', 'THN-884095', 'THN-883981'].includes(o.id || o.order_number) &&
              o.customer_name !== 'Dr. Anand Raman' &&
              o.customer_name !== 'Meenakshi Sundaram' &&
              o.customer_name !== 'Suresh Narayanan'
          )
          .map((o) => {
            const hasReal = isRealAwb(o.awb || o.tracking_awb)
            return {
              ...o,
              awb: hasReal ? (o.awb || o.tracking_awb) : '',
              tracking_awb: hasReal ? (o.tracking_awb || o.awb) : '',
            }
          })
        : []
      localStorage.setItem('thenee_user_orders', JSON.stringify(cleaned))
      return cleaned
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

  // Permanent 8-digit numeric user id
  const userIdNumber = user.user_id_number || user.userIdNumber || getNumericUserId(user || currentUser)

  // Fetch Supabase data on mount / auth change
  useEffect(() => {
    let isMounted = true
    const loadSupabaseData = async () => {
      if (currentUser?.id) {
        try {
          const res = await orderService.getUserOrders(currentUser.id)
          const dbOrders = res?.data || (Array.isArray(res) ? res : null)
          if (isMounted && Array.isArray(dbOrders)) {
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
              points: profile.reward_points ?? profile.green_points ?? prev.points ?? 0,
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
    const handleStorage = (event) => {
      try {
        if (event && event.detail && event.detail.deletedId) {
          const delId = String(event.detail.deletedId).trim().toLowerCase()
          const altId = delId.startsWith('#') ? delId.slice(1) : `#${delId}`
          setOrdersList((prev) =>
            prev.filter((o) => {
              const num = String(o.order_number || o.order_id || o.id || '').trim().toLowerCase()
              return num !== delId && num !== altId
            })
          )
        }
        const saved = localStorage.getItem('thenee_user_orders')
        if (saved) {
          const parsed = JSON.parse(saved)
          const cleaned = (Array.isArray(parsed) ? parsed : []).map((o) => {
            const hasReal = isRealAwb(o.awb || o.tracking_awb)
            return {
              ...o,
              awb: hasReal ? (o.awb || o.tracking_awb) : '',
              tracking_awb: hasReal ? (o.tracking_awb || o.awb) : '',
            }
          })
          setOrdersList(cleaned)
        } else {
          setOrdersList([])
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('thenee_orders_updated', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('thenee_orders_updated', handleStorage)
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
    return getSavedAddresses(currentUser?.email, currentUser?.id)
  })

  // Sync addresses whenever currentUser changes
  useEffect(() => {
    const loaded = getSavedAddresses(currentUser?.email, currentUser?.id)
    setAddresses(loaded)
  }, [currentUser])

  // Address Modal & Form State
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    alt_mobile: '',
    line1: '',
    line2: '',
    street: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    type: 'Home',
  })

  // Wishlist State (loaded live from localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('thenee_user_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Sync wishlist updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('thenee_user_wishlist', JSON.stringify(wishlist))
    } catch { }
  }, [wishlist])

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    email: user.email || '',
    contact: user.contact || '',
    language: user.language || 'English',
  })
  const [accPassword, setAccPassword] = useState('')
  const [accConfirmPassword, setAccConfirmPassword] = useState('')
  const [showAccPassword, setShowAccPassword] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

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
      if (hash === 'admin' || hash === 'account/admin') {
        setActiveTab('admin')
      } else if (hash.startsWith('account/')) {
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
    } else if (tab === 'admin') {
      window.location.hash = 'admin'
    } else {
      window.location.hash = `account/${tab}`
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Admin Authorization State
  const isUserAdmin = Boolean(
    adminService.isAdmin(currentUser) ||
    currentUser?.role === 'admin' ||
    (currentUser?.email && currentUser.email.toLowerCase() === 'rootsenterprises2025@gmail.com')
  )

  // When activeTab is set to admin, automatically navigate to the direct full Admin Workstation
  useEffect(() => {
    if (activeTab === 'admin' && isUserAdmin) {
      window.location.hash = 'admin'
    }
  }, [activeTab, isUserAdmin])

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

    if (accPassword) {
      if (accPassword.length < 6) {
        showToast('Password must be at least 6 characters.')
        return
      }
      if (accPassword !== accConfirmPassword) {
        showToast('Passwords do not match.')
        return
      }
    }

    setIsSavingProfile(true)
    const updated = { ...user, ...profileForm }
    setUser(updated)
    localStorage.setItem('thenee_user', JSON.stringify(updated))

    // 1. If password was entered, update Supabase user
    if (accPassword && isSupabaseConfigured && supabase) {
      try {
        const { error: passErr } = await supabase.auth.updateUser({ password: accPassword.trim() })
        if (passErr) {
          console.warn('Supabase password update notice:', passErr)
        }
      } catch (err) {
        console.warn('Supabase password update error:', err)
      }
    }

    // 2. Update local user registry
    await updateUserProfile({
      email: profileForm.email || user.email,
      name: profileForm.name,
      phone: profileForm.contact,
      ...(accPassword ? { password: accPassword.trim() } : {}),
    })

    // 3. Update Supabase profile
    if (currentUser?.id && isSupabaseConfigured) {
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

    setIsSavingProfile(false)
    if (accPassword) {
      setAccPassword('')
      setAccConfirmPassword('')
      showToast('Profile and login password saved successfully! 🌿')
    } else {
      showToast('Profile information saved successfully!')
    }
  }

  const handleOpenAddAddress = () => {
    setEditingAddressId(null)
    setNewAddr({
      name: currentUser?.name && !currentUser.name.includes('@') ? currentUser.name : '',
      phone: currentUser?.contact ? currentUser.contact.replace(/\D/g, '').slice(-10) : '',
      alt_mobile: '',
      line1: '',
      line2: '',
      street: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
      type: 'Home',
    })
    setShowAddressModal(true)
  }

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id)
    setNewAddr({
      name: addr.name || addr.recipient || '',
      phone: addr.phone || '',
      alt_mobile: addr.alt_mobile || '',
      line1: addr.line1 || addr.street || '',
      line2: addr.line2 || '',
      street: addr.line1 || addr.street || '',
      city: addr.city || '',
      district: addr.district || addr.city || '',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '',
      type: addr.type || 'Home',
    })
    setShowAddressModal(true)
  }

  const handleCloseAddressModal = () => {
    setShowAddressModal(false)
    setEditingAddressId(null)
  }

  const handleSaveAddressForm = (e) => {
    e.preventDefault()
    const streetAddress = (newAddr.line1 || newAddr.street || '').trim()
    if (!newAddr.name.trim() || !newAddr.phone.trim() || !streetAddress || !newAddr.city.trim() || !newAddr.pincode.trim()) {
      showToast('Please fill out all required address fields.')
      return
    }

    const payload = {
      ...newAddr,
      street: streetAddress,
      line1: streetAddress,
      district: newAddr.district || newAddr.city,
    }

    if (editingAddressId) {
      const updated = updateAddress(editingAddressId, payload, currentUser?.email, currentUser?.id)
      setAddresses(updated)
      showToast('Address updated successfully! 🌿')
    } else {
      const updated = saveAddress(payload, currentUser?.email, currentUser?.id)
      setAddresses(updated)
      showToast('New delivery address added! 🌿')
    }

    handleCloseAddressModal()
  }

  const handleSetDefaultAddress = (id) => {
    const updated = setDefaultAddress(id, currentUser?.email, currentUser?.id)
    setAddresses(updated)
    showToast('Default delivery address updated.')
  }

  const handleDeleteAddress = (id) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return
    const updated = deleteAddress(id, currentUser?.email, currentUser?.id)
    setAddresses(updated)
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

  // Live reward calculations
  const userPts = typeof user.points === 'number' ? user.points : 0
  const creditRupees = Math.floor(userPts / 2)
  let nextTierTarget = 250
  if (userPts >= 500) nextTierTarget = 1000
  else if (userPts >= 250) nextTierTarget = 500
  else if (userPts >= 100) nextTierTarget = 250
  else nextTierTarget = 100

  const ptsNeeded = Math.max(0, nextTierTarget - userPts)
  const milestonePercent = Math.min(100, Math.round((userPts / nextTierTarget) * 100))

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
          {isUserAdmin && (
            <button
              type="button"
              className="account-admin-portal-btn"
              onClick={() => {
                window.location.hash = 'admin'
              }}
              title="Open Store Administration Dashboard"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Admin Panel</span>
            </button>
          )}

          <div className="account-user-chip" onClick={() => navigateTab('profile')}>
            <span className="user-chip-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} className="user-chip-avatar-img" referrerPolicy="no-referrer" />
              ) : (
                (user.name || 'U').charAt(0).toUpperCase()
              )}
            </span>
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
              <div className="profile-hub-avatar-wrap">
                <div className="profile-hub-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className="profile-hub-avatar-img" referrerPolicy="no-referrer" />
                  ) : (
                    (user.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hub-avatar-active-dot" title="Account Active" />
              </div>

              <div className="profile-hub-user-text">
                <div className="hub-user-name-row">
                  <h2>Welcome, {user.name || 'Valued Customer'}</h2>
                  <span className="hub-user-id-badge" title="Permanent 8-Digit User ID">
                    <span className="hub-user-id-prefix">USER ID</span>
                    <strong className="hub-user-id-number">{userIdNumber}</strong>
                  </span>
                  {isUserAdmin && (
                    <span className="hub-admin-badge" title="Store Administrator Privileges Active">
                      ⭐ Store Admin
                    </span>
                  )}
                </div>

                <div className="hub-user-contact-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{user.contact || user.email || 'Tenkasi, Tamil Nadu'}</span>
                  {user.email && user.contact && (
                    <>
                      <span>•</span>
                      <span>{user.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-hub-metrics-strip">
              {/* Stat 1: Green Points */}
              <div className="hub-stat-item" onClick={() => navigateTab('rewards')} title="View Green Rewards & Coupons">
                <div className="hub-stat-top-row">
                  <span className="hub-stat-val">{userPts}</span>
                  <span className="hub-stat-unit">PTS</span>
                </div>
                <span className="hub-stat-lbl">Green Points (₹{creditRupees})</span>
                <span className="hub-stat-action">Redeem →</span>
              </div>

              {/* Stat 2: Active Orders */}
              <div className="hub-stat-item" onClick={() => navigateTab('orders')} title="View Orders & Tracking">
                <div className="hub-stat-top-row">
                  {activeShipments > 0 && <span className="pulse-dot-live" />}
                  <span className="hub-stat-val">{activeShipments} Live</span>
                </div>
                <span className="hub-stat-lbl">In Transit</span>
                <span className="hub-stat-action">Track →</span>
              </div>

              {/* Stat 3: Wishlist */}
              <div className="hub-stat-item" onClick={() => navigateTab('wishlist')} title="View Herbal Wishlist">
                <div className="hub-stat-top-row">
                  <span className="hub-stat-val">{wishlist.length}</span>
                  <span className="hub-stat-unit">{wishlist.length === 1 ? 'ITEM' : 'ITEMS'}</span>
                </div>
                <span className="hub-stat-lbl">Herbal Wishlist</span>
                <span className="hub-stat-action">View →</span>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="profile-hub-section-header">
            <span className="hub-section-eyebrow">WELLNESS & ACCOUNT PORTAL</span>
            <h3>Account Dashboard & Services</h3>
            <p>Manage your village-direct herbal orders, reward wallet, delivery destinations, and community impact:</p>
          </div>

          {/* Modern Exact Bento Grid */}
          <div className="profile-hub-bento-grid">
            {/* ROW 1: FEATURED BENTO CARDS */}
            {/* BENTO 1: Orders & Consignment Tracking (Left Card) */}
            <div className="bento-card bento-card-featured bento-card-orders" onClick={() => navigateTab('orders')}>
              <div className="bento-card-header">
                <div className="bento-icon-box bento-icon-orders">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="bento-badge-group">
                  {activeShipments > 0 ? (
                    <span className="bento-badge-pill pill-live-pulse">
                      <span className="live-pulse-dot" /> {activeShipments} In Transit
                    </span>
                  ) : ordersList.length > 0 ? (
                    <span className="bento-badge-pill pill-subtle">
                      {ordersList.length} Total {ordersList.length === 1 ? 'Order' : 'Orders'}
                    </span>
                  ) : (
                    <span className="bento-badge-pill pill-subtle">
                      0 Active Orders
                    </span>
                  )}
                </div>
              </div>

              <div className="bento-card-body">
                <h4>My Orders & Live Tracking</h4>
                <p>Direct Speed Post dispatches from our Kadayam, Tenkasi herbal processing unit with real-time consignment updates.</p>
              </div>

              <div className="bento-orders-preview-strip">
                <div className="bento-preview-tag">
                  <span className="preview-label">DISPATCH STATUS</span>
                  <span className="preview-val">
                    {activeShipments > 0
                      ? `${activeShipments} Order(s) In Transit`
                      : ordersList.length > 0
                        ? 'All Consignments Delivered'
                        : 'No Active Dispatches'}
                  </span>
                </div>
                <span className="bento-action-link">{ordersList.length > 0 ? 'Track Consignments →' : 'View Orders →'}</span>
              </div>
            </div>

            {/* BENTO 2: Green Rewards & Herbal Wallet (Right Card) */}
            <div className="bento-card bento-card-featured bento-card-rewards" onClick={() => navigateTab('rewards')}>
              <div className="bento-card-header">
                <div className="bento-icon-box bento-icon-rewards">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <div className="bento-badge-group">
                  <span className="bento-badge-pill pill-gold-glint">
                    🌿 {userPts} pts
                  </span>
                </div>
              </div>

              <div className="bento-card-body">
                <h4>Green Rewards & Wallet</h4>
                <p>Earn 1 point per ₹10 spent. Instant redeemable credit of ₹{creditRupees} at checkout.</p>
              </div>

              <div className="bento-rewards-meter-strip">
                <div className="meter-label-row">
                  <span>Next Milestone ({milestonePercent}%)</span>
                  <strong>{ptsNeeded > 0 ? `${ptsNeeded} pts to ₹${Math.floor(nextTierTarget / 2)} Voucher` : 'Voucher Ready!'}</strong>
                </div>
                <div className="meter-progress-bar">
                  <div className="meter-progress-fill" style={{ width: `${milestonePercent}%` }} />
                </div>
                <span className="bento-action-link">Redeem Points & Coupons →</span>
              </div>
            </div>

            {/* ROW 2: CORE FOUR UTILITY TILES */}
            {/* BENTO 3: Saved Delivery Addresses */}
            <div className="bento-card bento-card-utility" onClick={() => navigateTab('addresses')}>
              <div className="bento-card-header">
                <div className="bento-icon-box bento-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="bento-badge-pill pill-subtle">{addresses.length || 0} Saved</span>
              </div>
              <div className="bento-card-body">
                <h4>Saved Addresses</h4>
                <p>Doorstep shipping destinations, delivery contacts, and PIN codes across India.</p>
              </div>
              <div className="bento-card-footer">
                <span className="bento-simple-link">Manage Addresses →</span>
              </div>
            </div>

            {/* BENTO 4: Herbal Wishlist */}
            <div className="bento-card bento-card-utility" onClick={() => navigateTab('wishlist')}>
              <div className="bento-card-header">
                <div className="bento-icon-box bento-icon-rose">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span className="bento-badge-pill pill-subtle">{wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}</span>
              </div>
              <div className="bento-card-body">
                <h4>My Herbal Wishlist</h4>
                <p>Saved botanical teas, pure moringa powders, and hand-pounded podis.</p>
              </div>
              <div className="bento-card-footer">
                <span className="bento-simple-link">View Wishlist →</span>
              </div>
            </div>

            {/* BENTO 5: Rural Women Impact */}
            <div className="bento-card bento-card-utility" onClick={() => navigateTab('wellness')}>
              <div className="bento-card-header">
                <div className="bento-icon-box bento-icon-teal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="bento-badge-pill pill-teal">Tenkasi SHG</span>
              </div>
              <div className="bento-card-body">
                <h4>Rural Women Impact</h4>
                <p>Empowering 50+ rural women entrepreneurs with sustainable village livelihoods.</p>
              </div>
              <div className="bento-card-footer">
                <span className="bento-simple-link">Explore Mission →</span>
              </div>
            </div>

            {/* BENTO 6: Profile & Preferences */}
            <div className="bento-card bento-card-utility" onClick={() => navigateTab('profile')}>
              <div className="bento-card-header">
                <div className="bento-icon-box bento-icon-slate">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <span className="bento-badge-pill pill-subtle">{user.language || 'English'}</span>
              </div>
              <div className="bento-card-body">
                <h4>Profile & Preferences</h4>
                <p>Personal details, WhatsApp notification preferences, and account security.</p>
              </div>
              <div className="bento-card-footer">
                <span className="bento-simple-link">Edit Settings →</span>
              </div>
            </div>

            {/* BENTO 7: Store Admin Dashboard (Visible for Admin patrons) */}
            {isUserAdmin && (
              <div
                className="bento-card bento-card-admin"
                onClick={() => {
                  window.location.hash = 'admin'
                }}
                title="Open Store Administration Dashboard"
              >
                <div className="bento-card-header">
                  <div className="bento-icon-box bento-icon-admin">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  </div>
                  <span className="pill-admin-badge">
                    ⭐ STORE ADMINISTRATOR
                  </span>
                </div>

                <div className="bento-card-body">
                  <h4>Store Admin Dashboard</h4>
                  <p>Direct access to live dispatch ledger, real-time products catalog, coupon manager, website CMS, and customer base without signin screen.</p>
                </div>

                <div className="bento-card-footer">
                  <span className="bento-admin-launch-link">
                    Open Admin Dashboard (Direct Access) ➔
                  </span>
                </div>
              </div>
            )}
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
              <span className="subpage-crumb-tag">My Account → {TAB_TITLES[activeTab]}</span>
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
                              <span className="order-courier-note">
                                {isRealAwb(order.awb || order.tracking_awb) ? (
                                  <>Carrier: {order.courier || 'India Post Speed Post'} (AWB: {order.awb || order.tracking_awb})</>
                                ) : (
                                  <span style={{ color: '#854D0E', fontWeight: 600 }}>Tracking updated soon</span>
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-actions">
                        {isRealAwb(order.awb || order.tracking_awb) ? (
                          <button
                            className="btn-outline-sm"
                            onClick={() => setActiveTrackingOrder(activeTrackingOrder?.id === order.id ? null : order)}
                          >
                            {activeTrackingOrder?.id === order.id ? 'Hide Tracking ▲' : 'Track Shipment ▼'}
                          </button>
                        ) : (
                          <span
                            className="tracking-pending-badge"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              background: '#FEF9C3',
                              color: '#854D0E',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              border: '1px solid #FEF08A',
                            }}
                          >
                            ⏳ Tracking updated soon
                          </span>
                        )}

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
                      {isRealAwb(order.awb || order.tracking_awb) && activeTrackingOrder?.id === order.id && (
                        <div className="order-tracking-expanded">
                          <div className="expanded-track-head">
                            <h4>Live Delivery Timeline</h4>
                            <span>Destination: {order.destination}</span>
                          </div>
                          <div className="timeline-trail">
                            {order.timeline && order.timeline.map((step, sIdx) => (
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
                <button className="btn-primary" onClick={handleOpenAddAddress}>
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
                    <button className="btn-primary" onClick={handleOpenAddAddress}>
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

                      <h4 className="addr-name">{addr.name || addr.recipient}</h4>
                      <p className="addr-line">{addr.line1 || addr.street}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="addr-line">{addr.city}, {addr.district ? `${addr.district}, ` : ''}{addr.state} - <strong>{addr.pincode}</strong></p>
                      <p className="addr-phone">Phone: {addr.phone}{addr.alt_mobile ? ` · Alt: ${addr.alt_mobile}` : ''}</p>

                      <div className="addr-actions">
                        <button
                          type="button"
                          className="btn-addr-edit"
                          onClick={() => handleOpenEditAddress(addr)}
                        >
                          ✏️ Edit
                        </button>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            className="btn-addr-link"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-addr-delete"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add / Edit Address Modal */}
              {showAddressModal && (
                <div className="modal-backdrop-custom">
                  <div className="modal-box-custom">
                    <div className="modal-head">
                      <h3>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
                      <button className="modal-close-x" onClick={handleCloseAddressModal}>✕</button>
                    </div>
                    <form onSubmit={handleSaveAddressForm} className="modal-form-custom">
                      <div>
                        <label>Recipient Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Recipient Name"
                          value={newAddr.name}
                          onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label>Line 1 (Street) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Door / Flat, Building, Street"
                          value={newAddr.line1}
                          onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value, street: e.target.value })}
                        />
                      </div>

                      <div>
                        <label>Line 2 (Area/Apt)</label>
                        <input
                          type="text"
                          placeholder="Area / Landmark"
                          value={newAddr.line2}
                          onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                        />
                      </div>

                      <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
                        <div>
                          <label>City *</label>
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>District *</label>
                          <input
                            type="text"
                            required
                            placeholder="District"
                            value={newAddr.district}
                            onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>State *</label>
                          <input
                            type="text"
                            required
                            placeholder="State"
                            value={newAddr.state}
                            onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
                        <div>
                          <label>Pincode *</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Pincode"
                            value={newAddr.pincode}
                            onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>
                        <div>
                          <label>Mobile *</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="+91 75502..."
                            value={newAddr.phone}
                            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>
                        <div>
                          <label>Alt Mobile</label>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="Alternate"
                            value={newAddr.alt_mobile}
                            onChange={(e) => setNewAddr({ ...newAddr, alt_mobile: e.target.value.replace(/\D/g, '') })}
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
                        <button type="button" className="btn-secondary" onClick={handleCloseAddressModal}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          {editingAddressId ? 'Update Address' : 'Save Address'}
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
                  <div className="wallet-points-val">{userPts} <span className="pts-label">Green Points</span></div>
                  <p className="wallet-worth">Cash value: <strong>₹{creditRupees}.00</strong> (Redeemable at Checkout)</p>
                </div>
                <div className="wallet-right">
                  <button
                    className="btn-redeem-wallet"
                    onClick={() => {
                      onBack()
                      showToast(`₹${creditRupees} credit ready to use at checkout!`)
                    }}
                  >
                    Shop & Redeem Points →
                  </button>
                </div>
              </div>

              <div className="content-section">
                <h3>Active Herbal Vouchers & Coupons</h3>
                {COUPONS.length === 0 ? (
                  <div className="empty-state-card" style={{ padding: '32px 20px', textAlign: 'center', background: '#FAFAFA', borderRadius: '14px', border: '1px dashed #D0DDD0' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎟️</div>
                    <h4 style={{ fontSize: '1rem', color: '#1B3524', marginBottom: '4px' }}>No active coupon vouchers right now</h4>
                    <p style={{ color: '#5C6E60', fontSize: '0.82rem', maxWidth: '360px', margin: '0 auto' }}>
                      Seasonal discounts, festive voucher codes, and special promotions will appear here when announced.
                    </p>
                  </div>
                ) : (
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
                )}
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
                {/* Official 8-Digit Numeric User ID Card */}
                <div className="profile-id-banner">
                  <div className="profile-id-banner-left">
                    <span className="profile-id-kicker">OFFICIAL ACCOUNT IDENTIFIER</span>
                    <div className="profile-id-number-row">
                      <span className="profile-id-label">User ID:</span>
                      <strong className="profile-id-val">{userIdNumber}</strong>
                      <span className="profile-id-digits-tag">8-Digit Numeric ID</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-id"
                    onClick={() => {
                      navigator.clipboard.writeText(userIdNumber)
                      showToast(`User ID ${userIdNumber} copied to clipboard!`)
                    }}
                    title="Copy 8-Digit User ID"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy ID</span>
                  </button>
                </div>

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
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>
                  </div>

                  {/* Account Password Section for Google & Direct Email Login */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2EADF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0, fontWeight: 700, color: '#1B3524', fontSize: '0.9rem' }}>
                        Set or Update Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAccPassword(!showAccPassword)}
                        style={{ background: 'none', border: 'none', color: '#5A6D5E', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {showAccPassword ? 'Hide Password' : 'Show Password'}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#5C6E60', margin: '0 0 12px', lineHeight: 1.4 }}>
                      Allows you to log into THENEE using your email ({profileForm.email || user.email || 'your email'}) and password directly.
                    </p>
                    <div className="form-group-row">
                      <div>
                        <input
                          type={showAccPassword ? 'text' : 'password'}
                          placeholder="New password (min 6 characters)"
                          value={accPassword}
                          onChange={(e) => setAccPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          type={showAccPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={accConfirmPassword}
                          onChange={(e) => setAccConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Administrator Access Card inside Profile */}
                  {isUserAdmin && (
                    <div className="admin-profile-access-box" style={{ marginTop: '24px', padding: '18px 20px', background: '#F4FAF6', border: '1.5px solid #D6EDE0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.1rem' }}>⭐</span>
                          <strong style={{ color: '#123223', fontSize: '0.95rem' }}>Store Administrator Role Active</strong>
                        </div>
                        <p style={{ margin: 0, color: '#4B5E50', fontSize: '0.84rem' }}>
                          Your account has full administrator permissions to manage orders, catalog, coupons, website banners, and patron accounts.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => { window.location.hash = 'admin' }}
                        style={{ padding: '10px 18px', fontSize: '0.86rem', whiteSpace: 'nowrap' }}
                      >
                        Open Admin Dashboard ➔
                      </button>
                    </div>
                  )}

                  <div className="profile-form-actions">
                    <button type="submit" className="btn-primary" disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
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

          {/* SUBPAGE 7: STORE ADMIN CONSOLE & ORDERS BACKEND */}
          {activeTab === 'admin' && (
            <div className="subpage-content-box admin-content-box">
              {isUserAdmin ? (
                <div style={{ maxWidth: '480px', margin: '40px auto', background: '#FFFFFF', padding: '36px 28px', borderRadius: '16px', border: '1.5px solid #D6EDE0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.6rem', marginBottom: '12px' }}>🌿</div>
                  <h3 style={{ fontSize: '1.3rem', color: '#1B3524', marginBottom: '8px' }}>Store Admin Workstation</h3>
                  <p style={{ fontSize: '0.88rem', color: '#5C6E60', marginBottom: '22px', lineHeight: '1.5' }}>
                    Direct access to village dispatch ledger, live catalog editor, coupon manager, and website CMS without password or signin screen.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => { window.location.hash = 'admin' }}
                    style={{ padding: '12px 24px', fontSize: '0.96rem', fontWeight: 600, width: '100%' }}
                  >
                    Open Full Admin Dashboard ➔
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '480px', margin: '40px auto', background: '#FFFFFF', padding: '36px 28px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.6rem', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{ fontSize: '1.3rem', color: '#1B3524', marginBottom: '8px' }}>Admin Access Restricted</h3>
                  <p style={{ fontSize: '0.88rem', color: '#5C6E60', marginBottom: '22px', lineHeight: '1.5' }}>
                    This console is reserved for patrons with administrator privileges assigned in the Customer Base.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigateTab('hub')}
                    style={{ padding: '12px 24px', fontSize: '0.96rem', fontWeight: 600 }}
                  >
                    Return to Profile Menu ➔
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightweight Powered by Creare Mind Credits (Full Footer not required in Account Page) */}
      <footer className="account-credits-bar">
        <span>© {new Date().getFullYear()} The Roots Enterprises • Kadayam, Tenkasi</span>
        <span className="account-credits-dot">•</span>
        <a
          href="https://www.crearemind.in"
          target="_blank"
          rel="noopener noreferrer"
          className="account-crearemind-link"
          title="Visit Creare Mind (opens in new tab)"
        >
          <span>POWERED BY</span> <strong>CREARE MIND</strong>
        </a>
      </footer>

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
