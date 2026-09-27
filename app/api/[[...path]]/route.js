import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { ensureSeeded, CATEGORIES } from '@/lib/seed'
import { v4 as uuid } from 'uuid'
import { signToken, verifyToken, getBearer, getUserFromRequest, isAdminRequest, hashPassword, comparePassword } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { generateCSRFToken, getCSRFTokenFromRequest, validateCSRFToken } from '@/lib/csrf'

const json = (data, status = 200) => NextResponse.json(data, { status })
const stripId = (doc) => { if (!doc) return doc; const { _id, ...rest } = doc; return rest }

// Strip large image data from responses to prevent payload size issues
const stripLargeImages = (doc) => {
  if (!doc) return doc
  const { _id, image, hoverImage, ...rest } = doc
  // Return only image URLs, not full base64 data for admin lists
  return {
    ...rest,
    hasImage: !!image,
    hasHoverImage: !!hoverImage
  }
}

// Email validation using RFC 5322 compliant regex
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

async function withDb() {
  const db = await getDb()
  await ensureSeeded()
  return db
}

// -------- coupon helpers --------
async function applyCoupon(db, code, subtotal) {
  if (!code) return { discount: 0, coupon: null }
  const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase(), active: true })
  if (!coupon) return { discount: 0, coupon: null, error: 'Coupon invalid.' }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { discount: 0, coupon: null, error: 'Coupon expired.' }
  if (coupon.minOrder && subtotal < coupon.minOrder) return { discount: 0, coupon: null, error: `Minimum order \u20b9${coupon.minOrder} required.` }
  const discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
  return { discount: Math.min(discount, subtotal), coupon: stripId(coupon) }
}

export async function GET(request, { params }) {
  try {
    const path = (await params)?.path || []
    const [root, second, third] = path
    const { searchParams } = new URL(request.url)

    if (!root) return json({ ok: true, name: 'THE 404 STORE API', categories: CATEGORIES })

    // Products (public)
    if (root === 'products') {
      const db = await withDb()
      const col = db.collection('products')
      if (second) {
        const product = await col.findOne({ slug: second })
        if (!product) return json({ error: 'Not found' }, 404)
        const related = await col.find({ category: product.category, slug: { $ne: product.slug } }).limit(4).toArray()
        return json({ product: stripId(product), related: related.map(stripId) })
      }
      const category = searchParams.get('category')
      const query = searchParams.get('q')?.toLowerCase()
      const sort = searchParams.get('sort') || 'featured'
      const limit = Number(searchParams.get('limit') || 50) // Reduced default limit
      const filter = {}
      if (category && category !== 'All') filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      if (query) filter.$or = [
        { name: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { color: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { category: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      ]
      const sortMap = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, 'newest': { createdAt: -1 }, 'featured': { rating: -1 } }
      const docs = await col.find(filter).sort(sortMap[sort] || sortMap.featured).limit(limit).toArray()
      return json({ products: docs.map(stripId), count: docs.length, categories: CATEGORIES })
    }

    // Wishlist (public via slugs -> return product docs)
    if (root === 'wishlist' && second === 'lookup') {
      const db = await withDb()
      const slugs = (searchParams.get('slugs') || '').split(',').filter(Boolean)
      if (!slugs.length) return json({ products: [] })
      const docs = await db.collection('products').find({ slug: { $in: slugs } }).toArray()
      return json({ products: docs.map(stripId) })
    }

    // Customer account
    if (root === 'auth' && second === 'me') {
      const user = await getUserFromRequest(request)
      if (!user) return json({ error: 'Not authenticated' }, 401)
      return json({ user })
    }

    if (root === 'orders' && !second) {
      const user = await getUserFromRequest(request)
      if (!user) return json({ error: 'Not authenticated' }, 401)
      const db = await getDb()
      const list = await db.collection('orders').find({ userId: user.id }).sort({ createdAt: -1 }).toArray()
      return json({ orders: list.map(stripId) })
    }

    if (root === 'coupons' && second === 'validate') {
      const db = await getDb()
      const code = searchParams.get('code') || ''
      const subtotal = Number(searchParams.get('subtotal') || 0)
      const result = await applyCoupon(db, code, subtotal)
      if (result.error) return json({ error: result.error }, 400)
      return json(result)
    }

    // Admin
    if (root === 'admin') {
      if (!isAdminRequest(request)) return json({ error: 'Unauthorized' }, 401)
      const db = await getDb()
      if (second === 'products') {
        // Check if requesting a specific product with full details
        if (third) {
          const product = await db.collection('products').findOne({ slug: third })
          if (!product) return json({ error: 'Not found' }, 404)
          return json({ product: stripId(product) })
        }
        // For list view, strip large image data to prevent payload size issues
        const docs = await db.collection('products').find({}).sort({ createdAt: -1 }).limit(50).toArray()
        return json({ products: docs.map(stripLargeImages) })
      }
      if (second === 'coupons') {
        const docs = await db.collection('coupons').find({}).sort({ createdAt: -1 }).limit(50).toArray()
        return json({ coupons: docs.map(stripId) })
      }
      if (second === 'orders') {
        const docs = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(50).toArray()
        return json({ orders: docs.map(stripId) })
      }
      if (second === 'users') {
        const docs = await db.collection('users').find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).limit(50).toArray()
        return json({ users: docs.map(stripId) })
      }
      if (second === 'stats') {
        const [products, coupons, orders, users] = await Promise.all([
          db.collection('products').countDocuments(),
          db.collection('coupons').countDocuments(),
          db.collection('orders').countDocuments(),
          db.collection('users').countDocuments(),
        ])
        return json({ stats: { products, coupons, orders, users } })
      }
      return json({ ok: true })
    }

    if (root === 'seed') { const result = await ensureSeeded(true); return json({ ok: true, ...result }) }

    // CSRF token generation (public)
    if (root === 'csrf' && second === 'token') {
      const sessionId = searchParams.get('session') || 'anonymous'
      const token = generateCSRFToken(sessionId)
      return json({ token })
    }

    // Public order tracking (no auth) — returns limited safe fields
    if (root === 'track' && second) {
      const db = await getDb()
      const order = await db.collection('orders').findOne({ id: second })
      if (!order) return json({ error: 'Order not found.' }, 404)
      return json({ order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt || null,
        shippedAt: order.shippedAt || null,
        items: order.items?.map((i) => ({ slug: i.slug, name: i.name, image: i.image, quantity: i.quantity, size: i.size, price: i.price })) || [],
        total: order.total,
        customerName: order.userName || 'Customer',
        pointsEarned: order.pointsEarned || 100,
      } })
    }

    return json({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('GET error:', error?.message || error)
    return json({ error: 'Something went wrong. Please try again later.' }, 500)
  }
}

export async function POST(request, { params }) {
  try {
    const path = (await params)?.path || []
    const [root, second] = path
    const body = await request.json().catch(() => ({}))
    const db = await getDb()

    // ---- AUTH ----
    if (root === 'auth' && second === 'signup') {
      // Rate limiting based on IP
      const ip = getClientIP(request)
      const rateLimit = checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
      if (!rateLimit.allowed) {
        return json({ error: 'Too many signup attempts. Please try again later.' }, 429)
      }
      
      const { name, email, password } = body
      if (!name || !email || !password) return json({ error: 'Name, email and password required.' }, 400)
      if (!isValidEmail(email)) return json({ error: 'Valid email required.' }, 400)
      if (String(password).length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400)
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (existing) return json({ error: 'Account already exists. Please log in.' }, 400)
      const user = { id: uuid(), name, email: email.toLowerCase(), password: await hashPassword(password), role: 'customer', loyaltyPoints: 0, createdAt: new Date() }
      await db.collection('users').insertOne(user)
      const token = signToken({ userId: user.id, role: 'customer' })
      const { password: _p, _id, ...safe } = user
      return json({ ok: true, token, user: safe }, 201)
    }

    if (root === 'auth' && second === 'login') {
      // Rate limiting based on IP and email
      const ip = getClientIP(request)
      const email = body.email?.toLowerCase() || 'unknown'
      const rateLimit = checkRateLimit(`login:${ip}:${email}`, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
      if (!rateLimit.allowed) {
        return json({ error: 'Too many login attempts. Please try again later.' }, 429)
      }
      
      const { password } = body
      const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
      if (!user) return json({ error: 'Invalid credentials.' }, 401)
      const ok = await comparePassword(password || '', user.password)
      if (!ok) return json({ error: 'Invalid credentials.' }, 401)
      const token = signToken({ userId: user.id, role: 'customer' })
      const { password: _p, _id, ...safe } = user
      return json({ ok: true, token, user: safe })
    }

    if (root === 'auth' && second === 'forgot') {
      const { email } = body
      
      // Rate limiting based on IP and email
      const ip = getClientIP(request)
      const emailLower = email?.toLowerCase() || 'unknown'
      const rateLimit = checkRateLimit(`forgot:${ip}:${emailLower}`, 3, 60 * 60 * 1000) // 3 requests per hour
      if (!rateLimit.allowed) {
        return json({ error: 'Too many password reset attempts. Please try again later.' }, 429)
      }
      
      if (!email) return json({ error: 'Email required.' }, 400)
      if (!isValidEmail(email)) return json({ error: 'Valid email required.' }, 400)
      const user = await db.collection('users').findOne({ email: String(email).toLowerCase() })
      if (!user) return json({ error: 'No account found for this email.' }, 404)
      // Generate 6-digit reset code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min
      await db.collection('users').updateOne({ id: user.id }, { $set: { resetCode: code, resetExpiresAt: expiresAt } })
      
      // SECURITY: Send code via email service - never return in response
      // TODO: Implement email sending service
      // For now, log the code for development purposes (remove in production)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`DEV MODE: Password reset code for ${email}: ${code}`)
      }
      
      return json({ ok: true, message: 'Reset code sent to your email.' })
    }

    if (root === 'auth' && second === 'reset') {
      const { email, code, password } = body
      if (!email || !code || !password) return json({ error: 'Email, code and new password required.' }, 400)
      if (!isValidEmail(email)) return json({ error: 'Valid email required.' }, 400)
      if (String(password).length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400)
      const user = await db.collection('users').findOne({ email: String(email).toLowerCase() })
      if (!user || !user.resetCode) return json({ error: 'Invalid reset request.' }, 400)
      if (user.resetCode !== String(code)) return json({ error: 'Invalid reset code.' }, 400)
      if (user.resetExpiresAt && new Date(user.resetExpiresAt) < new Date()) return json({ error: 'Reset code expired.' }, 400)
      const hashed = await hashPassword(password)
      await db.collection('users').updateOne({ id: user.id }, { $set: { password: hashed }, $unset: { resetCode: '', resetExpiresAt: '' } })
      const token = signToken({ userId: user.id, role: 'customer' })
      const { password: _p, _id, resetCode, resetExpiresAt, ...safe } = user
      return json({ ok: true, token, user: { ...safe, password: undefined } })
    }


    // Newsletter (public)
    if (root === 'newsletter') {
      // Skip CSRF for newsletter to avoid issues
      if (!body.email || !isValidEmail(body.email)) return json({ error: 'Valid email required.' }, 400)
      await db.collection('newsletter').insertOne({ id: uuid(), email: body.email, createdAt: new Date() })
      return json({ ok: true, message: 'You are on the list.' }, 201)
    }

    // Admin login (separate from user auth)
    if (root === 'admin' && second === 'login') {
      // Rate limiting based on IP (stricter for admin)
      const ip = getClientIP(request)
      const rateLimit = checkRateLimit(`admin-login:${ip}`, 3, 30 * 60 * 1000) // 3 requests per 30 minutes
      if (!rateLimit.allowed) {
        return json({ error: 'Too many admin login attempts. Please try again later.' }, 429)
      }
      
      const { email, password } = body
      const adminEmail = process.env.ADMIN_EMAIL
      const adminPassword = process.env.ADMIN_PASSWORD
      
      console.log('Admin login attempt:', { email, adminEmail, hasPassword: !!adminPassword, isHashed: adminPassword?.startsWith('$2') })
      
      if (!adminEmail || !adminPassword) return json({ error: 'Admin credentials not configured.' }, 500)
      
      // Check if admin password is already hashed (starts with $2a$ or $2b$)
      const isHashed = adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$')
      
      let passwordMatch = false
      if (isHashed) {
        // Compare with hashed password
        passwordMatch = await comparePassword(password, adminPassword)
        console.log('Hashed password comparison:', passwordMatch)
      } else {
        // Legacy: plain text comparison (should be migrated to hashed)
        passwordMatch = (password === adminPassword)
        console.log('Plain text password comparison:', passwordMatch)
        if (passwordMatch) {
          // Auto-migrate: hash the password on successful login
          console.warn('WARNING: Admin password is stored in plain text. Please hash it and update .env file.')
        }
      }
      
      if (email && email.toLowerCase() === adminEmail.toLowerCase() && passwordMatch) {
        const token = signToken({ userId: 'admin', role: 'admin', email: email.toLowerCase() })
        console.log('Admin login successful, token generated')
        return json({ ok: true, token, user: { id: 'admin', name: 'Admin', email: email.toLowerCase(), role: 'admin' } })
      }
      
      console.log('Admin login failed: Invalid credentials')
      return json({ error: 'Invalid admin credentials.' }, 401)
    }

    // Place order
    if (root === 'orders') {
      const user = await getUserFromRequest(request)
      const items = Array.isArray(body.items) ? body.items : []
      if (!items.length) return json({ error: 'Cart is empty.' }, 400)
      const subtotal = items.reduce((t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
      const { discount: couponDiscount, coupon, error: couponError } = await applyCoupon(db, body.couponCode, subtotal)
      if (couponError) return json({ error: couponError }, 400)
      let pointsRedeemed = 0
      let pointsDiscount = 0
      if (user && body.redeemPoints) {
        const wantPts = Math.min(Number(body.redeemPoints) || 0, user.loyaltyPoints || 0)
        // 100 pts = ₹25, but must be a multiple of 100
        const usable = Math.floor(wantPts / 100) * 100
        pointsDiscount = Math.min((usable / 100) * 25, Math.max(0, subtotal - couponDiscount))
        pointsRedeemed = pointsDiscount > 0 ? (pointsDiscount / 25) * 100 : 0
      }
      const total = Math.max(0, subtotal - couponDiscount - pointsDiscount)
      const order = {
        id: uuid(),
        userId: user?.id || null,
        userEmail: user?.email || body.contactEmail || null,
        userName: user?.name || body.contactName || 'Guest',
        items,
        subtotal,
        couponCode: coupon?.code || null,
        couponDiscount,
        pointsRedeemed,
        pointsDiscount,
        pointsEarned: 100, // flat per purchase, credited on delivery
        total,
        status: 'placed',
        address: body.address || null,
        createdAt: new Date(),
      }
      await db.collection('orders').insertOne(order)
      if (user && pointsRedeemed > 0) {
        await db.collection('users').updateOne({ id: user.id }, { $inc: { loyaltyPoints: -pointsRedeemed } })
      }
      return json({ ok: true, order: stripId(order) }, 201)
    }

    // Admin actions
    if (root === 'admin') {
      if (!isAdminRequest(request)) return json({ error: 'Unauthorized' }, 401)
      if (second === 'products') {
        const p = body
        if (!p.name || !p.slug || !p.price || !p.category) return json({ error: 'name, slug, price, category required' }, 400)
        const doc = { id: uuid(), createdAt: new Date(), stock: 25, sizes: p.sizes?.length ? p.sizes : ['S','M','L','XL'], rating: p.rating || 4.8, reviews: p.reviews || 0, badge: p.badge || 'New', color: p.color || 'Black', image: p.image, hoverImage: p.hoverImage || p.image, description: p.description || '', ...p }
        await db.collection('products').insertOne(doc)
        return json({ ok: true, product: stripId(doc) }, 201)
      }
      if (second === 'coupons') {
        const { code, type, value, minOrder, expiresAt } = body
        if (!code || !type || value == null) return json({ error: 'code, type, value required' }, 400)
        if (!['flat', 'percent'].includes(type)) return json({ error: 'type must be flat or percent' }, 400)
        const doc = { id: uuid(), code: String(code).toUpperCase(), type, value: Number(value), minOrder: Number(minOrder || 0), expiresAt: expiresAt ? new Date(expiresAt) : null, active: true, createdAt: new Date() }
        await db.collection('coupons').insertOne(doc)
        return json({ ok: true, coupon: stripId(doc) }, 201)
      }
    }

    return json({ error: 'Unknown endpoint' }, 404)
  } catch (error) {
    console.error('POST error:', error?.message || error)
    return json({ error: 'Request failed. Please try again later.' }, 400)
  }
}

export async function PUT(request, { params }) {
  try {
    const path = (await params)?.path || []
    const [root, second, third] = path
    const body = await request.json().catch(() => ({}))
    const db = await getDb()

    if (root === 'admin' && isAdminRequest(request)) {
      if (second === 'products' && third) {
        const { id: _ignore, _id, ...update } = body
        await db.collection('products').updateOne({ slug: third }, { $set: update })
        const doc = await db.collection('products').findOne({ slug: third })
        return json({ ok: true, product: stripId(doc) })
      }
      if (second === 'orders' && third) {
        const status = body.status
        const before = await db.collection('orders').findOne({ id: third })
        if (!before) return json({ error: 'Order not found' }, 404)
        const setFields = { status }
        if (status === 'shipped' && !before.shippedAt) setFields.shippedAt = new Date()
        if (status === 'delivered' && !before.deliveredAt) setFields.deliveredAt = new Date()
        await db.collection('orders').updateOne({ id: third }, { $set: setFields })
        // credit loyalty on delivery (only once)
        if (status === 'delivered' && before.status !== 'delivered' && before.userId) {
          await db.collection('users').updateOne({ id: before.userId }, { $inc: { loyaltyPoints: before.pointsEarned || 100 } })
        }
        const doc = await db.collection('orders').findOne({ id: third })
        return json({ ok: true, order: stripId(doc) })
      }
      if (second === 'coupons' && third) {
        await db.collection('coupons').updateOne({ id: third }, { $set: body })
        const doc = await db.collection('coupons').findOne({ id: third })
        return json({ ok: true, coupon: stripId(doc) })
      }
    }

    return json({ error: 'Unauthorized' }, 401)
  } catch (error) {
    console.error('PUT error:', error?.message || error)
    return json({ error: 'Request failed. Please try again later.' }, 400)
  }
}

export async function DELETE(request, { params }) {
  try {
    const path = (await params)?.path || []
    const [root, second, third] = path
    const db = await getDb()
    if (root === 'admin' && isAdminRequest(request)) {
      if (second === 'products' && third) {
        await db.collection('products').deleteOne({ slug: third })
        return json({ ok: true })
      }
      if (second === 'coupons' && third) {
        await db.collection('coupons').deleteOne({ id: third })
        return json({ ok: true })
      }
    }
    return json({ error: 'Unauthorized' }, 401)
  } catch (error) {
    console.error('DELETE error:', error?.message || error)
    return json({ error: 'Request failed. Please try again later.' }, 400)
  }
}
