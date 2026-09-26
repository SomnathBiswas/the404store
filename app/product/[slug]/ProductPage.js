'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react'
import StoreNav from '@/components/StoreNav'
import { money } from '@/lib/session'

export default function ProductPage({ initialData, slug }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])

  useEffect(() => { if (!initialData) fetch(`/api/products/${slug}`).then((r) => r.json()).then(setData).catch(() => {}) }, [initialData, slug])

  const refreshCart = () => {
    const c = JSON.parse(window.localStorage.getItem('404-cart') || '[]')
    setCart(c)
    setCartCount(c.reduce((t, i) => t + i.quantity, 0))
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    setWishlistCount(wl.length)
  }

  useEffect(() => {
    refreshCart()
    if (data?.product?.sizes?.length) setSelectedSize(data.product.sizes[0])
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    setWishlisted(wl.includes(slug))
  }, [data, slug])

  if (!data || !data.product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] text-black">
        <div className="text-center">
          <h1 className="text-[clamp(120px,25vw,320px)] font-black leading-[.7] tracking-[-.14em]">404<span className="text-[#ff2d2d]">.</span></h1>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">This piece was not found.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-[11px] font-bold uppercase tracking-[0.2em]"><ArrowLeft size={14} /> Back to the store</Link>
        </div>
      </main>
    )
  }

  const { product, related } = data
  const gallery = [product.image, product.hoverImage].filter(Boolean)

  const addToBag = () => {
    const cart = JSON.parse(window.localStorage.getItem('404-cart') || '[]')
    const existing = cart.find((it) => it.slug === product.slug && it.size === selectedSize)
    if (existing) existing.quantity += quantity
    else cart.push({ slug: product.slug, name: product.name, price: product.price, image: product.image, color: product.color, size: selectedSize, quantity })
    window.localStorage.setItem('404-cart', JSON.stringify(cart))
    refreshCart()
    setAdded(true)
    setCartOpen(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const toggleWishlist = () => {
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    const next = wl.includes(slug) ? wl.filter((x) => x !== slug) : [...wl, slug]
    window.localStorage.setItem('404-wishlist', JSON.stringify(next))
    setWishlisted(next.includes(slug))
    setWishlistCount(next.length)
  }

  const changeCartQty = (item, delta) => {
    const next = cart.map((e) => e === item ? { ...e, quantity: Math.max(0, e.quantity + delta) } : e).filter((e) => e.quantity > 0)
    window.localStorage.setItem('404-cart', JSON.stringify(next))
    refreshCart()
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <StoreNav cartCount={cartCount} wishlistCount={wishlistCount} onCart={() => setCartOpen(true)} onSearch={() => router.push('/')} onCategory={(c) => router.push(`/?cat=${c}#drop`)} />

      <div className="pt-24" />
      <p className="px-5 pb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-black/50 md:px-10">
        <Link href="/" className="hover:text-black">The 404 Store</Link> / <Link href="/" className="hover:text-black">{product.category}</Link> / <span className="text-black">{product.name}</span>
      </p>

      <section className="grid gap-0 md:grid-cols-[1.15fr_.85fr]">
        <div className="relative bg-[#e8e3da]">
          <div className="aspect-[4/5] w-full overflow-hidden md:aspect-auto md:h-[calc(100vh-8rem)]">
            <img src={gallery[galleryIndex]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-5 flex gap-2">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} className={`h-16 w-14 overflow-hidden border-2 transition ${galleryIndex === i ? 'border-[#ff2d2d]' : 'border-white/60'}`}>
                  <img src={g} alt={`view ${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="absolute left-5 top-5 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">{product.badge}</div>
        </div>

        <div className="flex flex-col justify-between p-6 md:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">{product.category} / Drop 01</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[.82] tracking-[-.08em] md:text-7xl">{product.name}</h1>
            <div className="mt-6 flex items-center gap-4"><span className="text-2xl font-bold">{money(product.price)}</span>{product.originalPrice && <span className="text-base text-black/40 line-through">{money(product.originalPrice)}</span>}</div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-black/50">★★★★★ {product.rating} · {product.reviews} reviews</p>

            <div className="mt-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Color</p><div className="inline-flex items-center gap-3 border border-black px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em]"><span className="h-3 w-3 rounded-full bg-black" /> {product.color}</div></div>

            <div className="mt-8"><div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]"><span className="text-black/50">Select size</span><button className="underline">Size guide ↗</button></div><div className="grid grid-cols-5 gap-2">{product.sizes.map((size) => (<button key={size} onClick={() => setSelectedSize(size)} className={`border py-3 text-[11px] font-bold transition ${selectedSize === size ? 'border-black bg-black text-white' : 'border-black/30 hover:border-black'}`}>{size}</button>))}</div></div>

            <div className="mt-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Quantity</p><div className="inline-flex items-center border border-black"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus size={14} /></button><span className="w-10 text-center text-sm font-bold">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="p-3"><Plus size={14} /></button></div></div>

            <p className="mt-8 max-w-md text-[13px] leading-[1.7] text-black/70">{product.description}</p>

            <details className="mt-8 border-t border-black/15 pt-4"><summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.18em]">Details · Fit · Care</summary><div className="mt-3 text-[12px] leading-[1.7] text-black/60">Heavyweight construction. Machine wash cold, inside out. Do not tumble dry. Made in India.</div></details>
            <details className="mt-3 border-t border-black/15 pt-4"><summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.18em]">Shipping · Returns</summary><div className="mt-3 text-[12px] leading-[1.7] text-black/60">Free shipping on orders over ₹1,999. 15 day returns. Sale items are final.</div></details>
          </div>

          <div className="mt-10 flex gap-2">
            <button onClick={addToBag} className="group flex flex-1 items-center justify-center gap-3 bg-black py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2d2d]">{added ? <><Check size={16} /> Added to bag</> : <>Add to bag <ShoppingBag size={15} className="transition group-hover:translate-x-1" /></>}</button>
            <button onClick={toggleWishlist} className={`border border-black px-5 transition ${wishlisted ? 'bg-[#ff2d2d] text-white border-[#ff2d2d]' : 'hover:bg-black hover:text-white'}`} aria-label="Wishlist"><Heart size={19} fill={wishlisted ? 'currentColor' : 'none'} /></button>
          </div>
        </div>
      </section>

      {related?.length > 0 && (
        <section className="border-t border-black/15 px-5 py-20 md:px-10 md:py-28">
          <div className="container mx-auto">
            <div className="mb-10 flex items-end justify-between"><h2 className="text-4xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-7xl">You may<br /><span className="text-[#ff2d2d]">also like</span></h2><Link href="/" className="hidden text-[11px] font-bold uppercase tracking-[0.18em] md:inline">All products ↗</Link></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{related.map((p) => (<Link href={`/product/${p.slug}`} key={p.slug} className="group"><div className="aspect-[3/4] overflow-hidden bg-[#e2ded6]"><img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="mt-3"><h3 className="text-[11px] font-bold uppercase tracking-[0.08em]">{p.name}</h3><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{p.color} · {money(p.price)}</p></div></Link>))}</div>
          </div>
        </section>
      )}

      <footer className="border-t border-black bg-black px-5 py-14 text-white md:px-10"><div className="container mx-auto flex flex-col justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.2em] md:flex-row"><span>© 2026 THE 404 STORE</span><span className="text-[#ff2d2d]">Style not found.</span><Link href="/" className="flex items-center gap-2 hover:text-[#ff2d2d]">Back to store ↗</Link></div></footer>

      {cartOpen && (
        <div className="fixed inset-0 z-[55]">
          <button aria-label="Close" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f4f1eb] p-5 md:p-8">
            <div className="flex items-center justify-between border-b border-black/20 pb-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Your bag</p><h2 className="mt-2 text-4xl font-black uppercase leading-[.8] tracking-[-.08em]">{cartCount ? `${cartCount} found` : 'Nothing found'}</h2></div>
              <button onClick={() => setCartOpen(false)}><X size={23} /></button>
            </div>
            {cart.length ? (
              <>
                <div className="flex-1 overflow-auto py-5">
                  {cart.map((item) => (
                    <div key={`${item.slug}-${item.size}`} className="flex gap-3 border-b border-black/15 py-4">
                      <img src={item.image} alt={item.name} className="h-28 w-24 object-cover" />
                      <div className="flex flex-1 flex-col justify-between">
                        <div><h3 className="text-[11px] font-bold uppercase tracking-[0.08em]">{item.name}</h3><p className="mt-1 text-[10px] uppercase text-black/50">Size {item.size} · {money(item.price)}</p></div>
                        <div className="flex items-center justify-between"><div className="flex items-center border border-black"><button onClick={() => changeCartQty(item, -1)} className="p-2"><Minus size={12} /></button><span className="w-6 text-center text-[10px]">{item.quantity}</span><button onClick={() => changeCartQty(item, 1)} className="p-2"><Plus size={12} /></button></div><span className="text-[11px] font-bold">{money(item.price * item.quantity)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black pt-5">
                  <div className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>{money(cart.reduce((t, i) => t + i.price * i.quantity, 0))}</span></div>
                  <Link href="/" className="mt-5 flex w-full items-center justify-center gap-3 bg-black px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff2d2d]">Checkout <ArrowRight size={15} /></Link>
                  <p className="mt-4 text-center text-[9px] uppercase tracking-[0.14em] text-black/45">Apply coupons and points in the main bag</p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center"><Sparkles size={30} strokeWidth={1} /><p className="mt-6 text-3xl font-black uppercase leading-[.82] tracking-[-.07em]">Nothing found here.</p><button onClick={() => setCartOpen(false)} className="mt-7 border-b border-black pb-2 text-[10px] font-bold uppercase tracking-[0.18em]">Continue shopping <ArrowRight className="inline" size={14} /></button></div>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
