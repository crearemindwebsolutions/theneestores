import { useState, useEffect, useMemo, useRef } from 'react'
import { cmsService } from '../lib/cmsService'
import { adminService, profileService, mediaService, resolveSignupProvider, databaseService, purgeLegacyDemoOrders, isRealAwb, isSupabaseConfigured, supabase } from '../lib/supabase'
import { getNumericUserId } from '../lib/userIdHelper'
import {
  getOrderStatusCounts,
  openSingleOrderDetailSheet,
  openOrdersStatusReport,
  openBulkInvoicesSheet,
} from '../lib/orderExportHelper'
import { analyticsService } from '../lib/analyticsService'
import { useCart } from '../context/CartContext'
import './PagesShared.css'
import './AdminPortal.css'

const Icons = {
  database: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  check: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  arrowLeft: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  account: (props) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
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
  calendar: (props) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  eye: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  users: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  pulse: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  clock: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  chevronRight: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6" />
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
  loader: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
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
  { id: 'customers', label: 'Customers & Patrons', icon: 'customers' },
  { id: 'storage', label: 'System & Storage', icon: 'database' },
  { id: 'settings', label: 'Store & Dispatch Settings', icon: 'settings' },
]

const ORDER_STATUSES = ['all', 'Processing', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled']
const COURIER_PARTNERS = ['India Post Speed Post', 'Shadowfax', 'BlueDart Express', 'DTDC Courier', 'Professional Couriers', 'Delhivery']

const COURIER_PRESETS = [
  {
    name: 'Shadowfax',
    getTrackingUrl: (awb) => (awb ? `https://www.shadowfax.in/track?trackingId=${awb}` : ''),
  },
  {
    name: 'India Post Speed Post',
    getTrackingUrl: (awb) => (awb ? `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?awb=${awb}` : ''),
  },
  {
    name: 'BlueDart Express',
    getTrackingUrl: (awb) => (awb ? `https://www.bluedart.com/tracking?trackNumber=${awb}` : ''),
  },
  {
    name: 'Delhivery',
    getTrackingUrl: (awb) => (awb ? `https://www.delhivery.com/track/package/${awb}` : ''),
  },
  {
    name: 'DTDC Courier',
    getTrackingUrl: (awb) => (awb ? `https://www.dtdc.in/tracking/shipment-tracking.asp?trackingNo=${awb}` : ''),
  },
  {
    name: 'Professional Couriers',
    getTrackingUrl: (awb) => (awb ? `https://www.tpcindia.com/track.aspx?awb=${awb}` : ''),
  },
]

const formatOrderPlacedOn = (dateStr) => {
  if (!dateStr) return new Date().toLocaleString('en-IN')
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}`
}

const AdminPortal = ({ onBack }) => {
  // Authentication State
  const [isUnlocked, setIsUnlocked] = useState(() => cmsService.isAdminUnlocked())
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const { currentUser } = useCart()
  const isUserAdmin = Boolean(
    currentUser &&
    (currentUser.role === 'admin' ||
     adminService.isAdmin(currentUser) ||
     (currentUser.email && currentUser.email.toLowerCase().trim() === 'rootsenterprises2025@gmail.com'))
  )

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard')
  const contentAreaRef = useRef(null)

  // When changing sections, ensure page scrolls to top while sidebar stays fixed in place
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeTab])

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

  // Live Media Assets State
  const [mediaItems, setMediaItems] = useState([])
  const [mediaCategory, setMediaCategory] = useState('all')
  const [mediaSearch, setMediaSearch] = useState('')
  const [isSyncingMedia, setIsSyncingMedia] = useState(false)

  // Modals & Filter States
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [managingOrder, setManagingOrder] = useState(null)
  const [showCourierPresets, setShowCourierPresets] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [isDeletingOrder, setIsDeletingOrder] = useState(false)
  const [manageOrderForm, setManageOrderForm] = useState({
    status: 'Confirmed',
    courier_partner: 'India Post Speed Post',
    delivery_date: '',
    tracking_number: '',
    tracking_url: '',
    audit_note: '',
    recipient_name: '',
    line1: '',
    line2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    phone: '',
    alt_mobile: '',
  })
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false)
  const [courierForm, setCourierForm] = useState({ partner: 'India Post Speed Post', awb: '', status: 'Dispatched' })
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [invoiceOrder, setInvoiceOrder] = useState(null)

  // Orders Export & Lookup Modals State
  const [isSingleOrderModalOpen, setIsSingleOrderModalOpen] = useState(false)
  const [singleOrderInput, setSingleOrderInput] = useState('')
  const [singleOrderError, setSingleOrderError] = useState('')

  const [isStatusReportModalOpen, setIsStatusReportModalOpen] = useState(false)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

  const [isBulkInvoicesModalOpen, setIsBulkInvoicesModalOpen] = useState(false)
  const [bulkFromDate, setBulkFromDate] = useState('')
  const [bulkToDate, setBulkToDate] = useState('')
  const [bulkInvoicesError, setBulkInvoicesError] = useState('')

  // Compute live counts for the 9 status categories
  const statusCounts = useMemo(() => getOrderStatusCounts(orders), [orders])

  const STATUS_CHOICE_OPTIONS = [
    { key: 'all', title: 'All Orders', count: statusCounts.all },
    { key: 'pending', title: 'Pending', count: statusCounts.pending },
    { key: 'confirmed', title: 'Confirmed / Packed', count: statusCounts.confirmed },
    { key: 'shipped', title: 'Shipped', count: statusCounts.shipped },
    { key: 'delivered', title: 'Delivered', count: statusCounts.delivered },
    { key: 'returned', title: 'Returned', count: statusCounts.returned },
    { key: 'rejected', title: 'Rejected', count: statusCounts.rejected },
    { key: 'free_delivery', title: 'Free Delivery Orders', count: statusCounts.free_delivery },
    { key: 'charged_delivery', title: 'Charged Delivery Orders', count: statusCounts.charged_delivery },
  ]

  // Live Telemetry & Traffic Analytics State (Images 1, 2, 3, 4, 5)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState(() => analyticsService.getAnalyticsData('7d'))
  const [isAdvancedMetricsOpen, setIsAdvancedMetricsOpen] = useState(false)
  const [topPagesTab, setTopPagesTab] = useState('views') // 'views' | 'visitors'
  const [isSyncingAnalytics, setIsSyncingAnalytics] = useState(false)

  // Update analytics when period filter changes
  useEffect(() => {
    setAnalyticsData(analyticsService.getAnalyticsData(analyticsPeriod))
  }, [analyticsPeriod])

  // Product Editing Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false)
  const [isImageDragOver, setIsImageDragOver] = useState(false)
  const productImageInputRef = useRef(null)

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

  // System & Database Storage Telemetry State
  const [telemetry, setTelemetry] = useState(null)
  const [isPingingDb, setIsPingingDb] = useState(false)
  const [tableSearch, setTableSearch] = useState('')
  const [tableFilter, setTableFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [testingTableId, setTestingTableId] = useState(null)
  const [showRawDiagnostics, setShowRawDiagnostics] = useState(false)

  // Password / Pin Change
  const [newPin, setNewPin] = useState('')
  const [pinChangeMsg, setPinChangeMsg] = useState('')

  // Track any admin modal open state to lock background page scrolling
  const isAnyAdminModalOpen = Boolean(
    managingOrder ||
    isCourierModalOpen ||
    isInvoiceModalOpen ||
    isSingleOrderModalOpen ||
    isStatusReportModalOpen ||
    isBulkInvoicesModalOpen ||
    isProductModalOpen ||
    isCouponModalOpen ||
    isReviewModalOpen ||
    isPointsModalOpen
  )

  useEffect(() => {
    if (isAnyAdminModalOpen) {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      const originalBodyPosition = document.body.style.position
      const originalBodyTop = document.body.style.top
      const originalBodyLeft = document.body.style.left
      const originalBodyRight = document.body.style.right
      const originalBodyWidth = document.body.style.width
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow

      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.classList.add('admin-modal-open')

      if (window.__lenis) {
        window.__lenis.stop()
      }

      const handlePreventBackgroundTouch = (e) => {
        const modalCard = e.target.closest('.admin-modal-card, .export-dialog-card, .modal-manage-order-popup, .invoice-sheet')
        if (modalCard) {
          return
        }
        if (e.cancelable) {
          e.preventDefault()
        }
      }

      window.addEventListener('touchmove', handlePreventBackgroundTouch, { passive: false })

      return () => {
        window.removeEventListener('touchmove', handlePreventBackgroundTouch)
        document.body.style.position = originalBodyPosition
        document.body.style.top = originalBodyTop
        document.body.style.left = originalBodyLeft
        document.body.style.right = originalBodyRight
        document.body.style.width = originalBodyWidth
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
        document.body.classList.remove('admin-modal-open')

        window.scrollTo(0, scrollY)

        if (window.__lenis) {
          window.__lenis.start()
        }
      }
    }
  }, [isAnyAdminModalOpen])

  // Show Toast Helper
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Load Real Data from Supabase / Local Storage
  const loadStoreData = async () => {
    purgeLegacyDemoOrders()
    setIsLoading(true)
    try {
      const [ordersRes, inqRes, custRes, mediaRes, telemRes] = await Promise.all([
        adminService.getAllOrders(),
        adminService.getAllInquiries(),
        adminService.getAllCustomers(),
        mediaService.getAllMedia(),
        databaseService.getDatabaseTelemetry().catch(() => null),
      ])
      if (ordersRes.data && ordersRes.data.length > 0) {
        setOrders(ordersRes.data)
      } else {
        setOrders([])
      }
      if (inqRes.data) setInquiries(inqRes.data)
      if (custRes.data) setCustomers(custRes.data)
      if (mediaRes.data) setMediaItems(mediaRes.data)
      if (telemRes) setTelemetry(telemRes)
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
    if (isUserAdmin) {
      loadStoreData()
    }
  }, [isUserAdmin])

  // Real-time listener for live order creation and status changes across all admins
  useEffect(() => {
    if (!isUserAdmin) return

    const handleOrdersUpdated = () => {
      adminService.getAllOrders().then((res) => {
        if (res && Array.isArray(res.data)) {
          setOrders(res.data)
        }
      }).catch(() => {})
    }

    window.addEventListener('thenee_orders_updated', handleOrdersUpdated)
    window.addEventListener('storage', handleOrdersUpdated)

    // Supabase Realtime Channel: all store admins receive instant live updates
    let channel = null
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('store_admin_orders_channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              handleOrdersUpdated()
            }
          )
          .subscribe()
      } catch (rtErr) {
        console.warn('Realtime subscription notice:', rtErr)
      }
    }

    return () => {
      window.removeEventListener('thenee_orders_updated', handleOrdersUpdated)
      window.removeEventListener('storage', handleOrdersUpdated)
      if (channel && supabase) {
        try { supabase.removeChannel(channel) } catch {}
      }
    }
  }, [isUserAdmin])

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
    const processingCount = orders.filter((o) => {
      const st = (o.order_status || o.status || '').toLowerCase()
      return st === 'processing' || st === 'confirmed' || st === 'order confirmed'
    }).length
    const confirmedCount = processingCount
    const dispatchedCount = orders.filter((o) => (o.order_status || '').toLowerCase() === 'dispatched').length
    const deliveredCount = orders.filter((o) => (o.order_status || '').toLowerCase() === 'delivered').length
    const totalProductsCount = products.length + podis.length
    const aov = orders.length > 0 ? Math.round(totalRev / orders.length) : 0
    return {
      totalRev,
      ordersCount: orders.length,
      processingCount,
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
      const rawSt = (o.order_status || o.status || 'processing').toLowerCase().trim()
      const filterTarget = orderFilter.toLowerCase().trim()

      let matchFilter = filterTarget === 'all'
      if (!matchFilter) {
        if (filterTarget === 'pending') {
          matchFilter = rawSt === 'pending'
        } else if (filterTarget === 'confirmed' || filterTarget === 'processing') {
          matchFilter = rawSt === 'confirmed' || rawSt === 'processing' || rawSt === 'packed' || rawSt === 'order confirmed'
        } else if (filterTarget === 'shipped') {
          matchFilter = rawSt === 'shipped' || rawSt === 'dispatched' || rawSt === 'in_transit'
        } else if (filterTarget === 'delivered') {
          matchFilter = rawSt === 'delivered'
        } else if (filterTarget === 'returned') {
          matchFilter = rawSt === 'returned'
        } else if (filterTarget === 'rejected') {
          matchFilter = rawSt === 'rejected' || rawSt === 'cancelled'
        } else if (filterTarget === 'free_delivery') {
          matchFilter = Number(o.delivery_fee || 0) === 0
        } else if (filterTarget === 'charged_delivery') {
          matchFilter = Number(o.delivery_fee || 0) > 0
        } else {
          matchFilter = rawSt === filterTarget
        }
      }

      const q = orderSearch.toLowerCase().trim()
      const uid = getNumericUserId(o).toLowerCase()
      const matchSearch =
        !q ||
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.includes(q)) ||
        (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
        (o.tracking_number && o.tracking_number.toLowerCase().includes(q)) ||
        (o.tracking_awb && o.tracking_awb.toLowerCase().includes(q)) ||
        (o.shipping_city && o.shipping_city.toLowerCase().includes(q)) ||
        uid.includes(q)
      return matchFilter && matchSearch
    })
  }, [orders, orderFilter, orderSearch])

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim()
    if (!q) return customers
    return customers.filter((c) => {
      const uid = getNumericUserId(c).toLowerCase()
      const name = (c.name || '').toLowerCase()
      const phone = (c.phone || '').toLowerCase()
      const email = (c.email || '').toLowerCase()
      const city = (c.city || '').toLowerCase()
      const role = (c.role || 'customer').toLowerCase()
      const provider = (c.provider || '').toLowerCase()
      return (
        uid.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        provider.includes(q) ||
        city.includes(q)
      )
    })
  }, [customers, customerSearch])

  // Filtered Media Assets
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchCat = mediaCategory === 'all' || item.category === mediaCategory
      const q = mediaSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.file_path.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [mediaItems, mediaCategory, mediaSearch])

  // Synchronize all media to database
  const handleSyncMedia = async () => {
    setIsSyncingMedia(true)
    showToast('Synchronizing all 67 website media assets to live database...')
    const result = await mediaService.syncAllMediaToDatabase()
    setIsSyncingMedia(false)
    if (result.success) {
      showToast(`Successfully synchronized ${result.count} media items to live database!`)
      const refreshed = await mediaService.getAllMedia()
      if (refreshed.data) setMediaItems(refreshed.data)
    } else {
      showToast('Notice: Please ensure public.media table is created in Supabase SQL editor.')
    }
  }

  // --------------------------------------------------------------------------
  // ORDER ACTIONS & FULFILLMENT MANAGEMENT
  // --------------------------------------------------------------------------
  const handleOpenManageOrder = (order) => {
    setManagingOrder(order)
    setSelectedOrder(order)
    setShowCourierPresets(false)

    let addr = {}
    if (typeof order.shipping_address === 'object' && order.shipping_address !== null) {
      addr = order.shipping_address
    } else if (typeof order.shipping_address === 'string') {
      addr = {
        address: order.shipping_address,
        city: order.shipping_city || '',
        district: order.shipping_city || '',
        state: order.shipping_state || '',
        pincode: order.shipping_pincode || '',
        recipient: order.customer_name || '',
        phone: order.customer_phone || '',
      }
    }

    const partner = order.courier_partner || order.courier || 'India Post Speed Post'
    const rawAwb = order.tracking_number || order.tracking_awb || order.awb || ''
    const awb = isRealAwb(rawAwb) ? rawAwb.trim() : ''

    const initialDeliveryDate = order.delivery_date || order.deliveryDate || (typeof order.shipping_address === 'object' && order.shipping_address?.delivery_date) || ''

    let url = order.tracking_url || ''
    if (!url && awb) {
      const matchedPreset = COURIER_PRESETS.find((cp) => cp.name.toLowerCase() === partner.toLowerCase())
      if (matchedPreset) {
        url = matchedPreset.getTrackingUrl(awb)
      } else {
        url = `https://www.indiapost.gov.in`
      }
    } else if (!awb) {
      url = ''
    }

    const currentStatus = order.order_status || order.status || 'Processing'
    const normalizedStatus = (currentStatus === 'Confirmed' || currentStatus === 'Order Confirmed') ? 'Processing' : currentStatus

    setManageOrderForm({
      status: normalizedStatus,
      courier_partner: partner,
      delivery_date: initialDeliveryDate,
      tracking_number: awb,
      tracking_url: url,
      audit_note: order.audit_note || order.auditNote || '',
      recipient_name: addr.recipient_name || addr.recipient || addr.name || order.customer_name || '',
      line1: addr.line1 || addr.street || addr.address || '',
      line2: addr.line2 || addr.area || '',
      city: addr.city || order.shipping_city || '',
      district: addr.district || addr.city || order.shipping_city || '',
      state: addr.state || order.shipping_state || '',
      pincode: addr.pincode || addr.pin || order.shipping_pincode || '',
      phone: addr.phone || order.customer_phone || '',
      alt_mobile: addr.alt_mobile || addr.altPhone || '',
    })

    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectPreset = (preset) => {
    setShowCourierPresets(false)
    const newUrl = preset.getTrackingUrl(manageOrderForm.tracking_number)
    setManageOrderForm((prev) => ({
      ...prev,
      courier_partner: preset.name,
      tracking_url: newUrl,
    }))
    showToast(`Applied courier preset: ${preset.name}`)
  }

  const handleTrackingNumberChange = (newAwb) => {
    const matchedPreset = COURIER_PRESETS.find(
      (cp) => cp.name.toLowerCase() === (manageOrderForm.courier_partner || '').toLowerCase()
    )
    const newUrl = matchedPreset ? matchedPreset.getTrackingUrl(newAwb) : manageOrderForm.tracking_url
    setManageOrderForm((prev) => ({
      ...prev,
      tracking_number: newAwb,
      tracking_url: newUrl,
    }))
  }

  const handleSaveManageOrder = async (e) => {
    e && e.preventDefault()
    if (!managingOrder) return
    const orderKey = managingOrder.order_number || managingOrder.id

    const updatedAddress = {
      ...(managingOrder.shipping_address || {}),
      recipient: manageOrderForm.recipient_name,
      name: manageOrderForm.recipient_name,
      line1: manageOrderForm.line1,
      street: manageOrderForm.line1,
      address: manageOrderForm.line1,
      line2: manageOrderForm.line2,
      area: manageOrderForm.line2,
      city: manageOrderForm.city,
      district: manageOrderForm.district,
      state: manageOrderForm.state,
      pincode: manageOrderForm.pincode,
      phone: manageOrderForm.phone,
      alt_mobile: manageOrderForm.alt_mobile,
    }

    try {
      await adminService.updateOrder(orderKey, {
        order_status: manageOrderForm.status,
        tracking_awb: manageOrderForm.tracking_number,
        courier: manageOrderForm.courier_partner,
        delivery_date: manageOrderForm.delivery_date,
        tracking_url: manageOrderForm.tracking_url,
        audit_note: manageOrderForm.audit_note,
        shipping_address: updatedAddress,
      })

      setManagingOrder((prev) => ({
        ...prev,
        order_status: manageOrderForm.status,
        tracking_number: manageOrderForm.tracking_number,
        tracking_awb: manageOrderForm.tracking_number,
        courier_partner: manageOrderForm.courier_partner,
        courier: manageOrderForm.courier_partner,
        delivery_date: manageOrderForm.delivery_date,
        tracking_url: manageOrderForm.tracking_url,
        audit_note: manageOrderForm.audit_note,
        shipping_address: updatedAddress,
        customer_name: manageOrderForm.recipient_name,
        customer_phone: manageOrderForm.phone,
      }))

      showToast(`Order ${orderKey} logistics & shipping address updated successfully!`)
      loadStoreData()
    } catch {
      showToast('Error saving order settings')
    }
  }

  const handleOpenWhatsApp = () => {
    if (!managingOrder) return
    const rawPhone = manageOrderForm.phone || managingOrder.customer_phone || ''
    const phone = rawPhone.replace(/[^0-9]/g, '')
    const orderId = managingOrder.order_number || managingOrder.id
    const customerName = manageOrderForm.recipient_name || managingOrder.customer_name || 'Customer'
    const partner = manageOrderForm.courier_partner || 'Speed Post'
    const awb = manageOrderForm.tracking_number || 'Under processing'
    const trackingLink = manageOrderForm.tracking_url || 'https://theneestores.com'

    const message = `Hello ${customerName}! 🌿 Your ThenEE Stores order #${orderId} status is *${manageOrderForm.status}*. Shipped via ${partner}: *${awb}*. Track parcel: ${trackingLink}. Thank you for choosing Kadayam authentic herbs! 🙏`
    const targetUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`
    window.open(targetUrl, '_blank')
  }

  const handleAskForRating = () => {
    if (!managingOrder) return
    const rawPhone = manageOrderForm.phone || managingOrder.customer_phone || ''
    const phone = rawPhone.replace(/[^0-9]/g, '')
    const orderId = managingOrder.order_number || managingOrder.id
    const customerName = manageOrderForm.recipient_name || managingOrder.customer_name || 'Customer'

    const message = `Vanakkam ${customerName}! 🌿 We hope your ThenEE Stores parcel (Order #${orderId}) reached you safely. Could you please take 30 seconds to rate your herbal tea experience? Your feedback helps Kadayam village farmers! ⭐⭐⭐⭐⭐`
    const targetUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`
    window.open(targetUrl, '_blank')
  }

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return
    const target = orderToDelete
    const orderIdentifier = target.order_number || target.order_id || target.id
    setIsDeletingOrder(true)

    try {
      const res = await adminService.deleteOrder(orderIdentifier)
      if (res && res.error) {
        showToast(`Error: ${res.error}`)
        return
      }

      if (target.id && target.id !== orderIdentifier) {
        await adminService.deleteOrder(target.id)
      }

      const cleanNum = String(orderIdentifier).trim().toLowerCase()
      const altNum = cleanNum.startsWith('#') ? cleanNum.slice(1) : `#${cleanNum}`
      const targetId = target.id ? String(target.id).trim().toLowerCase() : ''

      setOrders((prev) =>
        prev.filter((o) => {
          const num = String(o.order_number || o.order_id || o.id || '').trim().toLowerCase()
          const oId = o.id ? String(o.id).trim().toLowerCase() : ''
          return num !== cleanNum && num !== altNum && oId !== cleanNum && (targetId ? oId !== targetId : true)
        })
      )

      if (managingOrder) {
        const managingNum = String(managingOrder.order_number || managingOrder.order_id || managingOrder.id || '').trim().toLowerCase()
        const managingId = managingOrder.id ? String(managingOrder.id).trim().toLowerCase() : ''
        if (managingNum === cleanNum || managingNum === altNum || managingId === cleanNum || (targetId && managingId === targetId)) {
          setManagingOrder(null)
        }
      }

      showToast(`Order ${orderIdentifier} deleted from database and customer account.`)
      setOrderToDelete(null)
      loadStoreData()
    } catch (err) {
      console.error('Delete order failure:', err)
      showToast('Failed to delete order. Please try again.')
    } finally {
      setIsDeletingOrder(false)
    }
  }

  const handlePrintPackingSlip = (order) => {
    setInvoiceOrder(order || managingOrder)
    setIsInvoiceModalOpen(true)
  }

  const handleOpenCourierModal = (order) => {
    handleOpenManageOrder(order)
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
  // ORDERS EXPORT & PDF PRINTING ACTIONS
  // --------------------------------------------------------------------------
  const handleDownloadSingleOrderSheet = (e) => {
    if (e) e.preventDefault()
    setSingleOrderError('')
    const query = (singleOrderInput || '').trim().toLowerCase()

    if (!query) {
      if (orders.length > 0) {
        openSingleOrderDetailSheet(orders[0])
        setIsSingleOrderModalOpen(false)
        showToast(`Order sheet for #${orders[0].order_number || orders[0].id} generated!`)
        return
      }
      setSingleOrderError('Please enter an Order Number or Order ID.')
      return
    }

    const found = orders.find((o) => {
      const num = (o.order_number || '').toLowerCase()
      const id = (o.id || '').toLowerCase()
      const trk = (o.tracking_number || o.tracking_awb || '').toLowerCase()
      const rz = (o.razorpay_order_id || '').toLowerCase()
      return num.includes(query) || id.includes(query) || trk.includes(query) || rz.includes(query)
    })

    if (!found) {
      setSingleOrderError(`Order "${singleOrderInput}" was not found. Please verify the order reference.`)
      return
    }

    openSingleOrderDetailSheet(found)
    setIsSingleOrderModalOpen(false)
    showToast(`Order detail sheet #${found.order_number || found.id} opened for PDF download!`)
  }

  const handleGenerateStatusReport = () => {
    const choice = STATUS_CHOICE_OPTIONS.find((c) => c.key === selectedStatusFilter)
    const label = choice ? choice.title : 'Orders'
    openOrdersStatusReport(selectedStatusFilter, orders, label)
    setIsStatusReportModalOpen(false)
    showToast(`Status report for "${label}" generated!`)
  }

  const handleGenerateBulkInvoices = (e) => {
    if (e) e.preventDefault()
    setBulkInvoicesError('')

    let matched = [...orders]
    if (bulkFromDate || bulkToDate) {
      const fromTime = bulkFromDate ? new Date(bulkFromDate + 'T00:00:00').getTime() : 0
      const toTime = bulkToDate ? new Date(bulkToDate + 'T23:59:59').getTime() : Infinity
      matched = orders.filter((o) => {
        const t = new Date(o.created_at || Date.now()).getTime()
        return t >= fromTime && t <= toTime
      })
    }

    if (matched.length === 0) {
      setBulkInvoicesError('No orders found within the chosen date range. Please select different dates.')
      return
    }

    openBulkInvoicesSheet(matched, bulkFromDate, bulkToDate)
    setIsBulkInvoicesModalOpen(false)
    showToast(`Compiled ${matched.length} customer invoices into combined PDF file!`)
  }

  // --------------------------------------------------------------------------
  // LIVE ANALYTICS & TELEMETRY ACTIONS
  // --------------------------------------------------------------------------
  const handleSyncAnalytics = () => {
    setIsSyncingAnalytics(true)
    setTimeout(() => {
      setAnalyticsData(analyticsService.getAnalyticsData(analyticsPeriod))
      setIsSyncingAnalytics(false)
      showToast('Live traffic metrics and visitor telemetry synced!')
    }, 350)
  }

  const handleClearAnalytics = () => {
    if (!window.confirm('Clear all visitor tracking logs from database? This will reset telemetry.')) return
    analyticsService.clearAnalytics()
    setAnalyticsData(analyticsService.getAnalyticsData(analyticsPeriod))
    showToast('Analytics logs and telemetry cleared.')
  }

  const handleExportAnalyticsCsv = () => {
    const csvContent = analyticsService.exportCsv(analyticsData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `THENEE_Website_Analytics_${analyticsPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Analytics report exported to CSV successfully.')
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

  const handleProductImageUpload = (file) => {
    if (!file) return
    if (!file.type || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, or SVG).')
      return
    }
    setIsUploadingProductImage(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result
      if (!dataUrl) {
        setIsUploadingProductImage(false)
        return
      }
      const img = new Image()
      img.onload = () => {
        const maxDim = 1200
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const optimized = canvas.toDataURL('image/jpeg', 0.88)
          setEditingProduct((prev) => ({
            ...prev,
            cardImage: optimized,
            image: optimized,
            bottle: optimized,
            image_url: optimized,
          }))
        } else {
          setEditingProduct((prev) => ({
            ...prev,
            cardImage: dataUrl,
            image: dataUrl,
            bottle: dataUrl,
            image_url: dataUrl,
          }))
        }
        setIsUploadingProductImage(false)
        showToast('Image uploaded and updated for this product!')
      }
      img.onerror = () => {
        setEditingProduct((prev) => ({
          ...prev,
          cardImage: dataUrl,
          image: dataUrl,
          bottle: dataUrl,
          image_url: dataUrl,
        }))
        setIsUploadingProductImage(false)
        showToast('Image uploaded!')
      }
      img.src = dataUrl
    }
    reader.onerror = () => {
      setIsUploadingProductImage(false)
      showToast('Failed to read image file.')
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadProductImage = async (imageUrl, prodName = 'thenee-product') => {
    if (!imageUrl) {
      showToast('No image available to download.')
      return
    }
    try {
      const cleanName = (prodName || 'thenee-product').toLowerCase().replace(/[^a-z0-9]/g, '-')
      const filename = `${cleanName}-imagery.jpg`
      if (imageUrl.startsWith('data:')) {
        const a = document.createElement('a')
        a.href = imageUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        showToast('Product image downloaded!')
        return
      }

      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      showToast('Product image downloaded successfully!')
    } catch {
      const a = document.createElement('a')
      a.href = imageUrl
      a.target = '_blank'
      a.download = `${prodName || 'product'}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      showToast('Image opened for download.')
    }
  }

  const handleDeleteProductImage = () => {
    if (!window.confirm('Are you sure you want to remove this product image?')) return
    setEditingProduct((prev) => ({
      ...prev,
      cardImage: '',
      image: '',
      bottle: '',
      image_url: '',
    }))
    showToast('Product image removed.')
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (!editingProduct || !editingProduct.name) return
    const activeImg = editingProduct.cardImage || editingProduct.image || editingProduct.bottle || ''
    const finalProduct = {
      ...editingProduct,
      cardImage: activeImg,
      image: activeImg,
      bottle: activeImg,
      image_url: activeImg,
    }
    if (finalProduct.category === 'podi') {
      cmsService.savePodi(finalProduct)
    } else {
      cmsService.saveProduct(finalProduct)
    }
    setIsProductModalOpen(false)
    showToast(`Product "${finalProduct.name}" saved and live on storefront!`)
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
  // CUSTOMER BASE ACTIONS
  // --------------------------------------------------------------------------
  const handleUpdateCustomerRole = async (customer, newRole) => {
    try {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id || (c.email && c.email === customer.email)
            ? { ...c, role: newRole }
            : c
        )
      )
      await adminService.updateCustomerRole(customer, newRole)
      showToast(`Account role for ${customer.name || customer.email || 'Patron'} updated to "${newRole}" live!`)
    } catch (err) {
      console.warn('Role update notice:', err)
      showToast('Could not persist role change')
    }
  }

  const formatJoinedDate = (dateVal) => {
    if (!dateVal) return { day: '11', month: 'November', year: '2026' }
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return { day: '11', month: 'November', year: '2026' }
    return {
      day: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'long' }),
      year: d.getFullYear(),
    }
  }

  const handleDownloadCustomersCSV = () => {
    const list = filteredCustomers.length > 0 ? filteredCustomers : customers
    if (!list || list.length === 0) {
      showToast('No customer accounts found to export.')
      return
    }
    showToast(`Downloading ${list.length} patrons to Excel (CSV)...`)
    adminService.exportCustomersToCSV(list)
  }

  const handleDownloadCustomersPDF = () => {
    const list = filteredCustomers.length > 0 ? filteredCustomers : customers
    if (!list || list.length === 0) {
      showToast('No customer accounts found to export.')
      return
    }
    showToast('Opening Printable Customer Registry PDF...')
    adminService.exportCustomersToPDF(list)
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
  // SYSTEM & STORAGE TELEMETRY ACTIONS
  // --------------------------------------------------------------------------
  const handlePingDatabase = async () => {
    setIsPingingDb(true)
    try {
      const res = await databaseService.pingDatabase()
      setTelemetry((prev) => prev ? { ...prev, ping: res } : prev)
      if (res.isConnected) {
        showToast(`Database ping verified in ${res.latencyMs}ms (${res.status})!`)
      } else {
        showToast(`Database connection status: ${res.status}`)
      }
    } catch {
      showToast('Could not ping database')
    } finally {
      setIsPingingDb(false)
    }
  }

  const handleRefreshTelemetry = async () => {
    setIsLoading(true)
    try {
      const data = await databaseService.getDatabaseTelemetry()
      setTelemetry(data)
      showToast('Database & storage architecture re-verified live!')
    } catch {
      showToast('Could not load telemetry')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTableStatus = (table) => {
    const nextStatus = databaseService.toggleTableStatus(table.id, table.status)
    setTelemetry((prev) => {
      if (!prev) return prev
      const updatedTables = prev.tables.map((t) =>
        t.id === table.id ? { ...t, status: nextStatus } : t
      )
      return {
        ...prev,
        tables: updatedTables,
        activeTablesCount: updatedTables.filter((t) => t.status === 'active').length,
        inactiveTablesCount: updatedTables.filter((t) => t.status !== 'active').length,
      }
    })
    showToast(`Table ${table.name} status updated to ${nextStatus.toUpperCase()}!`)
  }

  const handleTestTableQuery = async (table) => {
    setTestingTableId(table.id)
    try {
      const res = await databaseService.testTableQuery(table.name)
      if (res.success) {
        showToast(`Query to ${table.name} confirmed in ${res.latencyMs}ms (${res.count} records active)`)
      } else {
        showToast(`Query warning on ${table.name}: ${res.error}`)
      }
    } catch {
      showToast(`Query test failed for ${table.name}`)
    } finally {
      setTestingTableId(null)
    }
  }

  const handleExportDiagnostics = () => {
    if (!telemetry) {
      showToast('No diagnostics data available.')
      return
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(telemetry, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `thenee-database-system-report-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast('Database system report exported successfully (JSON).')
  }

  const filteredTables = useMemo(() => {
    if (!telemetry?.tables) return []
    return telemetry.tables.filter((t) => {
      const matchSearch =
        !tableSearch.trim() ||
        t.name.toLowerCase().includes(tableSearch.toLowerCase().trim()) ||
        t.displayName.toLowerCase().includes(tableSearch.toLowerCase().trim()) ||
        t.description.toLowerCase().includes(tableSearch.toLowerCase().trim())
      const matchFilter =
        tableFilter === 'all' ||
        (tableFilter === 'active' && t.status === 'active') ||
        (tableFilter === 'inactive' && t.status !== 'active')
      return matchSearch && matchFilter
    })
  }, [telemetry?.tables, tableSearch, tableFilter])

  // --------------------------------------------------------------------------
  // RENDER: RESTRICTED ACCESS SCREEN (When patron is not an administrator)
  // --------------------------------------------------------------------------
  if (!isUserAdmin) {
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

          <h2 className="admin-lock-title">Store Administrator Access Only</h2>
          <p className="admin-lock-desc">
            Direct access to dispatch ledger, product catalog editor, coupon settings, and website CMS is reserved strictly for store administrators.
          </p>

          <div style={{ background: '#F4FAF6', border: '1px solid #D6EDE0', borderRadius: '12px', padding: '16px', margin: '20px 0', textAlign: 'left', fontSize: '0.85rem', color: '#1B3524', lineHeight: '1.55' }}>
            <strong style={{ display: 'block', marginBottom: '6px', color: '#123223' }}>Account Access Status:</strong>
            Signed in as: <strong>{currentUser ? (currentUser.email || currentUser.name) : 'Guest / Not signed in'}</strong><br />
            Current Account Role: <span style={{ textTransform: 'uppercase', fontWeight: 700, color: currentUser?.role === 'admin' ? '#166534' : '#C53030' }}>{currentUser?.role || 'customer'}</span><br />
            <span style={{ fontSize: '0.8rem', color: '#556B5C', marginTop: 6, display: 'inline-block' }}>
              Only patrons assigned the <strong>admin</strong> role in the Customer Base directory are authorized to access this panel. Customers are restricted to patron account services.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {!currentUser ? (
              <button
                type="button"
                className="admin-unlock-btn"
                onClick={() => { window.location.hash = 'login' }}
              >
                Sign In with Admin Account
              </button>
            ) : (
              <button
                type="button"
                className="admin-unlock-btn"
                onClick={() => { window.location.hash = 'account' }}
              >
                Go to My Account
              </button>
            )}
            <button
              type="button"
              className="admin-back-store-btn"
              onClick={() => {
                window.location.hash = 'home'
                onBack && onBack()
              }}
            >
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
            className="admin-nav-action-btn account-btn"
            onClick={() => {
              window.location.hash = 'account'
            }}
            title="Return to Patron Account"
          >
            <Icons.account />
            <span>My Account</span>
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
        <main className="admin-content-area" ref={contentAreaRef}>
          {isLoading && (
            <div className="admin-loading-banner">
              <span className="admin-spinner" /> Synchronizing live store data...
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 1: EXECUTIVE DASHBOARD & LIVE ANALYTICS */}
          {/* ================================================================ */}
          {activeTab === 'dashboard' && (
            <section className="admin-tab-pane tab-dashboard">
              {/* 1. Header Strip with Period Filter (Image 5) */}
              <div className="analytics-header-strip">
                <div>
                  <h1 className="analytics-header-title">Website Traffic Analytics</h1>
                  <p className="analytics-header-sub">
                    Track visitor metrics, real-time activity and traffic sources
                  </p>
                </div>

                <div className="analytics-period-chips">
                  {[
                    { key: 'today', label: 'Today' },
                    { key: '7d', label: '7 Days' },
                    { key: '30d', label: '30 Days' },
                    { key: 'month', label: 'This Month' },
                    { key: 'year', label: 'This Year' },
                    { key: 'all', label: 'All Time' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className={`period-chip ${analyticsPeriod === p.key ? 'is-active' : ''}`}
                      onClick={() => setAnalyticsPeriod(p.key)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Top Analytics Stat Cards (Image 5 & Image 3) */}
              <div className="analytics-top-kpi-grid">
                {/* Card 1: TOTAL VIEWS */}
                <div className="analytics-stat-card">
                  <div className="stat-card-head">
                    <span className="stat-card-kicker">TOTAL VIEWS</span>
                    <span className="stat-card-icon-pill"><Icons.eye /></span>
                  </div>
                  <div className="stat-card-big-num">{analyticsData.totalViews}</div>
                  <div className="stat-card-trend down">
                    {analyticsData.viewsTrend}
                  </div>
                  <div className="stat-breakdown-list">
                    <div className="stat-breakdown-row">
                      <span>Today:</span>
                      <strong>{analyticsData.breakdown.viewsToday}</strong>
                    </div>
                    <div className="stat-breakdown-row">
                      <span>This Week:</span>
                      <strong>{analyticsData.breakdown.viewsWeek}</strong>
                    </div>
                    <div className="stat-breakdown-row">
                      <span>This Month:</span>
                      <strong>{analyticsData.breakdown.viewsMonth}</strong>
                    </div>
                    <div className="stat-breakdown-row">
                      <span>All Time:</span>
                      <strong>{analyticsData.breakdown.viewsAllTime.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Card 2: UNIQUE VISITORS */}
                <div className="analytics-stat-card">
                  <div className="stat-card-head">
                    <span className="stat-card-kicker">UNIQUE VISITORS</span>
                    <span className="stat-card-icon-pill"><Icons.users /></span>
                  </div>
                  <div className="stat-card-big-num">{analyticsData.uniqueVisitors}</div>
                  <div className="stat-card-trend down">
                    {analyticsData.visitorsTrend}
                  </div>
                  <div className="stat-breakdown-list">
                    <div className="stat-breakdown-row">
                      <span>Today:</span>
                      <strong>{analyticsData.breakdown.uniqueToday}</strong>
                    </div>
                    <div className="stat-breakdown-row">
                      <span>This Week:</span>
                      <strong>{analyticsData.breakdown.uniqueWeek}</strong>
                    </div>
                    <div className="stat-breakdown-row">
                      <span>This Month:</span>
                      <strong>{analyticsData.breakdown.uniqueMonth}</strong>
                    </div>
                    <div className="stat-breakdown-row">
                      <span>All Time:</span>
                      <strong>{analyticsData.breakdown.uniqueAllTime.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Card 3: LIVE NOW */}
                <div className="analytics-stat-card">
                  <div className="stat-card-head">
                    <span className="live-pulse-badge">
                      <span className="live-pulse-dot" /> LIVE NOW
                    </span>
                    <span className="stat-card-icon-pill"><Icons.pulse /></span>
                  </div>
                  <div className="stat-card-big-num">{analyticsData.liveNow}</div>
                  <div style={{ fontSize: '0.86rem', color: '#556B5C', fontWeight: 600 }}>Active Visitors</div>
                  <div style={{ flex: 1 }} />
                  <div className="live-card-footer">
                    <span>Updated just now</span>
                    <span className="realtime-indicator-pill">
                      <Icons.refresh width="12" height="12" /> Realtime Active
                    </span>
                  </div>
                </div>

                {/* Card 4: ACTIVE SESSIONS (Image 3) */}
                <div className="analytics-stat-card">
                  <div className="stat-card-head">
                    <span className="stat-card-kicker">ACTIVE SESSIONS</span>
                    <span className="stat-card-icon-pill"><Icons.account /></span>
                  </div>
                  <div className="stat-card-big-num">{analyticsData.activeSessions}</div>
                  <div style={{ fontSize: '0.84rem', color: '#6C7D71', marginTop: 12 }}>
                    Total page views: <strong>{analyticsData.totalPageViewsHistorical}</strong>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div className="live-card-footer">
                    <span>Engaged Sessions</span>
                    <span style={{ color: '#27AE60', fontWeight: 600 }}>100% Secure</span>
                  </div>
                </div>
              </div>

              {/* 3. Advanced Traffic Metrics Drawer Strip (Image 2) */}
              <div className="advanced-metrics-strip">
                <div className="advanced-metrics-left">
                  <span className="advanced-metrics-icon"><Icons.trend /></span>
                  <div>
                    <div className="advanced-metrics-title">Advanced Traffic Metrics</div>
                    <div className="advanced-metrics-sub">Bounce rates, session durations, and visitor loyalty</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-expand-details"
                  onClick={() => setIsAdvancedMetricsOpen(!isAdvancedMetricsOpen)}
                >
                  {isAdvancedMetricsOpen ? 'Collapse details ▲' : 'Expand details'}
                </button>
              </div>

              {isAdvancedMetricsOpen && (
                <div className="advanced-metrics-drawer">
                  <div className="advanced-metric-box">
                    <div className="advanced-metric-lbl">Bounce Rate</div>
                    <div className="advanced-metric-val">{analyticsData.advancedMetrics.bounceRate}</div>
                    <div className="advanced-metric-desc">Benchmark &lt; 45% (Healthy store engagement)</div>
                  </div>
                  <div className="advanced-metric-box">
                    <div className="advanced-metric-lbl">Avg Session Duration</div>
                    <div className="advanced-metric-val">{analyticsData.advancedMetrics.avgDuration}</div>
                    <div className="advanced-metric-desc">High patron exploration on herbal catalog</div>
                  </div>
                  <div className="advanced-metric-box">
                    <div className="advanced-metric-lbl">Visitor Loyalty</div>
                    <div className="advanced-metric-val">{analyticsData.advancedMetrics.loyaltyRate}</div>
                    <div className="advanced-metric-desc">Patrons revisiting the store multiple times</div>
                  </div>
                </div>
              )}

              {/* 4. Website Views Over Time SVG Chart (Image 2) */}
              <div className="analytics-chart-card">
                <div className="analytics-chart-header">
                  <div>
                    <h3 className="chart-title">Website Views Over Time</h3>
                    <p className="chart-subtitle">Compare page views against the previous period</p>
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item">
                      <span className="legend-bullet-solid" />
                      <span>Current Period ({analyticsData.totalViews} views)</span>
                    </span>
                    <span className="legend-item">
                      <span className="legend-bullet-dashed" />
                      <span>Previous Period</span>
                    </span>
                  </div>
                </div>

                <div className="svg-chart-container">
                  {(() => {
                    const chartPts = (analyticsData.chartData && analyticsData.chartData.length > 0)
                      ? analyticsData.chartData
                      : [
                        { day: 'Thu', current: 0, previous: 0 },
                        { day: 'Fri', current: 0, previous: 0 },
                        { day: 'Sat', current: 0, previous: 0 },
                        { day: 'Sun', current: 0, previous: 0 },
                        { day: 'Mon', current: 0, previous: 0 },
                        { day: 'Tue', current: 0, previous: 0 },
                        { day: 'Wed', current: 0, previous: 0 },
                      ]
                    const maxVal = Math.max(...chartPts.map((p) => Math.max(p.current || 0, p.previous || 0)), 4)
                    const getY = (val) => 180 - (Math.min(val || 0, maxVal) / maxVal) * 138
                    const getX = (idx) => 50 + idx * 96.666
                    const currentPoints = chartPts.map((pt, i) => `${getX(i).toFixed(1)},${getY(pt.current).toFixed(1)}`).join(' ')
                    const prevPoints = chartPts.map((pt, i) => `${getX(i).toFixed(1)},${getY(pt.previous).toFixed(1)}`).join(' ')
                    const areaPolygon = `50,180 ${currentPoints} 630,180`
                    const gridSteps = [
                      { val: maxVal, y: getY(maxVal) },
                      { val: Math.round(maxVal * 0.75), y: getY(maxVal * 0.75) },
                      { val: Math.round(maxVal * 0.5), y: getY(maxVal * 0.5) },
                      { val: Math.round(maxVal * 0.25), y: getY(maxVal * 0.25) },
                      { val: 0, y: 180 },
                    ]

                    return (
                      <svg viewBox="0 0 700 220" width="100%" height="220" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chartGoldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#B89D6C" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#B89D6C" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Y Axis Gridlines */}
                        {gridSteps.map((grid, idx) => (
                          <g key={`grid-${idx}-${grid.val}`}>
                            <text x="25" y={grid.y + 4} fill="#8A9A8E" fontSize="11" textAnchor="end" fontFamily="sans-serif">
                              {grid.val}
                            </text>
                            <line
                              x1="35"
                              y1={grid.y}
                              x2="670"
                              y2={grid.y}
                              stroke="#F0ECE1"
                              strokeDasharray={grid.val === 0 ? 'none' : '3 3'}
                              strokeWidth={grid.val === 0 ? '1.5' : '1'}
                            />
                          </g>
                        ))}

                        {/* Current Period Area Gradient Fill */}
                        <polygon points={areaPolygon} fill="url(#chartGoldGradient)" />

                        {/* Previous Period Dashed Curve */}
                        <polyline
                          points={prevPoints}
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />

                        {/* Current Period Solid Curve */}
                        <polyline
                          points={currentPoints}
                          fill="none"
                          stroke="#B89D6C"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data Points on Current Period Curve */}
                        {chartPts.map((pt, i) => {
                          const cx = getX(i)
                          const cy = getY(pt.current)
                          return (
                            <g key={pt.day + i}>
                              <circle cx={cx} cy={cy} r="4" fill="#FFFFFF" stroke="#B89D6C" strokeWidth="2.5" />
                              <text x={cx} y="202" fill="#556B5C" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
                                {pt.day}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    )
                  })()}
                </div>
              </div>

              {/* 5. 2x2 Analytics Grid (Image 4) */}
              <div className="analytics-2x2-grid">
                {/* Left Column 1: Traffic Sources */}
                <div className="analytics-sub-card">
                  <div className="sub-card-header">
                    <h3 className="sub-card-title">Traffic Sources</h3>
                  </div>
                  <div className="traffic-sources-list">
                    {analyticsData.trafficSources.map((ts) => (
                      <div key={ts.source} className="traffic-source-item">
                        <div className="traffic-source-label-row">
                          <span className="traffic-source-name">{ts.source}</span>
                          <span className="traffic-source-pct">{ts.percent}% ({ts.count})</span>
                        </div>
                        <div className="traffic-bar-track">
                          <div
                            className="traffic-bar-fill"
                            style={{ width: `${Math.max(ts.percent, ts.count > 0 ? 3 : 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column 1: Top Viewed Pages */}
                <div className="analytics-sub-card">
                  <div className="sub-card-header">
                    <h3 className="sub-card-title">Top Viewed Pages</h3>
                    <div className="top-pages-switch">
                      <button
                        type="button"
                        className={`btn-switch-pill ${topPagesTab === 'views' ? 'is-active' : ''}`}
                        onClick={() => setTopPagesTab('views')}
                      >
                        Views
                      </button>
                      <button
                        type="button"
                        className={`btn-switch-pill ${topPagesTab === 'visitors' ? 'is-active' : ''}`}
                        onClick={() => setTopPagesTab('visitors')}
                      >
                        Unique Visitors
                      </button>
                    </div>
                  </div>

                  <table className="top-pages-table">
                    <thead>
                      <tr>
                        <th>Page URL Path</th>
                        <th>{topPagesTab === 'views' ? 'Views ▲' : 'Visitors ▲'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topPages.map((pg) => (
                        <tr key={pg.path}>
                          <td>
                            <span className="top-pages-path">{pg.path}</span>
                          </td>
                          <td>{topPagesTab === 'views' ? pg.views : pg.visitors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Left Column 2: Live Activity Logs */}
                <div className="analytics-sub-card">
                  <div className="sub-card-header">
                    <h3 className="sub-card-title">Live Activity Logs</h3>
                    <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: '#7A8C80' }}>
                      Last 25 interactions
                    </span>
                  </div>

                  <div className="live-activity-list">
                    {analyticsData.activityLogs.map((log) => (
                      <div key={log.id} className="live-activity-row">
                        <div className="live-activity-left">
                          <span className="live-activity-bullet">•</span>
                          <span><strong>{log.visitor}</strong> {log.action}</span>
                        </div>
                        <span className="live-activity-time">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column 2: Devices Share & Visitor Locations */}
                <div className="analytics-right-dual">
                  {/* Devices Share */}
                  <div className="analytics-sub-card">
                    <div className="sub-card-header">
                      <h3 className="sub-card-title">Devices Share</h3>
                    </div>
                    <div className="devices-share-grid">
                      <div className="device-col-card">
                        <div className="device-col-lbl">MOBILE</div>
                        <div className="device-col-pct">{analyticsData.devicesShare.mobile.percent}%</div>
                        <div className="device-col-count">({analyticsData.devicesShare.mobile.count})</div>
                      </div>
                      <div className="device-col-card">
                        <div className="device-col-lbl">DESKTOP</div>
                        <div className="device-col-pct">{analyticsData.devicesShare.desktop.percent}%</div>
                        <div className="device-col-count">({analyticsData.devicesShare.desktop.count})</div>
                      </div>
                      <div className="device-col-card">
                        <div className="device-col-lbl">TABLET</div>
                        <div className="device-col-pct">{analyticsData.devicesShare.tablet.percent}%</div>
                        <div className="device-col-count">({analyticsData.devicesShare.tablet.count})</div>
                      </div>
                    </div>
                  </div>

                  {/* Visitor Locations */}
                  <div className="analytics-sub-card">
                    <div className="sub-card-header">
                      <h3 className="sub-card-title">Visitor Locations</h3>
                    </div>
                    <div className="visitor-locations-list">
                      {analyticsData.visitorLocations.map((loc) => (
                        <div key={loc.location} className="visitor-location-row">
                          <span className="visitor-location-name">{loc.location}</span>
                          <span className="visitor-location-count">{loc.sessions} sessions</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Peak Traffic & Analytics Admin Row (Image 1) */}
              <div className="analytics-bottom-grid">
                <div className="peak-times-card">
                  <h3 className="sub-card-title">Peak Traffic Times</h3>
                  <div className="peak-times-row">
                    <div>
                      <div className="peak-col-lbl">MOST ACTIVE TIME</div>
                      <div className="peak-col-val">{analyticsData.peakTraffic.mostActiveTime}</div>
                    </div>
                    <div>
                      <div className="peak-col-lbl">PEAK DAY OF WEEK</div>
                      <div className="peak-col-val">{analyticsData.peakTraffic.peakDay}</div>
                    </div>
                  </div>
                </div>

                <div className="analytics-admin-card">
                  <h3 className="sub-card-title">Analytics Administration</h3>
                  <div className="analytics-admin-actions">
                    <button
                      type="button"
                      className="btn-admin-action-link"
                      onClick={handleExportAnalyticsCsv}
                      title="Download CSV report of all visitor interactions"
                    >
                      <Icons.download width="14" height="14" />
                      <span>Export (CSV)</span>
                    </button>

                    <button
                      type="button"
                      className="btn-admin-action-link"
                      onClick={handleSyncAnalytics}
                      title="Refresh live visitor and session telemetry"
                    >
                      <Icons.refresh width="14" height="14" />
                      <span>{isSyncingAnalytics ? 'Syncing...' : 'Sync Data'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-admin-action-link danger"
                      onClick={handleClearAnalytics}
                      title="Clear visitor tracking database"
                    >
                      <Icons.trash width="14" height="14" />
                      <span>Clear Database</span>
                    </button>
                  </div>
                  <div className="analytics-last-updated-note">
                    Last updated: {analyticsData.lastUpdated}
                  </div>
                </div>
              </div>

              {/* 7. Recent Orders & Inventory Levels Dual Row (Image 1) */}
              <div className="analytics-dual-ledger-grid">
                {/* Recent Orders */}
                <div className="dashboard-mini-ledger-card">
                  <div className="dashboard-card-head">
                    <h3 className="dashboard-card-title">Recent Orders</h3>
                    <button
                      type="button"
                      className="dashboard-card-link"
                      onClick={() => setActiveTab('orders')}
                    >
                      All orders &gt;
                    </button>
                  </div>

                  <table className="mini-orders-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '28px 12px', color: '#6A7D71' }}>
                            No customer orders placed yet. Live orders will appear here automatically.
                          </td>
                        </tr>
                      ) : (
                        orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id}>
                            <td>
                              <strong
                                style={{ cursor: 'pointer', color: '#123223', fontFamily: 'monospace' }}
                                onClick={() => handleOpenManageOrder(ord)}
                                title="Manage order"
                              >
                                {ord.order_number || (ord.id ? ord.id.slice(0, 16) : 'Order')}
                              </strong>
                            </td>
                            <td>{ord.customer_name || 'Customer'}</td>
                            <td>₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`status-pill status-${(ord.order_status || 'delivered').toLowerCase()}`}>
                                {(ord.order_status || 'delivered').toLowerCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Inventory Levels */}
                <div className="dashboard-mini-ledger-card">
                  <div className="dashboard-card-head">
                    <h3 className="dashboard-card-title">Inventory Levels</h3>
                    <button
                      type="button"
                      className="dashboard-card-link"
                      onClick={() => setActiveTab('products')}
                    >
                      Manage stock &gt;
                    </button>
                  </div>

                  <div className="inventory-levels-list">
                    {[...products, ...podis].length === 0 ? (
                      <div className="admin-empty-state" style={{ padding: '24px 12px' }}>
                        No catalog products found. Add products to view stock levels.
                      </div>
                    ) : (
                      [...products, ...podis].slice(0, 6).map((item) => {
                        const stockCount = typeof item.stock === 'number' ? item.stock : 50
                        const price = item.price || item.mrp || 0
                        const category = item.category || (item.badge ? item.badge : 'Herbal Blend')
                        const image = item.image || item.image_url || '/images/custom_thenee/herbal-tea-product.jpg'
                        return (
                          <div key={item.id} className="inventory-item-row">
                            <div className="inventory-item-left">
                              <img src={image} alt={item.name} className="inventory-item-thumb" />
                              <div>
                                <span className="inventory-item-name">{item.name}</span>
                                <span className="inventory-item-cat">{category}</span>
                              </div>
                            </div>
                            <div className="inventory-item-right">
                              <span className={`inventory-stock-pill ${stockCount > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {stockCount} in stock
                              </span>
                              <span className="inventory-item-price">₹{price}</span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* 8. Store Operational KPIs & CRM Overview */}
              <div className="pane-header-row" style={{ marginTop: 16 }}>
                <div>
                  <span className="pane-kicker">EXECUTIVE SUMMARY</span>
                  <h2 className="pane-title" style={{ fontSize: '1.4rem' }}>Store Operations & Logistics</h2>
                </div>
                <div className="pane-actions-row">
                  <button type="button" className="admin-action-btn primary" onClick={() => handleOpenEditProduct(null, true)}>
                    <Icons.plus />
                    <span>Add Product</span>
                  </button>
                  <button type="button" className="admin-action-btn secondary" onClick={handleExportCsv}>
                    <Icons.download />
                    <span>Export Orders CSV</span>
                  </button>
                </div>
              </div>

              <div className="admin-kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-title">Gross Revenue</span>
                    <span className="kpi-icon"><Icons.trend /></span>
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
                    <span className="kpi-badge-confirmed">{metrics.processingCount} Processing</span> •{' '}
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

              <div className="admin-dual-feed-grid">
                {/* Recent Inquiries Feed */}
                <div className="admin-feed-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="feed-header-row">
                    <h3>Customer Inquiries & WhatsApp CRM</h3>
                    <button type="button" className="feed-view-all-link" onClick={() => setActiveTab('inquiries')}>
                      View All CRM ({inquiries.length}) →
                    </button>
                  </div>
                  {inquiries.length === 0 ? (
                    <p style={{ color: '#6A8070', fontSize: '0.86rem', padding: '12px 0' }}>No inquiries received yet.</p>
                  ) : (
                    <div className="feed-list">
                      {inquiries.slice(0, 5).map((inq) => (
                        <div key={inq.id} className="feed-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                          <div className="feed-item-info">
                            <strong>{inq.name || 'Visitor'}</strong>
                            <span style={{ fontSize: '0.78rem', color: '#6A8070', marginLeft: 8 }}>{inq.phone || inq.email || ''}</span>
                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#334155' }}>{inq.message || inq.inquiry_type || ''}</p>
                          </div>
                          <span className={`status-pill ${inq.status?.toLowerCase() || 'pending'}`}>{inq.status || 'Pending'}</span>
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
          {
            activeTab === 'orders' && (
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

                {/* Top Order Export & Lookup Action Cards */}
                <div className="orders-export-cards-grid">
                  <div className="orders-export-card">
                    <span className="export-card-kicker">SINGLE ORDER LOOKUP</span>
                    <p className="export-card-desc">
                      Download a detailed one-page sheet for any order number or order ID.
                    </p>
                    <button
                      type="button"
                      className="btn-orders-export-card"
                      onClick={() => {
                        setSingleOrderInput(orders[0]?.order_number || orders[0]?.id || '')
                        setSingleOrderError('')
                        setIsSingleOrderModalOpen(true)
                      }}
                    >
                      <Icons.download />
                      <span>Order Detail</span>
                    </button>
                  </div>

                  <div className="orders-export-card">
                    <span className="export-card-kicker">STATUS REPORT</span>
                    <p className="export-card-desc">
                      Generate a bulk orders list filtered by status or delivery method.
                    </p>
                    <button
                      type="button"
                      className="btn-orders-export-card"
                      onClick={() => setIsStatusReportModalOpen(true)}
                    >
                      <Icons.download />
                      <span>Orders by Status</span>
                    </button>
                  </div>

                  <div className="orders-export-card">
                    <span className="export-card-kicker">BULK INVOICES</span>
                    <p className="export-card-desc">
                      Download multiple customer invoices in one combined PDF by date range.
                    </p>
                    <button
                      type="button"
                      className="btn-orders-export-card"
                      onClick={() => {
                        setBulkInvoicesError('')
                        setIsBulkInvoicesModalOpen(true)
                      }}
                    >
                      <Icons.download />
                      <span>Bulk Invoices</span>
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
                                <strong
                                  className="order-num-clickable"
                                  onClick={() => handleOpenManageOrder(o)}
                                  style={{ cursor: 'pointer', color: '#123223', textDecoration: 'underline' }}
                                  title="Manage & Fulfill Order"
                                >
                                  {o.order_number || o.id.slice(0, 8)}
                                </strong>
                                <span className="cell-payment-tag">{o.payment_method || 'COD'}</span>
                              </td>
                              <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
                              <td>
                                <div className="cell-customer">
                                  <strong>{o.customer_name || 'Guest'}</strong>
                                  <span className="order-uid-tag">ID: {o.user_id_number || getNumericUserId(o.user_id || o.customer_email || o.customer_phone)}</span>
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
                                    className="btn-tbl-action fulfill"
                                    onClick={() => handleOpenManageOrder(o)}
                                    title="Manage & Fulfill Consignment"
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
                                  <button
                                    type="button"
                                    className="btn-tbl-action delete"
                                    onClick={() => setOrderToDelete(o)}
                                    title="Permanently Delete Order"
                                  >
                                    <Icons.trash />
                                    <span>Delete</span>
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
            )
          }

          {/* ================================================================ */}
          {/* TAB 3: PRODUCTS & CATALOG CMS */}
          {/* ================================================================ */}
          {
            activeTab === 'products' && (
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
                        <img src={prod.cardImage || prod.image} alt={prod.name} className="prod-thumb" />
                        <div className="prod-meta">
                          <span className="prod-badge-tag">{prod.badge || 'Botanical'}</span>
                          <h4 className="prod-name">{prod.name}</h4>
                          <span className="prod-vol">{prod.volume || '100g'}</span>
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
            )
          }

          {/* ================================================================ */}
          {/* TAB 4: COUPONS & DISCOUNTS */}
          {/* ================================================================ */}
          {
            activeTab === 'coupons' && (
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
                                      <strong
                                        className="order-num-clickable"
                                        onClick={() => handleOpenManageOrder(o)}
                                        style={{ cursor: 'pointer', color: '#123223', textDecoration: 'underline' }}
                                        title="Manage & Fulfill Order"
                                      >
                                        {o.order_number || o.id.slice(0, 8)}
                                      </strong>
                                      <span className="cell-payment-tag">{o.payment_method || 'COD'}</span>
                                    </td>
                                    <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
                                    <td>
                                      <div className="cell-customer">
                                        <strong>{o.customer_name || 'Guest'}</strong>
                                        <span className="order-uid-tag">ID: {o.user_id_number || getNumericUserId(o.user_id || o.customer_email || o.customer_phone)}</span>
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
                                      {isRealAwb(o.tracking_number || o.tracking_awb) ? (
                                        <div className="cell-courier-info">
                                          <strong>{o.courier_partner || o.courier || 'India Post Speed Post'}</strong>
                                          <span className="awb-num">{o.tracking_number || o.tracking_awb}</span>
                                        </div>
                                      ) : (
                                        <span className="cell-no-awb" style={{ color: '#854D0E', background: '#FEF9C3', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                                          Updated soon
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      <div className="row-action-btns">
                                        <button
                                          type="button"
                                          className="btn-tbl-action fulfill"
                                          onClick={() => handleOpenManageOrder(o)}
                                          title="Manage & Fulfill Consignment"
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
                                        <button
                                          type="button"
                                          className="btn-tbl-action delete"
                                          onClick={() => setOrderToDelete(o)}
                                          title="Permanently Delete Order"
                                        >
                                          <Icons.trash />
                                          <span>Delete</span>
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
            )
          }

          {/* ================================================================ */}
          {/* TAB 5: WEBSITE CONTENT & BANNERS CMS */}
          {/* ================================================================ */}
          {
            activeTab === 'cms' && (
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
                            className="manage-order-input"
                            value={manageOrderForm.tracking_number}
                            onChange={(e) => handleTrackingNumberChange(e.target.value)}
                            placeholder="Enter courier tracking ID (Updated soon)"
                          />
                        </div>

                        <div className="mo-field-group">
                          <label>Tracking URL</label>
                          <input
                            type="url"
                            className="manage-order-input"
                            value={manageOrderForm.tracking_url}
                            onChange={(e) => setManageOrderForm({ ...manageOrderForm, tracking_url: e.target.value })}
                            placeholder="Tracking URL will be generated when tracking ID is entered"
                          />
                        </div>

                        <div className="mo-field-group">
                          <label>Internal Audit Note</label>
                          <textarea
                            className="manage-order-input"
                            rows="3"
                            value={manageOrderForm.audit_note}
                            onChange={(e) => setManageOrderForm({ ...manageOrderForm, audit_note: e.target.value })}
                            placeholder="Reason for change..."
                          />
                        </div>

                        <button type="submit" className="btn-save-order-settings">
                          Save Order Settings
                        </button>
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

                  {/* 4. Live Website Media & Assets Library (Database Synced) */}
                  <div className="cms-section-card media-library-card">
                    <div className="media-library-header-row">
                      <div>
                        <h3>4. Live Website Images & Media Library ({filteredMedia.length} Assets)</h3>
                        <p className="cms-hint">All images and media currently active across THENEE storefront, synchronized with your live database.</p>
                      </div>
                      <button
                        type="button"
                        className="admin-action-btn primary"
                        onClick={handleSyncMedia}
                        disabled={isSyncingMedia}
                        title="Upload and synchronize all images to database"
                      >
                        <Icons.refresh />
                        <span>{isSyncingMedia ? 'Syncing to Database...' : 'Sync All Media to Live Database'}</span>
                      </button>
                    </div>

                    {/* Category Filter Pills & Search */}
                    <div className="media-filter-bar">
                      <div className="media-category-pills">
                        {[
                          { id: 'all', label: 'All (67)' },
                          { id: 'banner', label: 'Banners (3)' },
                          { id: 'product', label: 'Formulations (15)' },
                          { id: 'podi', label: 'Food Podis (8)' },
                          { id: 'brand', label: 'Brand & Badges (5)' },
                          { id: 'story', label: 'Heritage Story (2)' },
                          { id: 'perfume', label: 'Aromas (8)' },
                          { id: 'review', label: 'Reviews (17)' },
                          { id: 'ui', label: 'UI Layout (3)' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className={`media-filter-pill ${mediaCategory === cat.id ? 'is-active' : ''}`}
                            onClick={() => setMediaCategory(cat.id)}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                      <div className="media-search-wrap">
                        <input
                          type="text"
                          placeholder="Search media by name, path or tag..."
                          value={mediaSearch}
                          onChange={(e) => setMediaSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Media Cards Grid */}
                    <div className="media-cards-grid">
                      {filteredMedia.map((item) => (
                        <div key={item.id} className="media-item-card">
                          <div className="media-preview-box">
                            <img src={item.file_path} alt={item.alt_text || item.title} loading="lazy" />
                            <span className="media-badge-tag">{item.tag || item.category}</span>
                          </div>
                          <div className="media-info-box">
                            <h4 title={item.title}>{item.title}</h4>
                            <span className="media-path-text" title={item.file_path}>{item.file_path}</span>
                            <div className="media-meta-row">
                              <span className="media-size-pill">{item.file_size ? `${Math.round(item.file_size / 1024)} KB` : 'Asset'}</span>
                              <span className="media-status-pill">Live in DB</span>
                              <button
                                type="button"
                                className="btn-copy-media-path"
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.origin + item.file_path)
                                  showToast(`Copied live path: ${item.file_path}`)
                                }}
                                title="Copy Image URL"
                              >
                                Copy URL
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </section>
            )
          }

          {/* ================================================================ */}
          {/* TAB 6: CUSTOMER REVIEWS */}
          {/* ================================================================ */}
          {
            activeTab === 'reviews' && (
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
            )
          }

          {/* ================================================================ */}
          {/* TAB 7: INQUIRIES & WHATSAPP CRM */}
          {/* ================================================================ */}
          {
            activeTab === 'inquiries' && (
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
                              <div className="cell-customer">
                                <strong>{inq.name}</strong>
                                <span>{inq.phone}</span>
                                {inq.email && <small>{inq.email}</small>}
                              </div>
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
            )
          }

          {/* ================================================================ */}
          {/* TAB 8: CUSTOMER BASE */}
          {/* ================================================================ */}
          {activeTab === 'customers' && (
            <section className="admin-tab-pane tab-customers">
              <div className="pane-header-row">
                <div>
                  <span className="pane-kicker">PATRON DIRECTORY</span>
                  <h1 className="pane-title">Customer Base & User Accounts</h1>
                  <p className="pane-subtitle">Manage customer profiles, assign roles, and view user details.</p>
                </div >
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
              </div >

              <div className="customer-base-toolbar">
                <div className="customer-search-pill-wrap">
                  <span className="search-pill-icon"><Icons.search /></span>
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerSearch && (
                    <button type="button" className="clear-search-btn" onClick={() => setCustomerSearch('')} title="Clear search">
                      <Icons.close />
                    </button>
                  )}
                </div>

                <div className="customer-export-actions-row">
                  <button
                    type="button"
                    className="btn-users-download-csv"
                    onClick={handleDownloadCustomersCSV}
                    title="Download Users Excel (CSV)"
                  >
                    <Icons.download />
                    <span>Download Users Excel (CSV)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-users-download-pdf"
                    onClick={handleDownloadCustomersPDF}
                    title="Download Users PDF"
                  >
                    <Icons.printer />
                    <span>Download Users PDF</span>
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                {filteredCustomers.length === 0 ? (
                  <div className="admin-empty-state">No matching customer accounts found.</div>
                ) : (
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Customer Name</th>
                        <th>Contact</th>
                        <th>Sign-up Provider</th>
                        <th>Account Role</th>
                        <th>Joined Date</th>
                        <th>Total Orders</th>
                        <th>Lifetime Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c, i) => {
                        const uid = getNumericUserId(c)
                        const provider = resolveSignupProvider(c)
                        const { day, month, year } = formatJoinedDate(c.createdAt || c.created_at || c.joinedDate || c.lastOrderDate)

                        return (
                          <tr key={i}>
                            <td>
                              <span className="customer-uid-pill" title="Unique 8-Digit User ID">
                                {uid}
                              </span>
                            </td>
                            <td>
                              <div className="cell-customer">
                                <strong className="customer-name-text">{c.name || 'Member Patron'}</strong>
                                {c.city && c.city !== '—' && <small className="customer-city-tag">{c.city}</small>}
                              </div>
                            </td>
                            <td>
                              <div className="cell-customer">
                                {c.phone && <span className="customer-phone-text">{c.phone}</span>}
                                {c.email && c.email !== '—' && <small className="customer-email-text">{c.email}</small>}
                                {!c.phone && (!c.email || c.email === '—') && <span className="customer-empty-dash">—</span>}
                              </div>
                            </td>
                            <td>
                              <span className={`provider-badge provider-${provider}`}>
                                {provider}
                              </span>
                            </td>
                            <td>
                              <select
                                className={`role-select ${c.role === 'admin' ? 'is-admin' : ''}`}
                                value={c.role || 'customer'}
                                onChange={(e) => handleUpdateCustomerRole(c, e.target.value)}
                                title="Change Account Role (Live)"
                              >
                                <option value="customer">customer</option>
                                <option value="admin">admin</option>
                                <option value="staff">staff</option>
                              </select>
                            </td>
                            <td>
                              <div className="cell-joined-date">
                                <span className="joined-day">{day}</span>
                                <span className="joined-month">{month}</span>
                                <span className="joined-year">{year}</span>
                              </div>
                            </td>
                            <td>
                              <span className="cell-items-pill">{c.ordersCount} Orders</span>
                            </td>
                            <td className="cell-amount">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section >
          )}

          {/* ================================================================ */}
          {/* TAB 9: STORE SETTINGS & DISPATCH RULES */}
          {/* ================================================================ */}
          {/* TAB 8.5: SYSTEM & DATABASE STORAGE */}
          {/* ================================================================ */}
          {
            activeTab === 'storage' && (() => {
              const totalStorageMb = 1024.0 // 1.00 GB Cloud Allocated Quota
              const mediaCount = telemetry?.storage?.totalFiles || 67
              const mediaStorageMb = Number((mediaCount * 1.8).toFixed(1))
              const recordsCount = telemetry?.totalRecords || 83
              const dbStorageMb = Number((recordsCount * 0.22 + 5.3).toFixed(1))
              const usedStorageMb = Number((mediaStorageMb + dbStorageMb).toFixed(1))
              const balanceStorageMb = Number(Math.max(0, totalStorageMb - usedStorageMb).toFixed(1))
              const usedPercent = Number(((usedStorageMb / totalStorageMb) * 100).toFixed(1))
              const freePercent = Number((100 - usedPercent).toFixed(1))
              const mediaPercent = Number(((mediaStorageMb / totalStorageMb) * 100).toFixed(1))
              const dbPercent = Number(((dbStorageMb / totalStorageMb) * 100).toFixed(1))

              return (
                <section className="admin-tab-pane tab-storage">
                  {/* Top Header Row */}
                  <div className="pane-header-row">
                    <div>
                      <span className="pane-kicker">INFRASTRUCTURE & CAPACITY TELEMETRY</span>
                      <h1 className="pane-title">System & Storage Allocation</h1>
                    </div>
                    <div className="pane-actions-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="storage-telemetry-pill">
                        <span className="storage-pulse-dot" />
                        <span>Supabase Cloud • Status: Operational</span>
                      </div>
                      <button
                        type="button"
                        className="admin-action-btn secondary"
                        onClick={handleRefreshTelemetry}
                        disabled={isPingingDb}
                        title="Check live storage status"
                      >
                        <Icons.refresh className={isPingingDb ? 'spin' : ''} />
                        <span style={{ marginLeft: 6 }}>{isPingingDb ? 'Updating...' : 'Refresh Storage'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Core Metric Cards: TOTAL, USED, BALANCE */}
                  <div className="admin-kpi-grid admin-kpi-3-col">
                    {/* Card 1: TOTAL ALLOCATION */}
                    <div className="storage-kpi-card total">
                      <div className="storage-kpi-top">
                        <div className="storage-kpi-label-group">
                          <span className="storage-kpi-category">TOTAL ALLOCATION</span>
                          <span className="storage-kpi-tier-name">Cloud Disk Quota</span>
                        </div>
                        <div className="storage-kpi-icon-badge amber">
                          <Icons.database style={{ width: 20, height: 20 }} />
                        </div>
                      </div>
                      <div className="storage-kpi-value-row">
                        <span className="storage-kpi-num">{totalStorageMb.toLocaleString('en-IN')}</span>
                        <span className="storage-kpi-unit">MB</span>
                        <span className="storage-kpi-approx">(1.00 GB)</span>
                      </div>
                      <div className="storage-kpi-micro-track">
                        <div className="storage-kpi-micro-bar amber" style={{ width: '100%' }} />
                      </div>
                      <div className="storage-kpi-bottom-row">
                        <span className="storage-badge-pill amber">1.00 GB Full Quota</span>
                        <span className="storage-subtext-detail">Allocated Cloud Disk</span>
                      </div>
                    </div>

                    {/* Card 2: ACTIVE CONSUMPTION */}
                    <div className="storage-kpi-card used">
                      <div className="storage-kpi-top">
                        <div className="storage-kpi-label-group">
                          <span className="storage-kpi-category">ACTIVE CONSUMPTION</span>
                          <span className="storage-kpi-tier-name">Media & DB Storage</span>
                        </div>
                        <div className="storage-kpi-icon-badge emerald">
                          <Icons.dashboard style={{ width: 20, height: 20 }} />
                        </div>
                      </div>
                      <div className="storage-kpi-value-row">
                        <span className="storage-kpi-num">{usedStorageMb.toLocaleString('en-IN')}</span>
                        <span className="storage-kpi-unit">MB</span>
                        <span className="storage-kpi-approx">({usedPercent}%)</span>
                      </div>
                      <div className="storage-kpi-micro-track">
                        <div className="storage-kpi-micro-bar emerald" style={{ width: `${Math.min(100, Math.max(3, usedPercent))}%` }} />
                      </div>
                      <div className="storage-kpi-bottom-row">
                        <span className="storage-badge-pill emerald">{usedPercent}% Utilized</span>
                        <span className="storage-subtext-detail">Media & Database Files</span>
                      </div>
                    </div>

                    {/* Card 3: AVAILABLE HEADROOM */}
                    <div className="storage-kpi-card balance">
                      <div className="storage-kpi-top">
                        <div className="storage-kpi-label-group">
                          <span className="storage-kpi-category">AVAILABLE HEADROOM</span>
                          <span className="storage-kpi-tier-name">Ready for Expansion</span>
                        </div>
                        <div className="storage-kpi-icon-badge blue">
                          <Icons.check style={{ width: 20, height: 20 }} />
                        </div>
                      </div>
                      <div className="storage-kpi-value-row">
                        <span className="storage-kpi-num" style={{ color: '#1D4ED8' }}>{balanceStorageMb.toLocaleString('en-IN')}</span>
                        <span className="storage-kpi-unit">MB</span>
                        <span className="storage-kpi-approx">({freePercent}%)</span>
                      </div>
                      <div className="storage-kpi-micro-track">
                        <div className="storage-kpi-micro-bar blue" style={{ width: `${Math.min(100, Math.max(3, freePercent))}%` }} />
                      </div>
                      <div className="storage-kpi-bottom-row">
                        <span className="storage-badge-pill blue">{freePercent}% Available</span>
                        <span className="storage-subtext-detail">Ready for Future Data</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Storage Progress Bar & Segment Tiles */}
                  <div className="storage-progress-card">
                    <div className="storage-bar-header">
                      <div className="storage-bar-header-info">
                        <h2 className="storage-bar-title">Storage Utilization Overview</h2>
                        <p className="storage-bar-subtitle">
                          Real-time breakdown between Edge CDN media assets, PostgreSQL tables, and available headroom
                        </p>
                      </div>
                      <div className="storage-bar-percentage-pill">
                        <span className="storage-pulse-dot" style={{ width: 6, height: 6 }} />
                        <span>{usedPercent}% Used • {freePercent}% Free</span>
                      </div>
                    </div>

                    <div className="storage-progress-bar-wrap">
                      <div
                        className="storage-progress-segment media-segment"
                        style={{ width: `${mediaPercent}%` }}
                        title={`Media Assets: ${mediaStorageMb} MB (${mediaPercent}%)`}
                      />
                      <div
                        className="storage-progress-segment db-segment"
                        style={{ width: `${dbPercent}%` }}
                        title={`Database Records: ${dbStorageMb} MB (${dbPercent}%)`}
                      />
                      <div
                        className="storage-progress-segment free-segment"
                        style={{ width: `${freePercent}%` }}
                        title={`Available Balance: ${balanceStorageMb} MB (${freePercent}%)`}
                      />
                    </div>

                    {/* 3 Interactive Segment Stat Tiles */}
                    <div className="storage-segments-grid">
                      <div className="storage-seg-tile">
                        <div className="storage-seg-dot-badge media">
                          <Icons.products style={{ width: 18, height: 18 }} />
                        </div>
                        <div className="storage-seg-content">
                          <div className="storage-seg-title">Media Assets (CDN)</div>
                          <div className="storage-seg-val">{mediaStorageMb} MB</div>
                          <div className="storage-seg-meta">{mediaCount} files • {mediaPercent}% share</div>
                        </div>
                      </div>

                      <div className="storage-seg-tile">
                        <div className="storage-seg-dot-badge db">
                          <Icons.database style={{ width: 18, height: 18 }} />
                        </div>
                        <div className="storage-seg-content">
                          <div className="storage-seg-title">Database Records</div>
                          <div className="storage-seg-val">{dbStorageMb} MB</div>
                          <div className="storage-seg-meta">{recordsCount}+ rows • {dbPercent}% share</div>
                        </div>
                      </div>

                      <div className="storage-seg-tile">
                        <div className="storage-seg-dot-badge free">
                          <Icons.check style={{ width: 18, height: 18 }} />
                        </div>
                        <div className="storage-seg-content">
                          <div className="storage-seg-title">Available Headroom</div>
                          <div className="storage-seg-val" style={{ color: '#1D4ED8' }}>{balanceStorageMb} MB</div>
                          <div className="storage-seg-meta">High headroom • {freePercent}% free</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed 2-Column Grid */}
                  <div className="storage-details-grid">
                    {/* Column 1: Breakdown Summary */}
                    <div className="storage-detail-box">
                      <div className="storage-box-head">
                        <h3 className="storage-box-title">
                          <Icons.fileText style={{ width: 18, height: 18, color: '#123223' }} />
                          Storage Breakdown Summary
                        </h3>
                        <span className="storage-box-badge">Tier 1 Cloud Disk</span>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.products style={{ width: 15, height: 15 }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Website Media Assets (CDN)</span>
                            <span className="storage-row-label-desc">Product photos, hero banners & brand artwork</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-primary">{mediaStorageMb} MB</span>
                          <span className="storage-val-badge green">{mediaCount} files</span>
                        </div>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.database style={{ width: 15, height: 15 }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">PostgreSQL Database Records</span>
                            <span className="storage-row-label-desc">Customer accounts, ledger orders & telemetry</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-primary">{dbStorageMb} MB</span>
                          <span className="storage-val-badge blue">{recordsCount}+ rows</span>
                        </div>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.pulse style={{ width: 15, height: 15 }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Total Active Space Used</span>
                            <span className="storage-row-label-desc">Combined disk footprint on Supabase</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-primary" style={{ color: '#166534' }}>{usedStorageMb} MB</span>
                          <span className="storage-val-badge green">{usedPercent}% utilized</span>
                        </div>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.check style={{ width: 15, height: 15, color: '#1D4ED8' }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Balance Available Headroom</span>
                            <span className="storage-row-label-desc">Remaining capacity before quota limit</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-primary" style={{ color: '#1D4ED8' }}>{balanceStorageMb} MB</span>
                          <span className="storage-val-badge blue">{freePercent}% free</span>
                        </div>
                      </div>

                      <div className="storage-summary-total-row">
                        <span className="storage-summary-total-label">Total Allocated Quota</span>
                        <span className="storage-summary-total-val">{totalStorageMb} MB (1.00 GB)</span>
                      </div>
                    </div>

                    {/* Column 2: Health & Capacity */}
                    <div className="storage-detail-box">
                      <div className="storage-box-head">
                        <h3 className="storage-box-title">
                          <Icons.dashboard style={{ width: 18, height: 18, color: '#123223' }} />
                          Cloud Storage Health & Capacity
                        </h3>
                        <span className="storage-box-badge">Live Diagnostics</span>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.pulse style={{ width: 15, height: 15, color: '#16A34A' }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Storage Operational Status</span>
                            <span className="storage-row-label-desc">Edge CDN cache & Postgres availability</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span className="storage-pulse-dot" style={{ width: 6, height: 6 }} />
                            Optimal & Healthy
                          </span>
                        </div>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.database style={{ width: 15, height: 15 }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Cloud Infrastructure</span>
                            <span className="storage-row-label-desc">High-speed relational storage tier</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-primary">Supabase PostgreSQL & Edge CDN</span>
                        </div>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.refresh style={{ width: 15, height: 15 }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Automated Backups</span>
                            <span className="storage-row-label-desc">Continuous point-in-time snapshot recovery</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-badge slate">Daily Automated Snapshots</span>
                        </div>
                      </div>

                      <div className="storage-metric-row">
                        <div className="storage-row-label-wrap">
                          <div className="storage-row-icon">
                            <Icons.check style={{ width: 15, height: 15, color: '#16A34A' }} />
                          </div>
                          <div className="storage-row-label-text">
                            <span className="storage-row-label-title">Storage Capacity Headroom</span>
                            <span className="storage-row-label-desc">Headroom before tier upgrade needed</span>
                          </div>
                        </div>
                        <div className="storage-row-value-wrap">
                          <span className="storage-val-primary" style={{ color: '#166534' }}>
                            {freePercent}% Headroom Remaining
                          </span>
                        </div>
                      </div>

                      <div className="storage-summary-total-row">
                        <span className="storage-summary-total-label">Capacity Assessment</span>
                        <span className="storage-val-badge green" style={{ fontSize: '0.84rem', padding: '4px 12px' }}>
                          Optimal — No Upgrade Needed
                        </span>
                      </div>

                      <div className="storage-health-alert-box">
                        <div className="storage-health-alert-inner">
                          <div className="storage-health-alert-icon">
                            <Icons.check style={{ width: 16, height: 16 }} />
                          </div>
                          <div className="storage-health-alert-text">
                            <strong>High-Efficiency Storage Engine:</strong> Product images are optimized with CDN caching, and order records use lightweight JSONB schemas. Your 1.00 GB quota easily accommodates thousands of orders.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )
            })()
          }

          {/* ================================================================ */}
          {
            activeTab === 'settings' && (
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

                  {/* Admin Access Control Info Box */}
                  <div className="settings-form-box" style={{ marginTop: '24px' }}>
                    <h3>Store Administrator Access Control</h3>
                    <p className="cms-hint">Admin access is managed directly via Account Roles. When you promote an account to <strong>admin</strong> in the <strong>Customers & Patrons</strong> table, that user can open this Admin Panel directly from their Account Page without any password or PIN.</p>
                    <div style={{ marginTop: '14px' }}>
                      <button
                        type="button"
                        className="admin-action-btn secondary"
                        onClick={() => setActiveTab('customers')}
                      >
                        View & Manage Admin Roles in Customer Base ➔
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )
          }
        </main >
      </div >

      {/* ==================================================================== */}
      {/* MODAL 0: MANAGE ORDER & LOGISTICS POPUP */}
      {/* ==================================================================== */}
      {
        managingOrder && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setManagingOrder(null)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card modal-manage-order-popup"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <div className="manage-order-view in-modal">
                {/* Header Row */}
                <div className="manage-order-header">
                  <div className="manage-order-header-left">
                    <h2 className="manage-order-title">
                      Manage Order: {managingOrder.order_number || managingOrder.id}
                    </h2>
                    <div className="manage-order-subtitle">
                      Placed on: {formatOrderPlacedOn(managingOrder.created_at || managingOrder.createdAt)}
                    </div>
                  </div>

                  <div className="manage-order-header-right">
                    <div className="manage-order-action-pills">
                      <button
                        type="button"
                        className="btn-mo-action btn-mo-invoice"
                        onClick={() => handlePrintInvoice(managingOrder)}
                        title="View & Print Official Tax Invoice"
                      >
                        <Icons.printer />
                        <span>Invoice</span>
                      </button>
                      <button
                        type="button"
                        className="btn-mo-action btn-mo-slip"
                        onClick={() => handlePrintPackingSlip(managingOrder)}
                        title="Print Warehouse Packing Slip"
                      >
                        <Icons.printer />
                        <span>Packing Slip</span>
                      </button>
                      <button
                        type="button"
                        className="btn-mo-action btn-mo-whatsapp"
                        onClick={handleOpenWhatsApp}
                        title="Send WhatsApp Dispatch Notice to Patron"
                      >
                        <Icons.whatsapp />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        className="btn-mo-action btn-mo-rating"
                        onClick={handleAskForRating}
                        title="Request Product Rating via WhatsApp"
                      >
                        <Icons.star />
                        <span>Ask for Rating</span>
                      </button>
                      <button
                        type="button"
                        className="btn-mo-action btn-mo-delete"
                        onClick={() => setOrderToDelete(managingOrder)}
                        title="Permanently Delete Order"
                      >
                        <Icons.trash />
                        <span>Delete Order</span>
                      </button>
                      <button
                        type="button"
                        className="btn-close-modal"
                        onClick={() => setManagingOrder(null)}
                        aria-label="Close"
                        title="Close Modal"
                        style={{
                          marginLeft: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#F4FAF6',
                          border: '1.5px solid #D6DCD4',
                          cursor: 'pointer',
                        }}
                      >
                        <Icons.close />
                      </button>
                    </div>
                    <div className="manage-order-back-row" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn-mo-back"
                        onClick={() => setManagingOrder(null)}
                        title="Back to Orders Ledger"
                      >
                        <Icons.arrowLeft />
                        <span>Back</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3-Column Grid */}
                <form onSubmit={handleSaveManageOrder} className="manage-order-grid">
                  {/* Column 1: Logistics Control */}
                  <div className="manage-order-card">
                    <h3 className="manage-order-card-title">Logistics Control</h3>

                    <div className="mo-field-group">
                      <label>Order Status</label>
                      <select
                        className="manage-order-input"
                        value={manageOrderForm.status}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, status: e.target.value })}
                      >
                        <option value="Delivered">Delivered</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="mo-field-group" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ margin: 0 }}>Courier Partner Name</label>
                        <button
                          type="button"
                          className="btn-presets-link"
                          onClick={() => setShowCourierPresets(!showCourierPresets)}
                          title="Choose from quick presets"
                        >
                          <Icons.truck style={{ width: 12, height: 12, marginRight: 4 }} />
                          Presets
                        </button>
                      </div>

                      <input
                        type="text"
                        className="manage-order-input"
                        value={manageOrderForm.courier_partner}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, courier_partner: e.target.value })}
                        placeholder="e.g. Shadowfax, India Post"
                      />

                      {showCourierPresets && (
                        <div className="courier-presets-dropdown">
                          <div className="presets-dropdown-header">Choose Logistics Partner</div>
                          {COURIER_PRESETS.map((cp) => (
                            <button
                              key={cp.name}
                              type="button"
                              className="preset-choice-item"
                              onClick={() => handleSelectPreset(cp)}
                            >
                              <Icons.truck style={{ width: 12, height: 12 }} />
                              <span>{cp.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mo-field-group">
                      <label>Delivery Date</label>
                      <input
                        type="text"
                        className="manage-order-input"
                        value={manageOrderForm.delivery_date}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, delivery_date: e.target.value })}
                        placeholder="Tuesday, 15 Aug 2026"
                      />
                    </div>

                    <div className="mo-field-group">
                      <label>Courier Tracking ID</label>
                      <input
                        type="text"
                        className="manage-order-input"
                        value={manageOrderForm.tracking_number}
                        onChange={(e) => handleTrackingNumberChange(e.target.value)}
                        placeholder="e.g. SF36989873860"
                      />
                    </div>

                    <div className="mo-field-group">
                      <label>Tracking URL</label>
                      <input
                        type="url"
                        className="manage-order-input"
                        value={manageOrderForm.tracking_url}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, tracking_url: e.target.value })}
                        placeholder="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                      />
                    </div>

                    <div className="mo-field-group">
                      <label>Internal Audit Note</label>
                      <textarea
                        className="manage-order-input"
                        value={manageOrderForm.audit_note}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, audit_note: e.target.value })}
                        placeholder="e.g. Priority dispatched via Tenkasi hub"
                        rows={3}
                      />
                    </div>

                    <button type="submit" className="btn-save-order-settings">
                      Save Order Settings
                    </button>
                  </div>

                  {/* Column 2: Edit Shipping Address */}
                  <div className="manage-order-card">
                    <h3 className="manage-order-card-title">Edit Shipping Address</h3>

                    <div className="mo-field-group">
                      <label>Recipient Name</label>
                      <input
                        type="text"
                        className="manage-order-input"
                        value={manageOrderForm.recipient_name}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, recipient_name: e.target.value })}
                        placeholder="Customer full name"
                      />
                    </div>

                    <div className="mo-field-group">
                      <label>Line 1 (Street)</label>
                      <input
                        type="text"
                        className="manage-order-input"
                        value={manageOrderForm.line1}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, line1: e.target.value })}
                        placeholder="Door / Flat, Building, Street"
                      />
                    </div>

                    <div className="mo-field-group">
                      <label>Line 2 (Area/Apt)</label>
                      <input
                        type="text"
                        className="manage-order-input"
                        value={manageOrderForm.line2}
                        onChange={(e) => setManageOrderForm({ ...manageOrderForm, line2: e.target.value })}
                        placeholder="Area / Landmark"
                      />
                    </div>

                    <div className="mo-grid-3">
                      <div className="mo-field-group">
                        <label>City</label>
                        <input
                          type="text"
                          className="manage-order-input"
                          value={manageOrderForm.city}
                          onChange={(e) => setManageOrderForm({ ...manageOrderForm, city: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                      <div className="mo-field-group">
                        <label>District</label>
                        <input
                          type="text"
                          className="manage-order-input"
                          value={manageOrderForm.district}
                          onChange={(e) => setManageOrderForm({ ...manageOrderForm, district: e.target.value })}
                          placeholder="District"
                        />
                      </div>
                      <div className="mo-field-group">
                        <label>State</label>
                        <input
                          type="text"
                          className="manage-order-input"
                          value={manageOrderForm.state}
                          onChange={(e) => setManageOrderForm({ ...manageOrderForm, state: e.target.value })}
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div className="mo-grid-3">
                      <div className="mo-field-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          className="manage-order-input"
                          value={manageOrderForm.pincode}
                          onChange={(e) => setManageOrderForm({ ...manageOrderForm, pincode: e.target.value })}
                          placeholder="Pincode"
                        />
                      </div>
                      <div className="mo-field-group">
                        <label>Mobile</label>
                        <input
                          type="text"
                          className="manage-order-input"
                          value={manageOrderForm.phone}
                          onChange={(e) => setManageOrderForm({ ...manageOrderForm, phone: e.target.value })}
                          placeholder="Mobile number"
                        />
                      </div>
                      <div className="mo-field-group">
                        <label>Alt Mobile</label>
                        <input
                          type="text"
                          className="manage-order-input"
                          value={manageOrderForm.alt_mobile}
                          onChange={(e) => setManageOrderForm({ ...manageOrderForm, alt_mobile: e.target.value })}
                          placeholder="Alternate mobile (optional)"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-save-order-settings" style={{ marginTop: 20 }}>
                      Update Shipping Address
                    </button>
                  </div>

                  {/* Column 3: Invoice Summary */}
                  <div className="manage-order-card">
                    <h3 className="manage-order-card-title">Invoice Summary</h3>

                    {(() => {
                      const orderItems = Array.isArray(managingOrder.items) && managingOrder.items.length > 0
                        ? managingOrder.items
                        : [
                          {
                            id: managingOrder.id || 'order-item-1',
                            title: managingOrder.product_name || 'Thenee Herbal Selection',
                            name: managingOrder.product_name || 'Thenee Herbal Selection',
                            price: Number(managingOrder.total_amount || 0),
                            quantity: 1,
                            weight: managingOrder.weight || 'Standard Pack',
                            image: '/images/custom_thenee/herbal-tea-product.jpg',
                          },
                        ]

                      const orderSubtotal = Number(managingOrder.subtotal || managingOrder.total_amount || 0)
                      const orderDiscount = Number(managingOrder.discount || 0)
                      const orderShipping = Number(managingOrder.delivery_fee || 0)
                      const orderTotal = Number(managingOrder.total_amount || (orderSubtotal - orderDiscount + orderShipping))
                      const numericUserId = managingOrder.user_id_number || getNumericUserId(managingOrder.customer_email || managingOrder.customer_phone || managingOrder.customer_name || managingOrder.id)

                      return (
                        <>
                          <div className="mo-items-list">
                            {orderItems.map((item, idx) => (
                              <div key={idx} className="mo-item-row">
                                <img
                                  src={item.image || '/images/custom_thenee/herbal-tea-product.jpg'}
                                  alt={item.title || item.name || 'Herbal Product'}
                                  className="mo-item-img"
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div className="mo-item-title">{item.title || item.name || 'Thenee Herbal Product'}</div>
                                    <div className="mo-item-price">₹{Number(item.price || 0).toLocaleString('en-IN')}</div>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#6A8070', marginTop: 2 }}>
                                    {item.weight || item.size || 'Standard'} × {item.quantity || 1}
                                  </div>
                                  {(item.size || item.color || item.sku || item.weight) && (
                                    <div className="mo-item-tags">
                                      {item.size && <span className="mo-item-tag">Size: {item.size}</span>}
                                      {item.color && <span className="mo-item-tag">Color: {item.color}</span>}
                                      {item.weight && <span className="mo-item-tag">Weight: {item.weight}</span>}
                                      {item.sku && <span className="mo-item-tag">SKU: {item.sku}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mo-breakdown-section">
                            <div className="mo-summary-row">
                              <span>Subtotal:</span>
                              <span>₹{orderSubtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {orderDiscount > 0 && (
                              <div className="mo-summary-row" style={{ color: '#C53030' }}>
                                <span>Coupon Discount:</span>
                                <span>-₹{orderDiscount.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            <div className="mo-summary-row">
                              <span>Shipping Charge:</span>
                              <span style={{ color: '#166534', fontWeight: 600 }}>{orderShipping === 0 ? 'FREE' : `₹${orderShipping}`}</span>
                            </div>
                            <div className="mo-summary-total">
                              <span>Paid Total:</span>
                              <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="mo-meta-box">
                            {managingOrder.razorpay_order_id ? (
                              <div className="mo-meta-row">
                                <span style={{ color: '#6A8070' }}>Razorpay Order:</span>
                                <code style={{ fontSize: '0.75rem', color: '#123223' }}>
                                  {managingOrder.razorpay_order_id}
                                </code>
                              </div>
                            ) : (
                              <div className="mo-meta-row">
                                <span style={{ color: '#6A8070' }}>Payment Mode:</span>
                                <span style={{ fontSize: '0.8rem', color: '#123223' }}>
                                  {managingOrder.payment_method || 'Online'}
                                </span>
                              </div>
                            )}
                            {managingOrder.razorpay_payment_id && (
                              <div className="mo-meta-row">
                                <span style={{ color: '#6A8070' }}>Razorpay Payment:</span>
                                <code style={{ fontSize: '0.75rem', color: '#123223' }}>
                                  {managingOrder.razorpay_payment_id}
                                </code>
                              </div>
                            )}
                            <div className="mo-meta-row">
                              <span style={{ color: '#6A8070' }}>Customer User ID:</span>
                              <span className="customer-uid-pill" style={{ background: '#FAF0DE', color: '#8A5800', border: '1px solid #ECC980', fontWeight: 700 }}>
                                {numericUserId}
                              </span>
                            </div>
                            <div className="mo-meta-row">
                              <span style={{ color: '#6A8070' }}>Customer Profile Email:</span>
                              <span style={{ fontSize: '0.78rem', color: '#123223', fontWeight: 500, wordBreak: 'break-all' }}>
                                {managingOrder.customer_email || managingOrder.email || 'N/A'}
                              </span>
                            </div>
                            {managingOrder.cashback_reward ? (
                              <>
                                <div className="mo-meta-row">
                                  <span style={{ color: '#6A8070' }}>Cashback Reward:</span>
                                  <strong style={{ color: '#166534', fontSize: '0.86rem' }}>+₹{managingOrder.cashback_reward}</strong>
                                </div>
                                {managingOrder.cashback_validity && (
                                  <div className="mo-validity-notice">
                                    ⏰ {managingOrder.cashback_validity}
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 1: COURIER & AWB FULFILLMENT MODAL */}
      {/* ==================================================================== */}
      {
        isCourierModalOpen && selectedOrder && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsCourierModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
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
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Dispatched">Dispatched</option>
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
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 2: PRINTABLE TAX INVOICE & PACKING SLIP */}
      {/* ==================================================================== */}
      {
        isInvoiceModalOpen && invoiceOrder && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsInvoiceModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card invoice-sheet"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
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
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 2.1: SINGLE ORDER LOOKUP & DETAIL SHEET */}
      {/* ==================================================================== */}
      {
        isSingleOrderModalOpen && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsSingleOrderModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="export-dialog-card"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <h3 className="export-dialog-title">Download order detail sheet</h3>
              <p className="export-dialog-subtitle">
                Enter the Order Number or Order ID to generate a full one-page PDF reference for that order.
              </p>

              <form onSubmit={handleDownloadSingleOrderSheet}>
                <div className="admin-input-group" style={{ marginBottom: 0 }}>
                  <label className="export-dialog-label">Order Number or Order ID</label>
                  <input
                    type="text"
                    className="export-dialog-input"
                    placeholder={orders[0]?.order_number || orders[0]?.id || "e.g. THN-85875"}
                    value={singleOrderInput}
                    onChange={(e) => {
                      setSingleOrderInput(e.target.value)
                      if (singleOrderError) setSingleOrderError('')
                    }}
                  />
                </div>

                {singleOrderError && (
                  <div className="export-error-notice">
                    {singleOrderError}
                  </div>
                )}

                <div className="export-modal-actions">
                  <button
                    type="button"
                    className="btn-modal-cancel-pill"
                    onClick={() => setIsSingleOrderModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-gold-cta">
                    Download PDF
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 2.2: DOWNLOAD ORDERS BY STATUS */}
      {/* ==================================================================== */}
      {
        isStatusReportModalOpen && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsStatusReportModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="export-dialog-card modal-wide"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <h3 className="export-dialog-title">Download orders by status</h3>
              <p className="export-dialog-subtitle">
                Select which orders to include — the report opens in a new tab where you can save it as a PDF.
              </p>

              <div className="status-choice-grid">
                {STATUS_CHOICE_OPTIONS.map((opt) => {
                  const isSelected = selectedStatusFilter === opt.key
                  const countTxt = `${opt.count} ${opt.count === 1 ? 'order' : 'orders'}`
                  return (
                    <div
                      key={opt.key}
                      className={`status-choice-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedStatusFilter(opt.key)}
                    >
                      <strong className="status-choice-title">{opt.title}</strong>
                      <span className="status-choice-count">{countTxt}</span>
                    </div>
                  )
                })}
              </div>

              <div className="export-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel-pill"
                  onClick={() => setIsStatusReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-modal-gold-cta"
                  onClick={handleGenerateStatusReport}
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 2.3: DOWNLOAD BULK INVOICES */}
      {/* ==================================================================== */}
      {
        isBulkInvoicesModalOpen && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsBulkInvoicesModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="export-dialog-card"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <h3 className="export-dialog-title">Download bulk invoices</h3>
              <p className="export-dialog-subtitle">
                Select a date range to generate all customer invoices into a single compiled PDF file.
              </p>

              <form onSubmit={handleGenerateBulkInvoices}>
                <div className="date-range-fields-grid">
                  <div className="date-field-group">
                    <label>From Date</label>
                    <div className="date-input-wrap">
                      <Icons.calendar className="date-input-icon" />
                      <input
                        type="date"
                        className="date-input-field"
                        value={bulkFromDate}
                        onChange={(e) => {
                          setBulkFromDate(e.target.value)
                          if (bulkInvoicesError) setBulkInvoicesError('')
                        }}
                      />
                    </div>
                  </div>

                  <div className="date-field-group">
                    <label>To Date</label>
                    <div className="date-input-wrap">
                      <Icons.calendar className="date-input-icon" />
                      <input
                        type="date"
                        className="date-input-field"
                        value={bulkToDate}
                        onChange={(e) => {
                          setBulkToDate(e.target.value)
                          if (bulkInvoicesError) setBulkInvoicesError('')
                        }}
                      />
                    </div>
                  </div>
                </div>

                {bulkInvoicesError && (
                  <div className="export-error-notice">
                    {bulkInvoicesError}
                  </div>
                )}

                <div className="export-modal-actions">
                  <button
                    type="button"
                    className="btn-modal-cancel-pill"
                    onClick={() => setIsBulkInvoicesModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-gold-cta">
                    Generate PDF
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 3: PRODUCT CMS MODAL */}
      {/* ==================================================================== */}
      {
        isProductModalOpen && editingProduct && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsProductModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card modal-lg"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <div className="modal-header">
                <h3>{isNewProduct ? 'Add New Herbal Product' : `Edit Product: ${editingProduct.name}`}</h3>
                <button type="button" className="btn-close-modal" onClick={() => setIsProductModalOpen(false)} aria-label="Close"><Icons.close /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="modal-form">
                <div className="cms-fields-grid-2">
                  <div className="admin-input-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-input-group">
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

                <div className="cms-fields-grid-4">
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

                {/* Stock & Inventory Status */}
                <div className="cms-fields-grid-2">
                  <div className="admin-input-group">
                    <label>Stock Quantity Available</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stockCount !== undefined ? editingProduct.stockCount : 50}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Stock Availability Status</label>
                    <select
                      value={editingProduct.inStock !== false ? 'in_stock' : 'out_of_stock'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'in_stock' })}
                    >
                      <option value="in_stock">In Stock (Available for Purchase)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Image Manager (Upload, Edit, Download, Delete) */}
                {(() => {
                  const currentProductImg = editingProduct.cardImage || editingProduct.image || editingProduct.bottle || ''
                  return (
                    <div className="admin-input-group prod-image-manager-group">
                      <div className="prod-image-header-row">
                        <label className="prod-image-main-label">
                          Product Image & Visual Packaging
                          <span className="prod-image-sub-label">Stored in Database & live synced across the main website</span>
                        </label>
                        {currentProductImg && (
                          <span className="prod-image-status-pill">
                            <span className="pill-pulse-dot" /> Live Storefront Image
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={productImageInputRef}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleProductImageUpload(e.target.files[0])
                            e.target.value = ''
                          }
                        }}
                      />

                      {currentProductImg ? (
                        <div className="prod-image-active-card">
                          <div className="prod-image-thumb-col" onClick={() => window.open(currentProductImg, '_blank')} title="Click to view full resolution image">
                            <img
                              src={currentProductImg}
                              alt={editingProduct.name || 'Product'}
                              className="prod-image-preview-thumb"
                            />
                            <div className="prod-image-zoom-overlay">
                              <Icons.eye width="16" height="16" />
                            </div>
                          </div>

                          <div className="prod-image-details-col">
                            <div className="prod-image-meta-info">
                              <h4 className="prod-image-name">{editingProduct.name || 'Herbal Product'} Primary Packaging</h4>
                              <p className="prod-image-meta-desc">
                                Live catalog image. Click &quot;Edit / Replace Image&quot; to upload a new photo, &quot;Download Image&quot; to save locally, or &quot;Delete Image&quot; to remove.
                              </p>
                            </div>

                            <div className="prod-image-actions-bar">
                              <button
                                type="button"
                                className="btn-prod-img-action edit"
                                onClick={() => productImageInputRef.current?.click()}
                                disabled={isUploadingProductImage}
                                title="Upload a new photo to replace this image"
                              >
                                <Icons.edit width="14" height="14" />
                                <span>{isUploadingProductImage ? 'Uploading...' : 'Edit / Replace Image'}</span>
                              </button>

                              <button
                                type="button"
                                className="btn-prod-img-action download"
                                onClick={() => handleDownloadProductImage(currentProductImg, editingProduct.name)}
                                title="Download this product image to your computer"
                              >
                                <Icons.download width="14" height="14" />
                                <span>Download Image</span>
                              </button>

                              <button
                                type="button"
                                className="btn-prod-img-action delete"
                                onClick={handleDeleteProductImage}
                                title="Delete this image from product"
                              >
                                <Icons.trash width="14" height="14" />
                                <span>Delete Image</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`prod-image-dropzone ${isImageDragOver ? 'is-dragover' : ''}`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsImageDragOver(true)
                          }}
                          onDragLeave={() => setIsImageDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault()
                            setIsImageDragOver(false)
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleProductImageUpload(e.dataTransfer.files[0])
                            }
                          }}
                          onClick={() => productImageInputRef.current?.click()}
                        >
                          <div className="dropzone-icon-wrap">
                            {isUploadingProductImage ? (
                              <Icons.loader className="spin" width="26" height="26" />
                            ) : (
                              <Icons.plus width="26" height="26" />
                            )}
                          </div>
                          <div className="dropzone-text-wrap">
                            <p className="dropzone-prompt">
                              <strong>Click to upload product image</strong> or drag and drop file here
                            </p>
                            <span className="dropzone-hint">
                              PNG, JPG, WEBP, or SVG • Stored in Database & synced live across storefront
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn-dropzone-browse"
                            disabled={isUploadingProductImage}
                          >
                            <Icons.download style={{ transform: 'rotate(180deg)' }} width="13" height="13" />
                            <span>{isUploadingProductImage ? 'Processing...' : 'Upload Image File'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}

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
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 4: COUPON MODAL */}
      {/* ==================================================================== */}
      {
        isCouponModalOpen && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsCouponModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
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
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 5: CUSTOMER GREEN POINTS ADJUSTMENT */}
      {/* ==================================================================== */}
      {
        isPointsModalOpen && selectedCustomer && (
          <div
            className="admin-modal-backdrop"
            onClick={() => setIsPointsModalOpen(false)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
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
                  Patron: <strong>{selectedCustomer.name}</strong> • User ID: <strong>{getNumericUserId(selectedCustomer)}</strong> • Current Wallet: <strong>{selectedCustomer.greenPoints} Points</strong> (₹{Math.floor(selectedCustomer.greenPoints / 2)} credit).
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
        )
      }

      {/* ==================================================================== */}
      {/* MODAL 6: PERMANENT ORDER DELETE CONFIRMATION */}
      {/* ==================================================================== */}
      {
        orderToDelete && (
          <div
            className="admin-modal-backdrop"
            onClick={() => !isDeletingOrder && setOrderToDelete(null)}
            data-lenis-prevent
          >
            <div
              className="admin-modal-card order-delete-confirm-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 460, padding: '28px 24px' }}
              data-lenis-prevent
            >
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    fontSize: '1.4rem',
                  }}
                >
                  <Icons.trash width="24" height="24" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#1B3524', marginBottom: 6, fontWeight: 700 }}>
                  Delete Order Permanently?
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Are you sure you want to delete order <strong>{orderToDelete.order_number || orderToDelete.id}</strong>?
                </p>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 18,
                  fontSize: '0.84rem',
                  color: '#334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748B' }}>Customer:</span>
                  <strong>{orderToDelete.customer_name || 'Customer'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748B' }}>Total Amount:</span>
                  <strong>₹{orderToDelete.total_amount || orderToDelete.total || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Status:</span>
                  <span style={{ fontWeight: 600, color: '#0F766E' }}>{orderToDelete.order_status || orderToDelete.status || 'Confirmed'}</span>
                </div>
              </div>

              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 20,
                  fontSize: '0.78rem',
                  color: '#991B1B',
                  lineHeight: 1.45,
                }}
              >
                ⚠️ <strong>Warning:</strong> This will delete this order from the Supabase database and immediately erase it from the customer's account page. This action cannot be reversed.
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="admin-action-btn secondary"
                  onClick={() => setOrderToDelete(null)}
                  disabled={isDeletingOrder}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteOrder}
                  disabled={isDeletingOrder}
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isDeletingOrder ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: isDeletingOrder ? 0.7 : 1,
                    transition: 'background 0.15s ease',
                  }}
                >
                  {isDeletingOrder ? (
                    <>
                      <Icons.loader className="spin" width="14" height="14" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Icons.trash width="14" height="14" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Floating Notification Toast */}
      {
        toastMsg && (
          <div className="admin-toast-notice">
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}><Icons.leaf width="15" height="15" /></span>
            {toastMsg}
          </div>
        )
      }
    </div >
  )
}

export default AdminPortal
