import { spawn } from 'child_process'
import fs from 'fs'

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9337',
    '--user-data-dir=' + process.env.TEMP + '\\chrome_test_cat_new',
    '--no-first-run',
    '--disable-gpu',
    '--window-size=1400,900',
  ])

  await new Promise(r => setTimeout(r, 1200))
  const listRes = await fetch('http://127.0.0.1:9337/json/list')
  const listData = await listRes.json()
  const page = listData.find(t => t.type === 'page') || listData[0]

  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let id = 1
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++
    const handler = (evt) => {
      const msg = JSON.parse(evt.data)
      if (msg.id === curId) {
        ws.removeEventListener('message', handler)
        resolve(msg.result)
      }
    }
    ws.addEventListener('message', handler)
    ws.send(JSON.stringify({ id: curId, method, params }))
  })

  await new Promise(r => ws.addEventListener('open', r))
  await send('Page.enable')
  await send('Page.navigate', { url: 'http://localhost:5173/' })
  
  await new Promise(r => setTimeout(r, 3500))

  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  })
  await new Promise(r => setTimeout(r, 1000))

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('scratch/test_catalog_updated.png', Buffer.from(shot.data, 'base64'))

  ws.close()
  chrome.kill()
  console.log('Done test catalog screenshot')
}

run()

