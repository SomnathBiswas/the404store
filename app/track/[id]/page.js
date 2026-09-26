import TrackingPage from './TrackingPage'

async function getOrder(id) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  try {
    const res = await fetch(`${base}/api/track/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export default async function Page({ params }) {
  const { id } = await params
  const data = await getOrder(id)
  return <TrackingPage initialData={data} orderId={id} />
}
