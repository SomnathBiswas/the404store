'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react'

const money = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`

export default function ProductPage({ initialData, slug }) {
  const [data, setData] = useState(initialData)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    if (!initialData) {
      fetch(`/api/products/${slug}`).then((r) => r.json()).then(setData).catch(() => {})
    }
  }, [initialData, slug])

  useEffect(() => {
    if (data?.product?.sizes?.length) setSelectedSize(data.product.sizes[0])
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    setWishlisted(wl.includes(slug))
  }, [data, slug])

  if (!data || !data.product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] text-black">
        <div className="text-center">
          <h1 className="text-[clamp(120px,25vw,320px)] font-black leading-[.7] tracking-[-.14em]">404<span className="text-[#ff2d2d]">.</span></h1>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">This piece was not found. Or maybe you found it too soon.</p>
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
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const toggleWishlist = () => {
    const wl = JSON.parse(window.localStorage.getItem('404-wishlist') || '[]')
    const next = wl.includes(slug) ? wl.filter((x) => x !== slug) : [...wl, slug]
    window.localStorage.setItem('404-wishlist', JSON.stringify(next))
    setWishlisted(next.includes(slug))
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/15 bg-[#f4f1eb]/90 px-5 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] hover:text-[#ff2d2d]"><ArrowLeft size={14} /> The 404 Store</Link>
        <p className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-black/50 md:block">Product / {product.category} / {product.slug}</p>
        <Link href="/" className="font-black leading-[.78] tracking-[-.08em] text-[14px]">THE<br />404<br />STORE</Link>
      </header>

      <section className="grid gap-0 md:grid-cols-[1.15fr_.85fr]">
        {/* LEFT — gallery */}
        <div className="relative bg-[#e8e3da]">
          <div className="aspect-[4/5] w-full overflow-hidden md:aspect-auto md:h-[calc(100vh-72px)]">
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

        {/* RIGHT — details */}
        <div className="flex flex-col justify-between p-6 md:h-[calc(100vh-72px)] md:overflow-auto md:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">{product.category} / Drop 01</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[.82] tracking-[-.08em] md:text-7xl">{product.name}</h1>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-2xl font-bold">{money(product.price)}</span>
              {product.originalPrice && <span className="text-base text-black/40 line-through">{money(product.originalPrice)}</span>}
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-black/50">★★★★★ {product.rating} · {product.reviews} reviews</p>

            <div className="mt-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Color</p>
              <div className="inline-flex items-center gap-3 border border-black px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em]">
                <span className="h-3 w-3 rounded-full bg-black" /> {product.color}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="text-black/50">Select size</span>
                <button className="underline">Size guide ↗</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`border py-3 text-[11px] font-bold transition ${selectedSize === size ? 'border-black bg-black text-white' : 'border-black/30 hover:border-black'}`}>{size}</button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Quantity</p>
              <div className="inline-flex items-center border border-black">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus size={14} /></button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3"><Plus size={14} /></button>
              </div>
            </div>

            <p className="mt-8 max-w-md text-[13px] leading-[1.7] text-black/70">{product.description}</p>

            <details className="mt-8 border-t border-black/15 pt-4">
              <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.18em]">Details · Fit · Care</summary>
              <div className="mt-3 text-[12px] leading-[1.7] text-black/60">Heavyweight construction. Machine wash cold, inside out. Do not tumble dry. Reshape while damp. Made in India.</div>
            </details>
            <details className="mt-3 border-t border-black/15 pt-4">
              <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.18em]">Shipping · Returns</summary>
              <div className="mt-3 text-[12px] leading-[1.7] text-black/60">Free shipping on orders over ₹1,999. 15 day returns. Sale items are final.</div>
            </details>
          </div>

          <div className="mt-10 flex gap-2">
            <button onClick={addToBag} className="group flex flex-1 items-center justify-center gap-3 bg-black py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2d2d]">
              {added ? 'Added to bag' : <>Add to bag <ShoppingBag size={15} className="transition group-hover:translate-x-1" /></>}
            </button>
            <button onClick={toggleWishlist} className={`border border-black px-5 transition ${wishlisted ? 'bg-[#ff2d2d] text-white' : 'hover:bg-black hover:text-white'}`} aria-label="Wishlist">
              <Heart size={19} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related?.length > 0 && (
        <section className="border-t border-black/15 px-5 py-20 md:px-10 md:py-28">
          <div className="container mx-auto">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-4xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-7xl">You may<br /><span className="text-[#ff2d2d]">also like</span></h2>
              <Link href="/" className="hidden text-[11px] font-bold uppercase tracking-[0.18em] md:inline">All products ↗</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {related.map((p) => (
                <Link href={`/product/${p.slug}`} key={p.slug} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-[#e2ded6]">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.08em]">{p.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{p.color} · {money(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-black bg-black px-5 py-14 text-white md:px-10">
        <div className="container mx-auto flex flex-col justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.2em] md:flex-row">
          <span>© 2026 THE 404 STORE</span>
          <span className="text-[#ff2d2d]">Style not found.</span>
          <Link href="/" className="flex items-center gap-2 hover:text-[#ff2d2d]">Back to store <ArrowUpRight size={14} /></Link>
        </div>
      </footer>
    </main>
  )
}
