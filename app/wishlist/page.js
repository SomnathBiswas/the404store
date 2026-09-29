'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, ArrowRight, X } from 'lucide-react'
import StoreNav from '@/components/StoreNav'
import { money } from '@/lib/session'

export default function WishlistPage() {
  const [slugs, setSlugs] = useState([])
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshCart = () => {
    const c = JSON.parse(window.localStorage.getItem('404-cart') || '[]')
    setCartCount(c.reduce((t, i) => t + i.quantity, 0))
  }

  const loadWishlist = () => {
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    setSlugs(wl)
    if (!wl.length) { setProducts([]); setLoading(false); return }
    fetch(`/api/wishlist/lookup?slugs=${wl.join(',')}`).then((r) => r.json()).then((d) => { setProducts(d.products || []); setLoading(false) })
  }

  useEffect(() => { loadWishlist(); refreshCart() }, [])

  const remove = (slug) => {
    const next = slugs.filter((s) => s !== slug)
    setSlugs(next)
    setProducts((p) => p.filter((x) => x.slug !== slug))
    window.localStorage.setItem('404-wishlist', JSON.stringify(next))
  }

  const addToBag = (p) => {
    const cart = JSON.parse(window.localStorage.getItem('404-cart') || '[]')
    const size = p.sizes?.[0] || 'M'
    const existing = cart.find((i) => i.slug === p.slug && i.size === size)
    if (existing) existing.quantity += 1
    else cart.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, color: p.color, size, quantity: 1 })
    window.localStorage.setItem('404-cart', JSON.stringify(cart))
    refreshCart()
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black">
      <StoreNav cartCount={cartCount} wishlistCount={slugs.length} onCart={() => router.push('/')} onSearch={() => router.push('/')} />
      <div className="mx-auto max-w-[1600px] px-5 pt-32 pb-24 md:px-10">
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-black/15 pb-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">Saved for later / 404</p>
            <h1 className="text-5xl font-black uppercase leading-[.82] tracking-[-.08em] md:text-8xl">Your<br /><span className="text-[#ff2d2d]">wishlist.</span></h1>
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-black/50">{slugs.length} pieces marked</p>
        </div>

        {loading ? (
          <p className="py-24 text-center text-[11px] uppercase tracking-[0.18em] text-black/50">Loading…</p>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-black/25 p-16 text-center">
            <Heart size={40} strokeWidth={1} className="mx-auto" />
            <p className="mt-6 text-3xl font-black uppercase leading-[.85] tracking-[-.07em]">Nothing found here.</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-black/50">Save fits from any product page.</p>
            <Link href="/" className="mt-8 inline-flex items-center gap-2 bg-black px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#ff2d2d]">Continue shopping <ArrowRight size={14} /></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <div key={p.slug} className="group">
                <Link href={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-[#e2ded6]">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </Link>
                <div className="mt-3 flex items-start justify-between">
                  <Link href={`/product/${p.slug}`}>
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]">{p.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{p.color} · {money(p.price)}</p>
                  </Link>
                  <button onClick={() => remove(p.slug)} className="p-1 text-black/50 hover:text-[#ff2d2d]" aria-label="Remove"><X size={14} /></button>
                </div>
                <button onClick={() => addToBag(p)} className="mt-3 flex w-full items-center justify-center gap-2 border border-black py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition hover:bg-black hover:text-white"><ShoppingBag size={12} /> Add to bag</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black px-5 py-8 text-white md:px-10">
        <div className="container mx-auto flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row">
          <span>© 2026 The 404 Store</span>
          <span>Privacy · Terms · Refund policy</span>
          <a href="https://digital-future-32.preview.emergentagent.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff2d2d] transition">Made by KYRO Digital 💙</a>
        </div>
      </footer>
    </main>
  )
}
