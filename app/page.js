'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Heart, Instagram, Minus, Plus, Search, ShoppingBag, Sparkles, X, Tag } from 'lucide-react'
import StoreNav from '@/components/StoreNav'
import { authFetch, getStoredUser, getToken, money } from '@/lib/session'

const HERO_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/z86lx0kg_file_0000000091908211b979c011be24a43a.png'
const LANDING_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/u3ixlku2_file_00000000ac908211af2cb10fe70a1e09.png'
const EDITORIAL_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/deavzcwm_file_00000000a4c48211a4f3e355ddb9da99.png'
const CAT_A = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/7t5y1xpl_file_000000003f508211bff835467c511012.png'
const CAT_B = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/uui4654j_file_00000000c1b88211bd75e52d376dca02.png'
const SOCIALS = [CAT_A, CAT_B, EDITORIAL_IMG, LANDING_IMG]

const CATEGORIES = ['All', 'Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']

const Marquee = ({ reverse = false, dark = true, children }) => (
  <div className={`overflow-hidden whitespace-nowrap border-y ${dark ? 'border-white/20 bg-black text-white' : 'border-black/15 bg-[#f4f1eb] text-black'}`}>
    <div className={`flex min-w-max gap-10 py-3 text-[10px] font-bold uppercase tracking-[0.25em] ${reverse ? 'marquee-reverse' : 'marquee'}`}>
      <span>{children} <b className="px-4 text-[#ff2d2d]">✱</b> {children} <b className="px-4 text-[#ff2d2d]">✱</b> {children} <b className="px-4 text-[#ff2d2d]">✱</b></span>
      <span>{children} <b className="px-4 text-[#ff2d2d]">✱</b> {children} <b className="px-4 text-[#ff2d2d]">✱</b> {children}</span>
    </div>
  </div>
)

const ProductCard = ({ product, onAdd, wishlist, onWishlist, index = 0 }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <article className={`group relative ${index % 4 === 1 ? 'md:translate-y-8' : ''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-[#e2ded6]">
        <img src={hovered ? (product.hoverImage || product.image) : product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black">{product.badge}</span>
        <span className="absolute bottom-3 left-3 flex translate-y-2 items-center gap-2 bg-[#ff2d2d] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">View piece <ArrowUpRight size={12} /></span>
      </Link>
      <div className="flex items-start justify-between gap-3 border-b border-black/15 py-3">
        <Link href={`/product/${product.slug}`} className="text-left">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]">{product.name}</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/50">{product.color} · {product.category}</p>
          <p className="mt-2 text-[12px] font-bold">
            {money(product.price)}
            {product.originalPrice && <span className="ml-2 text-black/40 line-through">{money(product.originalPrice)}</span>}
          </p>
        </Link>
        <div className="flex items-center gap-1">
          <button aria-label={`Wishlist ${product.name}`} type="button" onClick={() => onWishlist(product)} className={`p-1 transition ${wishlist ? 'text-[#ff2d2d]' : 'text-black/50 hover:text-black'}`}><Heart size={15} fill={wishlist ? 'currentColor' : 'none'} strokeWidth={1.5} /></button>
          <button type="button" onClick={() => onAdd(product)} className="border border-black px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition hover:bg-black hover:text-white">Quick add</button>
        </div>
      </div>
    </article>
  )
}

const App = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [hasEntered, setHasEntered] = useState(false)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(false)
  const [user, setUser] = useState(null)
  // Checkout state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponMsg, setCouponMsg] = useState('')
  const [redeemPts, setRedeemPts] = useState(0)
  const [placedOrder, setPlacedOrder] = useState(null)

  // Loader / entry state
  useEffect(() => {
    const alreadyEntered = window.sessionStorage.getItem('404-entered') === '1'
    if (alreadyEntered) { setIsLoading(false); setHasEntered(true); setLoaderProgress(100); return }
    const startedAt = Date.now()
    const progressTimer = window.setInterval(() => {
      const progress = Math.min(100, Math.round(((Date.now() - startedAt) / 2100) * 100))
      setLoaderProgress(progress)
      if (progress >= 100) { window.clearInterval(progressTimer); window.setTimeout(() => setIsLoading(false), 260) }
    }, 40)
    return () => window.clearInterval(progressTimer)
  }, [])

  useEffect(() => {
    const savedCart = window.localStorage.getItem('404-cart')
    const savedWishlist = window.localStorage.getItem('404-wishlist')
    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
    setUser(getStoredUser())
    if (getToken()) authFetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((d) => { if (d?.user) { setUser(d.user); window.localStorage.setItem('404-user', JSON.stringify(d.user)) } })
  }, [])

  useEffect(() => { window.localStorage.setItem('404-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { window.localStorage.setItem('404-wishlist', JSON.stringify(wishlist)) }, [wishlist])

  useEffect(() => {
    if (!hasEntered) return
    const url = new URL('/api/products', window.location.origin)
    if (activeCategory && activeCategory !== 'All') url.searchParams.set('category', activeCategory)
    if (query) url.searchParams.set('q', query)
    fetch(url.toString()).then((r) => r.json()).then((data) => setProducts(data.products || [])).catch(() => {})
  }, [hasEntered, activeCategory, query])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.type === 'percent') return Math.round((subtotal * appliedCoupon.value) / 100)
    return Math.min(appliedCoupon.value, subtotal)
  }, [appliedCoupon, subtotal])

  const pointsUsable = Math.floor((redeemPts || 0) / 100) * 100
  const pointsDiscount = Math.min((pointsUsable / 100) * 25, Math.max(0, subtotal - couponDiscount))
  const cartTotal = Math.max(0, subtotal - couponDiscount - pointsDiscount)

  const addToCart = (product, size) => {
    const chosen = size || product.sizes?.[0] || 'M'
    setCart((current) => {
      const existing = current.find((item) => item.slug === product.slug && item.size === chosen)
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { slug: product.slug, name: product.name, price: product.price, image: product.image, color: product.color, size: chosen, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const changeQuantity = (item, delta) => setCart((current) => current.map((entry) => entry === item ? { ...entry, quantity: Math.max(0, entry.quantity + delta) } : entry).filter((entry) => entry.quantity > 0))
  const toggleWishlist = (product) => setWishlist((current) => current.includes(product.slug) ? current.filter((id) => id !== product.slug) : [...current, product.slug])

  const enterStore = () => {
    window.sessionStorage.setItem('404-entered', '1')
    setHasEntered(true)
  }

  const submitNewsletter = async (event) => {
    event.preventDefault()
    if (!newsletterEmail.includes('@')) return
    try { await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newsletterEmail }) }); setNewsletterDone(true) } catch { setNewsletterDone(true) }
  }

  const applyCoupon = async () => {
    if (!couponInput) return
    setCouponMsg('')
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput)}&subtotal=${subtotal}`)
    const data = await res.json()
    if (!res.ok) { setCouponMsg(data.error || 'Coupon invalid'); setAppliedCoupon(null); return }
    setAppliedCoupon(data.coupon)
    setCouponMsg(`✓ Coupon ${data.coupon.code} applied`)
  }

  const placeOrder = () => {
    if (!cart.length) return
    if (!user) { router.push('/auth?redirect=/checkout'); return }
    // Prevent admin users from accessing checkout
    if (user?.role === 'admin') {
      alert('Admin users cannot place orders')
      return
    }
    router.push('/checkout')
  }

  if (isLoading) {
    return (
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] px-5 py-6 text-[#f4f1eb] selection:bg-[#ff2d2d] selection:text-white">
        <style>{`@keyframes loaderScan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}`}</style>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#ff2d2d]/10 to-transparent" style={{ animation: 'loaderScan 2.1s linear infinite' }} />
        <div className="relative z-10 flex items-start justify-between border-b border-white/20 pb-4 text-[9px] font-bold uppercase tracking-[0.22em]"><span>THE 404 STORE</span><span>Boot sequence / 001</span><span>{loaderProgress}%</span></div>
        <div className="relative z-10 flex flex-1 flex-col justify-center"><p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">Error code: style not found</p><h1 className="text-[clamp(150px,34vw,520px)] font-black leading-[.65] tracking-[-.17em]">404<span className="text-[#ff2d2d]">.</span></h1><div className="mt-12 max-w-xl"><div className="mb-3 flex justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-white/45"><span>Searching for the ordinary</span><span>{loaderProgress}/100</span></div><div className="h-1 w-full bg-white/15"><div className="h-full bg-[#ff2d2d] transition-[width] duration-75" style={{ width: `${loaderProgress}%` }} /></div></div></div>
        <div className="relative z-10 flex items-end justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-white/40"><span>Nothing ordinary found</span><span className="hidden md:inline">Loading the unknown / Please wait</span><span>2026</span></div>
      </main>
    )
  }

  if (!hasEntered) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
        <style>{`@keyframes landingReveal{from{transform:scale(1.06);opacity:.4}to{transform:scale(1);opacity:1}}`}</style>
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-5 md:px-10 md:py-7">
          <div className="flex items-start justify-between border-b border-black/20 pb-4 text-[9px] font-bold uppercase tracking-[0.22em]"><span className="text-[16px] font-black leading-[.75] tracking-[-.1em]">THE<br />404<br />STORE</span><span className="hidden md:block">A new uniform for the uncertain</span><span>Entry / 404</span></div>
          <section className="relative flex flex-1 flex-col justify-center py-10 md:py-12">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(80px,18vw,260px)] font-black uppercase leading-[.7] tracking-[-.13em] text-black/[.06]">Not<br />found</div>
            <div className="relative grid items-center gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-16">
              <div className="order-2 md:order-1"><p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">Collection 01 / 2026</p><h1 className="max-w-xl text-[clamp(64px,10vw,150px)] font-black uppercase leading-[.74] tracking-[-.1em]">Page<br /><span className="ml-[12vw] text-[#ff2d2d]">not</span><br />found<span className="text-black">.</span></h1><p className="mt-8 max-w-[260px] text-[11px] leading-[1.6] text-black/55">You were looking for something ordinary. Good news: this isn't it.</p><button type="button" onClick={enterStore} className="group mt-9 flex items-center gap-4 bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff2d2d]">Enter the 404 <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button></div>
              <div className="relative order-1 h-[52vh] min-h-[420px] overflow-hidden bg-[#d8d2c8] md:order-2 md:h-[70vh]" style={{ animation: 'landingReveal 1.2s ease-out both' }}><img src={LANDING_IMG} alt="campaign" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/0" /><div className="absolute left-5 top-5 text-[9px] font-bold uppercase tracking-[0.22em] text-white">404 / Preview 001</div><div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white"><span className="max-w-[170px] text-[11px] uppercase leading-[1.25] tracking-[0.12em]">Style is a place you weren't meant to find.</span><span className="text-[9px] uppercase tracking-[0.18em]">Scroll ↘</span></div></div>
            </div>
          </section>
          <div className="flex justify-between border-t border-black/20 pt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-black/45"><span>Shirt / Tshirt / Jeans / Newdrop / Sale</span><span>Style not found.</span><span>Enter at your own risk ↗</span></div>
        </div>
      </main>
    )
  }

  const mostWanted = products.slice(4, 12)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes marqueeReverse{from{transform:translateX(-50%)}to{transform:translateX(0)}}.marquee{animation:marquee 28s linear infinite}.marquee-reverse{animation:marqueeReverse 28s linear infinite}@keyframes glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}}.glitch:hover{animation:glitch .3s steps(2) infinite}`}</style>

      <StoreNav activeCategory={activeCategory} onCategory={(c) => { setActiveCategory(c); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} onSearch={() => setSearchOpen(true)} onCart={() => setCartOpen(true)} cartCount={cartCount} wishlistCount={wishlist.length} />

      {/* HERO */}
      <section id="top" className="relative grid min-h-[720px] grid-cols-1 bg-[#0a0a0a] text-white md:min-h-[900px] md:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex flex-col justify-end px-5 pb-10 pt-28 md:px-12 md:pb-20 md:pt-40">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d] md:mb-6">The 404 store / collection 01 / 2026</p>
          <h1 className="max-w-[720px] text-[clamp(56px,15vw,190px)] font-black uppercase leading-[.76] tracking-[-.1em]">Style<br /><span className="ml-[10vw] text-[#f4f1eb]">not</span><br />found<span className="text-[#ff2d2d]">.</span></h1>
          <div className="mt-8 flex flex-col items-start gap-4 md:mt-12 md:flex-row md:items-end md:justify-between md:gap-8 md:max-w-xl"><p className="max-w-[240px] text-[11px] leading-[1.6] text-white/60">Clothes for people who don't dress to fit in. Drop one is online now.</p><a href="#drop" className="flex items-center gap-2 border-b border-[#ff2d2d] pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff2d2d]">Shop new drop <ArrowDownRight size={15} /></a></div>
        </div>
        <div className="relative min-h-[380px] overflow-hidden md:min-h-0"><img src={HERO_IMG} alt="campaign" className="h-full w-full object-cover transition duration-1000 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" /><div className="absolute right-4 top-6 flex flex-col gap-2 text-right text-[9px] uppercase tracking-[0.2em] text-white/60 md:right-10 md:top-40"><span>Drop 01</span><span>01 — 15</span></div><div className="absolute bottom-5 right-4 max-w-[150px] text-right text-[10px] leading-[1.5] text-white/70 md:right-10 md:bottom-7">A uniform for the uncertain. <span className="text-[#ff2d2d]">Designed in India.</span></div></div>
        <div className="absolute bottom-4 left-5 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/50 md:flex md:left-12 md:bottom-5"><span className="h-8 w-px bg-[#ff2d2d]" /> Scroll to explore</div>
      </section>

      <Marquee>THE 404 STORE · NEW DROP · STYLE NOT FOUND · NOTHING ORDINARY</Marquee>

      <section className="container mx-auto px-4 py-16 md:px-10 md:py-36">
        <div className="mb-8 flex items-end justify-between md:mb-10"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 md:mb-4">Find your frequency / 01</p><h2 className="text-4xl font-black uppercase leading-[.85] tracking-[-.08em] md:text-8xl">Shop<br /><span className="ml-8 text-[#ff2d2d] md:ml-16">the unknown</span></h2></div><ArrowDownRight className="hidden md:block" size={50} strokeWidth={1} /></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">
          <button type="button" onClick={() => { setActiveCategory('Shirt'); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative h-[360px] overflow-hidden text-left md:col-span-5 md:h-[620px]"><img src={CAT_A} alt="Shirts" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/0" /><span className="absolute bottom-4 left-4 text-4xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3 md:bottom-5 md:left-5 md:text-7xl">Shirt <ArrowRight className="inline" size={30} /></span></button>
          <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
            <button type="button" onClick={() => { setActiveCategory('Tshirt'); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative h-[300px] overflow-hidden text-left md:h-[420px]"><img src={CAT_B} alt="Tshirts" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-4 left-4 text-4xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3 md:bottom-5 md:left-5 md:text-5xl">Tshirt <ArrowRight className="inline" size={26} /></span></button>
            <button type="button" onClick={() => { setActiveCategory('Jeans'); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative mt-0 h-[300px] overflow-hidden bg-[#ff2d2d] text-left md:mt-20 md:h-[420px]"><img src={SOCIALS[2]} alt="Jeans" className="h-full w-full object-cover mix-blend-multiply transition duration-700 group-hover:scale-105" /><span className="absolute bottom-4 left-4 text-4xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3 md:bottom-5 md:left-5 md:text-5xl">Jeans <ArrowRight className="inline" size={26} /></span></button>
          </div>
        </div>
      </section>

      <section id="drop" className="border-t border-black/15 px-5 py-24 md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Just landed / Drop 01</p><h2 className="text-6xl font-black uppercase leading-[.78] tracking-[-.09em] md:text-[130px]">Shop<br /><span className="ml-12 text-[#ff2d2d]">everything</span></h2></div><div className="max-w-[220px] text-[11px] uppercase leading-[1.5] tracking-[0.08em] text-black/55">Nothing basic. Heavyweight essentials and strange little details.</div></div>
          <div className="mb-8 flex items-center gap-2 overflow-auto border-b border-black/15 pb-3 text-[10px] font-bold uppercase tracking-[0.18em]">
            <span className="mr-3 text-black/40">Filter</span>
            {CATEGORIES.map((category) => (<button type="button" key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap px-3 py-2 transition ${activeCategory === category ? 'bg-black text-white' : 'hover:bg-black/10'}`}>{category === 'Newdrop' ? 'New Drop' : category}</button>))}
            <button type="button" onClick={() => setSearchOpen(true)} className="ml-auto flex items-center gap-2 whitespace-nowrap"><Search size={13} /> Search {query ? `(${query})` : ''}</button>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} onAdd={addToCart} wishlist={wishlist.includes(product.slug)} onWishlist={toggleWishlist} />)}</div>
          {!products.length && <p className="py-16 text-center text-sm uppercase tracking-[0.16em] text-black/50">No pieces found. Try another signal.</p>}
        </div>
      </section>

      <section className="relative min-h-[760px] overflow-hidden bg-[#0a0a0a] md:min-h-[880px]"><img src={EDITORIAL_IMG} alt="Editorial" className="absolute inset-0 h-full w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" /><div className="relative z-10 flex min-h-[760px] flex-col justify-between p-6 text-white md:min-h-[880px] md:p-12"><div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.22em]"><span>Editorial / 004</span><span>Read the story ↗</span></div><div><h2 className="glitch text-[clamp(80px,17vw,250px)] font-black uppercase leading-[.72] tracking-[-.11em]">The<br /><span className="ml-[16vw]">new</span><br />normal<span className="text-[#ff2d2d]">.</span></h2><div className="mt-10 flex max-w-2xl flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-[340px] text-[12px] leading-[1.6] text-white/80">Clothes designed for people who don't dress to fit in. We explore everyday silhouettes through unexpected proportions, textures and attitude.</p><button type="button" className="flex items-center gap-2 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Read the story <ArrowRight size={16} /></button></div></div></div></section>

      {/* LOYAL 404 CORNER */}
      <section id="loyal-corner" className="bg-black px-5 py-24 text-white md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="grid gap-10 md:grid-cols-[1fr_.9fr]">
            <div>
              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">Members only / 05</p>
              <h2 className="text-6xl font-black uppercase leading-[.78] tracking-[-.09em] md:text-[130px]">Loyal<br /><span className="text-[#ff2d2d]">404</span><br />corner.</h2>
              <p className="mt-8 max-w-md text-sm leading-[1.7] text-white/60">The store rewards the ones who kept scrolling. Points show up in your account. Discounts show up at checkout.</p>
            </div>
            <div className="grid gap-4 self-end">
              <div className="border border-white/15 p-6"><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">01 — Earn</p><p className="mt-3 text-3xl font-black uppercase leading-[.9] tracking-[-.05em]">+100 pts per order</p><p className="mt-2 text-[11px] text-white/50">Credited after delivery.</p></div>
              <div className="border border-white/15 p-6"><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">02 — Redeem</p><p className="mt-3 text-3xl font-black uppercase leading-[.9] tracking-[-.05em]">100 pts = ₹25 off</p><p className="mt-2 text-[11px] text-white/50">Apply in the bag.</p></div>
              <div className="border border-white/15 p-6"><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">03 — You</p>{user ? <><p className="mt-3 text-3xl font-black uppercase leading-[.9] tracking-[-.05em]">{user.loyaltyPoints || 0} pts</p><Link href="/account" className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff2d2d]">View your account ↗</Link></> : <><p className="mt-3 text-3xl font-black uppercase leading-[.9] tracking-[-.05em]">Sign in to see.</p><Link href="/auth" className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff2d2d]">Create an account ↗</Link></>}</div>
            </div>
          </div>
        </div>
      </section>

      {mostWanted.length > 0 && (
        <section className="container mx-auto px-5 py-24 md:px-10 md:py-36">
          <div className="mb-12 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">The pieces that stay / 02</p><h2 className="text-6xl font-black uppercase leading-[.8] tracking-[-.09em] md:text-[120px]">Most<br /><span className="ml-12">wanted</span></h2></div><span className="hidden text-[10px] uppercase tracking-[0.2em] md:block">{mostWanted.length} pieces</span></div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-5">{mostWanted.map((product, index) => <ProductCard key={`mw-${product.slug}`} product={product} index={index + 1} onAdd={addToCart} wishlist={wishlist.includes(product.slug)} onWishlist={toggleWishlist} />)}</div>
        </section>
      )}

      <Marquee reverse dark={false}>SEEN OUTSIDE THE 404 · #404STORE · TAG YOUR UNKNOWN</Marquee>

      <section className="container mx-auto px-5 py-24 md:px-10 md:py-32">
        <div className="mb-10 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Out there / 04</p><h2 className="text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-8xl">Seen outside<br /><span className="ml-16 text-[#ff2d2d]">the 404</span></h2></div><Instagram className="mb-2" size={30} strokeWidth={1} /></div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          <a href="#drop" className="group relative aspect-[.8] overflow-hidden md:row-span-2 md:aspect-auto"><img src={SOCIALS[0]} alt="street style" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={SOCIALS[1]} alt="detail" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={SOCIALS[2]} alt="portrait" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={SOCIALS[3]} alt="closeup" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={EDITORIAL_IMG} alt="look" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></a>
        </div>
      </section>

      <section className="border-y border-black bg-[#ff2d2d] px-5 py-20 text-white md:px-10 md:py-28">
        <div className="container mx-auto flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div><p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]">Don't get lost / Stay found</p><h2 className="max-w-4xl text-5xl font-black uppercase leading-[.78] tracking-[-.1em] md:text-[130px] md:leading-[.75]">Don't<br /><span className="ml-6 md:ml-14">get lost.</span></h2></div>
          <div className="w-full max-w-sm space-y-6">
            <form onSubmit={submitNewsletter}><p className="mb-4 text-[11px] leading-[1.5]">Get first access to drops, limited pieces and things that shouldn't exist.</p><div className="flex border-b border-white py-3"><input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} type="email" placeholder="YOUR EMAIL" className="min-w-0 flex-1 bg-transparent text-[11px] font-bold uppercase tracking-[0.18em] outline-none placeholder:text-white/60" /><button type="submit" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">{newsletterDone ? <><Check size={14} /> Joined</> : <>Join 404 <ArrowRight size={14} /></>}</button></div></form>
            <div className="border-t border-white/40 pt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]">Track an order</p>
              <form onSubmit={(e) => { e.preventDefault(); const id = new FormData(e.currentTarget).get('id'); if (id) router.push(`/track/${id}`) }}>
                <div className="flex border-b border-white py-3"><input name="id" placeholder="ORDER ID" className="min-w-0 flex-1 bg-transparent text-[11px] font-bold uppercase tracking-[0.18em] outline-none placeholder:text-white/60" /><button type="submit" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Track <ArrowRight size={14} /></button></div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black px-5 py-16 text-white md:px-10 md:py-24">
        <div className="container mx-auto">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div><div className="text-5xl font-black leading-[.72] tracking-[-.1em]">THE<br />404<br />STORE</div><p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-white/50">Style not found.</p></div>
            <div><h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Shop</h4>{['All', 'Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale'].map((item) => (<button key={item} onClick={() => { setActiveCategory(item); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="mb-3 block text-left text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item === 'Newdrop' ? 'New Drop' : item}</button>))}</div>
            <div><h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Account</h4><Link href="/account" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">My account</Link><Link href="/wishlist" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">Wishlist</Link><Link href="/auth/forgot" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">Forgot password</Link><a href="#loyal-corner" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">Loyal 404 Corner</a><Link href="/about" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">About</Link></div>
            <div><h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Follow</h4>{['Instagram', 'YouTube', 'Pinterest', 'TikTok'].map((item) => <a key={item} href="#social" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">{item}</a>)}</div>
          </div>
          <div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row"><span>© 2026 The 404 Store</span><span>Privacy · Terms · Refund policy</span><span>Made for the not found</span></div>
        </div>
      </footer>

      {searchOpen && <div className="fixed inset-0 z-[55] overflow-auto bg-[#f4f1eb] p-5 md:p-10"><div className="mx-auto max-w-[1440px]"><div className="flex items-center justify-between border-b border-black pb-5"><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Search / 404</span><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={23} /></button></div><div className="py-16 md:py-24"><label htmlFor="search" className="mb-4 block text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">What are you looking for?</label><div className="flex items-center border-b-2 border-black pb-4"><input id="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TYPE TO SEARCH" className="w-full bg-transparent text-4xl font-black uppercase tracking-[-.07em] outline-none placeholder:text-black/15 md:text-8xl" /><Search size={30} /></div><div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">{['Hoodie', 'Cargo', 'Tee', 'Denim', 'Shirt'].map((term) => <button type="button" key={term} onClick={() => setQuery(term)} className="border border-black px-3 py-2 transition hover:bg-black hover:text-white">{term}</button>)}</div></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{products.slice(0, 8).map((product) => <ProductCard key={`s-${product.slug}`} product={product} onAdd={addToCart} wishlist={wishlist.includes(product.slug)} onWishlist={toggleWishlist} />)}</div></div></div>}

      {cartOpen && <div className="fixed inset-0 z-[55]"><button type="button" aria-label="Close bag" onClick={() => { setCartOpen(false); setPlacedOrder(null) }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f4f1eb] p-5 md:p-8">
        <div className="flex items-center justify-between border-b border-black/20 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Your bag</p><h2 className="mt-2 text-4xl font-black uppercase leading-[.8] tracking-[-.08em]">{cartCount ? `${cartCount} found` : 'Nothing found'}</h2></div><button type="button" onClick={() => { setCartOpen(false); setPlacedOrder(null) }}><X size={23} /></button></div>

        {placedOrder ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff2d2d] text-white"><Check size={26} /></div>
            <p className="mt-6 text-4xl font-black uppercase leading-[.85] tracking-[-.08em]">Order<br />placed.</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-black/50">#{placedOrder.id.slice(0, 8)} · {money(placedOrder.total)}</p>
            <p className="mt-6 max-w-xs text-[11px] leading-[1.6] text-black/60">You'll earn <b>+{placedOrder.pointsEarned} pts</b> once it's delivered. Track it in your account.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href={`/track/${placedOrder.id}`} className="bg-black px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#ff2d2d]">Track order ↗</Link>
              <Link href="/account" className="border-b border-black pb-1 text-[10px] font-bold uppercase tracking-[0.18em]">View orders ↗</Link>
            </div>
          </div>
        ) : cart.length ? (
          <>
            <div className="flex-1 overflow-auto py-5">
              {cart.map((item) => (
                <div key={`${item.slug}-${item.size}`} className="flex gap-3 border-b border-black/15 py-4">
                  <img src={item.image} alt={item.name} className="h-28 w-24 object-cover" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div><h3 className="text-[11px] font-bold uppercase tracking-[0.08em]">{item.name}</h3><p className="mt-1 text-[10px] uppercase text-black/50">Size {item.size} · {money(item.price)}</p></div>
                    <div className="flex items-center justify-between"><div className="flex items-center border border-black"><button onClick={() => changeQuantity(item, -1)} className="p-2"><Minus size={12} /></button><span className="w-6 text-center text-[10px]">{item.quantity}</span><button onClick={() => changeQuantity(item, 1)} className="p-2"><Plus size={12} /></button></div><span className="text-[11px] font-bold">{money(item.price * item.quantity)}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-black/15 py-3">
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="COUPON CODE" className="flex-1 border border-black bg-transparent px-3 py-2 text-[11px] font-bold tracking-widest outline-none placeholder:text-black/30" />
                <button onClick={applyCoupon} className="flex items-center gap-1 bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white"><Tag size={12} /> Apply</button>
              </div>
              {couponMsg && <p className={`mt-2 text-[10px] uppercase tracking-[0.14em] ${appliedCoupon ? 'text-[#ff2d2d]' : 'text-black/50'}`}>{couponMsg}</p>}
            </div>

            {/* Loyalty redeem */}
            {user && (user.loyaltyPoints || 0) >= 100 && (
              <div className="border-t border-black/15 py-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em]"><span>Loyal 404 pts</span><span>{user.loyaltyPoints} available</span></div>
                <div className="mt-2 flex gap-2">
                  <input type="number" min="0" step="100" max={user.loyaltyPoints} value={redeemPts} onChange={(e) => setRedeemPts(Number(e.target.value))} className="flex-1 border border-black bg-transparent px-3 py-2 text-[11px] font-bold outline-none" placeholder="Points to redeem" />
                  <button onClick={() => setRedeemPts(Math.min(user.loyaltyPoints, Math.floor(user.loyaltyPoints / 100) * 100))} className="border border-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Max</button>
                </div>
                {pointsUsable > 0 && <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#ff2d2d]">Redeem {pointsUsable} pts = −{money(pointsDiscount)}</p>}
              </div>
            )}

            <div className="border-t border-black pt-5">
              <div className="space-y-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-[#ff2d2d]"><span>Coupon {appliedCoupon?.code}</span><span>−{money(couponDiscount)}</span></div>}
                {pointsDiscount > 0 && <div className="flex justify-between text-[#ff2d2d]"><span>{pointsUsable} points</span><span>−{money(pointsDiscount)}</span></div>}
                <div className="flex justify-between border-t border-black/15 pt-2 text-lg"><span>Total</span><span>{money(cartTotal)}</span></div>
              </div>
              <button onClick={placeOrder} className="mt-5 flex w-full items-center justify-center gap-3 bg-black px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff2d2d]">{user ? <>Place order <ArrowRight size={15} /></> : <>Sign in to checkout <ArrowRight size={15} /></>}</button>
              <p className="mt-4 text-center text-[9px] uppercase tracking-[0.14em] text-black/45">Cash on delivery · Free shipping over ₹1,999</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center"><Sparkles size={30} strokeWidth={1} /><p className="mt-6 text-3xl font-black uppercase leading-[.82] tracking-[-.07em]">Nothing found here.</p><button onClick={() => setCartOpen(false)} className="mt-7 border-b border-black pb-2 text-[10px] font-bold uppercase tracking-[0.18em]">Continue shopping <ArrowRight className="inline" size={14} /></button></div>
        )}
      </aside></div>}
    </main>
  )
}

export default App
