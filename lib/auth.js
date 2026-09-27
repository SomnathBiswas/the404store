import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getDb } from './mongo'

const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-in-production'
if (!process.env.AUTH_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: AUTH_SECRET environment variable not set. Using default secret for development. Set AUTH_SECRET for production.')
}

export function signToken(payload) {
  const tokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hour expiration
    iat: Math.floor(Date.now() / 1000)
  }
  const body = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

// Add token validation for debugging
export function validateTokenAndGetPayload(token) {
  if (!token || typeof token !== 'string') {
    console.warn('Token validation failed: No token provided')
    return null
  }
  
  const [body, sig] = token.split('.')
  if (!body || !sig) {
    console.warn('Token validation failed: Invalid token format')
    return null
  }
  
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (expected !== sig) {
    console.warn('Token validation failed: Signature mismatch')
    return null
  }
  
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.warn('Token validation failed: Token expired')
      return null
    }
    return payload
  } catch (error) {
    console.warn('Token validation failed: JSON parse error', error)
    return null
  }
}

export function verifyToken(token) {
  return validateTokenAndGetPayload(token)
}

export function getBearer(request) {
  const h = request.headers.get('authorization') || request.headers.get('Authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m ? m[1] : null
}

export async function getUserFromRequest(request) {
  const token = getBearer(request)
  const payload = verifyToken(token)
  if (!payload || !payload.userId || payload.role !== 'customer') return null
  const db = await getDb()
  const user = await db.collection('users').findOne({ id: payload.userId })
  if (!user) return null
  const { password, _id, ...safe } = user
  return safe
}

export function isAdminRequest(request) {
  const token = getBearer(request)
  const payload = verifyToken(token)
  if (!payload) return false
  if (payload.role !== 'admin') return false
  // Allow admin if email matches or if it's the admin user ID
  if (payload.email === process.env.ADMIN_EMAIL) return true
  if (payload.userId === 'admin') return true
  return false
}

export async function hashPassword(pw) { return bcrypt.hash(pw, 10) }
export async function comparePassword(pw, hash) { return bcrypt.compare(pw, hash) }
