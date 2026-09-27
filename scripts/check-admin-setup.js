/**
 * Admin setup checker utility
 * Helps debug and set up admin authentication
 */

const crypto = require('crypto')
const bcrypt = require('bcryptjs')

// Load environment variables (simple implementation)
require('dotenv').config({ path: '.env' })

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const AUTH_SECRET = process.env.AUTH_SECRET

console.log('=== Admin Setup Checker ===\n')

// Check environment variables
console.log('Environment Variables:')
console.log('ADMIN_EMAIL:', ADMIN_EMAIL ? '✓ Set' : '✗ Missing')
console.log('ADMIN_PASSWORD:', ADMIN_PASSWORD ? '✓ Set' : '✗ Missing')
console.log('AUTH_SECRET:', AUTH_SECRET ? '✓ Set' : '✗ Missing (using default)')

// Check password format
if (ADMIN_PASSWORD) {
  const isHashed = ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$')
  console.log('Password format:', isHashed ? 'Hashed (bcrypt)' : 'Plain text')
  
  if (!isHashed) {
    console.log('\n⚠️  WARNING: Admin password is stored in plain text!')
    console.log('⚠️  Run: node scripts/hash-admin-password.js your-password')
    console.log('⚠️  Then copy the hash to your .env file as ADMIN_PASSWORD')
  }
}

// Test token generation
const SECRET = AUTH_SECRET || 'dev-secret-change-in-production'

function signToken(payload) {
  const tokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    iat: Math.floor(Date.now() / 1000)
  }
  const body = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (expected !== sig) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}

// Test token generation and verification
console.log('\n=== Token Test ===')
const testPayload = { userId: 'admin', role: 'admin', email: ADMIN_EMAIL?.toLowerCase() || 'admin@test.com' }
const testToken = signToken(testPayload)
console.log('Generated token:', testToken.substring(0, 50) + '...')

const verified = verifyToken(testToken)
console.log('Token verification:', verified ? '✓ Valid' : '✗ Invalid')

if (verified) {
  console.log('Token payload:', verified)
}

// Password hash test
if (ADMIN_PASSWORD && !ADMIN_PASSWORD.startsWith('$2')) {
  console.log('\n=== Password Hash Test ===')
  bcrypt.hash(ADMIN_PASSWORD, 10)
    .then(hash => {
      console.log('Generated hash:', hash)
      console.log('\nAdd this to your .env file:')
      console.log(`ADMIN_PASSWORD=${hash}`)
    })
    .catch(err => console.error('Error hashing:', err))
}

console.log('\n=== Setup Instructions ===')
console.log('1. Make sure .env file exists with ADMIN_EMAIL and ADMIN_PASSWORD')
console.log('2. For security, hash your password: node scripts/hash-admin-password.js')
console.log('3. Set AUTH_SECRET for production environment')
console.log('4. Restart your development server')
console.log('5. Try logging in again at /admin')
