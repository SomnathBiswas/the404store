import ProductPage from './ProductPage'

async function getProduct(slug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  try {
    const res = await fetch(`${base}/api/products/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export default async function Page({ params }) {
  const { slug } = await params
  const data = await getProduct(slug)
  return <ProductPage initialData={data} slug={slug} />
}
