import { useState, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useLenis from './lib/useLenis'
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import OfferMarquee from './components/OfferMarquee'
import Hero from './components/Hero'
import BestSellers from './components/BestSellers'
import AboutUs from './components/AboutUs'
import OfferGallery from './components/OfferGallery'
import MoodSelector from './components/MoodSelector'
import Testimonial from './components/Testimonial'
import Reviews from './components/Reviews'
import PromoOffers from './components/PromoOffers'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ProductModal from './components/ProductModal'
import AccountPage from './components/AccountPage'
import ProductsPage from './components/ProductsPage'
import FoodPodisPage from './components/FoodPodisPage'
import HealthGoalsPage from './components/HealthGoalsPage'
import OurStoryPage from './components/OurStoryPage'
import ReviewsPage from './components/ReviewsPage'
import ContactPage from './components/ContactPage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import TermsOfServicePage from './components/TermsOfServicePage'
import CheckoutPage from './components/CheckoutPage'
import LoginPage from './components/LoginPage'
import ProfileCompletionModal from './components/ProfileCompletionModal'
import AdminPortal from './components/AdminPortal'
import { CartProvider, useCart } from './context/CartContext'
import { analyticsService } from './lib/analyticsService'
import { migrateLegacyDataIfNeeded } from './lib/userScope'

const parseRouteFromHash = () => {
  if (typeof window !== 'undefined') {
    const search = window.location.search || ''
    const fullHash = window.location.hash || ''
    const isOauthPending = localStorage.getItem('thenee_oauth_pending') === 'true'

    // If OAuth code or access token is present, route directly to account (or saved redirect)
    if (search.includes('code=') || fullHash.includes('access_token=') || (isOauthPending && !fullHash)) {
      const target = localStorage.getItem('thenee_auth_redirect') || 'account'
      return target
    }
  }

  const hash = window.location.hash.replace('#', '')
  if (hash.startsWith('admin')) return 'admin'
  if (hash.startsWith('account')) return 'account'
  if (hash.startsWith('login') || hash.startsWith('signin') || hash.startsWith('signup')) return 'login'
  if (hash.startsWith('checkout')) return 'checkout'
  if (hash === 'products' || hash === 'catalog') return 'products'
  if (hash === 'podis' || hash === 'food-podis') return 'podis'
  if (hash === 'wellness' || hash === 'health-goals') return 'wellness'
  if (hash === 'about' || hash === 'our-story') return 'about'
  if (hash === 'reviews') return 'reviews'
  if (hash === 'contact') return 'contact'
  if (hash === 'privacy' || hash === 'privacy-policy') return 'privacy'
  if (hash === 'terms' || hash === 'terms-of-service' || hash === 'terms-and-conditions') return 'terms'
  return 'home'
}

const AuthLoadingScreen = () => (
  <div
    style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: '44px',
        height: '44px',
        border: '3.5px solid rgba(49, 84, 58, 0.15)',
        borderTopColor: '#274C37',
        borderRadius: '50%',
        animation: 'authSpin 0.8s linear infinite',
      }}
    />
    <style>{`
      @keyframes authSpin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <p
      style={{
        fontFamily: 'var(--font-heading, serif)',
        color: 'var(--color-primary, #1e392a)',
        fontSize: '1.2rem',
        fontWeight: 600,
        margin: 0,
      }}
    >
      Signing you into your THENEE Account...
    </p>
    <p
      style={{
        color: '#666',
        fontSize: '0.9rem',
        margin: 0,
      }}
    >
      Verifying credentials with Google
    </p>
  </div>
)

const STORAGE_KEY_PROMPTED_ACCOUNTS = 'thenee_google_prompted_accounts'

function hasAccountBeenPrompted(email) {
  if (!email) return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMPTED_ACCOUNTS)
    const list = raw ? JSON.parse(raw) : []
    const clean = email.toLowerCase().trim()
    return list.includes(clean)
  } catch {
    return false
  }
}

function markAccountAsPrompted(email) {
  if (!email) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMPTED_ACCOUNTS)
    const list = raw ? JSON.parse(raw) : []
    const clean = email.toLowerCase().trim()
    if (!list.includes(clean)) {
      list.push(clean)
      localStorage.setItem(STORAGE_KEY_PROMPTED_ACCOUNTS, JSON.stringify(list))
    }
  } catch {}
}

const AppContent = () => {
  const [route, setRoute] = useState(parseRouteFromHash)

  useLenis()
  const { toastMessage, isLoggedIn, authLoading, currentUser, loginUser } = useCart()

  useEffect(() => {
    migrateLegacyDataIfNeeded()
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Live analytics route event tracking
  useEffect(() => {
    if (route && route !== 'admin') {
      const routePath = route === 'home' ? '/' : `/${route}`
      const actionLabel = route === 'home' ? 'viewed Home' : `viewed /${route}`
      analyticsService.trackEvent(actionLabel, routePath)
    }
  }, [route])

  // Whenever the active route changes, reset body locks, sync Lenis, scroll to top, and refresh GSAP ScrollTrigger
  useEffect(() => {
    // 1. Clear any stuck body locks from previous drawers/modals
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''

    // 2. Unpause and reset Lenis scroll if active
    if (window.__lenis) {
      window.__lenis.start()
      window.__lenis.scrollTo(0, { immediate: true })
    }

    // 3. Scroll browser viewport to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    // 4. Double check scroll position on next frame and after 100ms
    // to override any component unmount cleanups and update GSAP ScrollTrigger
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true })
      }
      ScrollTrigger.refresh()
    })

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      ScrollTrigger.refresh()
    }, 120)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timer)
    }
  }, [route])

  const navigateToAccount = () => {
    if (isLoggedIn) {
      window.location.hash = 'account'
      setRoute('account')
    } else {
      window.location.hash = 'login'
      setRoute('login')
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToLogin = () => {
    window.location.hash = 'login'
    setRoute('login')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToHome = () => {
    window.location.hash = 'home'
    setRoute('home')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <Loader />

      {route === 'admin' && (
        <AdminPortal onBack={navigateToHome} />
      )}
      {route === 'account' && (
        authLoading ? (
          <AuthLoadingScreen />
        ) : isLoggedIn ? (
          <AccountPage onBack={navigateToHome} onLogout={navigateToLogin} />
        ) : (
          <LoginPage
            onLoginSuccess={(dest) => {
              const target = dest || 'account'
              window.location.hash = target
              setRoute(target)
            }}
            onBack={navigateToHome}
          />
        )
      )}
      {route === 'login' && (
        authLoading ? (
          <AuthLoadingScreen />
        ) : isLoggedIn ? (
          <AccountPage onBack={navigateToHome} onLogout={navigateToLogin} />
        ) : (
          <LoginPage
            onLoginSuccess={(dest) => {
              const target = dest || 'account'
              window.location.hash = target
              setRoute(target)
            }}
            onBack={navigateToHome}
          />
        )
      )}
      {route === 'checkout' && (
        authLoading ? (
          <AuthLoadingScreen />
        ) : isLoggedIn ? (
          <CheckoutPage onBack={navigateToHome} onOpenAccount={navigateToAccount} />
        ) : (
          <LoginPage
            redirectTarget="checkout"
            onLoginSuccess={() => {
              sessionStorage.removeItem('thenee_login_redirect')
              window.location.hash = 'checkout'
              setRoute('checkout')
            }}
            onBack={navigateToHome}
          />
        )
      )}
      {route === 'products' && <ProductsPage onOpenAccount={navigateToAccount} />}
      {route === 'podis' && <FoodPodisPage onOpenAccount={navigateToAccount} />}
      {route === 'wellness' && <HealthGoalsPage onOpenAccount={navigateToAccount} />}
      {route === 'about' && <OurStoryPage onOpenAccount={navigateToAccount} />}
      {route === 'reviews' && <ReviewsPage onOpenAccount={navigateToAccount} />}
      {route === 'contact' && <ContactPage onOpenAccount={navigateToAccount} />}
      {route === 'privacy' && <PrivacyPolicyPage onOpenAccount={navigateToAccount} />}
      {route === 'terms' && <TermsOfServicePage onOpenAccount={navigateToAccount} />}

      {route === 'home' && (
        <div className="home-page-wrapper">
          <OfferMarquee />
          <header className="site-header-sticky">
            <Navbar onOpenAccount={navigateToAccount} currentRoute="home" />
          </header>
          <Hero onOpenAccount={navigateToAccount} />
          <BestSellers />
          <OfferGallery />
          <MoodSelector />
          <AboutUs />
          <Testimonial />
          <Reviews />
          <PromoOffers />
          <Footer />
        </div>
      )}

      <CartDrawer />
      <ProductModal />

      {/* Mandatory Profile & Password Setup for Google Sign-Up Users (Asked strictly ONCE per account) */}
      {isLoggedIn &&
        currentUser?.email &&
        !hasAccountBeenPrompted(currentUser.email) &&
        !currentUser.profilePrompted &&
        !currentUser.profileCompleted &&
        (!currentUser.hasPassword || !currentUser.contact || currentUser.contact.trim() === '' || !currentUser.name || currentUser.name.trim() === '' || currentUser.name.includes('@')) && (
          <ProfileCompletionModal
            currentUser={currentUser}
            onComplete={(updatedUser) => {
              markAccountAsPrompted(currentUser.email)
              loginUser({
                ...updatedUser,
                profilePrompted: true,
                profileCompleted: true,
                hasPassword: true,
              })
            }}
          />
        )}

      {/* Cart toast notification */}
      {toastMessage && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span className="cart-toast-icon">🌿</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}

export default App
