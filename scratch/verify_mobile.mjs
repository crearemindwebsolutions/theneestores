import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const PORT = 9336
const TEMP_USER_DATA = path.join(process.env.TEMP, 'chrome_verify_mobile_' + Date.now())

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--window-size=390,844',
    'http://localhost:5173/',
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
    chromeProc.kill()
    process.exit(1)
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`)
  const tabs = await listRes.json()
  const pageWsUrl = tabs[0]?.webSocketDebuggerUrl

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

  console.log('Waiting for mobile page load...')
  await sleep(2500)

  const shot1 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scratch/shot-mobile-hero.png', Buffer.from(shot1.data, 'base64'))
  console.log('Saved shot-mobile-hero.png')

  // Open mobile menu
  console.log('Toggling mobile burger menu...')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const burger = document.querySelector('.navbar-burger');
      if (burger) burger.click();
    })()`,
  })
  await sleep(600)

  const shot2 = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scratch/shot-mobile-menu.png', Buffer.from(shot2.data, 'base64'))
  console.log('Saved shot-mobile-menu.png')

  ws.close()
  chromeProc.kill()

  try {
    fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true })
  } catch {}

  process.exit(0)
}

main().catch(console.error)

