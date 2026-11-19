import { useState, useEffect, useMemo } from 'react'
import { cmsService } from '../lib/cmsService'
import { adminService, profileService } from '../lib/supabase'
import './PagesShared.css'
import './AdminPortal.css'

const Icons = {
  dashboard: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  orders: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  products: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  coupons: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  ),
  cms: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  reviews: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  inquiries: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  customers: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  settings: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  storefront: (props) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  refresh: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  ),
  lock: (props) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  plus: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  download: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  revenue: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="18" />
    </svg>
  ),
  trend: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  leaf: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  truck: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  fileText: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  edit: (props) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (props) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  save: (props) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  search: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  printer: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  whatsapp: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
    </svg>
  ),
  gift: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  star: (props) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  close: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard & Analytics', icon: 'dashboard' },
  { id: 'orders', label: 'Orders & Fulfillment', icon: 'orders' },
  { id: 'products', label: 'Products & Catalog CMS', icon: 'products' },
  { id: 'coupons', label: 'Coupons & Discounts', icon: 'coupons' },
  { id: 'cms', label: 'Website Content & Banners', icon: 'cms' },
  { id: 'reviews', label: 'Customer Reviews', icon: 'reviews' },
  { id: 'inquiries', label: 'Inquiries & WhatsApp CRM', icon: 'inquiries' },
  { id: 'customers', label: 'Customers & Green Loyalty', icon: 'customers' },
  { id: 'settings', label: 'Store & Dispatch Settings', icon: 'settings' },
]

const ORDER_STATUSES = ['all', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled']
const COURIER_PARTNERS = ['India Post Speed Post', 'BlueDart Express', 'DTDC Courier', 'Professional Couriers', 'Delhivery']

const AdminPortal = ({ onBack }) => {
  // Authentication State
  const [isUnlocked, setIsUnlocked] = useState(() => cmsService.isAdminUnlocked())
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard')

  // Data States
  const [orders, setOrders] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [products, setProducts] = useState(() => cmsService.getProducts())
  const [podis, setPodis] = useState(() => cmsService.getPodis())
  const [coupons, setCoupons] = useState(() => cmsService.getCoupons())
  const [siteContent, setSiteContent] = useState(() => cmsService.getSiteContent())
  const [reviews, setReviews] = useState(() => cmsService.getReviews())
  const [storeSettings, setStoreSettings] = useState(() => cmsService.getStoreSettings())
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Modals & Filter States
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false)
  const [courierForm, setCourierForm] = useState({ partner: 'India Post Speed Post', awb: '', status: 'Dispatched' })
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [invoiceOrder, setInvoiceOrder] = useState(null)

  // Product Editing Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isNewProduct, setIsNewProduct] = useState(false)

  // Coupon Editing Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState({
    code: '',
    discountType: 'flat',
    discountValue: 50,
    minOrder: 499,
    maxDiscount: 50,
    isActive: true,
    description: '',
    expiryDate: '2026-12-31',
  })

  // Review Editing Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState({
    id: '',
    name: '',
    location: '',
    rating: 5,
    productName: 'Thenee Herbal Tea',
    text: '',
    isApproved: true,
  })

  // Green Points Adjustment Modal
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [pointsDelta, setPointsDelta] = useState(50)
  const [pointsReason, setPointsReason] = useState('Customer Loyalty Bonus')

  // Password / Pin Change
  const [newPin, setNewPin] = useState('')
  const [pinChangeMsg, setPinChangeMsg] = useState('')

  // Show Toast Helper
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Load Real Data from Supabase / Local Storage
  const loadStoreData = async () => {
    setIsLoading(true)
    try {
      const [ordersRes, inqRes, custRes] = await Promise.all([
        adminService.getAllOrders(),
        adminService.getAllInquiries(),
        adminService.getAllCustomers(),
      ])
      if (ordersRes.data) setOrders(ordersRes.data)
      if (inqRes.data) setInquiries(inqRes.data)
      if (custRes.data) setCustomers(custRes.data)
      setProducts(cmsService.getProducts())
      setPodis(cmsService.getPodis())
      setCoupons(cmsService.getCoupons())
      setSiteContent(cmsService.getSiteContent())
      setReviews(cmsService.getReviews())
      setStoreSettings(cmsService.getStoreSettings())
    } catch (err) {
      console.warn('Admin data load notice:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isUnlocked) {
      loadStoreData()
    }
  }, [isUnlocked])

  // Listen to CMS update broadcasts
  useEffect(() => {
    const handleCmsUpdate = () => {
      setProducts(cmsService.getProducts())
      setPodis(cmsService.getPodis())
      setCoupons(cmsService.getCoupons())
      setSiteContent(cmsService.getSiteContent())
      setReviews(cmsService.getReviews())
      setStoreSettings(cmsService.getStoreSettings())
    }
    window.addEventListener('thenee_cms_updated', handleCmsUpdate)
    return () => window.removeEventListener('thenee_cms_updated', handleCmsUpdate)
  }, [])

  // Unlock Handler
  const handleUnlock = (e) => {
    e.preventDefault()
    if (cmsService.unlockAdmin(pinInput)) {
      setIsUnlocked(true)
      setPinError('')
      showToast('Admin Console unlocked successfully. Welcome to Kadayam Store Control!')
    } else {
      setPinError('Invalid Admin Passcode. Use registered Master PIN or 7550248005.')
    }
  }

  const handleLock = () => {
    cmsService.lockAdmin()
    setIsUnlocked(false)
    setPinInput('')
    showToast('Admin Console session locked.')
  }

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS
  // --------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const confirmedCount = orders.filter((o) => (o.order_status || '').toLowerCase() === 'confirmed').length
    const dispatchedCount = orders.filter((o) => (o.order_status || '').toLowerCase() === 'dispatched').length
    const deliveredCount = orders.filter((o) => (o.order_status || '').toLowerCase() === 'delivered').length
    const totalProductsCount = products.length + podis.length
    const aov = orders.length > 0 ? Math.round(totalRev / orders.length) : 0
    return {
      totalRev,
      ordersCount: orders.length,
      confirmedCount,
      dispatchedCount,
      deliveredCount,
      totalProductsCount,
      aov,
      inquiriesCount: inquiries.length,
    }
  }, [orders, products, podis, inquiries])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = orderFilter === 'all' || (o.order_status || '').toLowerCase() === orderFilter.toLowerCase()
      const q = orderSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.includes(q)) ||
        (o.tracking_number && o.tracking_number.toLowerCase().includes(q)) ||
        (o.shipping_city && o.shipping_city.toLowerCase().includes(q))
      return matchFilter && matchSearch
    })
  }, [orders, orderFilter, orderSearch])

  // --------------------------------------------------------------------------
  // ORDER ACTIONS
  // --------------------------------------------------------------------------
  const handleOpenCourierModal = (order) => {
    setSelectedOrder(order)
    setCourierForm({
      partner: order.courier_partner || 'India Post Speed Post',
      awb: order.tracking_number || '',
      status: order.order_status || 'Dispatched',
    })
    setIsCourierModalOpen(true)
  }

  const handleSaveCourier = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return
    const orderKey = selectedOrder.order_number || selectedOrder.id
    try {
      await adminService.updateOrderStatus(
        orderKey,
        courierForm.status,
        courierForm.awb,
        courierForm.partner
      )
      setIsCourierModalOpen(false)
      showToast(`Order ${orderKey} updated with ${courierForm.partner} AWB: ${courierForm.awb}`)
      loadStoreData()
    } catch (err) {
      showToast('Error updating consignment details')
    }
  }

  const handlePrintInvoice = (order) => {
    setInvoiceOrder(order)
    setIsInvoiceModalOpen(true)
  }

  const handleExportCsv = () => {
    const csvData = cmsService.exportOrdersToCsv(orders)
    if (!csvData) {
      showToast('No orders available to export.')
      return
    }
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `THENEE_Orders_Ledger_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Orders ledger exported to CSV successfully.')
  }

  // --------------------------------------------------------------------------
  // PRODUCT MANAGEMENT ACTIONS
  // --------------------------------------------------------------------------
  const handleOpenEditProduct = (prod, isNew = false) => {
    setIsNewProduct(isNew)
    if (isNew) {
      setEditingProduct({
        id: `custom-prod-${Date.now()}`,
        name: '',
        category: 'tea',
        categoryLabel: 'Botanical Teas',
        price: 299,
        originalPrice: 399,
        volume: '100g Pouch',
        badge: 'New Harvest',
        tagline: 'Handcrafted village botanical formulation',
        description: 'Authentic 100% natural formulation crafted in Kadayam.',
        ingredients: 'Pure shade-dried mountain botanicals and herbs',
        inStock: true,
        stockCount: 50,
        cardImage: '/images/custom_thenee/herbal-tea-product.jpg',
        keyBenefits: [
          { title: 'Natural Healing', desc: 'Handcrafted according to traditional Ayurvedic principles.' },
          { title: 'Pure Botanicals', desc: '100% natural herbs with zero artificial additives.' },
        ],
      })
    } else {
      setEditingProduct({ ...prod, inStock: prod.inStock !== false, stockCount: prod.stockCount || 45 })
    }
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (!editingProduct || !editingProduct.name) return
    if (editingProduct.category === 'podi') {
      cmsService.savePodi(editingProduct)
    } else {
      cmsService.saveProduct(editingProduct)
    }
    setIsProductModalOpen(false)
    showToast(`Product "${editingProduct.name}" saved and live on storefront!`)
    loadStoreData()
  }

  const handleDeleteProduct = (id, isPodi = false) => {
    if (!window.confirm('Are you sure you want to delete this product from the live catalog?')) return
    if (isPodi) {
      cmsService.deletePodi(id)
    } else {
      cmsService.deleteProduct(id)
    }
    showToast('Product removed from catalog.')
    loadStoreData()
  }

  const handleResetCatalog = () => {
    if (!window.confirm('Reset catalog back to initial factory botanical formulations? Custom added products will be cleared.')) return
    cmsService.resetCatalogDefaults()
    showToast('Catalog reset to initial authentic botanical formulas.')
    loadStoreData()
  }

  // --------------------------------------------------------------------------
  // COUPON MANAGEMENT ACTIONS
  // --------------------------------------------------------------------------
  const handleOpenNewCoupon = () => {
    setEditingCoupon({
      code: '',
      discountType: 'flat',
      discountValue: 50,
      minOrder: 499,
      maxDiscount: 50,
      isActive: true,
      description: 'Special store discount',
      usageCount: 0,
      expiryDate: '2026-12-31',
    })
    setIsCouponModalOpen(true)
  }

  const handleSaveCoupon = (e) => {
    e.preventDefault()
    if (!editingCoupon.code) return
    cmsService.saveCoupon({
      ...editingCoupon,
      code: editingCoupon.code.toUpperCase().trim(),
    })
    setIsCouponModalOpen(false)
    showToast(`Coupon code ${editingCoupon.code.toUpperCase()} is now live!`)
    loadStoreData()
  }

  const handleDeleteCoupon = (code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return
    cmsService.deleteCoupon(code)
    showToast(`Coupon ${code} deleted.`)
    loadStoreData()
  }

  const handleToggleCouponActive = (c) => {
    cmsService.saveCoupon({ ...c, isActive: !c.isActive })
    showToast(`Coupon ${c.code} is now ${!c.isActive ? 'Active' : 'Inactive'}.`)
    loadStoreData()
  }

  // --------------------------------------------------------------------------
  // CONTENT CMS ACTIONS
  // --------------------------------------------------------------------------
  const handleSaveSiteContent = (e) => {
    e.preventDefault()
    cmsService.saveSiteContent(siteContent)
    showToast('Storefront content, announcements & promotional banners updated live!')
  }

  // --------------------------------------------------------------------------
  // REVIEWS MANAGEMENT
  // --------------------------------------------------------------------------
  const handleOpenAddReview = () => {
    setEditingReview({
      id: `rev-${Date.now()}`,
      name: '',
      location: 'Tenkasi, TN',
      rating: 5,
      productName: 'Thenee Herbal Tea',
      date: new Date().toISOString().split('T')[0],
      text: '',
      isApproved: true,
    })
    setIsReviewModalOpen(true)
  }

  const handleSaveReview = (e) => {
    e.preventDefault()
    if (!editingReview.name || !editingReview.text) return
    cmsService.saveReview(editingReview)
    setIsReviewModalOpen(false)
    showToast(`Review by ${editingReview.name} saved!`)
    loadStoreData()
  }

  const handleDeleteReview = (id) => {
    if (!window.confirm('Delete this customer review?')) return
    cmsService.deleteReview(id)
    showToast('Review removed.')
    loadStoreData()
  }

  const handleToggleReviewApproved = (rev) => {
    cmsService.saveReview({ ...rev, isApproved: !rev.isApproved })
    showToast(`Review by ${rev.name} ${!rev.isApproved ? 'Approved' : 'Hidden'}.`)
    loadStoreData()
  }

  // --------------------------------------------------------------------------
  // INQUIRIES & WHATSAPP CRM
  // --------------------------------------------------------------------------
  const handleUpdateInquiry = async (id, status) => {
    try {
      await adminService.updateInquiryStatus(id, status)
      showToast(`Inquiry status marked as ${status}`)
      loadStoreData()
    } catch (e) {
      showToast('Error updating inquiry status')
    }
  }

  const handleOpenWhatsAppReply = (inq) => {
    const phone = (inq.phone || '').replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Vanakkam ${inq.name || 'Patron'}, greetings from THENEE Ayurvedic store (Manthiyoor, Kadayam, Tenkasi). Regarding your inquiry on "${inq.inquiry_type || 'Retail Order'}": we are happy to assist you today!`
    )
    window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${msg}`, '_blank')
    handleUpdateInquiry(inq.id, 'Replied')
  }

  // --------------------------------------------------------------------------
  // STORE SETTINGS ACTIONS
  // --------------------------------------------------------------------------
  const handleSaveStoreSettings = (e) => {
    e.preventDefault()
    cmsService.saveStoreSettings(storeSettings)
    showToast('Store settings, contact info, and dispatch rules updated!')
  }

  const handleChangePin = (e) => {
    e.preventDefault()
    if (!newPin || newPin.length < 4) {
      setPinChangeMsg('PIN must be at least 4 digits')
      return
    }
    cmsService.setMasterPin(newPin)
    setPinChangeMsg('Master PIN updated successfully!')
    setNewPin('')
    setTimeout(() => setPinChangeMsg(''), 4000)
    showToast('Admin master PIN updated.')
  }

  // --------------------------------------------------------------------------
  // RENDER: LOCKED AUTHENTICATION GATE
  // --------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="admin-portal-wrapper admin-lock-screen">
        <div className="admin-lock-card">
          <div className="admin-lock-logo">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 3.5 1.8 6.57 4.54 8.35C6.19 19.34 6 18.2 6 17c0-4.41 3.59-8 8-8 1.2 0 2.34.19 3.35.54C15.57 6.8 12.5 5 9 5c-.34 0-.67.02-1 .06C9.17 3.23 10.5 2 12 2z"
                fill="#123223"
              />
              <path
                d="M17 9c-3.86 0-7 3.14-7 7 0 1.29.35 2.5 1 3.53C12.54 20.35 14.18 21 16 21c3.86 0 7-3.14 7-7 0-1.82-.65-3.46-1.47-5-.84.6-1.92 1-3.53 1z"
                fill="#2E5C42"
              />
            </svg>
            <span className="admin-seal-tag">KADAYAM STORE BACKEND</span>
          </div>

          <h2 className="admin-lock-title">THENEE Store Admin Console</h2>
          <p className="admin-lock-desc">
            Direct access to village dispatch ledger, live catalog editor, coupon manager, and website CMS.
          </p>

          <form onSubmit={handleUnlock} className="admin-lock-form">
            <label className="admin-field-lbl">Enter Master Admin Passcode</label>
            <div className="admin-pin-input-wrap">
              <span className="admin-pin-key-icon"><Icons.lock width="18" height="18" /></span>
              <input
                type="password"
                placeholder="Enter 4-10 digit master PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                required
              />
            </div>
            {pinError && <div className="admin-pin-err-msg">{pinError}</div>}

            <button type="submit" className="admin-unlock-btn">
              Unlock Admin Portal
            </button>
          </form>

          <div className="admin-lock-footer">
            <span className="admin-hint-txt">Default Master PINs: <strong>7550248005</strong> or <strong>thenee2026</strong></span>
            <button type="button" className="admin-back-store-btn" onClick={onBack}>
              ← Return to Storefront
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: UNLOCKED ADMIN CONSOLE WORKSTATION
  // --------------------------------------------------------------------------
  return (
    <div className="admin-portal-wrapper">
      {/* Top Admin App Header */}
      <header className="admin-top-nav">
        <div className="admin-top-left">
          <div className="admin-brand-cluster">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 3.5 1.8 6.57 4.54 8.35C6.19 19.34 6 18.2 6 17c0-4.41 3.59-8 8-8 1.2 0 2.34.19 3.35.54C15.57 6.8 12.5 5 9 5c-.34 0-.67.02-1 .06C9.17 3.23 10.5 2 12 2z"
                fill="#CADCBE"
              />
            </svg>
            <div className="admin-brand-meta">
              <span className="admin-brand-name">THENEE ADMIN</span>
              <span className="admin-hub-badge">Kadayam Hub • Live Mode</span>
            </div>
          </div>
        </div>

        <div className="admin-top-center">
          <span className="admin-live-pulse" />
          <span className="admin-clock-txt">
            Live Storefront: {metrics.ordersCount} Orders • ₹{metrics.totalRev.toLocaleString('en-IN')} Gross
          </span>
        </div>

        <div className="admin-top-actions">
          <button
            type="button"
            className="admin-nav-action-btn store-view-btn"
            onClick={() => {
              window.location.hash = 'home'
              onBack && onBack()
            }}
            title="Open Customer Storefront"
          >
            <Icons.storefront />
            <span>View Storefront</span>
          </button>
          <button
            type="button"
            className="admin-nav-action-btn refresh-btn"
            onClick={loadStoreData}
            title="Refresh Live Data"
          >
            <Icons.refresh />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="admin-nav-action-btn lock-btn"
            onClick={handleLock}
            title="Lock Admin Session"
          >
            <Icons.lock />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar + Viewport */}
      <div className="admin-portal-layout">
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section-title">STORE SECTIONS</div>
          <nav className="admin-sidebar-nav">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              let badgeCount = null
              if (tab.id === 'orders') badgeCount = metrics.ordersCount
              if (tab.id === 'products') badgeCount = metrics.totalProductsCount
              if (tab.id === 'inquiries') badgeCount = metrics.inquiriesCount
              if (tab.id === 'coupons') badgeCount = coupons.filter((c) => c.isActive).length

              const TabIcon = Icons[tab.icon] || Icons.dashboard

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`admin-sidebar-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="sidebar-item-icon"><TabIcon /></span>
                  <span className="sidebar-item-label">{tab.label}</span>
                  {badgeCount !== null && (
                    <span className={`sidebar-badge ${badgeCount > 0 ? 'has-data' : ''}`}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-unit-info">
              <span className="unit-name">Tenkasi Unit #01</span>
              <span className="unit-fssai">FSSAI: {storeSettings.fssai}</span>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="admin-content-area">
          {isLoading && (
            <div className="admin-loading-banner">
              <span className="admin-spinner" /> Synchronizing live store data...
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {/* ================================================================ */}
          {activeTab === 'dashboard' && (
            <section className="admin-tab-pane tab-dashboard">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">EXECUTIVE OVERVIEW</span>
                  <h1 className="pane-title">Store Operations & Health</h1>
                </div>
                <div className="pane-actions-row">
                  <button type="button" className="admin-action-btn primary" onClick={() => handleOpenEditProduct(null, true)}>
                    <Icons.plus />
                    <span>Add Product</span>
                  </button>
                  <button type="button" className="admin-action-btn secondary" onClick={handleExportCsv}>
                    <Icons.download />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 4 Large KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="kpi-card highlight-green">
                  <div className="kpi-card-top">
                    <span className="kpi-title">Gross Revenue</span>
                    <span className="kpi-icon"><Icons.revenue /></span>
                  </div>
                  <div className="kpi-num">₹{metrics.totalRev.toLocaleString('en-IN')}</div>
                  <div className="kpi-meta">All confirmed customer orders</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-title">Total Orders</span>
                    <span className="kpi-icon"><Icons.orders /></span>
                  </div>
                  <div className="kpi-num">{metrics.ordersCount}</div>
                  <div className="kpi-meta">
                    <span className="kpi-badge-confirmed">{metrics.confirmedCount} Confirmed</span> •{' '}
                    <span className="kpi-badge-dispatched">{metrics.dispatchedCount} Dispatched</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-title">Average Order Value</span>
                    <span className="kpi-icon"><Icons.trend /></span>
                  </div>
                  <div className="kpi-num">₹{metrics.aov}</div>
                  <div className="kpi-meta">Per customer basket size</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-title">Catalog Health</span>
                    <span className="kpi-icon"><Icons.leaf /></span>
                  </div>
                  <div className="kpi-num">{metrics.totalProductsCount} Items</div>
                  <div className="kpi-meta">Teas, Superfood & Podis in Stock</div>
                </div>
              </div>

              {/* Split Dashboard Feeds: Recent Orders & Inquiries */}
              <div className="admin-dual-feed-grid">
                {/* Recent Orders Feed */}
                <div className="admin-feed-card">
                  <div className="feed-header-row">
                    <h3>Recent Customer Orders</h3>
                    <button type="button" className="feed-view-all-link" onClick={() => setActiveTab('orders')}>
                      View All Orders ({orders.length}) →
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="admin-empty-state">No customer orders recorded yet.</div>
                  ) : (
                    <div className="feed-orders-list">
                      {orders.slice(0, 5).map((o) => (
                        <div key={o.id} className="feed-order-row">
                          <div className="order-main-meta">
                            <strong>{o.order_number || o.id.slice(0, 8)}</strong>
                            <span>{o.customer_name || 'Guest'} • {o.shipping_city || 'India'}</span>
                          </div>
                          <div className="order-amt-status">
                            <span className="order-amt">₹{o.total_amount}</span>
                            <span className={`status-pill status-${(o.order_status || 'confirmed').toLowerCase()}`}>
                              {o.order_status || 'Confirmed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Inquiries Feed */}
                <div className="admin-feed-card">
                  <div className="feed-header-row">
                    <h3>Recent Contact Inquiries</h3>
                    <button type="button" className="feed-view-all-link" onClick={() => setActiveTab('inquiries')}>
                      View All CRM ({inquiries.length}) →
                    </button>
                  </div>
                  {inquiries.length === 0 ? (
                    <div className="admin-empty-state">No customer inquiries pending.</div>
                  ) : (
                    <div className="feed-orders-list">
                      {inquiries.slice(0, 5).map((inq) => (
                        <div key={inq.id} className="feed-order-row">
                          <div className="order-main-meta">
                            <strong>{inq.name}</strong>
                            <span className="inq-tag-line">{inq.inquiry_type} • {inq.phone}</span>
                          </div>
                          <button
                            type="button"
                            className="btn-feed-whatsapp"
                            onClick={() => handleOpenWhatsAppReply(inq)}
                            title="Reply via WhatsApp"
                          >
                            <Icons.whatsapp />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 2: ORDERS & FULFILLMENT */}
          {/* ================================================================ */}
          {activeTab === 'orders' && (
            <section className="admin-tab-pane tab-orders">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">STORE LOGISTICS</span>
                  <h1 className="pane-title">Orders & Consignment Dispatch</h1>
                </div>
                <div className="pane-actions-row">
                  <button type="button" className="admin-action-btn secondary" onClick={handleExportCsv}>
                    <Icons.download />
                    <span>Export CSV Ledger</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="orders-control-bar">
                <div className="orders-filter-chips">
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`filter-chip ${orderFilter === st ? 'is-active' : ''}`}
                      onClick={() => setOrderFilter(st)}
                    >
                      {st.toUpperCase()}
                      {st !== 'all' && (
                        <span className="chip-count">
                          {orders.filter((o) => (o.order_status || '').toLowerCase() === st.toLowerCase()).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="orders-search-wrap">
                  <span className="search-icon"><Icons.search /></span>
                  <input
                    type="text"
                    placeholder="Search Order #, Name, Phone, AWB, City..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  {orderSearch && (
                    <button type="button" className="clear-search-btn" onClick={() => setOrderSearch('')}>
                      <Icons.close />
                    </button>
                  )}
                </div>
              </div>

              {/* Orders Table */}
              <div className="admin-table-container">
                {filteredOrders.length === 0 ? (
                  <div className="admin-empty-state">No matching orders found.</div>
                ) : (
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Courier / AWB</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const itemsCount = (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)
                        return (
                          <tr key={o.id}>
                            <td className="cell-order-id">
                              <strong>{o.order_number || o.id.slice(0, 8)}</strong>
                              <span className="cell-payment-tag">{o.payment_method || 'COD'}</span>
                            </td>
                            <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
                            <td>
                              <div className="cell-customer">
                                <strong>{o.customer_name || 'Guest'}</strong>
                                <span>{o.customer_phone || '—'}</span>
                                <small>{o.shipping_city || o.shipping_state || 'India'}</small>
                              </div>
                            </td>
                            <td>
                              <span className="cell-items-pill">{itemsCount} Items</span>
                            </td>
                            <td className="cell-amount">₹{o.total_amount}</td>
                            <td>
                              <span className={`status-pill status-${(o.order_status || 'confirmed').toLowerCase()}`}>
                                {o.order_status || 'Confirmed'}
                              </span>
                            </td>
                            <td>
                              {o.tracking_number ? (
                                <div className="cell-courier-info">
                                  <strong>{o.courier_partner || 'India Post'}</strong>
                                  <span className="awb-num">{o.tracking_number}</span>
                                </div>
                              ) : (
                                <span className="cell-no-awb">Awaiting AWB</span>
                              )}
                            </td>
                            <td>
                              <div className="row-action-btns">
                                <button
                                  type="button"
                                  className="btn-tbl-action"
                                  onClick={() => handleOpenCourierModal(o)}
                                  title="Assign Courier & Status"
                                >
                                  <Icons.truck />
                                  <span>Fulfill</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn-tbl-action invoice"
                                  onClick={() => handlePrintInvoice(o)}
                                  title="Print Packing Slip & Invoice"
                                >
                                  <Icons.fileText />
                                  <span>Invoice</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 3: PRODUCTS & CATALOG CMS */}
          {/* ================================================================ */}
          {activeTab === 'products' && (
            <section className="admin-tab-pane tab-products">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">CATALOG CMS</span>
                  <h1 className="pane-title">Products, Pricing & Inventory</h1>
                </div>
                <div className="pane-actions-row">
                  <button type="button" className="admin-action-btn primary" onClick={() => handleOpenEditProduct(null, true)}>
                    <Icons.plus />
                    <span>Add New Product</span>
                  </button>
                  <button type="button" className="admin-action-btn secondary" onClick={handleResetCatalog} title="Reset to initial catalogue">
                    <Icons.refresh />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Main Products Grid */}
              <div className="admin-section-subhead">
                <h3>Botanical Teas & Superfood Blends ({products.length})</h3>
                <span>Changes made here update the storefront live across all pages.</span>
              </div>

              <div className="admin-products-grid">
                {products.map((prod) => (
                  <div key={prod.id} className="admin-product-card">
                    <div className="prod-card-top">
                      <img src={prod.cardImage || prod.bottle} alt={prod.name} className="prod-thumb" />
                      <div className="prod-meta">
                        <span className="prod-badge-tag">{prod.badge || 'Kadayam Fresh'}</span>
                        <h4 className="prod-name">{prod.name}</h4>
                        <span className="prod-vol">{prod.volume}</span>
                      </div>
                    </div>

                    <div className="prod-card-body">
                      <div className="prod-price-row">
                        <span className="selling-price">₹{prod.price}</span>
                        {prod.originalPrice && <span className="mrp-price">₹{prod.originalPrice}</span>}
                        <span className="stock-pill in-stock">In Stock ({prod.stockCount || 50})</span>
                      </div>
                      <p className="prod-desc-snippet">{prod.tagline || prod.description}</p>
                    </div>

                    <div className="prod-card-actions">
                      <button type="button" className="btn-prod-edit" onClick={() => handleOpenEditProduct(prod, false)}>
                        <Icons.edit />
                        <span>Edit Product</span>
                      </button>
                      <button type="button" className="btn-prod-del" onClick={() => handleDeleteProduct(prod.id, false)}>
                        <Icons.trash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual Food Podis Grid */}
              <div className="admin-section-subhead" style={{ marginTop: '36px' }}>
                <h3>Traditional Food Podis Collection ({podis.length})</h3>
                <span>Stone-ground authentic village recipes packaged in 100g pouches.</span>
              </div>

              <div className="admin-products-grid">
                {podis.map((podi) => (
                  <div key={podi.id} className="admin-product-card">
                    <div className="prod-card-top">
                      <img src={podi.cardImage || podi.image} alt={podi.name} className="prod-thumb" />
                      <div className="prod-meta">
                        <span className="prod-badge-tag">{podi.badge || 'Stone-Ground'}</span>
                        <h4 className="prod-name">{podi.name}</h4>
                        <span className="prod-vol">{podi.volume || '100g Pouch'}</span>
                      </div>
                    </div>

                    <div className="prod-card-body">
                      <div className="prod-price-row">
                        <span className="selling-price">₹{podi.price}</span>
                        {podi.originalPrice && <span className="mrp-price">₹{podi.originalPrice}</span>}
                        <span className="stock-pill in-stock">In Stock</span>
                      </div>
                      <p className="prod-desc-snippet">{podi.shortDesc || podi.desc}</p>
                    </div>

                    <div className="prod-card-actions">
                      <button type="button" className="btn-prod-edit" onClick={() => handleOpenEditProduct(podi, false)}>
                        <Icons.edit />
                        <span>Edit Podi</span>
                      </button>
                      <button type="button" className="btn-prod-del" onClick={() => handleDeleteProduct(podi.id, true)}>
                        <Icons.trash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 4: COUPONS & DISCOUNTS */}
          {/* ================================================================ */}
          {activeTab === 'coupons' && (
            <section className="admin-tab-pane tab-coupons">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">MARKETING & PROMOTIONS</span>
                  <h1 className="pane-title">Coupons & Special Vouchers</h1>
                </div>
                <div className="pane-actions-row">
                  <button type="button" className="admin-action-btn primary" onClick={handleOpenNewCoupon}>
                    <Icons.plus />
                    <span>Create Coupon</span>
                  </button>
                </div>
              </div>

              <div className="coupons-grid">
                {coupons.map((c) => (
                  <div key={c.code} className={`coupon-admin-card ${c.isActive ? 'is-active' : 'is-disabled'}`}>
                    <div className="coupon-card-top">
                      <div className="coupon-code-badge">
                        <span><Icons.coupons width="15" height="15" /></span>
                        <strong>{c.code}</strong>
                      </div>
                      <span className={`coupon-status-tag ${c.isActive ? 'active' : 'inactive'}`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="coupon-card-value">
                      {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </div>

                    <p className="coupon-desc">{c.description || 'Valid on all Kadayam village products'}</p>

                    <div className="coupon-meta-grid">
                      <div>
                        <span>Min Order:</span> <strong>₹{c.minOrder}</strong>
                      </div>
                      <div>
                        <span>Expires:</span> <strong>{c.expiryDate}</strong>
                      </div>
                      <div>
                        <span>Redeemed:</span> <strong>{c.usageCount || 0} times</strong>
                      </div>
                    </div>

                    <div className="coupon-card-actions">
                      <button
                        type="button"
                        className="btn-toggle-coupon"
                        onClick={() => handleToggleCouponActive(c)}
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className="btn-delete-coupon"
                        onClick={() => handleDeleteCoupon(c.code)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 5: WEBSITE CONTENT & BANNERS CMS */}
          {/* ================================================================ */}
          {activeTab === 'cms' && (
            <section className="admin-tab-pane tab-cms">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">STOREFRONT CMS</span>
                  <h1 className="pane-title">Banner Text, Marquee & Village Story</h1>
                </div>
              </div>

              <form onSubmit={handleSaveSiteContent} className="cms-editor-form">
                {/* 1. Top Announcement Marquee */}
                <div className="cms-section-card">
                  <h3>1. Top Scrolling Announcement Marquee</h3>
                  <p className="cms-hint">Appears at the very top of all store pages above the navbar.</p>

                  <div className="admin-input-group">
                    <label>Marquee Announcement Text</label>
                    <textarea
                      rows={2}
                      value={siteContent.marqueeText}
                      onChange={(e) => setSiteContent({ ...siteContent, marqueeText: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* 2. Dual Promotional Banner Tiles */}
                <div className="cms-section-card">
                  <h3>2. Promotional Dual Banner Tiles</h3>
                  <p className="cms-hint">The two feature cards displayed on the storefront home page.</p>

                  <div className="cms-dual-columns">
                    <div className="cms-sub-box">
                      <h4>Left Tile (Botanical Wellness)</h4>
                      <div className="admin-input-group">
                        <label>Heading</label>
                        <input
                          type="text"
                          value={siteContent.promoTile1?.heading || ''}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              promoTile1: { ...siteContent.promoTile1, heading: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>Description Body</label>
                        <input
                          type="text"
                          value={siteContent.promoTile1?.body || ''}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              promoTile1: { ...siteContent.promoTile1, body: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>Button Label</label>
                        <input
                          type="text"
                          value={siteContent.promoTile1?.cta || ''}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              promoTile1: { ...siteContent.promoTile1, cta: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="cms-sub-box">
                      <h4>Right Tile (Free Shipping Offer)</h4>
                      <div className="admin-input-group">
                        <label>Heading</label>
                        <input
                          type="text"
                          value={siteContent.promoTile2?.heading || ''}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              promoTile2: { ...siteContent.promoTile2, heading: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>Description Body</label>
                        <input
                          type="text"
                          value={siteContent.promoTile2?.body || ''}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              promoTile2: { ...siteContent.promoTile2, body: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>Button Label</label>
                        <input
                          type="text"
                          value={siteContent.promoTile2?.cta || ''}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              promoTile2: { ...siteContent.promoTile2, cta: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Kadayam Village Story & Impact Numbers */}
                <div className="cms-section-card">
                  <h3>3. Kadayam Village Story & Heritage Stats</h3>
                  <div className="cms-fields-row">
                    <div className="admin-input-group">
                      <label>Families Healed Statistic</label>
                      <input
                        type="text"
                        value={siteContent.heritageStory?.familiesHealed || '16,000+'}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            heritageStory: { ...siteContent.heritageStory, familiesHealed: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="admin-input-group">
                      <label>Women Artisans Percentage</label>
                      <input
                        type="text"
                        value={siteContent.heritageStory?.womenArtisans || '100%'}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            heritageStory: { ...siteContent.heritageStory, womenArtisans: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="admin-save-cms-btn">
                  <Icons.save />
                  <span>Save All Website Content Changes</span>
                </button>
              </form>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 6: CUSTOMER REVIEWS */}
          {/* ================================================================ */}
          {activeTab === 'reviews' && (
            <section className="admin-tab-pane tab-reviews">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">PATRON TRUST</span>
                  <h1 className="pane-title">Customer Reviews & Testimonials</h1>
                </div>
                <div className="pane-actions-row">
                  <button type="button" className="admin-action-btn primary" onClick={handleOpenAddReview}>
                    <Icons.plus />
                    <span>Add Verified Review</span>
                  </button>
                </div>
              </div>

              <div className="admin-reviews-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Patron</th>
                      <th>Rating</th>
                      <th>Product</th>
                      <th>Review Text</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((rev) => (
                      <tr key={rev.id}>
                        <td>
                          <strong>{rev.name}</strong>
                          <small>{rev.location}</small>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
                            {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                              <Icons.star key={i} />
                            ))}
                          </div>
                        </td>
                        <td>{rev.productName}</td>
                        <td className="cell-review-text">{rev.text}</td>
                        <td>
                          <span className={`status-pill ${rev.isApproved ? 'status-delivered' : 'status-cancelled'}`}>
                            {rev.isApproved ? 'Approved' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div className="row-action-btns">
                            <button
                              type="button"
                              className="btn-tbl-action"
                              onClick={() => handleToggleReviewApproved(rev)}
                            >
                              {rev.isApproved ? 'Hide' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              className="btn-tbl-action invoice"
                              onClick={() => handleDeleteReview(rev.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 7: INQUIRIES & WHATSAPP CRM */}
          {/* ================================================================ */}
          {activeTab === 'inquiries' && (
            <section className="admin-tab-pane tab-inquiries">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">SUPPORT DESK</span>
                  <h1 className="pane-title">Customer Messages & WhatsApp CRM</h1>
                </div>
              </div>

              <div className="admin-table-container">
                {inquiries.length === 0 ? (
                  <div className="admin-empty-state">No inquiries received yet.</div>
                ) : (
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Direct Reply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq.id}>
                          <td>{inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-IN') : '—'}</td>
                          <td>
                            <strong>{inq.name}</strong>
                            <span>{inq.phone}</span>
                            <small>{inq.email || 'No email'}</small>
                          </td>
                          <td>
                            <span className="inquiry-type-tag">{inq.inquiry_type || 'Retail Order'}</span>
                          </td>
                          <td className="cell-review-text">{inq.message}</td>
                          <td>
                            <span className={`status-pill ${(inq.status || 'pending').toLowerCase() === 'replied' ? 'status-delivered' : 'status-confirmed'}`}>
                              {inq.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-feed-whatsapp"
                              onClick={() => handleOpenWhatsAppReply(inq)}
                              title="Send WhatsApp Message"
                            >
                              <Icons.whatsapp />
                              <span>Reply on WhatsApp</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 8: CUSTOMERS & GREEN POINTS */}
          {/* ================================================================ */}
          {activeTab === 'customers' && (
            <section className="admin-tab-pane tab-customers">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">CUSTOMER BASE</span>
                  <h1 className="pane-title">Registered Patrons & Green Loyalty Wallet</h1>
                </div>
                <div className="pane-actions-row">
                  <button
                    type="button"
                    className="admin-action-btn secondary"
                    onClick={async () => {
                      showToast('Syncing live users from database...')
                      await loadStoreData()
                      showToast('Patrons synchronized live from database!')
                    }}
                  >
                    <Icons.refresh />
                    <span>Sync Database Users</span>
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                {customers.length === 0 ? (
                  <div className="admin-empty-state">No customer accounts registered yet.</div>
                ) : (
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Contact</th>
                        <th>Total Orders</th>
                        <th>Lifetime Spend</th>
                        <th>Green Points Wallet</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <tr key={i}>
                          <td>
                            <strong>{c.name || 'Member Patron'}</strong>
                            {c.city && c.city !== '—' && <small>{c.city}</small>}
                          </td>
                          <td>
                            {c.phone && <span>{c.phone}</span>}
                            {c.email && c.email !== '—' && <small>{c.email}</small>}
                            {!c.phone && (!c.email || c.email === '—') && <span>—</span>}
                          </td>
                          <td>
                            <span className="cell-items-pill">{c.ordersCount} Orders</span>
                          </td>
                          <td className="cell-amount">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                          <td>
                            <span className="green-points-badge">
                              <Icons.leaf width="13" height="13" style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                              {c.greenPoints} pts (₹{Math.floor(c.greenPoints / 2)})
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-tbl-action"
                              onClick={() => {
                                setSelectedCustomer(c)
                                setIsPointsModalOpen(true)
                              }}
                            >
                              <Icons.gift />
                              <span>Adjust Points</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* TAB 9: STORE SETTINGS & DISPATCH RULES */}
          {/* ================================================================ */}
          {activeTab === 'settings' && (
            <section className="admin-tab-pane tab-settings">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">STORE CONFIGURATION</span>
                  <h1 className="pane-title">Contact, FSSAI & Dispatch Rules</h1>
                </div>
              </div>

              <div className="settings-cards-stack">
                <form onSubmit={handleSaveStoreSettings} className="settings-form-box">
                  <h3>Village Unit Contact & License</h3>

                  <div className="cms-fields-row">
                    <div className="admin-input-group">
                      <label>Customer Care Helpline Phone</label>
                      <input
                        type="text"
                        value={storeSettings.phone}
                        onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-input-group">
                      <label>WhatsApp Support Helpline</label>
                      <input
                        type="text"
                        value={storeSettings.whatsapp}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="cms-fields-row">
                    <div className="admin-input-group">
                      <label>Official Customer Support Email</label>
                      <input
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-input-group">
                      <label>Central FSSAI License Number</label>
                      <input
                        type="text"
                        value={storeSettings.fssai}
                        onChange={(e) => setStoreSettings({ ...storeSettings, fssai: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-input-group">
                    <label>Kadayam Village Processing Unit Address</label>
                    <textarea
                      rows={2}
                      value={storeSettings.address}
                      onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                      required
                    />
                  </div>

                  <h3 style={{ marginTop: '28px' }}>Shipping & Dispatch Parameters</h3>
                  <div className="cms-fields-row">
                    <div className="admin-input-group">
                      <label>Free Shipping Qualification Threshold (₹)</label>
                      <input
                        type="number"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="admin-input-group">
                      <label>Standard Shipping Charge (₹)</label>
                      <input
                        type="number"
                        value={storeSettings.standardShippingFee}
                        onChange={(e) => setStoreSettings({ ...storeSettings, standardShippingFee: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="admin-action-btn primary" style={{ marginTop: '16px' }}>
                    <Icons.save />
                    <span>Save Store Configuration</span>
                  </button>
                </form>

                {/* Master PIN Change Box */}
                <div className="settings-form-box" style={{ marginTop: '24px' }}>
                  <h3>Admin Master PIN Passcode</h3>
                  <p className="cms-hint">Used to unlock the store admin console on any browser session.</p>

                  <form onSubmit={handleChangePin} className="cms-fields-row" style={{ alignItems: 'flex-end' }}>
                    <div className="admin-input-group" style={{ flex: 1 }}>
                      <label>New Master PIN (Min 4 Digits)</label>
                      <input
                        type="text"
                        placeholder="e.g. 7550248005"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="admin-action-btn primary" style={{ height: '44px' }}>
                      Update PIN
                    </button>
                  </form>
                  {pinChangeMsg && <div className="admin-success-note">{pinChangeMsg}</div>}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: COURIER & AWB FULFILLMENT MODAL */}
      {/* ==================================================================== */}
      {isCourierModalOpen && selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setIsCourierModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Fulfill Order {selectedOrder.order_number || selectedOrder.id}</h3>
              <button type="button" className="btn-close-modal" onClick={() => setIsCourierModalOpen(false)} aria-label="Close"><Icons.close /></button>
            </div>
            <form onSubmit={handleSaveCourier} className="modal-form">
              <div className="admin-input-group">
                <label>Update Order Status</label>
                <select
                  value={courierForm.status}
                  onChange={(e) => setCourierForm({ ...courierForm, status: e.target.value })}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing (Packing at Kadayam)</option>
                  <option value="Dispatched">Dispatched (Handed to Courier)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="admin-input-group">
                <label>Carrier / Logistics Partner</label>
                <select
                  value={courierForm.partner}
                  onChange={(e) => setCourierForm({ ...courierForm, partner: e.target.value })}
                >
                  {COURIER_PARTNERS.map((cp) => (
                    <option key={cp} value={cp}>{cp}</option>
                  ))}
                </select>
              </div>

              <div className="admin-input-group">
                <label>AWB / Consignment Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. SP-IN-784920394"
                  value={courierForm.awb}
                  onChange={(e) => setCourierForm({ ...courierForm, awb: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsCourierModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn primary">Save & Update Consignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: PRINTABLE TAX INVOICE & PACKING SLIP */}
      {/* ==================================================================== */}
      {isInvoiceModalOpen && invoiceOrder && (
        <div className="admin-modal-backdrop" onClick={() => setIsInvoiceModalOpen(false)}>
          <div className="admin-modal-card invoice-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h3>Official Tax Invoice & Dispatch Slip</h3>
              <div className="header-print-actions">
                <button type="button" className="btn-print-slip" onClick={() => window.print()}><Icons.printer /> Print Invoice</button>
                <button type="button" className="btn-close-modal" onClick={() => setIsInvoiceModalOpen(false)} aria-label="Close"><Icons.close /></button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="printable-invoice">
              <div className="invoice-brand-strip">
                <div>
                  <h1 className="inv-brand-title">THENEE</h1>
                  <span className="inv-brand-tag">Crafted by Women. Rooted in Nature.</span>
                  <p className="inv-origin">
                    The Roots Enterprises, 2/224, South Street, Manthiyoor, Kadayam - 627415, Tenkasi District, TN.<br />
                    Central FSSAI License: #22425278000320 • Customer Care: +91 7550248005
                  </p>
                </div>
                <div className="inv-badge-box">
                  <strong>TAX INVOICE</strong>
                  <span>#{invoiceOrder.order_number || invoiceOrder.id}</span>
                  <small>Date: {new Date(invoiceOrder.created_at || Date.now()).toLocaleDateString('en-IN')}</small>
                </div>
              </div>

              <div className="invoice-parties-grid">
                <div className="inv-party-box">
                  <strong>Dispatched From:</strong>
                  <p>
                    THENEE Herbal Village Unit<br />
                    Manthiyoor, Kadayam, Tenkasi District<br />
                    Tamil Nadu - 627415, India
                  </p>
                </div>
                <div className="inv-party-box">
                  <strong>Consignee (Customer):</strong>
                  <p>
                    <strong>{invoiceOrder.customer_name}</strong><br />
                    {invoiceOrder.shipping_address}<br />
                    {invoiceOrder.shipping_city}, {invoiceOrder.shipping_state} - {invoiceOrder.shipping_pincode}<br />
                    Phone: {invoiceOrder.customer_phone}
                  </p>
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Herbal Formulation Item</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoiceOrder.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{it.name}</strong>
                        <small>{it.volume || 'Village Pack'}</small>
                      </td>
                      <td>{it.quantity || 1}</td>
                      <td>₹{it.price}</td>
                      <td>₹{(it.price || 0) * (it.quantity || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals-strip">
                <div>
                  <span>Courier Partner: <strong>{invoiceOrder.courier_partner || 'India Post Speed Post'}</strong></span><br />
                  <span>Consignment AWB: <strong>{invoiceOrder.tracking_number || 'Under Dispatch'}</strong></span>
                </div>
                <div className="inv-final-sum">
                  <span>Grand Total:</span>
                  <h2>₹{invoiceOrder.total_amount}</h2>
                  <small>Payment Mode: {invoiceOrder.payment_method || 'Cash on Delivery'}</small>
                </div>
              </div>

              <div className="invoice-footer-seal">
                <p>Authentic stone-ground botanicals. No synthetic preservatives. Thank you for empowering Kadayam rural women!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: PRODUCT EDITING MODAL */}
      {/* ==================================================================== */}
      {isProductModalOpen && editingProduct && (
        <div className="admin-modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
          <div className="admin-modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isNewProduct ? 'Add New Formulation to Catalog' : `Edit Product: ${editingProduct.name}`}</h3>
              <button type="button" className="btn-close-modal" onClick={() => setIsProductModalOpen(false)} aria-label="Close"><Icons.close /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="cms-fields-row">
                <div className="admin-input-group" style={{ flex: 2 }}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-input-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    <option value="tea">Botanical Tea</option>
                    <option value="superfood">Superfood Powder</option>
                    <option value="podi">Traditional Food Podi</option>
                  </select>
                </div>
              </div>

              <div className="cms-fields-row">
                <div className="admin-input-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Original MRP Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Weight / Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 100g Pouch"
                    value={editingProduct.volume || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Tagline / Short Summary</label>
                <input
                  type="text"
                  value={editingProduct.tagline || editingProduct.shortDesc || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value, shortDesc: e.target.value })}
                />
              </div>

              <div className="admin-input-group">
                <label>Full Product Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || editingProduct.desc || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value, desc: e.target.value })}
                />
              </div>

              <div className="admin-input-group">
                <label>Botanical Ingredients List</label>
                <input
                  type="text"
                  value={editingProduct.ingredients || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn primary">Save Product & Sync Live</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: COUPON MODAL */}
      {/* ==================================================================== */}
      {isCouponModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCouponModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Promotional Coupon</h3>
              <button type="button" className="btn-close-modal" onClick={() => setIsCouponModalOpen(false)} aria-label="Close"><Icons.close /></button>
            </div>
            <form onSubmit={handleSaveCoupon} className="modal-form">
              <div className="admin-input-group">
                <label>Coupon Code * (Auto Uppercase)</label>
                <input
                  type="text"
                  placeholder="e.g. ROOTS50"
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="cms-fields-row">
                <div className="admin-input-group">
                  <label>Discount Type</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })}
                  >
                    <option value="flat">Flat ₹ Discount</option>
                    <option value="percent">Percentage (%) Discount</option>
                  </select>
                </div>
                <div className="admin-input-group">
                  <label>Discount Value ({editingCoupon.discountType === 'percent' ? '%' : '₹'})</label>
                  <input
                    type="number"
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="cms-fields-row">
                <div className="admin-input-group">
                  <label>Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrder}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrder: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={editingCoupon.expiryDate}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Description Note</label>
                <input
                  type="text"
                  placeholder="e.g. Flat ₹50 off on orders above ₹499"
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsCouponModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn primary">Save & Launch Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: CUSTOMER GREEN POINTS ADJUSTMENT */}
      {/* ==================================================================== */}
      {isPointsModalOpen && selectedCustomer && (
        <div className="admin-modal-backdrop" onClick={() => setIsPointsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adjust Green Rewards: {selectedCustomer.name}</h3>
              <button type="button" className="btn-close-modal" onClick={() => setIsPointsModalOpen(false)} aria-label="Close"><Icons.close /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const res = await adminService.updateCustomerPoints(selectedCustomer, pointsDelta, pointsReason)
                selectedCustomer.greenPoints = res.newPoints !== undefined ? res.newPoints : (selectedCustomer.greenPoints + Number(pointsDelta))
                showToast(`Adjusted Green Points by ${Number(pointsDelta) > 0 ? '+' : ''}${pointsDelta} for ${selectedCustomer.name}!`)
                setIsPointsModalOpen(false)
                loadStoreData()
              }}
              className="modal-form"
            >
              <p className="cms-hint">
                Current Wallet Balance: <strong>{selectedCustomer.greenPoints} Points</strong> (₹{Math.floor(selectedCustomer.greenPoints / 2)} credit).
              </p>

              <div className="admin-input-group">
                <label>Points to Add / Deduct (Use - for deduction)</label>
                <input
                  type="number"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Reason / Note for Patron</label>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsPointsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn primary">Confirm Points Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMsg && (
        <div className="admin-toast-notice">
          <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}><Icons.leaf width="15" height="15" /></span>
          {toastMsg}
        </div>
      )}
    </div>
  )
}

export default AdminPortal
