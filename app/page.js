'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Heart, Instagram, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, X } from 'lucide-react'

const imageSet = [
  'https://images.unsplash.com/photo-1547066066-aff8d227ec11?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1700557477468-9b3d9db79663?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1700557477593-2d86947ff385?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1700557477726-23aba4f7c7da?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1508216310976-c518daae0cdc?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1649877705659-adf38e1f68f1?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1717674798312-d27a58153d07?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1493739993711-66f6621741bb?auto=format&fit=crop&w=1400&q=85',
]

const products = [
  { id: '404-tee', name: '404 Oversized Tee', category: 'Unisex', price: 1499, color: 'Washed Black', sizes: ['S', 'M', 'L', 'XL'], image: imageSet[1], hoverImage: imageSet[5], badge: 'Drop 01', rating: 4.9, reviews: 84 },
  { id: 'error-hoodie', name: 'Error Hoodie', category: 'Unisex', price: 2499, color: 'Charcoal', sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: imageSet[0], hoverImage: imageSet[6], badge: 'Most wanted', rating: 5, reviews: 128 },
  { id: 'not-found-cargo', name: 'Not Found Cargo', category: 'Men', price: 2999, color: 'Concrete', sizes: ['28', '30', '32', '34', '36'], image: imageSet[4], hoverImage: imageSet[2], badge: 'New', rating: 4.8, reviews: 56 },
  { id: 'zip-jacket', name: '404 Zip Jacket', category: 'Women', price: 3499, color: 'Ink', sizes: ['S', 'M', 'L', 'XL'], image: imageSet[3], hoverImage: imageSet[7], badge: 'Limited', rating: 4.7, reviews: 42 },
  { id: 'essential-tee', name: '404 Essential Tee', category: 'Women', price: 1299, color: 'Bone', sizes: ['XS', 'S', 'M', 'L'], image: imageSet[7], hoverImage: imageSet[1], badge: 'Everyday', rating: 4.8, reviews: 102 },
  { id: 'utility-jacket', name: 'Utility Jacket', category: 'Men', price: 3999, color: 'Black', sizes: ['M', 'L', 'XL'], image: imageSet[5], hoverImage: imageSet[4], badge: 'New', rating: 4.9, reviews: 38 },
  { id: '404-denim', name: '404 Wide Denim', category: 'Unisex', price: 2799, color: 'Raw Indigo', sizes: ['28', '30', '32', '34'], image: imageSet[2], hoverImage: imageSet[0], badge: 'Restocked', rating: 4.6, reviews: 74 },
  { id: 'error-cap', name: 'Error Cap', category: 'Unisex', price: 899, color: 'Washed Black', sizes: ['OS'], image: imageSet[6], hoverImage: imageSet[3], badge: 'Accessory', rating: 4.9, reviews: 31 },
]

const money = (amount) => `₹${amount.toLocaleString('en-IN')}`

const Marquee = ({ reverse = false, dark = true, children }) => (
  <div className={`overflow-hidden whitespace-nowrap border-y ${dark ? 'border-white/20 bg-black text-white' : 'border-black/15 bg-[#f4f1eb] text-black'}`}>
    <div className={`flex min-w-max gap-10 py-3 text-[10px] font-bold uppercase tracking-[0.25em] ${reverse ? 'marquee-reverse' : 'marquee'}`}>
      <span>{children} <b className="px-4 text-[#c9ff32]">✳</b> {children} <b className="px-4 text-[#c9ff32]">✳</b> {children} <b className="px-4 text-[#c9ff32]">✳</b></span>
      <span>{children} <b className="px-4 text-[#c9ff32]">✳</b> {children} <b className="px-4 text-[#c9ff32]">✳</b> {children}</span>
    </div>
  </div>
)

const ProductCard = ({ product, onAdd, onOpen, wishlist, onWishlist, index = 0 }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <article className={`group relative ${index % 4 === 1 ? 'md:translate-y-8' : ''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button type="button" onClick={() => onOpen(product)} className="relative block aspect-[3/4] w-full overflow-hidden bg-[#e2ded6] text-left">
        <img src={hovered ? product.hoverImage : product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black">{product.badge}</span>
        <span className="absolute bottom-3 left-3 flex translate-y-2 items-center gap-2 bg-[#c9ff32] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">View piece <ArrowUpRight /></span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] opacity-0 transition group-hover:opacity-100">Explore</span>
      </button>
      <div className="flex items-start justify-between gap-3 border-b border-black/15 py-3">
        <button type="button" onClick={() => onOpen(product)} className="text-left">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]">{product.name}</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/50">{product.color} · {product.category}</p>
          <p className="mt-2 text-[12px] font-bold">{money(product.price)}</p>
        </button>
        <div className="flex items-center gap-1">
          <button aria-label={`Add ${product.name} to wishlist`} type="button" onClick={() => onWishlist(product)} className={`p-1 transition ${wishlist ? 'text-red-600' : 'text-black/50 hover:text-black'}`}><Heart size={15} fill={wishlist ? 'currentColor' : 'none'} strokeWidth={1.5} /></button>
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
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [styleIndex, setStyleIndex] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(false)

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

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesQuery = !query || `${product.name} ${product.color}`.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  }), [activeCategory, query])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const styleProduct = products[styleIndex]

  const addToCart = (product, size = product.sizes?.[0] || 'M') => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size)
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { ...product, size, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const changeQuantity = (item, delta) => setCart((current) => current.map((entry) => entry === item ? { ...entry, quantity: Math.max(0, entry.quantity + delta) } : entry).filter((entry) => entry.quantity > 0))
  const toggleWishlist = (product) => setWishlist((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])
  const submitNewsletter = (event) => { event.preventDefault(); if (newsletterEmail.includes('@')) setNewsletterDone(true) }

  if (isLoading) {
    return (
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#191919] px-5 py-6 text-[#f4f1eb] selection:bg-[#c9ff32] selection:text-black">
        <style>{`@keyframes loaderScan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}@keyframes loaderNoise{0%,100%{opacity:.1}50%{opacity:.35}}`}</style>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#c9ff32]/10 to-transparent" style={{ animation: 'loaderScan 2.1s linear infinite' }} />
        <div className="relative z-10 flex items-start justify-between border-b border-white/20 pb-4 text-[9px] font-bold uppercase tracking-[0.22em]"><span>THE 404 STORE</span><span>Boot sequence / 001</span><span>{loaderProgress}%</span></div>
        <div className="relative z-10 flex flex-1 flex-col justify-center"><p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9ff32]">Error code: style not found</p><h1 className="text-[clamp(150px,34vw,520px)] font-black leading-[.65] tracking-[-.17em]">404<span className="text-[#c9ff32]">.</span></h1><div className="mt-12 max-w-xl"><div className="mb-3 flex justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-white/45"><span>Searching for the ordinary</span><span>{loaderProgress}/100</span></div><div className="h-1 w-full bg-white/15"><div className="h-full bg-[#c9ff32] transition-[width] duration-75" style={{ width: `${loaderProgress}%` }} /></div></div></div>
        <div className="relative z-10 flex items-end justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-white/40"><span>Nothing ordinary found</span><span className="hidden md:inline">Loading the unknown / Please wait</span><span>2026</span></div>
      </main>
    )
  }

  if (!hasEntered) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#f4f1eb] text-black selection:bg-[#c9ff32] selection:text-black">
        <style>{`@keyframes landingReveal{from{transform:scale(1.06);opacity:.4}to{transform:scale(1);opacity:1}}`}</style>
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-5 md:px-10 md:py-7">
          <div className="flex items-start justify-between border-b border-black/20 pb-4 text-[9px] font-bold uppercase tracking-[0.22em]"><span className="text-[16px] font-black leading-[.75] tracking-[-.1em]">THE<br />404<br />STORE</span><span className="hidden md:block">A new uniform for the uncertain</span><span>Entry / 404</span></div>
          <section className="relative flex flex-1 flex-col justify-center py-10 md:py-12">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(80px,18vw,260px)] font-black uppercase leading-[.7] tracking-[-.13em] text-black/[.06]">Not<br />found</div>
            <div className="relative grid items-center gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-16">
              <div className="order-2 md:order-1"><p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">Collection 01 / 2026</p><h1 className="max-w-xl text-[clamp(64px,10vw,150px)] font-black uppercase leading-[.74] tracking-[-.1em]">Page<br /><span className="ml-[12vw] text-[#a6c928]">not</span><br />found<span className="text-black">.</span></h1><p className="mt-8 max-w-[260px] text-[11px] leading-[1.6] text-black/55">You were looking for something ordinary. Good news: this isn't it.</p><button type="button" onClick={() => setHasEntered(true)} className="group mt-9 flex items-center gap-4 bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#c9ff32] hover:text-black">Enter the 404 <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button></div>
              <div className="relative order-1 h-[52vh] min-h-[420px] overflow-hidden bg-[#d8d2c8] md:order-2 md:h-[70vh]" style={{ animation: 'landingReveal 1.2s ease-out both' }}><img src={imageSet[3]} alt="The 404 Store campaign preview" className="h-full w-full object-cover grayscale mix-blend-multiply" /><div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" /><div className="absolute left-5 top-5 text-[9px] font-bold uppercase tracking-[0.22em] text-white">404 / Preview 001</div><div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white"><span className="max-w-[170px] text-[11px] uppercase leading-[1.25] tracking-[0.12em]">Style is a place you weren't meant to find.</span><span className="text-[9px] uppercase tracking-[0.18em]">Scroll ↘</span></div></div>
            </div>
          </section>
          <div className="flex justify-between border-t border-black/20 pt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-black/45"><span>Men / Women / Unisex</span><span>Style not found.</span><span>Enter at your own risk ↗</span></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1eb] text-black selection:bg-[#c9ff32] selection:text-black">
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes marqueeReverse{from{transform:translateX(-50%)}to{transform:translateX(0)}}.marquee{animation:marquee 28s linear infinite}.marquee-reverse{animation:marqueeReverse 28s linear infinite}@keyframes glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}}.glitch:hover{animation:glitch .3s steps(2) infinite}`}</style>

      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3 md:px-8">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between border-b border-black/20 bg-[#f4f1eb]/90 px-1 pb-3 backdrop-blur-md">
          <a href="#top" className="font-black text-[17px] leading-[.8] tracking-[-.08em]">THE<br />404<br />STORE</a>
          <div className="hidden items-center gap-7 text-[10px] font-bold uppercase tracking-[0.18em] md:flex">
            {['Men', 'Women', 'Unisex', 'New drop', 'Sale'].map((item) => <button key={item} type="button" onClick={() => setActiveCategory(item === 'New drop' || item === 'Sale' ? 'All' : item)} className="transition hover:text-[#799200]">{item}</button>)}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em]">
            <button type="button" onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 md:flex"><Search size={14} /> Search</button>
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="md:hidden"><Search size={17} /></button>
            <button type="button" className="hidden md:block">Account</button>
            <button type="button" onClick={() => setCartOpen(true)} className="flex items-center gap-1"><ShoppingBag size={15} /> <span className="hidden md:inline">Bag</span> ({cartCount})</button>
            <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="md:hidden"><Menu size={19} /></button>
          </div>
        </nav>
      </header>

      <section id="top" className="relative grid min-h-[760px] grid-cols-1 bg-[#191919] text-white md:min-h-[840px] md:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex flex-col justify-end px-6 pb-12 pt-32 md:px-12 md:pb-20">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9ff32]">The 404 store / collection 01 / 2026</p>
          <h1 className="max-w-[720px] text-[clamp(68px,13vw,190px)] font-black uppercase leading-[.76] tracking-[-.1em]">Style<br /><span className="ml-[12vw] text-[#f4f1eb]">not</span><br />found<span className="text-[#c9ff32]">.</span></h1>
          <div className="mt-12 flex items-end justify-between gap-8 md:max-w-xl"><p className="max-w-[220px] text-[11px] leading-[1.6] text-white/60">Clothes for people who don't dress to fit in. Drop one is online now.</p><a href="#drop" className="flex items-center gap-2 border-b border-[#c9ff32] pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9ff32]">Shop new drop <ArrowDownRight size={15} /></a></div>
        </div>
        <div className="relative min-h-[480px] overflow-hidden md:min-h-0">
          <img src={imageSet[0]} alt="Model in a dark oversized streetwear look" className="h-full w-full object-cover grayscale transition duration-1000 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="absolute right-5 top-32 flex flex-col gap-2 text-right text-[9px] uppercase tracking-[0.2em] text-white/60 md:right-10"><span>Drop 01</span><span>01 — 08</span></div>
          <div className="absolute bottom-7 right-6 max-w-[150px] text-right text-[10px] leading-[1.5] text-white/70 md:right-10">A uniform for the uncertain. <span className="text-[#c9ff32]">Designed in India.</span></div>
        </div>
        <div className="absolute bottom-5 left-6 flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/50 md:left-12"><span className="h-8 w-px bg-[#c9ff32]" /> Scroll to explore</div>
      </section>

      <Marquee>THE 404 STORE · NEW DROP · STYLE NOT FOUND · NOTHING ORDINARY</Marquee>

      <section className="container mx-auto px-5 py-24 md:px-10 md:py-36">
        <div className="mb-10 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Find your frequency / 01</p><h2 className="text-5xl font-black uppercase leading-[.82] tracking-[-.08em] md:text-8xl">Shop<br /><span className="ml-16 text-[#a6c928]">the unknown</span></h2></div><ArrowDownRight className="hidden md:block" size={50} strokeWidth={1} /></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">
          <button type="button" onClick={() => setActiveCategory('Men')} className="group relative h-[480px] overflow-hidden text-left md:col-span-5 md:h-[620px]"><img src={imageSet[4]} alt="Men's streetwear edit" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/0" /><span className="absolute bottom-5 left-5 text-5xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3 md:text-7xl">Men <ArrowRight className="inline" size={45} /></span></button>
          <div className="grid gap-3 md:col-span-7 md:grid-cols-2"><button type="button" onClick={() => setActiveCategory('Women')} className="group relative h-[370px] overflow-hidden text-left md:h-[420px]"><img src={imageSet[7]} alt="Women's fashion edit" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-5 left-5 text-5xl font-black uppercase tracking-[-.08em] text-white transition group-hover:translate-x-3">Women <ArrowRight className="inline" size={35} /></span></button><button type="button" onClick={() => setActiveCategory('Unisex')} className="group relative mt-0 h-[370px] overflow-hidden bg-[#c9ff32] text-left md:mt-20 md:h-[420px]"><img src={imageSet[2]} alt="Unisex fashion edit" className="h-full w-full object-cover mix-blend-multiply grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-5 left-5 text-5xl font-black uppercase tracking-[-.08em] text-black transition group-hover:translate-x-3">Unisex <ArrowRight className="inline" size={35} /></span></button></div>
        </div>
      </section>

      <section id="drop" className="border-t border-black/15 px-5 py-24 md:px-10 md:py-32">
        <div className="container mx-auto"><div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Just landed / Drop 01</p><h2 className="text-6xl font-black uppercase leading-[.78] tracking-[-.09em] md:text-[130px]">New<br /><span className="ml-12 text-[#a6c928]">drop</span></h2></div><div className="max-w-[220px] text-[11px] uppercase leading-[1.5] tracking-[0.08em] text-black/55">Nothing basic. Heavyweight essentials and strange little details.</div></div>
          <div className="mb-8 flex items-center gap-2 overflow-auto border-b border-black/15 pb-3 text-[10px] font-bold uppercase tracking-[0.18em]"><span className="mr-3 text-black/40">Filter</span>{['All', 'Men', 'Women', 'Unisex'].map((category) => <button type="button" key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap px-3 py-2 transition ${activeCategory === category ? 'bg-black text-white' : 'hover:bg-black/10'}`}>{category}</button>)}<button type="button" onClick={() => setSearchOpen(true)} className="ml-auto flex items-center gap-2 whitespace-nowrap"><Search size={13} /> Search {query ? `(${query})` : ''}</button></div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{filteredProducts.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={addToCart} onOpen={(item) => { setSelectedProduct(item); setSelectedSize(item.sizes[0]) }} wishlist={wishlist.includes(product.id)} onWishlist={toggleWishlist} />)}</div>
          {!filteredProducts.length && <p className="col-span-full py-10 text-center text-sm uppercase tracking-[0.16em] text-black/50">No pieces found. Try another signal.</p>}
        </div>
      </section>

      <section className="relative min-h-[760px] overflow-hidden bg-[#d6d0c7] md:min-h-[880px]"><img src={imageSet[5]} alt="Editorial 404 campaign" className="absolute inset-0 h-full w-full object-cover grayscale mix-blend-multiply" /><div className="absolute inset-0 bg-[#f4f1eb]/30" /><div className="relative z-10 flex min-h-[760px] flex-col justify-between p-6 md:min-h-[880px] md:p-12"><div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.22em]"><span>Editorial / 004</span><span>Read the story ↗</span></div><div><h2 className="glitch text-[clamp(80px,17vw,250px)] font-black uppercase leading-[.72] tracking-[-.11em]">The<br /><span className="ml-[16vw]">new</span><br />normal<span className="text-[#a6c928]">.</span></h2><div className="mt-10 flex max-w-2xl flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-[340px] text-[12px] leading-[1.6]">Clothes designed for people who don't dress to fit in. We explore everyday silhouettes through unexpected proportions, textures and attitude.</p><button type="button" className="flex items-center gap-2 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Read the story <ArrowRight size={16} /></button></div></div></div></section>

      <section className="container mx-auto px-5 py-24 md:px-10 md:py-36"><div className="mb-12 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">The pieces that stay / 02</p><h2 className="text-6xl font-black uppercase leading-[.8] tracking-[-.09em] md:text-[120px]">Most<br /><span className="ml-12">wanted</span></h2></div><span className="hidden text-[10px] uppercase tracking-[0.2em] md:block">08 / 08 pieces</span></div><div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-5">{products.slice(4).concat(products.slice(0, 2)).map((product, index) => <ProductCard key={`${product.id}-${index}`} product={product} index={index + 1} onAdd={addToCart} onOpen={(item) => { setSelectedProduct(item); setSelectedSize(item.sizes[0]) }} wishlist={wishlist.includes(product.id)} onWishlist={toggleWishlist} />)}</div></section>

      <section className="bg-black px-5 py-24 text-white md:px-10 md:py-40"><div className="container mx-auto"><div className="flex flex-col justify-between gap-12 md:flex-row"><div><p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9ff32]">A secret section / 404</p><h2 className="glitch text-[clamp(150px,32vw,480px)] font-black leading-[.65] tracking-[-.16em] text-[#f4f1eb]">404</h2></div><div className="max-w-[320px] self-end"><p className="mb-7 text-3xl font-bold uppercase leading-[.9] tracking-[-.05em]">You weren't supposed to find this.</p><p className="mb-8 text-sm leading-[1.6] text-white/50">But since you did, you might as well look around. There is always something hiding in plain sight.</p><button type="button" onClick={() => document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-3 bg-[#c9ff32] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black">Enter the 404 <ArrowRight size={15} /></button></div></div></div></section>

      <section className="container mx-auto px-5 py-24 md:px-10 md:py-36"><div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Play with it / 03</p><h2 className="text-6xl font-black uppercase leading-[.78] tracking-[-.09em] md:text-[120px]">404<br /><span className="ml-12 text-[#a6c928]">style lab</span></h2></div><p className="max-w-[230px] text-[11px] uppercase leading-[1.5] tracking-[0.08em] text-black/55">Build a fit that looks like you found it by accident.</p></div><div className="grid gap-0 border-y border-black md:grid-cols-[1fr_1.3fr]"><div className="flex flex-col justify-between border-b border-black p-5 md:border-b-0 md:border-r md:p-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">Current selection / 01</p><h3 className="mt-6 text-4xl font-black uppercase leading-[.85] tracking-[-.08em]">{styleProduct.name}</h3><p className="mt-3 text-sm text-black/60">{styleProduct.color} / {money(styleProduct.price)}</p></div><div className="mt-12"><div className="mb-4 flex justify-between text-[10px] font-bold uppercase tracking-[0.16em]"><span>Top</span><span>01 / 04</span></div><div className="flex gap-2">{['Top', 'Bottom', 'Outerwear', 'Accessory'].map((label, index) => <button key={label} type="button" onClick={() => setStyleIndex((index + styleIndex + 1) % products.length)} className="flex-1 border border-black px-2 py-3 text-[9px] font-bold uppercase tracking-[0.08em] transition hover:bg-black hover:text-white">{label}</button>)}</div></div></div><div className="relative h-[500px] overflow-hidden bg-[#d8d2c8] md:h-[610px]"><img src={styleProduct.image} alt="404 style lab look" className="h-full w-full object-cover grayscale mix-blend-multiply transition duration-500" /><div className="absolute bottom-5 left-5 right-5 flex items-center justify-between"><span className="bg-[#c9ff32] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em]">Build your fit</span><button type="button" onClick={() => setStyleIndex((styleIndex + 1) % products.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"><ArrowRight size={16} /></button></div></div></div></section>

      <Marquee reverse dark={false}>SEEN OUTSIDE THE 404 · #404STORE · TAG YOUR UNKNOWN</Marquee>
      <section className="container mx-auto px-5 py-24 md:px-10 md:py-32"><div className="mb-10 flex items-end justify-between"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Out there / 04</p><h2 className="text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-8xl">Seen outside<br /><span className="ml-16 text-[#a6c928]">the 404</span></h2></div><Instagram className="mb-2" size={30} strokeWidth={1} /></div><div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3"><a href="#drop" className="group relative aspect-[.8] overflow-hidden md:row-span-2 md:aspect-auto"><img src={imageSet[6]} alt="404 community street style" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#c9ff32] px-2 py-1 text-[9px] font-bold uppercase opacity-0 transition group-hover:opacity-100">View ↗</span></a><a href="#drop" className="group relative aspect-square overflow-hidden"><img src={imageSet[3]} alt="404 campaign detail" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#c9ff32] px-2 py-1 text-[9px] font-bold uppercase opacity-0 transition group-hover:opacity-100">View ↗</span></a><a href="#drop" className="group relative aspect-square overflow-hidden"><img src={imageSet[1]} alt="404 street style portrait" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#c9ff32] px-2 py-1 text-[9px] font-bold uppercase opacity-0 transition group-hover:opacity-100">View ↗</span></a><a href="#drop" className="group relative aspect-square overflow-hidden"><img src={imageSet[4]} alt="404 fashion closeup" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#c9ff32] px-2 py-1 text-[9px] font-bold uppercase opacity-0 transition group-hover:opacity-100">View ↗</span></a><a href="#drop" className="group relative aspect-square overflow-hidden"><img src={imageSet[0]} alt="404 urban look" className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 bg-[#c9ff32] px-2 py-1 text-[9px] font-bold uppercase opacity-0 transition group-hover:opacity-100">View ↗</span></a></div></section>

      <section className="border-y border-black bg-[#c9ff32] px-5 py-20 md:px-10 md:py-28"><div className="container mx-auto flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]">Don't get lost / Stay found</p><h2 className="max-w-4xl text-6xl font-black uppercase leading-[.75] tracking-[-.1em] md:text-[130px]">Don't<br /><span className="ml-14">get lost.</span></h2></div><form onSubmit={submitNewsletter} className="w-full max-w-sm"><p className="mb-5 text-[11px] leading-[1.5]">Get first access to drops, limited pieces and things that shouldn't exist.</p><div className="flex border-b border-black py-3"><input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} type="email" placeholder="YOUR EMAIL" className="min-w-0 flex-1 bg-transparent text-[11px] font-bold uppercase tracking-[0.18em] outline-none placeholder:text-black/50" /><button type="submit" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">{newsletterDone ? <><Check size={14} /> Joined</> : <>Join 404 <ArrowRight size={14} /></>}</button></div></form></div></section>

      <footer className="bg-black px-5 py-16 text-white md:px-10 md:py-24"><div className="container mx-auto"><div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><div className="text-5xl font-black leading-[.72] tracking-[-.1em]">THE<br />404<br />STORE</div><p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-white/50">Style not found.</p></div><div><h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9ff32]">Shop</h4>{['All products', 'Men', 'Women', 'Unisex', 'New drop', 'Sale'].map((item) => <a key={item} href="#drop" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item}</a>)}</div><div><h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9ff32]">Help</h4>{['Contact', 'Shipping', 'Returns', 'Size guide', 'FAQ'].map((item) => <a key={item} href="#top" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item}</a>)}</div><div><h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9ff32]">Follow</h4>{['Instagram', 'YouTube', 'Pinterest', 'TikTok'].map((item) => <a key={item} href="#social" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{item}</a>)}</div></div><div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row"><span>© 2026 The 404 Store</span><span>Privacy · Terms · Refund policy</span><span>Made for the not found</span></div></div></footer>

      {menuOpen && <div className="fixed inset-0 z-50 flex flex-col bg-[#c9ff32] p-6 text-black md:hidden"><div className="flex items-center justify-between"><span className="text-[17px] font-black leading-[.8] tracking-[-.08em]">THE<br />404<br />STORE</span><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={24} /></button></div><div className="mt-24 flex flex-col gap-5 text-5xl font-black uppercase leading-[.78] tracking-[-.08em]">{['Men', 'Women', 'Unisex', 'New drop', 'Sale'].map((item) => <button type="button" key={item} className="text-left" onClick={() => { setActiveCategory(item === 'New drop' || item === 'Sale' ? 'All' : item); setMenuOpen(false); document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' }) }}>{item} <ArrowUpRight className="inline" size={28} /></button>)}</div><p className="mt-auto text-[10px] font-bold uppercase tracking-[0.2em]">Style not found.</p></div>}

      {searchOpen && <div className="fixed inset-0 z-50 overflow-auto bg-[#f4f1eb] p-5 md:p-10"><div className="mx-auto max-w-[1440px]"><div className="flex items-center justify-between border-b border-black pb-5"><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Search / 404</span><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={23} /></button></div><div className="py-16 md:py-24"><label htmlFor="search" className="mb-4 block text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">What are you looking for?</label><div className="flex items-center border-b-2 border-black pb-4"><input id="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TYPE TO SEARCH" className="w-full bg-transparent text-4xl font-black uppercase tracking-[-.07em] outline-none placeholder:text-black/15 md:text-8xl" /><Search size={30} /></div><div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">{['Hoodies', 'Cargos', 'Oversized tee', 'Jackets'].map((term) => <button type="button" key={term} onClick={() => setQuery(term)} className="border border-black px-3 py-2 transition hover:bg-black hover:text-white">{term}</button>)}</div></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{filteredProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} onOpen={(item) => { setSelectedProduct(item); setSelectedSize(item.sizes[0]); setSearchOpen(false) }} wishlist={wishlist.includes(product.id)} onWishlist={toggleWishlist} />)}</div></div></div>}

      {cartOpen && <div className="fixed inset-0 z-50"><button type="button" aria-label="Close bag" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f4f1eb] p-5 md:p-8"><div className="flex items-center justify-between border-b border-black/20 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Your bag</p><h2 className="mt-2 text-4xl font-black uppercase leading-[.8] tracking-[-.08em]">{cartCount ? `${cartCount} found` : 'Nothing found'}</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={23} /></button></div>{cart.length ? <><div className="flex-1 overflow-auto py-5">{cart.map((item) => <div key={`${item.id}-${item.size}`} className="flex gap-3 border-b border-black/15 py-4"><img src={item.image} alt={item.name} className="h-28 w-24 object-cover grayscale" /><div className="flex flex-1 flex-col justify-between"><div><h3 className="text-[11px] font-bold uppercase tracking-[0.08em]">{item.name}</h3><p className="mt-1 text-[10px] uppercase text-black/50">Size {item.size} · {money(item.price)}</p></div><div className="flex items-center justify-between"><div className="flex items-center border border-black"><button type="button" onClick={() => changeQuantity(item, -1)} className="p-2"><Minus size={12} /></button><span className="w-6 text-center text-[10px]">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item, 1)} className="p-2"><Plus size={12} /></button></div><span className="text-[11px] font-bold">{money(item.price * item.quantity)}</span></div></div></div>)}</div><div className="border-t border-black pt-5"><div className="mb-5 flex justify-between text-[11px] font-bold uppercase tracking-[0.15em]"><span>Subtotal</span><span>{money(cartTotal)}</span></div><button type="button" className="flex w-full items-center justify-center gap-3 bg-black px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Checkout <ArrowRight size={15} /></button><p className="mt-4 text-center text-[9px] uppercase tracking-[0.14em] text-black/45">Taxes and shipping calculated at checkout</p></div></> : <div className="flex flex-1 flex-col items-center justify-center text-center"><Sparkles size={30} strokeWidth={1} /><p className="mt-6 text-3xl font-black uppercase leading-[.82] tracking-[-.07em]">Nothing found here.</p><button type="button" onClick={() => setCartOpen(false)} className="mt-7 border-b border-black pb-2 text-[10px] font-bold uppercase tracking-[0.18em]">Continue shopping <ArrowRight className="inline" size={14} /></button></div>}</aside></div>}

      {selectedProduct && <div className="fixed inset-0 z-50 overflow-auto"><button type="button" aria-label="Close product" onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="relative mx-auto my-8 grid min-h-[calc(100vh-4rem)] max-w-5xl bg-[#f4f1eb] md:grid-cols-2"><button type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product" className="absolute right-4 top-4 z-10 bg-white p-2"><X size={19} /></button><div className="min-h-[480px] bg-[#d8d2c8]"><img src={selectedProduct.image} alt={selectedProduct.name} className="h-full min-h-[480px] w-full object-cover grayscale" /></div><div className="flex flex-col justify-between p-6 md:p-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">{selectedProduct.badge} · {selectedProduct.category}</p><h2 className="mt-5 max-w-sm text-5xl font-black uppercase leading-[.8] tracking-[-.08em]">{selectedProduct.name}</h2><p className="mt-5 text-lg font-bold">{money(selectedProduct.price)}</p><p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-black/50">★★★★★ {selectedProduct.rating} / {selectedProduct.reviews} reviews</p><p className="mt-10 max-w-sm text-sm leading-[1.6] text-black/65">Heavyweight everyday form with relaxed proportions, brushed texture and a clean 404 identity. Designed to be worn wrong in all the right ways.</p><div className="mt-10"><div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em]"><span>Select size</span><span>Size guide ↗</span></div><div className="grid grid-cols-5 gap-2">{selectedProduct.sizes.map((size) => <button type="button" key={size} onClick={() => setSelectedSize(size)} className={`border py-3 text-[10px] font-bold ${selectedSize === size ? 'border-black bg-black text-white' : 'border-black/30'}`}>{size}</button>)}</div></div></div><div className="mt-10 flex gap-2"><button type="button" onClick={() => { addToCart(selectedProduct, selectedSize); setSelectedProduct(null) }} className="flex flex-1 items-center justify-center gap-2 bg-black py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Add to bag <ShoppingBag size={14} /></button><button type="button" onClick={() => toggleWishlist(selectedProduct)} className={`border border-black px-4 ${wishlist.includes(selectedProduct.id) ? 'bg-[#c9ff32]' : ''}`} aria-label="Wishlist"><Heart size={17} fill={wishlist.includes(selectedProduct.id) ? 'currentColor' : 'none'} /></button></div></div></div></div>}
    </main>
  )
}

export default App