import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getDb } from './mongo'

const SECRET = process.env.AUTH_SECRET
if (!SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET environment variable must be set in production')
}
if (!SECRET) {
  console.warn('WARNING: Using default AUTH_SECRET in development. Set AUTH_SECRET environment variable for production.')
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

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (expected !== sig) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    return payload
  } catch { return null }
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
  return !!(payload && payload.role === 'admin' && payload.email === process.env.ADMIN_EMAIL)
}

export async function hashPassword(pw) { return bcrypt.hash(pw, 10) }
export async function comparePassword(pw, hash) { return bcrypt.compare(pw, hash) }
