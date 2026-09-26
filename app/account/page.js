'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogOut, Package } from 'lucide-react'
import StoreNav from '@/components/StoreNav'
import { authFetch, clearToken, clearStoredUser, money, getToken } from '@/lib/session'

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [wishCount, setWishCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!getToken()) { router.push('/auth'); return }
    const cart = JSON.parse(window.localStorage.getItem('404-cart') || '[]')
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    setCartCount(cart.reduce((t, i) => t + i.quantity, 0))
    setWishCount(wl.length)
    Promise.all([authFetch('/api/auth/me').then((r) => r.ok ? r.json() : null), authFetch('/api/orders').then((r) => r.ok ? r.json() : { orders: [] })])
      .then(([me, ord]) => {
        if (!me) { router.push('/auth'); return }
        setUser(me.user)
        window.localStorage.setItem('404-user', JSON.stringify(me.user))
        setOrders(ord.orders || [])
        setLoading(false)
      })
  }, [router])

  const doLogout = () => { clearToken(); clearStoredUser(); router.push('/') }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] text-[10px] uppercase tracking-[0.2em] text-black/50">Loading account…</main>

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black">
      <StoreNav cartCount={cartCount} wishlistCount={wishCount} onCart={() => router.push('/')} onSearch={() => router.push('/')} />
      <div className="mx-auto max-w-[1400px] px-5 pt-32 pb-24 md:px-10">
        <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">Your account / 404</p>
            <h1 className="text-6xl font-black uppercase leading-[.82] tracking-[-.08em] md:text-8xl">Hey<br /><span className="text-[#ff2d2d]">{user?.name?.split(' ')[0] || 'you'}.</span></h1>
            <p className="mt-8 max-w-sm text-sm text-black/60">{user?.email}</p>

            <div className="mt-10 border-4 border-black bg-black p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff2d2d]">Loyal 404 Corner</p>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-[clamp(60px,8vw,110px)] font-black leading-[.8] tracking-[-.08em]">{user?.loyaltyPoints || 0}</span>
                <span className="pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">points</span>
              </div>
              <p className="mt-4 text-[11px] leading-[1.6] text-white/60">Earn <b className="text-white">100 points</b> per delivered order. Redeem <b className="text-white">100 pts = ₹25</b> off at checkout. Points credit only after your order is delivered.</p>
            </div>

            <button onClick={doLogout} className="mt-8 flex items-center gap-2 border border-black px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-black hover:text-white"><LogOut size={13} /> Log out</button>
          </div>

          <div>
            <div className="mb-6 flex items-end justify-between border-b border-black/20 pb-3">
              <h2 className="text-3xl font-black uppercase leading-[.85] tracking-[-.06em]">Your orders</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">{orders.length} placed</span>
            </div>
            {orders.length === 0 ? (
              <div className="border border-dashed border-black/25 p-10 text-center">
                <Package size={32} strokeWidth={1.2} className="mx-auto" />
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-black/50">Nothing found here yet.</p>
                <Link href="/" className="mt-6 inline-flex items-center gap-2 border-b border-black pb-1 text-[11px] font-bold uppercase tracking-[0.16em]">Start shopping <ArrowRight size={13} /></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="border border-black/15 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">Order #{o.id.slice(0, 8)}</p>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-black/60">{new Date(o.createdAt).toDateString()} · {o.items?.length} items</p>
                      </div>
                      <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${o.status === 'delivered' ? 'bg-[#ff2d2d] text-white' : o.status === 'shipped' ? 'bg-black text-white' : 'border border-black'}`}>{o.status}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {o.items?.slice(0, 4).map((i, k) => <img key={k} src={i.image} alt={i.name} className="h-16 w-14 object-cover" />)}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
                      <span>Total {money(o.total)}</span>
                      {o.status === 'delivered' && <span className="text-[#ff2d2d]">+{o.pointsEarned || 100} pts earned</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
