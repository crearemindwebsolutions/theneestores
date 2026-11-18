import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { brandInfo } from '../data/products'
import './Navbar.css'

const NAV_LINKS = [
  { id: 'home', name: 'Home', href: '#home' },
  { id: 'products', name: 'Products', href: '#products' },
  { id: 'podis', name: 'Food Podis', href: '#podis' },
  { id: 'wellness', name: 'Health Goals', href: '#wellness' },
  { id: 'about', name: 'Our Story', href: '#about' },
  { id: 'reviews', name: 'Reviews', href: '#reviews' },
  { id: 'contact', name: 'Contact', href: '#contact' },
]

const Navbar = ({ onOpenAccount, currentRoute = 'home' }) => {
  const [open, setOpen] = useState(false)
  const { totalCount, openCart, isLoggedIn, currentUser } = useCart()

  const handleAccountClick = () => {
    if (onOpenAccount) {
      onOpenAccount()
    } else {
      window.location.hash = isLoggedIn ? 'account' : 'login'
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const handleNavClick = (href) => {
    setOpen(false)
    window.location.hash = href
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const checkIsActive = (item) => {
    if (item.id === 'home') {
      return !currentRoute || currentRoute === 'home'
    }
    if (item.id === 'products') {
      return currentRoute === 'products' || currentRoute === 'catalog'
    }
    if (item.id === 'podis') {
      return currentRoute === 'podis' || currentRoute === 'food-podis'
    }
    if (item.id === 'wellness') {
      return currentRoute === 'wellness' || currentRoute === 'health-goals'
    }
    if (item.id === 'about') {
      return currentRoute === 'about' || currentRoute === 'our-story'
    }
    return currentRoute === item.id
  }

  return (
    <nav className="navbar">
      <a
        href="#home"
        className="navbar-brand"
        onClick={(e) => {
          e.preventDefault()
          handleNavClick('#home')
        }}
      >
        <img
          src="/images/custom_thenee/thenee-brand-logo.png"
          alt="THENEE - The Roots Enterprises"
          className="navbar-brand-logo"
        />
        <div className="navbar-brand-text">
          <span className="navbar-brand-title">THENEE</span>
          <span className="navbar-brand-sub"><span className="tamil-word">தேனீ • </span>Roots of Nature</span>
        </div>
      </a>

      {/* Navigation Links Side Drawer */}
      <ul className={`navbar-links ${open ? 'is-open' : ''}`}>
        {NAV_LINKS.map((item) => {
          const active = checkIsActive(item)
          return (
            <li key={item.name}>
              <a
                href={item.href}
                className={`navbar-link ${active ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item.href)
                }}
              >
                {item.name}
              </a>
            </li>
          )
        })}
      </ul>

      {/* Action Buttons on the Right */}
      <div className="navbar-actions">
        {/* FSSAI badge (desktop only) */}
        <div className="navbar-fssai-pill" title={`FSSAI License: ${brandInfo.fssai}`}>
          <span className="fssai-dot" />
          <span className="fssai-text">FSSAI Certified</span>
        </div>

        {/* Account Button: Directly opens the dedicated Account Page */}
        <button
          className="navbar-account-btn"
          onClick={handleAccountClick}
          aria-label={isLoggedIn ? `Account (${currentUser?.name || 'User'})` : 'Login / Account Portal'}
          title={isLoggedIn ? `Account: ${currentUser?.name || 'User'} (Signed In)` : 'Login to Account Portal'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isLoggedIn && <span className="navbar-account-dot" title="Signed In" />}
        </button>

        {/* Cart button with count */}
        <button
          className="navbar-cart-btn"
          onClick={openCart}
          aria-label={`Shopping Cart with ${totalCount} items`}
        >
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
          {totalCount > 0 && <span className="navbar-cart-badge">{totalCount}</span>}
        </button>

        {/* Mobile Hamburger Menu: Placed at the top right corner */}
        <button
          className={`navbar-burger ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          title="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {open && (
        <div
          className="navbar-drawer-backdrop"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar