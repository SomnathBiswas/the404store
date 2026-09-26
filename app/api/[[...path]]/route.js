import { NextResponse } from 'next/server'

const imageSet = [
  'https://images.unsplash.com/photo-1547066066-aff8d227ec11?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1700557477468-9b3d9db79663?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1700557477593-2d86947ff385?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1700557477726-23aba4f7c7da?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1508216310976-c518daae0cdc?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1649877705659-adf38e1f68f1?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1717674798312-d27a58153d07?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1493739993711-66f6621741bb?auto=format&fit=crop&w=1200&q=85',
]

const products = [
  { id: '404-tee', slug: '404-oversized-tee', name: '404 Oversized Tee', category: 'Unisex', price: 1499, color: 'Washed Black', sizes: ['S', 'M', 'L', 'XL'], image: imageSet[1], hoverImage: imageSet[5], badge: 'Drop 01', rating: 4.9, reviews: 84 },
  { id: 'error-hoodie', slug: 'error-hoodie', name: 'Error Hoodie', category: 'Unisex', price: 2499, color: 'Charcoal', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: imageSet[0], hoverImage: imageSet[6], badge: 'Most wanted', rating: 5, reviews: 128 },
  { id: 'not-found-cargo', slug: 'not-found-cargo', name: 'Not Found Cargo', category: 'Men', price: 2999, color: 'Concrete', sizes: ['28', '30', '32', '34', '36'], image: imageSet[4], hoverImage: imageSet[2], badge: 'New', rating: 4.8, reviews: 56 },
  { id: 'zip-jacket', slug: '404-zip-jacket', name: '404 Zip Jacket', category: 'Women', price: 3499, color: 'Ink', sizes: ['S', 'M', 'L', 'XL'], image: imageSet[3], hoverImage: imageSet[7], badge: 'Limited', rating: 4.7, reviews: 42 },
  { id: 'essential-tee', slug: '404-essential-tee', name: '404 Essential Tee', category: 'Women', price: 1299, color: 'Bone', sizes: ['XS', 'S', 'M', 'L'], image: imageSet[7], hoverImage: imageSet[1], badge: 'Everyday', rating: 4.8, reviews: 102 },
  { id: 'utility-jacket', slug: 'utility-jacket', name: 'Utility Jacket', category: 'Men', price: 3999, color: 'Black', sizes: ['M', 'L', 'XL'], image: imageSet[5], hoverImage: imageSet[4], badge: 'New', rating: 4.9, reviews: 38 },
  { id: '404-denim', slug: '404-denim', name: '404 Wide Denim', category: 'Unisex', price: 2799, color: 'Raw Indigo', sizes: ['28', '30', '32', '34'], image: imageSet[2], hoverImage: imageSet[0], badge: 'Restocked', rating: 4.6, reviews: 74 },
  { id: 'error-cap', slug: 'error-cap', name: 'Error Cap', category: 'Unisex', price: 899, color: 'Washed Black', sizes: ['OS'], image: imageSet[6], hoverImage: imageSet[3], badge: 'Accessory', rating: 4.9, reviews: 31 },
]

const json = (data, status = 200) => NextResponse.json(data, { status })

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const query = searchParams.get('q')?.toLowerCase()
    const filtered = products.filter((product) => {
      const matchesCategory = !category || category === 'All' || product.category.toLowerCase() === category.toLowerCase()
      const matchesQuery = !query || `${product.name} ${product.color} ${product.category}`.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
    return json({ products: filtered, count: filtered.length })
  } catch (error) {
    return json({ error: 'Unable to load the collection.' }, 500)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (body?.type === 'newsletter') {
      if (!body.email || !String(body.email).includes('@')) return json({ error: 'A valid email is required.' }, 400)
      return json({ ok: true, message: 'You are on the list.' }, 201)
    }
    return json({ ok: true, message: 'Cart is ready for checkout.' }, 201)
  } catch (error) {
    return json({ error: 'Request could not be completed.' }, 400)
  }
}