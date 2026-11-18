import { createContext, useContext, useState, useEffect } from 'react'
import { brandInfo } from '../data/products'
import { authService, isSupabaseConfigured } from '../lib/supabase'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('thenee_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('thenee_auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Track active auth resolution (e.g. while returning from Google OAuth)
  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || ''
      const hash = window.location.hash || ''
      const isOauthPending = localStorage.getItem('thenee_oauth_pending') === 'true'
      return search.includes('code=') || hash.includes('access_token=') || isOauthPending
    }
    return false
  })

  // Sync with Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false)
      return
    }

    let isMounted = true

    // Check for OAuth error parameters in URL (?error=... or #error=...)
    if (typeof window !== 'undefined') {
      const search = window.location.search || ''
      const hash = window.location.hash || ''
      if (search.includes('error=') || hash.includes('error=')) {
        try {
          localStorage.removeItem('thenee_oauth_pending')
          localStorage.removeItem('thenee_auth_redirect')
        } catch {}
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.origin + window.location.pathname + '#login')
        } else {
          window.location.hash = 'login'
        }
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        setAuthLoading(false)
        showToast('Google sign-in was cancelled or encountered an issue.')
        return
      }
    }

    const syncSessionUser = (session) => {
      if (!session?.user) return false
      const u = session.user
      const userData = {
        id: u.id,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Member',
        email: u.email || '',
        contact: u.phone || u.user_metadata?.phone || '',
        avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
        authProvider: u.app_metadata?.provider || 'google',
        joinedDate: new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        points: 100,
      }

      try {
        localStorage.setItem('thenee_auth_user', JSON.stringify(userData))
        localStorage.setItem('thenee_user', JSON.stringify(userData))
      } catch {}

      if (isMounted) {
        setCurrentUser(userData)
        setAuthLoading(false)
      }

      // Check if returning from OAuth / login redirect
      if (typeof window !== 'undefined') {
        const isOauthPending = localStorage.getItem('thenee_oauth_pending') === 'true'
        const search = window.location.search || ''
        const hash = window.location.hash || ''
        const hasAuthParams = search.includes('code=') || hash.includes('access_token') || hash.includes('login')
        const targetRoute = localStorage.getItem('thenee_auth_redirect') || 'account'

        if (isOauthPending || hasAuthParams) {
          try {
            localStorage.removeItem('thenee_oauth_pending')
            localStorage.removeItem('thenee_auth_redirect')
          } catch {}

          // Clean URL parameters in browser history
          if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname + '#' + targetRoute
            window.history.replaceState(null, '', cleanUrl)
          } else {
            window.location.hash = targetRoute
          }
          window.dispatchEvent(new HashChangeEvent('hashchange'))
          showToast(`Welcome back, ${userData.name}! 🌿`)
        }
      }
      return true
    }

    // Proactively exchange code or verify current session on startup
    const initAuthSession = async () => {
      try {
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search)
          const code = searchParams.get('code')
          if (code) {
            try {
              const res = await authService.exchangeCodeForSession(code)
              if (res?.data?.session) {
                syncSessionUser(res.data.session)
                return
              }
            } catch {
              // Ignore if code was already exchanged by detectSessionInUrl
            }
          }
        }

        const session = await authService.getSession()
        if (session) {
          syncSessionUser(session)
        } else if (isMounted) {
          setAuthLoading(false)
        }
      } catch (err) {
        console.warn('Auth session check notice:', err)
        if (isMounted) setAuthLoading(false)
      }
    }

    initAuthSession()

    // Subscribe to auth state updates
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        if (session) {
          syncSessionUser(session)
        } else if (isMounted) {
          setAuthLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem('thenee_auth_user')
          localStorage.removeItem('thenee_user')
          localStorage.removeItem('thenee_oauth_pending')
          localStorage.removeItem('thenee_auth_redirect')
        } catch {}
        if (isMounted) {
          setCurrentUser(null)
          setAuthLoading(false)
        }
      }
    })

    // Safety timeout in case network stalls
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setAuthLoading(false)
        try {
          localStorage.removeItem('thenee_oauth_pending')
        } catch {}
      }
    }, 4000)

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const loginUser = (userData) => {
    try {
      localStorage.setItem('thenee_auth_user', JSON.stringify(userData))
      localStorage.setItem('thenee_user', JSON.stringify(userData))
      setCurrentUser(userData)
      showToast(`Welcome, ${userData.name || 'Member'}! 🌿`)
    } catch {
      setCurrentUser(userData)
    }
  }

  const logoutUser = () => {
    try {
      if (isSupabaseConfigured) {
        authService.signOut().catch(() => {})
      }
      localStorage.removeItem('thenee_auth_user')
      localStorage.removeItem('thenee_user')
      setCurrentUser(null)
      showToast('You have been signed out safely.')
    } catch {
      setCurrentUser(null)
    }
  }

  const isLoggedIn = !!currentUser

  // Applied Coupon state (cleared until store owner configures active campaigns)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('thenee_applied_coupon', JSON.stringify(appliedCoupon))
      } else {
        localStorage.removeItem('thenee_applied_coupon')
      }
    } catch {
      // storage error fallback
    }
  }, [appliedCoupon])

  useEffect(() => {
    try {
      localStorage.setItem('thenee_cart', JSON.stringify(cartItems))
    } catch {
      // storage error fallback
    }
  }, [cartItems])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          tamilName: product.tamilName || '',
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          volume: product.volume,
          cardImage: product.bottle || product.cardImage || product.image,
          quantity,
        },
      ]
    })
    showToast(`Added ${product.name} to bag!`)
  }

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => setCartItems([])

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalOriginal = cartItems.reduce(
    (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
    0
  )
  const savings = Math.max(0, totalOriginal - subtotal)

  // Free delivery threshold: ₹499
  const freeShippingThreshold = 499
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const isFreeShipping = subtotal >= freeShippingThreshold

  // Active store coupons (demo coupon codes removed until store owner adds active coupon campaigns)
  const VALID_COUPONS = {}

  const applyCoupon = (rawCode) => {
    if (!rawCode || !rawCode.trim()) {
      return { success: false, message: 'Please enter a coupon code' }
    }
    const code = rawCode.trim().toUpperCase()
    if (Object.keys(VALID_COUPONS).length === 0) {
      return { success: false, message: `Coupon code "${code}" is invalid or expired.` }
    }
    const found = VALID_COUPONS[code]
    if (!found) {
      return { success: false, message: `Coupon code "${code}" is invalid.` }
    }
    if (found.minOrder && subtotal < found.minOrder) {
      return { success: false, message: `Minimum order value for ${code} is ₹${found.minOrder}.` }
    }
    setAppliedCoupon(found)
    showToast(`Coupon "${code}" applied successfully! 🎉`)
    return { success: true, message: `Coupon "${code}" applied!` }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    showToast('Coupon removed.')
  }

  let couponDiscount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round((subtotal * appliedCoupon.value) / 100)
    } else if (appliedCoupon.type === 'flat') {
      couponDiscount = Math.min(subtotal, appliedCoupon.value)
    }
  }

  const isFreeDelivery = isFreeShipping || (appliedCoupon && appliedCoupon.type === 'shipping')
  const deliveryFee = cartItems.length === 0 ? 0 : isFreeDelivery ? 0 : 40
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee)

  const generateWhatsAppOrderUrl = () => {
    if (cartItems.length === 0) {
      return `https://wa.me/917550248005?text=${encodeURIComponent(
        'Hello THENEE team! I would like to know more about your herbal products.'
      )}`
    }

    let text = `Namaste THENEE! 🌱\nI would like to order the following herbal products:\n\n`
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (${item.volume || ''})\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}\n`
    })

    text += `\n*Subtotal: ₹${subtotal}*`
    if (appliedCoupon) {
      text += `\nCoupon Applied: ${appliedCoupon.code} (-₹${couponDiscount})`
    }
    if (savings > 0) {
      text += ` (Saved ₹${savings}!)`
    }
    text += `\n*Final Total: ₹${grandTotal}*\nShipping: ${isFreeDelivery ? 'FREE Delivery' : 'Standard Delivery (₹40)'}\n\nPlease share the payment details and delivery time to my address. Thank you!`

    return `https://wa.me/917550248005?text=${encodeURIComponent(text)}`
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((o) => !o),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        savings,
        freeShippingThreshold,
        amountToFreeShipping,
        isFreeShipping,
        isFreeDelivery,
        deliveryFee,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        couponDiscount,
        grandTotal,
        selectedProduct,
        setSelectedProduct,
        toastMessage,
        generateWhatsAppOrderUrl,
        currentUser,
        isLoggedIn,
        authLoading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

