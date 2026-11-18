import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const PORT = 9333
const TEMP_USER_DATA = path.join(process.env.TEMP, 'chrome_verify_user_data_' + Date.now())

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('Starting headless Chrome on port', PORT)
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--window-size=1440,900',
    'about:blank',
  ])

  let connected = false
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) {
        connected = true
        break
      }
    } catch {}
    await sleep(200)
  }

  if (!connected) {
    console.error('Failed to connect to Chrome remote debugging')
    chromeProc.kill()
    process.exit(1)
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`)
  const tabs = await listRes.json()
  const pageWsUrl = tabs[0]?.webSocketDebuggerUrl

  console.log('Connecting to DevTools WebSocket:', pageWsUrl)
  const ws = new WebSocket(pageWsUrl)

  let idCounter = 1
  const pending = new Map()

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id)
      pending.delete(data.id)
      if (data.error) reject(data.error)
      else resolve(data.result)
    }
  }

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }

  await new Promise((r) => (ws.onopen = r))

  await send('Page.enable')
  await send('Runtime.enable')

  console.log('Navigating to http://localhost:5173/...')
  await send('Page.navigate', { url: 'http://localhost:5173/' })

  console.log('Waiting for loader to finish...')
  await sleep(3000)

  async function takeScreenshot(name) {
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const outPath = path.join(process.cwd(), 'scratch', `${name}.png`)
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'))
    console.log(`Saved screenshot: ${name}.png`)
    return outPath
  }

  // 1. Hero initial
  await takeScreenshot('01-hero')

  // 2. Click on second pill (Bliss Tea) to verify hero color change in light theme
  console.log('Switching hero product to Bliss Tea...')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const pills = document.querySelectorAll('.hero-pill');
      if (pills[1]) pills[1].click();
    })()`,
  })
  await sleep(800)
  await takeScreenshot('02-hero-bliss-tea')

  // 3. Switch back to first product
  await send('Runtime.evaluate', {
    expression: `(() => {
      const pills = document.querySelectorAll('.hero-pill');
      if (pills[0]) pills[0].click();
    })()`,
  })
  await sleep(800)

  // 4. Scroll down gradually to Signature Herbal Products (BestSellers)
  console.log('Scrolling to Signature Herbal Products (#catalog)...')
  await send('Runtime.evaluate', {
    expression: `document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1500)
  await takeScreenshot('03-bestsellers-catalog')

  // 5. Scroll to Traditional Food Podis shelf
  console.log('Scrolling to Food Podis (#podis)...')
  await send('Runtime.evaluate', {
    expression: `document.getElementById('podis').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('04-food-podis')

  // 6. Scroll to About Us / Our Story
  console.log('Scrolling to About Us (#about)...')
  await send('Runtime.evaluate', {
    expression: `document.getElementById('about').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('05-about-us')

  // 6b. Scroll to Offer Gallery
  console.log('Scrolling to Offer Gallery...')
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.offer-gallery').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('05b-offer-gallery')

  // 7. Scroll to Offer Gallery & Health Goals
  console.log('Scrolling to Offer Gallery & Health Goals (#wellness)...')
  await send('Runtime.evaluate', {
    expression: `document.getElementById('wellness').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('06-health-goals-wellness')

  // 7b. Scroll to Testimonial
  console.log('Scrolling to Testimonial...')
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.testimonial').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('06b-testimonial')

  // 8. Scroll to Testimonials & Reviews
  console.log('Scrolling to Reviews (#reviews)...')
  await send('Runtime.evaluate', {
    expression: `document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('07-reviews')

  // 9. Scroll to Footer & Newsletter
  console.log('Scrolling to Footer (#contact)...')
  await send('Runtime.evaluate', {
    expression: `document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })`,
  })
  await sleep(1200)
  await takeScreenshot('08-footer')

  // 10. Open Cart Drawer by clicking cart button in navbar
  console.log('Opening Cart Drawer...')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const addBtns = document.querySelectorAll('.bs-card-add');
      if (addBtns[0]) addBtns[0].click();
    })()`,
  })
  await sleep(800)
  await takeScreenshot('09-cart-drawer')

  // Close Cart Drawer and Open Product Modal
  console.log('Closing cart and opening Product Modal...')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.cart-close-btn');
      if (closeBtn) closeBtn.click();
      setTimeout(() => {
        const qvBtns = document.querySelectorAll('.bs-card-quickview');
        if (qvBtns[0]) qvBtns[0].click();
      }, 300);
    })()`,
  })
  await sleep(1000)
  await takeScreenshot('10-product-modal')

  console.log('All verification screenshots captured successfully!')

  ws.close()
  chromeProc.kill()

  try {
    fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true })
  } catch {}

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
