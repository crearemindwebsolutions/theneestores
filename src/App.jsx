import { useState, useEffect } from 'react'
import useLenis from './lib/useLenis'
import Loader from './components/Loader'
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
import CheckoutPage from './components/CheckoutPage'
import LoginPage from './components/LoginPage'
import { CartProvider, useCart } from './context/CartContext'

const parseRouteFromHash = () => {
  const hash = window.location.hash.replace('#', '')
  if (hash.startsWith('account')) return 'account'
  if (hash.startsWith('login') || hash.startsWith('signin') || hash.startsWith('signup')) return 'login'
  if (hash.startsWith('checkout')) return 'checkout'
  if (hash === 'products' || hash === 'catalog') return 'products'
  if (hash === 'podis' || hash === 'food-podis') return 'podis'
  if (hash === 'wellness' || hash === 'health-goals') return 'wellness'
  if (hash === 'about' || hash === 'our-story') return 'about'
  if (hash === 'reviews') return 'reviews'
  if (hash === 'contact') return 'contact'
  return 'home'
}

const AppContent = () => {
  const [route, setRoute] = useState(parseRouteFromHash)

  useLenis()
  const { toastMessage, isLoggedIn } = useCart()

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRouteFromHash())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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

      {route === 'account' && (
        isLoggedIn ? (
          <AccountPage onBack={navigateToHome} onLogout={navigateToLogin} />
        ) : (
          <LoginPage
            onLoginSuccess={() => {
              const redirect = sessionStorage.getItem('thenee_login_redirect') || 'account'
              sessionStorage.removeItem('thenee_login_redirect')
              window.location.hash = redirect
              setRoute(redirect)
            }}
            onBack={navigateToHome}
          />
        )
      )}
      {route === 'login' && (
        <LoginPage
          onLoginSuccess={() => {
            const redirect = sessionStorage.getItem('thenee_login_redirect') || 'account'
            sessionStorage.removeItem('thenee_login_redirect')
            window.location.hash = redirect
            setRoute(redirect)
          }}
          onBack={navigateToHome}
        />
      )}
      {route === 'checkout' && (
        isLoggedIn ? (
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

      {route === 'home' && (
        <>
          <Hero onOpenAccount={navigateToAccount} />
          <BestSellers />
          <AboutUs />
          <OfferGallery />
          <MoodSelector />
          <Testimonial />
          <Reviews />
          <PromoOffers />
          <Footer />
        </>
      )}

      <CartDrawer />
      <ProductModal />

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
