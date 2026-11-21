import fs from 'fs'
import path from 'path'

try {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=')
      process.env[key.trim()] = vals.join('=').trim()
    }
  })
} catch (e) {
  console.warn('Could not load .env file directly:', e)
}

import handler from '../api/auth.js'

function createMockReqRes(body) {
  let statusCode = 200
  let resData = null
  const headers = {}

  const req = {
    method: 'POST',
    body,
  }

  const res = {
    setHeader(k, v) { headers[k] = v },
    status(code) {
      statusCode = code
      return this
    },
    json(data) {
      resData = data
      return this
    },
    end() {
      return this
    },
  }

  return { req, res, getResult: () => ({ status: statusCode, data: resData }) }
}

async function runTests() {
  console.log('--- Testing send-signup-otp ---')
  const testEmail = 'gowthamandharshan4@gmail.com'

  const { req: req1, res: res1, getResult: getRes1 } = createMockReqRes({
    action: 'send-signup-otp',
    email: testEmail,
    name: 'Gowtham',
    phone: '7550248005',
    password: 'SecurePassword123!',
  })

  await handler(req1, res1)
  const result1 = getRes1()
  console.log('Result 1 (send-signup-otp):', result1)

  if (!result1.data?.otpToken) {
    console.error('Test 1 failed: No otpToken returned.')
    return
  }

  const token = result1.data.otpToken
  console.log('Received otpToken:', token)

  console.log('\n--- Testing verify-signup-otp with WRONG code ---')
  const { req: req2, res: res2, getResult: getRes2 } = createMockReqRes({
    action: 'verify-signup-otp',
    email: testEmail,
    otp: '0000',
    otpToken: token,
  })

  await handler(req2, res2)
  const result2 = getRes2()
  console.log('Result 2 (wrong otp):', result2)

  console.log('\n--- Testing verify-signup-otp with INVALID token ---')
  const { req: req3, res: res3, getResult: getRes3 } = createMockReqRes({
    action: 'verify-signup-otp',
    email: testEmail,
    otp: '1234',
    otpToken: 'fake.token',
  })

  await handler(req3, res3)
  const result3 = getRes3()
  console.log('Result 3 (fake token):', result3)
}

runTests().catch(console.error)
