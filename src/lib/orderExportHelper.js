// ==============================================================================
// THENEE ORDERS EXPORT & PDF PRINTING UTILITIES
// Generates single-order detail sheets, status-filtered reports, and bulk invoices
// ==============================================================================

import { isRealAwb, getNumericUserId } from './supabase'

/**
 * Computes dynamic counts for the 9 status filters based on the active orders ledger
 */
export const getOrderStatusCounts = (ordersList = []) => {
  const counts = {
    all: ordersList.length,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    returned: 0,
    rejected: 0,
    free_delivery: 0,
    charged_delivery: 0,
  }

  ordersList.forEach((o) => {
    const st = (o.order_status || o.status || '').toLowerCase().trim()
    if (st === 'pending') {
      counts.pending++
    } else if (st === 'confirmed' || st === 'packed' || st === 'processing') {
      counts.confirmed++
    } else if (st === 'shipped' || st === 'dispatched' || st === 'in_transit') {
      counts.shipped++
    } else if (st === 'delivered') {
      counts.delivered++
    } else if (st === 'returned') {
      counts.returned++
    } else if (st === 'rejected' || st === 'cancelled') {
      counts.rejected++
    }

    const fee = Number(o.delivery_fee ?? o.shipping_fee ?? o.shippingCharge ?? (Number(o.total_amount) > 499 ? 0 : 50))
    if (fee === 0) {
      counts.free_delivery++
    } else {
      counts.charged_delivery++
    }
  })

  return counts
}

/**
 * Filter orders by the selected status filter key
 */
export const filterOrdersByStatusKey = (ordersList = [], filterKey = 'all') => {
  switch (filterKey) {
    case 'pending':
      return ordersList.filter((o) => (o.order_status || o.status || '').toLowerCase() === 'pending')
    case 'confirmed':
      return ordersList.filter((o) => {
        const s = (o.order_status || o.status || '').toLowerCase()
        return s === 'confirmed' || s === 'packed' || s === 'processing'
      })
    case 'shipped':
      return ordersList.filter((o) => {
        const s = (o.order_status || o.status || '').toLowerCase()
        return s === 'shipped' || s === 'dispatched' || s === 'in_transit'
      })
    case 'delivered':
      return ordersList.filter((o) => (o.order_status || o.status || '').toLowerCase() === 'delivered')
    case 'returned':
      return ordersList.filter((o) => (o.order_status || o.status || '').toLowerCase() === 'returned')
    case 'rejected':
      return ordersList.filter((o) => {
        const s = (o.order_status || o.status || '').toLowerCase()
        return s === 'rejected' || s === 'cancelled'
      })
    case 'free_delivery':
      return ordersList.filter((o) => {
        const fee = Number(o.delivery_fee ?? o.shipping_fee ?? o.shippingCharge ?? (Number(o.total_amount) > 499 ? 0 : 50))
        return fee === 0
      })
    case 'charged_delivery':
      return ordersList.filter((o) => {
        const fee = Number(o.delivery_fee ?? o.shipping_fee ?? o.shippingCharge ?? (Number(o.total_amount) > 499 ? 0 : 50))
        return fee > 0
      })
    case 'all':
    default:
      return [...ordersList]
  }
}

/**
 * Formats a currency number with INR symbol
 */
const formatInr = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(num) || 0)
}

/**
 * Standard CSS rules injected into printable tabs for pixel-perfect PDF rendering
 */
const BASE_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #123223;
    background: #FDFCF8;
    line-height: 1.5;
    padding: 24px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #123223;
    color: #FFFFFF;
    padding: 12px 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 14px rgba(18, 50, 35, 0.15);
  }

  .print-action-bar h4 {
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-print-cta {
    background: #B89D6C;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 8px 18px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-print-cta:hover {
    background: #A48957;
  }

  .btn-close-cta {
    background: transparent;
    color: #E2E8F0;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 0.85rem;
    cursor: pointer;
    margin-left: 10px;
  }

  .sheet-container {
    max-width: 860px;
    margin: 0 auto;
    background: #FFFFFF;
    border: 1px solid #EAE5D8;
    border-radius: 16px;
    padding: 36px 40px;
    box-shadow: 0 10px 30px rgba(18, 50, 35, 0.05);
  }

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #123223;
    padding-bottom: 20px;
    margin-bottom: 24px;
  }

  .brand-logo-text {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #123223;
    line-height: 1;
  }

  .brand-motto {
    font-size: 0.8rem;
    font-weight: 600;
    color: #7D8F82;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 4px;
    display: block;
  }

  .brand-address {
    font-size: 0.76rem;
    color: #556B5C;
    margin-top: 8px;
    line-height: 1.4;
  }

  .header-badge-box {
    text-align: right;
  }

  .badge-tag-pill {
    display: inline-block;
    background: #FAF6EE;
    color: #8C6D37;
    border: 1.5px solid #D8C7A0;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .badge-order-num {
    font-size: 1.2rem;
    font-weight: 700;
    color: #123223;
    margin-top: 6px;
    font-family: monospace;
  }

  .badge-date {
    font-size: 0.78rem;
    color: #6C7F72;
    margin-top: 2px;
  }

  .two-col-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  .col-card {
    background: #FAF9F5;
    border: 1px solid #ECE7DC;
    border-radius: 12px;
    padding: 16px 20px;
  }

  .col-card-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #385040;
    margin-bottom: 10px;
    border-bottom: 1px solid #E4DED1;
    padding-bottom: 6px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.84rem;
    margin-bottom: 6px;
  }

  .detail-row span {
    color: #65756B;
  }

  .detail-row strong {
    color: #123223;
    font-weight: 600;
    text-align: right;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }

  .items-table th {
    background: #F4F7F2;
    border-bottom: 2px solid #123223;
    color: #123223;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: left;
    padding: 10px 14px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .items-table td {
    padding: 12px 14px;
    border-bottom: 1px solid #EAEFE7;
    font-size: 0.85rem;
    color: #1E2E23;
  }

  .items-table tr:last-child td {
    border-bottom: 1.5px solid #123223;
  }

  .totals-box {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 28px;
  }

  .totals-inner {
    width: 320px;
    background: #FAF9F5;
    border: 1px solid #ECE7DC;
    border-radius: 12px;
    padding: 16px 20px;
  }

  .totals-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.86rem;
    margin-bottom: 8px;
    color: #556B5C;
  }

  .totals-row.grand-total {
    border-top: 1.5px dashed #D5CEBE;
    padding-top: 10px;
    margin-top: 8px;
    font-size: 1.15rem;
    font-weight: 700;
    color: #123223;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .status-delivered { background: #EAF3E6; color: #27AE60; }
  .status-confirmed { background: #E8F8F5; color: #16A085; }
  .status-shipped { background: #EBF5FB; color: #2980B9; }
  .status-pending { background: #FEF9E7; color: #D4AC0D; }
  .status-rejected { background: #FADBD8; color: #C0392B; }

  .footer-seal-strip {
    border-top: 1px solid #EAE5D8;
    padding-top: 18px;
    text-align: center;
    font-size: 0.76rem;
    color: #7A8C7F;
    line-height: 1.5;
  }

  .report-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 0.82rem;
  }

  .report-table th {
    background: #123223;
    color: #FFFFFF;
    font-weight: 600;
    text-align: left;
    padding: 10px 12px;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .report-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #EBE7DD;
    color: #1D2E22;
  }

  .report-table tbody tr:nth-child(even) {
    background: #FAF9F6;
  }

  .stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: #FAF9F5;
    border: 1px solid #ECE7DC;
    border-radius: 10px;
    padding: 14px 16px;
    text-align: center;
  }

  .stat-card-val {
    font-size: 1.35rem;
    font-weight: 700;
    color: #123223;
  }

  .stat-card-lbl {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #728277;
    margin-top: 4px;
  }

  @media print {
    body {
      background: #FFFFFF;
      padding: 0;
    }

    .no-print, .print-action-bar {
      display: none !important;
    }

    .sheet-container {
      border: none;
      box-shadow: none;
      padding: 10px 0;
      max-width: 100%;
    }

    .page-break-after {
      page-break-after: always;
      break-after: page;
      height: 1px;
    }
  }
`

/**
 * OPENS MODAL 1 RESULT: High-resolution, official 1-page Order Detail Sheet
 */
export const openSingleOrderDetailSheet = (order) => {
  if (!order) return

  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow popups to preview and save the Order Detail Sheet as PDF.')
    return
  }

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.subtotal || order.total_amount || 0)
  const discount = Number(order.discount || 0)
  const deliveryFee = Number(order.delivery_fee ?? order.shipping_fee ?? order.shippingCharge ?? (subtotal > 499 ? 0 : 50))
  const grandTotal = Number(order.total_amount || subtotal - discount + deliveryFee)
  const orderNum = order.order_number || order.id || 'N/A'
  const placedDate = order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')
  const status = (order.order_status || order.status || 'Confirmed').toLowerCase()

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>THENEE Order Detail Sheet - #${orderNum}</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="print-action-bar no-print">
    <h4>
      <span>📋 Official Order Detail Sheet #${orderNum}</span>
    </h4>
    <div>
      <button type="button" class="btn-print-cta" onclick="window.print()">📥 Save / Print PDF</button>
      <button type="button" class="btn-close-cta" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="sheet-container">
    <div class="sheet-header">
      <div>
        <div class="brand-logo-text">THENEE</div>
        <span class="brand-motto">Crafted by Women • Rooted in Nature</span>
        <p class="brand-address">
          The Roots Enterprises • 2/224, South Street, Manthiyoor, Kadayam - 627415, Tenkasi District, Tamil Nadu<br />
          Central FSSAI License: <strong>#22425278000320</strong> • Patron Helpdesk: +91 7550248005
        </p>
      </div>
      <div class="header-badge-box">
        <span class="badge-tag-pill">Order Reference Sheet</span>
        <div class="badge-order-num">#${orderNum}</div>
        <div class="badge-date">Placed: ${placedDate}</div>
      </div>
    </div>

    <div class="two-col-grid">
      <div class="col-card">
        <div class="col-card-title">Customer & Consignee Info</div>
        <div class="detail-row">
          <span>Recipient Name:</span>
          <strong>${order.customer_name || 'Valued Customer'}</strong>
        </div>
        <div class="detail-row">
          <span>Contact Number:</span>
          <strong>${order.customer_phone || '+91 75502 48005'}</strong>
        </div>
        <div class="detail-row">
          <span>Customer Email:</span>
          <strong>${order.customer_email || 'patron@theneestores.com'}</strong>
        </div>
        <div class="detail-row">
          <span>Shipping Destination:</span>
          <strong>${order.shipping_address ? (typeof order.shipping_address === 'string' ? order.shipping_address : (order.shipping_address.street || order.shipping_address.city || 'Standard Address')) : (order.shipping_city || 'Registered Address')}</strong>
        </div>
        <div class="detail-row">
          <span>Patron User ID:</span>
          <strong>${getNumericUserId(order)}</strong>
        </div>
      </div>

      <div class="col-card">
        <div class="col-card-title">Consignment & Logistics Control</div>
        <div class="detail-row">
          <span>Current Status:</span>
          <span class="status-badge status-${status}">${order.order_status || order.status || 'Confirmed'}</span>
        </div>
        <div class="detail-row">
          <span>Courier Partner:</span>
          <strong>${order.courier_partner || order.courier || 'India Post Speed Post'}</strong>
        </div>
        <div class="detail-row">
          <span>Tracking ID / AWB:</span>
          <strong>${isRealAwb(order.tracking_number || order.tracking_awb) ? (order.tracking_number || order.tracking_awb) : 'Updated soon'}</strong>
        </div>
        <div class="detail-row">
          <span>Payment Gateway:</span>
          <strong>${order.payment_method || 'Online Razorpay'} ${order.razorpay_payment_id ? `(${order.razorpay_payment_id})` : ''}</strong>
        </div>
        <div class="detail-row">
          <span>Expected Delivery:</span>
          <strong>${order.delivery_date || 'Standard Courier Dispatch'}</strong>
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45px;">#</th>
          <th>Herbal Botanical Formulation</th>
          <th style="width: 100px;">Packaging</th>
          <th style="width: 70px; text-align: center;">Qty</th>
          <th style="width: 110px; text-align: right;">Unit Price</th>
          <th style="width: 120px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          items.length > 0
            ? items
                .map(
                  (it, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>
              <strong>${it.name || 'Thenee Botanical Formulation'}</strong>
            </td>
            <td>${it.volume || it.size || 'Village Pack'}</td>
            <td style="text-align: center;">${it.quantity || 1}</td>
            <td style="text-align: right;">${formatInr(it.price || 0)}</td>
            <td style="text-align: right;">${formatInr((it.price || 0) * (it.quantity || 1))}</td>
          </tr>
        `
                )
                .join('')
            : `
          <tr>
            <td>1</td>
            <td><strong>Thenee Botanical Herbal Formulation</strong></td>
            <td>100g Village Pouch</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">${formatInr(subtotal)}</td>
            <td style="text-align: right;">${formatInr(subtotal)}</td>
          </tr>
        `
        }
      </tbody>
    </table>

    <div class="totals-box">
      <div class="totals-inner">
        <div class="totals-row">
          <span>Items Subtotal:</span>
          <span>${formatInr(subtotal)}</span>
        </div>
        ${
          discount > 0
            ? `
        <div class="totals-row" style="color: #27AE60;">
          <span>Promotional Discount:</span>
          <span>-${formatInr(discount)}</span>
        </div>
        `
            : ''
        }
        <div class="totals-row">
          <span>Logistics Dispatch Fee:</span>
          <span>${deliveryFee === 0 ? 'FREE DELIVERY' : formatInr(deliveryFee)}</span>
        </div>
        <div class="totals-row grand-total">
          <span>Total Paid:</span>
          <span>${formatInr(grandTotal)}</span>
        </div>
      </div>
    </div>

    <div class="footer-seal-strip">
      <p>This is an authentic verified logistics summary issued by THENEE Stores dispatch operations, Kadayam Unit.</p>
      <p>For questions or verification, contact support@theneestores.com • FSSAI Central License #22425278000320</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}

/**
 * OPENS MODAL 2 RESULT: Orders Filtered by Status Report Sheet
 */
export const openOrdersStatusReport = (statusKey, ordersList = [], statusLabel = 'All Orders') => {
  const filtered = filterOrdersByStatusKey(ordersList, statusKey)

  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow popups to preview and save the Status Report as PDF.')
    return
  }

  const totalValue = filtered.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const totalItemsCount = filtered.reduce((sum, o) => {
    const itms = Array.isArray(o.items) ? o.items : []
    return sum + itms.reduce((s, it) => s + (it.quantity || 1), 0)
  }, 0)
  const reportDate = new Date().toLocaleString('en-IN')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>THENEE Orders Ledger Report - ${statusLabel}</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="print-action-bar no-print">
    <h4>
      <span>📊 Consignment Report: ${statusLabel} (${filtered.length} Orders)</span>
    </h4>
    <div>
      <button type="button" class="btn-print-cta" onclick="window.print()">📥 Save / Print PDF</button>
      <button type="button" class="btn-close-cta" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="sheet-container" style="max-width: 1040px;">
    <div class="sheet-header">
      <div>
        <div class="brand-logo-text">THENEE</div>
        <span class="brand-motto">Dispatch & Logistics Operations Ledger</span>
        <p class="brand-address">
          The Roots Enterprises • Tenkasi Processing Unit #01 • FSSAI Lic: <strong>22425278000320</strong>
        </p>
      </div>
      <div class="header-badge-box">
        <span class="badge-tag-pill">${statusLabel}</span>
        <div class="badge-order-num">${filtered.length} Consignments</div>
        <div class="badge-date">Generated: ${reportDate}</div>
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-card">
        <div class="stat-card-val">${filtered.length}</div>
        <div class="stat-card-lbl">Total Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-val">${formatInr(totalValue)}</div>
        <div class="stat-card-lbl">Gross Value</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-val">${totalItemsCount}</div>
        <div class="stat-card-lbl">Botanical Units</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-val">${statusLabel.split(' ')[0]}</div>
        <div class="stat-card-lbl">Filter Category</div>
      </div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Order Number</th>
          <th>Date</th>
          <th>Customer & Phone</th>
          <th>Destination</th>
          <th>Items Summary</th>
          <th>Payment</th>
          <th>Delivery Mode</th>
          <th>Status</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${
          filtered.length > 0
            ? filtered
                .map((o, idx) => {
                  const itms = Array.isArray(o.items) ? o.items : []
                  const itmSummary = itms.map((it) => `${it.name || 'Item'} (x${it.quantity || 1})`).join(', ') || 'Herbal Pack'
                  const fee = Number(o.delivery_fee ?? o.shipping_fee ?? o.shippingCharge ?? (Number(o.total_amount) > 499 ? 0 : 50))
                  const isFree = fee === 0
                  const st = (o.order_status || o.status || 'Confirmed').toLowerCase()

                  return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong style="font-family: monospace;">${o.order_number || o.id}</strong></td>
            <td>${o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
            <td>
              <strong>${o.customer_name || 'Customer'}</strong><br />
              <small style="color: #6C7F72;">${o.customer_phone || '—'}</small>
            </td>
            <td><small>${o.shipping_city || o.shipping_state || 'India'}</small></td>
            <td><small style="display: block; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${itmSummary}</small></td>
            <td><small>${o.payment_method || 'Online'}</small></td>
            <td>
              <span style="font-size: 0.74rem; font-weight: 600; color: ${isFree ? '#27AE60' : '#8C6D37'};">
                ${isFree ? 'Free Delivery' : 'Charged (₹' + fee + ')'}
              </span>
            </td>
            <td><span class="status-badge status-${st}">${o.order_status || o.status || 'Confirmed'}</span></td>
            <td style="text-align: right; font-weight: 700;">${formatInr(o.total_amount || 0)}</td>
          </tr>
        `
                })
                .join('')
            : `
          <tr>
            <td colspan="10" style="text-align: center; padding: 28px; color: #728277;">
              No orders found matching the filter "${statusLabel}".
            </td>
          </tr>
        `
        }
      </tbody>
    </table>

    <div class="footer-seal-strip">
      <p>Report automatically compiled from THENEE Central Stores database • FSSAI Central License #22425278000320</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}

/**
 * OPENS MODAL 3 RESULT: Bulk Tax Invoices compiled into a single combined multi-page PDF
 */
export const openBulkInvoicesSheet = (matchedOrders = [], fromDate = '', toDate = '') => {
  if (matchedOrders.length === 0) return

  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow popups to preview and save the Bulk Invoices as PDF.')
    return
  }

  const rangeLabel = fromDate && toDate ? `${fromDate} to ${toDate}` : fromDate ? `From ${fromDate}` : toDate ? `Up to ${toDate}` : 'All Dates'

  const invoicesHtml = matchedOrders
    .map((order, idx) => {
      const items = Array.isArray(order.items) ? order.items : []
      const subtotal = Number(order.subtotal || order.total_amount || 0)
      const discount = Number(order.discount || 0)
      const deliveryFee = Number(order.delivery_fee ?? order.shipping_fee ?? order.shippingCharge ?? (subtotal > 499 ? 0 : 50))
      const grandTotal = Number(order.total_amount || subtotal - discount + deliveryFee)
      const orderNum = order.order_number || order.id || `THN-${100000 + idx}`
      const invoiceDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')

      return `
    <div class="sheet-container" style="margin-bottom: 30px;">
      <div class="sheet-header">
        <div>
          <div class="brand-logo-text">THENEE</div>
          <span class="brand-motto">Crafted by Women • Rooted in Nature</span>
          <p class="brand-address">
            The Roots Enterprises • 2/224, South Street, Manthiyoor, Kadayam - 627415, Tenkasi District, TN<br />
            Central FSSAI License: <strong>#22425278000320</strong> • Customer Care: +91 7550248005
          </p>
        </div>
        <div class="header-badge-box">
          <span class="badge-tag-pill">TAX INVOICE</span>
          <div class="badge-order-num">#${orderNum}</div>
          <div class="badge-date">Date: ${invoiceDate} • [${idx + 1} of ${matchedOrders.length}]</div>
        </div>
      </div>

      <div class="two-col-grid">
        <div class="col-card">
          <div class="col-card-title">Dispatched From (Supplier)</div>
          <p style="font-size: 0.82rem; line-height: 1.5; color: #385040;">
            <strong>THENEE Herbal Village Unit</strong><br />
            The Roots Enterprises, Manthiyoor, Kadayam<br />
            Tenkasi District, Tamil Nadu - 627415, India<br />
            GST / Central FSSAI: #22425278000320
          </p>
        </div>
        <div class="col-card">
          <div class="col-card-title">Consignee (Billed & Shipped To)</div>
          <p style="font-size: 0.82rem; line-height: 1.5; color: #385040;">
            <strong>${order.customer_name || 'Valued Patron'}</strong><br />
            ${order.shipping_address ? (typeof order.shipping_address === 'string' ? order.shipping_address : `${order.shipping_address.street || ''}, ${order.shipping_address.city || ''}`) : (order.shipping_city || '')}<br />
            ${order.shipping_state || 'Tamil Nadu'}${order.shipping_pincode ? ` - ${order.shipping_pincode}` : ''}<br />
            Phone: ${order.customer_phone || ''}
          </p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 45px;">#</th>
            <th>Herbal Formulation Item</th>
            <th style="width: 110px;">Packaging</th>
            <th style="width: 70px; text-align: center;">Qty</th>
            <th style="width: 110px; text-align: right;">Unit Price</th>
            <th style="width: 120px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length > 0
              ? items
                  .map(
                    (it, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${it.name || 'Botanical Herbal Formulation'}</strong></td>
              <td>${it.volume || it.size || 'Village Pack'}</td>
              <td style="text-align: center;">${it.quantity || 1}</td>
              <td style="text-align: right;">${formatInr(it.price || 0)}</td>
              <td style="text-align: right;">${formatInr((it.price || 0) * (it.quantity || 1))}</td>
            </tr>
          `
                  )
                  .join('')
              : `
            <tr>
              <td>1</td>
              <td><strong>Thenee Botanical Herbal Formulation</strong></td>
              <td>100g Village Pouch</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">${formatInr(subtotal)}</td>
              <td style="text-align: right;">${formatInr(subtotal)}</td>
            </tr>
          `
          }
        </tbody>
      </table>

      <div class="totals-box">
        <div class="totals-inner">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatInr(subtotal)}</span>
          </div>
          ${
            discount > 0
              ? `
          <div class="totals-row" style="color: #27AE60;">
            <span>Coupon Discount:</span>
            <span>-${formatInr(discount)}</span>
          </div>
          `
              : ''
          }
          <div class="totals-row">
            <span>Logistics Dispatch:</span>
            <span>${deliveryFee === 0 ? 'FREE' : formatInr(deliveryFee)}</span>
          </div>
          <div class="totals-row grand-total">
            <span>Paid Total:</span>
            <span>${formatInr(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div class="footer-seal-strip">
        <p>This is a computer generated official tax invoice issued under FSSAI Central License #22425278000320.</p>
        <p>Authorized Dispatch Unit • Manthiyoor, Kadayam, Tenkasi District, TN - 627415</p>
      </div>
    </div>
    ${idx < matchedOrders.length - 1 ? '<div class="page-break-after"></div>' : ''}
  `
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>THENEE Compiled Invoices (${matchedOrders.length} Invoices)</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="print-action-bar no-print">
    <h4>
      <span>📑 Compiled Invoices: ${rangeLabel} (${matchedOrders.length} Tax Invoices)</span>
    </h4>
    <div>
      <button type="button" class="btn-print-cta" onclick="window.print()">📥 Save All as Single PDF</button>
      <button type="button" class="btn-close-cta" onclick="window.close()">Close</button>
    </div>
  </div>

  ${invoicesHtml}

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}
