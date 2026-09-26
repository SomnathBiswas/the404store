import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { ensureSeeded, CATEGORIES } from '@/lib/seed'
import { v4 as uuid } from 'uuid'

const json = (data, status = 200) => NextResponse.json(data, { status })

const stripId = (doc) => {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

async function withDb() {
  const db = await getDb()
  await ensureSeeded()
  return db
}

export async function GET(request, { params }) {
  try {
    const path = (await params)?.path || []
    const [root, second] = path
    const { searchParams } = new URL(request.url)

    if (!root) return json({ ok: true, name: 'THE 404 STORE API', categories: CATEGORIES })

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
      const limit = Number(searchParams.get('limit') || 100)

      const filter = {}
      if (category && category !== 'All') filter.category = new RegExp(`^${category}$`, 'i')
      if (query) filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ]

      const sortMap = {
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
        'newest': { createdAt: -1 },
        'featured': { rating: -1 },
      }
      const docs = await col.find(filter).sort(sortMap[sort] || sortMap.featured).limit(limit).toArray()
      return json({ products: docs.map(stripId), count: docs.length, categories: CATEGORIES })
    }

    if (root === 'seed') {
      const result = await ensureSeeded(true)
      return json({ ok: true, ...result })
    }

    return json({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('GET error', error)
    return json({ error: 'Something went wrong.', detail: String(error?.message || error) }, 500)
  }
}

export async function POST(request, { params }) {
  try {
    const path = (await params)?.path || []
    const [root] = path
    const body = await request.json().catch(() => ({}))

    if (root === 'newsletter') {
      if (!body.email || !String(body.email).includes('@')) return json({ error: 'Valid email required.' }, 400)
      const db = await getDb()
      await db.collection('newsletter').insertOne({ id: uuid(), email: body.email, createdAt: new Date() })
      return json({ ok: true, message: 'You are on the list.' }, 201)
    }

    if (root === 'orders') {
      const db = await getDb()
      const order = { id: uuid(), items: body.items || [], total: body.total || 0, contact: body.contact || null, createdAt: new Date(), status: 'placed' }
      await db.collection('orders').insertOne(order)
      return json({ ok: true, order: stripId(order) }, 201)
    }

    return json({ error: 'Unknown endpoint' }, 404)
  } catch (error) {
    console.error('POST error', error)
    return json({ error: 'Request failed.', detail: String(error?.message || error) }, 400)
  }
}
