'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Heart, Instagram, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, X } from 'lucide-react'

const HERO_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/z86lx0kg_file_0000000091908211b979c011be24a43a.png'
const LANDING_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/u3ixlku2_file_00000000ac908211af2cb10fe70a1e09.png'
const EDITORIAL_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/deavzcwm_file_00000000a4c48211a4f3e355ddb9da99.png'
const CAT_MEN_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/7t5y1xpl_file_000000003f508211bff835467c511012.png'
const CAT_WMN_IMG = 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/uui4654j_file_00000000c1b88211bd75e52d376dca02.png'
const SOCIAL_IMGS = [
  'https://customer-assets-7cd3h4nn.emergentagent.net/job_0a5d31b0-fd6e-42cf-a4b8-cc9721891336/artifacts/05gqlsap_image.png',
  'https://customer-assets-7cd3h4nn.emergentagent.net/job_0a5d31b0-fd6e-42cf-a4b8-cc9721891336/artifacts/f2zyam6x_image.png',
  'https://customer-assets-7cd3h4nn.emergentagent.net/job_0a5d31b0-fd6e-42cf-a4b8-cc9721891336/artifacts/r8cg88al_image.png',
  'https://customer-assets-7cd3h4nn.emergentagent.net/job_0a5d31b0-fd6e-42cf-a4b8-cc9721891336/artifacts/ysqx5hkt_image.png',
]

const CATEGORIES = ['All', 'Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']
const money = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`

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
  const [isLoading, setIsLoading] = useState(true)
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [hasEntered, setHasEntered] = useState(false)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const startedAt = Date.now()
    const progressTimer = window.setInterval(() => {
      const progress = Math.min(100, Math.round(((Date.now() - startedAt) / 2100) * 100))
      setLoaderProgress(progress)
      if (progress >= 100) {
        window.clearInterval(progressTimer)
        window.setTimeout(() => setIsLoading(false), 260)
      }
    }, 40)
    return () => window.clearInterval(progressTimer)
  }, [])

  useEffect(() => {
    const savedCart = window.localStorage.getItem('404-cart')
    const savedWishlist = window.localStorage.getItem('404-wishlist')
    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
  }, [])

  useEffect(() => { window.localStorage.setItem('404-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { window.localStorage.setItem('404-wishlist', JSON.stringify(wishlist)) }, [wishlist])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!hasEntered) return
    const url = new URL('/api/products', window.location.origin)
    if (activeCategory && activeCategory !== 'All') url.searchParams.set('category', activeCategory)
    if (query) url.searchParams.set('q', query)
    fetch(url.toString()).then((r) => r.json()).then((data) => setProducts(data.products || [])).catch(() => {})
  }, [hasEntered, activeCategory, query])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

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

  const submitNewsletter = async (event) => {
    event.preventDefault()
    if (!newsletterEmail.includes('@')) return
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newsletterEmail }) })
      setNewsletterDone(true)
    } catch { setNewsletterDone(true) }
  }

  const productsByCat = useMemo(() => {
    const grouped = {}
    for (const p of products) {
      grouped[p.category] = grouped[p.category] || []
      grouped[p.category].push(p)
    }
    return grouped
  }, [products])

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
              <div className="order-2 md:order-1"><p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">Collection 01 / 2026</p><h1 className="max-w-xl text-[clamp(64px,10vw,150px)] font-black uppercase leading-[.74] tracking-[-.1em]">Page<br /><span className="ml-[12vw] text-[#ff2d2d]">not</span><br />found<span className="text-black">.</span></h1><p className="mt-8 max-w-[260px] text-[11px] leading-[1.6] text-black/55">You were looking for something ordinary. Good news: this isn't it.</p><button type="button" onClick={() => setHasEntered(true)} className="group mt-9 flex items-center gap-4 bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff2d2d] hover:text-white">Enter the 404 <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button></div>
              <div className="relative order-1 h-[52vh] min-h-[420px] overflow-hidden bg-[#d8d2c8] md:order-2 md:h-[70vh]" style={{ animation: 'landingReveal 1.2s ease-out both' }}><img src={LANDING_IMG} alt="The 404 Store campaign preview" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/0" /><div className="absolute left-5 top-5 text-[9px] font-bold uppercase tracking-[0.22em] text-white">404 / Preview 001</div><div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white"><span className="max-w-[170px] text-[11px] uppercase leading-[1.25] tracking-[0.12em]">Style is a place you weren't meant to find.</span><span className="text-[9px] uppercase tracking-[0.18em]">Scroll ↘</span></div></div>
            </div>
          </section>
          <div className="flex justify-between border-t border-black/20 pt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-black/45"><span>Shirt / Tshirt / Jeans / Newdrop / Sale</span><span>Style not found.</span><span>Enter at your own risk ↗</span></div>
        </div>
      </main>
    )
  }

  const heroProducts = products.slice(0, 4)
  const mostWanted = products.slice(4, 12)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes marqueeReverse{from{transform:translateX(-50%)}to{transform:translateX(0)}}.marquee{animation:marquee 28s linear infinite}.marquee-reverse{animation:marqueeReverse 28s linear infinite}@keyframes glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}}.glitch:hover{animation:glitch .3s steps(2) infinite}`}</style>

      {/* NAVBAR — bigger, brutalist, sticky with shrink on scroll */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#f4f1eb]/95 backdrop-blur-md py-2 shadow-[0_1px_0_rgba(0,0,0,0.15)]' : 'bg-transparent py-4'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 md:px-10">
          <Link href="/" className={`font-black leading-[.78] tracking-[-.09em] transition-all ${scrolled ? 'text-[22px]' : 'text-[30px] md:text-[38px]'}`}>
            THE<br />404<br />STORE
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {CATEGORIES.filter((c) => c !== 'All').map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setActiveCategory(item); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }}
                className={`relative text-[13px] font-black uppercase tracking-[0.14em] transition ${activeCategory === item ? 'text-[#ff2d2d]' : 'hover:text-[#ff2d2d]'}`}
              >
                {item === 'Newdrop' ? 'New Drop' : item}
                {activeCategory === item && <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#ff2d2d]" />}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.14em] md:gap-5">
            <button type="button" onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 md:flex hover:text-[#ff2d2d] transition"><Search size={16} /> Search</button>
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="md:hidden"><Search size={18} /></button>
            <button type="button" className="hidden md:block hover:text-[#ff2d2d] transition">Account</button>
            <span className="hidden md:inline text-black/30">·</span>
            <span className="hidden md:inline text-[10px]">♡ {wishlist.length}</span>
            <button type="button" onClick={() => setCartOpen(true)} className="flex items-center gap-1.5 hover:text-[#ff2d2d] transition"><ShoppingBag size={17} /> <span className="hidden md:inline">Bag</span>({cartCount})</button>
            <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="md:hidden"><Menu size={22} /></button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative grid min-h-[820px] grid-cols-1 bg-[#0a0a0a] text-white md:min-h-[900px] md:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex flex-col justify-end px-6 pb-12 pt-40 md:px-12 md:pb-20">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">The 404 store / collection 01 / 2026</p>
          <h1 className="max-w-[720px] text-[clamp(68px,13vw,190px)] font-black uppercase leading-[.76] tracking-[-.1em]">Style<br /><span className="ml-[12vw] text-[#f4f1eb]">not</span><br />found<span className="text-[#ff2d2d]">.</span></h1>
          <div className="mt-12 flex items-end justify-between gap-8 md:max-w-xl"><p className="max-w-[220px] text-[11px] leading-[1.6] text-white/60">Clothes for people who don't dress to fit in. Drop one is online now.</p><a href="#drop" className="flex items-center gap-2 border-b border-[#ff2d2d] pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff2d2d]">Shop new drop <ArrowDownRight size={15} /></a></div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden md:min-h-0">
          <img src={HERO_IMG} alt="The 404 Store campaign" className="h-full w-full object-cover transition duration-1000 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="absolute right-5 top-40 flex flex-col gap-2 text-right text-[9px] uppercase tracking-[0.2em] text-white/60 md:right-10"><span>Drop 01</span><span>01 — 15</span></div>
          <div className="absolute bottom-7 right-6 max-w-[150px] text-right text-[10px] leading-[1.5] text-white/70 md:right-10">A uniform for the uncertain. <span className="text-[#ff2d2d]">Designed in India.</span></div>
        </div>
        <div className="absolute bottom-5 left-6 flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/50 md:left-12"><span className="h-8 w-px bg-[#ff2d2d]" /> Scroll to explore</div>
      </section>

      <Marquee>THE 404 STORE · NEW DROP · STYLE NOT FOUND · NOTHING ORDINARY</Marquee>

      {/* CATEGORY SHOWCASE */}
      <section className="container mx-auto px-5 py-24 md:px-10 md:py-36">
        <div className="mb-10 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Find your frequency / 01</p><h2 className="text-5xl font-black uppercase leading-[.82] tracking-[-.08em] md:text-8xl">Shop<br /><span className="ml-16 text-[#ff2d2d]">the unknown</span></h2></div><ArrowDownRight className="hidden md:block" size={50} strokeWidth={1} /></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">
          <button type="button" onClick={() => { setActiveCategory('Shirt'); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative h-[480px] overflow-hidden text-left md:col-span-5 md:h-[620px]"><img src={CAT_MEN_IMG} alt="Shirts" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/0" /><span className="absolute bottom-5 left-5 text-5xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3 md:text-7xl">Shirt <ArrowRight className="inline" size={45} /></span></button>
          <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
            <button type="button" onClick={() => { setActiveCategory('Tshirt'); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative h-[370px] overflow-hidden text-left md:h-[420px]"><img src={CAT_WMN_IMG} alt="T-shirts" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-5 left-5 text-5xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3">Tshirt <ArrowRight className="inline" size={35} /></span></button>
            <button type="button" onClick={() => { setActiveCategory('Jeans'); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative mt-0 h-[370px] overflow-hidden bg-[#ff2d2d] text-left md:mt-20 md:h-[420px]"><img src={SOCIAL_IMGS[3]} alt="Jeans" className="h-full w-full object-cover mix-blend-multiply transition duration-700 group-hover:scale-105" /><span className="absolute bottom-5 left-5 text-5xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3">Jeans <ArrowRight className="inline" size={35} /></span></button>
          </div>
        </div>
      </section>

      {/* NEW DROP */}
      <section id="drop" className="border-t border-black/15 px-5 py-24 md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Just landed / Drop 01</p><h2 className="text-6xl font-black uppercase leading-[.78] tracking-[-.09em] md:text-[130px]">Shop<br /><span className="ml-12 text-[#ff2d2d]">everything</span></h2></div><div className="max-w-[220px] text-[11px] uppercase leading-[1.5] tracking-[0.08em] text-black/55">Nothing basic. Heavyweight essentials and strange little details.</div></div>
          <div className="mb-8 flex items-center gap-2 overflow-auto border-b border-black/15 pb-3 text-[10px] font-bold uppercase tracking-[0.18em]">
            <span className="mr-3 text-black/40">Filter</span>
            {CATEGORIES.map((category) => (
              <button type="button" key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap px-3 py-2 transition ${activeCategory === category ? 'bg-black text-white' : 'hover:bg-black/10'}`}>
                {category === 'Newdrop' ? 'New Drop' : category}
              </button>
            ))}
            <button type="button" onClick={() => setSearchOpen(true)} className="ml-auto flex items-center gap-2 whitespace-nowrap"><Search size={13} /> Search {query ? `(${query})` : ''}</button>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
            {products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} onAdd={addToCart} wishlist={wishlist.includes(product.slug)} onWishlist={toggleWishlist} />)}
          </div>
          {!products.length && <p className="py-16 text-center text-sm uppercase tracking-[0.16em] text-black/50">No pieces found. Try another signal.</p>}
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="relative min-h-[760px] overflow-hidden bg-[#0a0a0a] md:min-h-[880px]"><img src={EDITORIAL_IMG} alt="Editorial 404 campaign" className="absolute inset-0 h-full w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" /><div className="relative z-10 flex min-h-[760px] flex-col justify-between p-6 text-white md:min-h-[880px] md:p-12"><div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.22em]"><span>Editorial / 004</span><span>Read the story ↗</span></div><div><h2 className="glitch text-[clamp(80px,17vw,250px)] font-black uppercase leading-[.72] tracking-[-.11em]">The<br /><span className="ml-[16vw]">new</span><br />normal<span className="text-[#ff2d2d]">.</span></h2><div className="mt-10 flex max-w-2xl flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-[340px] text-[12px] leading-[1.6] text-white/80">Clothes designed for people who don't dress to fit in. We explore everyday silhouettes through unexpected proportions, textures and attitude.</p><button type="button" className="flex items-center gap-2 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Read the story <ArrowRight size={16} /></button></div></div></div></section>

      {/* 404 SECTION */}
      <section className="bg-black px-5 py-24 text-white md:px-10 md:py-40">
        <div className="container mx-auto">
          <div className="flex flex-col justify-between gap-12 md:flex-row">
            <div>
              <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">A secret section / 404</p>
              <h2 className="glitch text-[clamp(150px,32vw,480px)] font-black leading-[.65] tracking-[-.16em] text-[#f4f1eb]">404</h2>
            </div>
            <div className="max-w-[320px] self-end">
              <p className="mb-7 text-3xl font-bold uppercase leading-[.9] tracking-[-.05em]">You weren't supposed to find this.</p>
              <p className="mb-8 text-sm leading-[1.6] text-white/50">But since you did, you might as well look around. There is always something hiding in plain sight.</p>
              <button type="button" onClick={() => document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-3 bg-[#ff2d2d] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Enter the 404 <ArrowRight size={15} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* MOST WANTED */}
      {mostWanted.length > 0 && (
        <section className="container mx-auto px-5 py-24 md:px-10 md:py-36">
          <div className="mb-12 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">The pieces that stay / 02</p><h2 className="text-6xl font-black uppercase leading-[.8] tracking-[-.09em] md:text-[120px]">Most<br /><span className="ml-12">wanted</span></h2></div><span className="hidden text-[10px] uppercase tracking-[0.2em] md:block">{mostWanted.length} pieces</span></div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-5">{mostWanted.map((product, index) => <ProductCard key={`mw-${product.slug}`} product={product} index={index + 1} onAdd={addToCart} wishlist={wishlist.includes(product.slug)} onWishlist={toggleWishlist} />)}</div>
        </section>
      )}

      <Marquee reverse dark={false}>SEEN OUTSIDE THE 404 · #404STORE · TAG YOUR UNKNOWN</Marquee>

      {/* SOCIAL */}
      <section className="container mx-auto px-5 py-24 md:px-10 md:py-32">
        <div className="mb-10 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Out there / 04</p><h2 className="text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-8xl">Seen outside<br /><span className="ml-16 text-[#ff2d2d]">the 404</span></h2></div><Instagram className="mb-2" size={30} strokeWidth={1} /></div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          <a href="#drop" className="group relative aspect-[.8] overflow-hidden md:row-span-2 md:aspect-auto"><img src={SOCIAL_IMGS[0]} alt="404 street style" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#ff2d2d] px-2 py-1 text-[9px] font-bold uppercase text-white opacity-0 transition group-hover:opacity-100">View ↗</span></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={SOCIAL_IMGS[1]} alt="404 detail" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#ff2d2d] px-2 py-1 text-[9px] font-bold uppercase text-white opacity-0 transition group-hover:opacity-100">View ↗</span></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={SOCIAL_IMGS[2]} alt="404 portrait" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#ff2d2d] px-2 py-1 text-[9px] font-bold uppercase text-white opacity-0 transition group-hover:opacity-100">View ↗</span></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={SOCIAL_IMGS[3]} alt="404 closeup" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#ff2d2d] px-2 py-1 text-[9px] font-bold uppercase text-white opacity-0 transition group-hover:opacity-100">View ↗</span></a>
          <a href="#drop" className="group relative aspect-square overflow-hidden"><img src={EDITORIAL_IMG} alt="404 look" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#ff2d2d] px-2 py-1 text-[9px] font-bold uppercase text-white opacity-0 transition group-hover:opacity-100">View ↗</span></a>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-y border-black bg-[#ff2d2d] px-5 py-20 text-white md:px-10 md:py-28">
        <div className="container mx-auto flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]">Don't get lost / Stay found</p>
            <h2 className="max-w-4xl text-6xl font-black uppercase leading-[.75] tracking-[-.1em] md:text-[130px]">Don't<br /><span className="ml-14">get lost.</span></h2>
          </div>
          <form onSubmit={submitNewsletter} className="w-full max-w-sm">
            <p className="mb-5 text-[11px] leading-[1.5]">Get first access to drops, limited pieces and things that shouldn't exist.</p>
            <div className="flex border-b border-white py-3">
              <input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} type="email" placeholder="YOUR EMAIL" className="min-w-0 flex-1 bg-transparent text-[11px] font-bold uppercase tracking-[0.18em] outline-none placeholder:text-white/60" />
              <button type="submit" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">{newsletterDone ? <><Check size={14} /> Joined</> : <>Join 404 <ArrowRight size={14} /></>}</button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-5 py-16 text-white md:px-10 md:py-24">
        <div className="container mx-auto">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="text-5xl font-black leading-[.72] tracking-[-.1em]">THE<br />404<br />STORE</div>
              <p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-white/50">Style not found.</p>
            </div>
            <div>
              <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Shop</h4>
              {['All', 'Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale'].map((item) => (
                <button key={item} onClick={() => { setActiveCategory(item); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }} className="mb-3 block text-left text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item === 'Newdrop' ? 'New Drop' : item}</button>
              ))}
            </div>
            <div>
              <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Help</h4>
              {['Contact', 'Shipping', 'Returns', 'Size guide', 'FAQ'].map((item) => <a key={item} href="#top" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item}</a>)}
            </div>
            <div>
              <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Follow</h4>
              {['Instagram', 'YouTube', 'Pinterest', 'TikTok'].map((item) => <a key={item} href="#social" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item}</a>)}
            </div>
          </div>
          <div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row"><span>© 2026 The 404 Store</span><span>Privacy · Terms · Refund policy</span><span>Made for the not found</span></div>
        </div>
      </footer>

      {/* MOBILE MENU */}
      {menuOpen && <div className="fixed inset-0 z-50 flex flex-col bg-[#ff2d2d] p-6 text-white md:hidden"><div className="flex items-center justify-between"><span className="text-[22px] font-black leading-[.8] tracking-[-.08em]">THE<br />404<br />STORE</span><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={24} /></button></div><div className="mt-24 flex flex-col gap-5 text-5xl font-black uppercase leading-[.78] tracking-[-.08em]">{CATEGORIES.filter((c) => c !== 'All').map((item) => <button type="button" key={item} className="text-left" onClick={() => { setActiveCategory(item); setMenuOpen(false); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }}>{item === 'Newdrop' ? 'New Drop' : item} <ArrowUpRight className="inline" size={28} /></button>)}</div><p className="mt-auto text-[10px] font-bold uppercase tracking-[0.2em]">Style not found.</p></div>}

      {/* SEARCH */}
      {searchOpen && <div className="fixed inset-0 z-50 overflow-auto bg-[#f4f1eb] p-5 md:p-10"><div className="mx-auto max-w-[1440px]"><div className="flex items-center justify-between border-b border-black pb-5"><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Search / 404</span><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={23} /></button></div><div className="py-16 md:py-24"><label htmlFor="search" className="mb-4 block text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">What are you looking for?</label><div className="flex items-center border-b-2 border-black pb-4"><input id="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TYPE TO SEARCH" className="w-full bg-transparent text-4xl font-black uppercase tracking-[-.07em] outline-none placeholder:text-black/15 md:text-8xl" /><Search size={30} /></div><div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">{['Hoodie', 'Cargo', 'Tee', 'Denim', 'Shirt'].map((term) => <button type="button" key={term} onClick={() => setQuery(term)} className="border border-black px-3 py-2 transition hover:bg-black hover:text-white">{term}</button>)}</div></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{products.slice(0, 8).map((product) => <ProductCard key={`s-${product.slug}`} product={product} onAdd={addToCart} wishlist={wishlist.includes(product.slug)} onWishlist={toggleWishlist} />)}</div></div></div>}

      {/* CART DRAWER */}
      {cartOpen && <div className="fixed inset-0 z-50"><button type="button" aria-label="Close bag" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f4f1eb] p-5 md:p-8"><div className="flex items-center justify-between border-b border-black/20 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Your bag</p><h2 className="mt-2 text-4xl font-black uppercase leading-[.8] tracking-[-.08em]">{cartCount ? `${cartCount} found` : 'Nothing found'}</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={23} /></button></div>{cart.length ? <><div className="flex-1 overflow-auto py-5">{cart.map((item) => <div key={`${item.slug}-${item.size}`} className="flex gap-3 border-b border-black/15 py-4"><img src={item.image} alt={item.name} className="h-28 w-24 object-cover" /><div className="flex flex-1 flex-col justify-between"><div><h3 className="text-[11px] font-bold uppercase tracking-[0.08em]">{item.name}</h3><p className="mt-1 text-[10px] uppercase text-black/50">Size {item.size} · {money(item.price)}</p></div><div className="flex items-center justify-between"><div className="flex items-center border border-black"><button type="button" onClick={() => changeQuantity(item, -1)} className="p-2"><Minus size={12} /></button><span className="w-6 text-center text-[10px]">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item, 1)} className="p-2"><Plus size={12} /></button></div><span className="text-[11px] font-bold">{money(item.price * item.quantity)}</span></div></div></div>)}</div><div className="border-t border-black pt-5"><div className="mb-5 flex justify-between text-[11px] font-bold uppercase tracking-[0.15em]"><span>Subtotal</span><span>{money(cartTotal)}</span></div><button type="button" className="flex w-full items-center justify-center gap-3 bg-black px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff2d2d]">Checkout <ArrowRight size={15} /></button><p className="mt-4 text-center text-[9px] uppercase tracking-[0.14em] text-black/45">Taxes and shipping calculated at checkout</p></div></> : <div className="flex flex-1 flex-col items-center justify-center text-center"><Sparkles size={30} strokeWidth={1} /><p className="mt-6 text-3xl font-black uppercase leading-[.82] tracking-[-.07em]">Nothing found here.</p><button type="button" onClick={() => setCartOpen(false)} className="mt-7 border-b border-black pb-2 text-[10px] font-bold uppercase tracking-[0.18em]">Continue shopping <ArrowRight className="inline" size={14} /></button></div>}</aside></div>}
    </main>
  )
}

export default App
