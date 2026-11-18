import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Ensure local .env variables are available to process.env during Vite dev
try {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=')
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = vals.join('=').trim()
      }
    }
  })
} catch {}

function localApiMiddlewarePlugin() {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.startsWith('/api/auth') || url.startsWith('/api/send-email')) {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {}
              res.status = function (code) {
                this.statusCode = code
                return this
              }
              res.json = function (data) {
                this.setHeader('Content-Type', 'application/json')
                this.end(JSON.stringify(data))
              }

              if (url.startsWith('/api/auth')) {
                const { default: authHandler } = await import('./api/auth.js')
                await authHandler(req, res)
              } else if (url.startsWith('/api/send-email')) {
                const { default: emailHandler } = await import('./api/send-email.js')
                await emailHandler(req, res)
              }
            } catch (err) {
              console.error('Local API dev middleware error:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiMiddlewarePlugin()],
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
    watch: {
      ignored: ['**/public/perfume/**', '**/public/perfume bg/**', '**/public/ui layout/**'],
    },
  },
})
