'use client'

import { Instagram, ArrowRight, Sparkles, Menu, X, ShoppingBag, Heart, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getStoredUser } from '@/lib/session'

const NAV = ['Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale', 'About']

const TEAM = [
  {
    name: 'Somnath',
    instagram: '_somnath2_',
    instagramUrl: 'https://www.instagram.com/_somnath2_/',
    role: 'Founder & Creative Director',
    bio: 'The visionary behind the 404 aesthetic. Creating style that defies convention.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somnath&backgroundColor=f4f1eb'
  },
  {
    name: 'Sudip',
    instagram: 'suddiixz',
    instagramUrl: 'https://www.instagram.com/suddiixz/',
    role: 'Head of Operations',
    bio: 'Ensuring the unknown stays accessible. Managing the chaos of the 404.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudip&backgroundColor=f4f1eb'
  },
  {
    name: 'Sohaib',
    instagram: 'sohaibians_sw',
    instagramUrl: 'https://www.instagram.com/sohaibians_sw/',
    role: 'Digital Strategist',
    bio: 'Connecting the dots in the digital void. Making the 404 visible everywhere.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sohaib&backgroundColor=f4f1eb'
  }
]

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getStoredUser())
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (item) => {
    if (item === 'About') {
      window.location.href = '/about'
    } else {
      window.location.href = `/?cat=${item}`
    }
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb]">
      {/* Custom Navigation */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#f4f1eb]/95 backdrop-blur-md py-2 shadow-[0_1px_0_rgba(0,0,0,0.15)]' : 'bg-gradient-to-b from-black/50 via-black/25 to-transparent py-3 md:py-4'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 md:px-10">
          <Link href="/" className={`font-black leading-[.78] tracking-[-.09em] transition-all ${scrolled ? 'text-[18px] text-black md:text-[22px]' : 'text-[20px] text-white md:text-[38px]'}`}>THE<br />404<br />STORE</Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {NAV.map((item) => (
              <button key={item} type="button" onClick={() => handleNav(item)} className="relative text-[13px] font-black uppercase tracking-[0.14em] transition hover:text-[#ff2d2d]">
                {item === 'Newdrop' ? 'New Drop' : item}
              </button>
            ))}
          </nav>
          <div className={`flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.14em] md:gap-5 ${scrolled ? 'text-black' : 'text-white md:text-black'}`}>
            <button type="button" onClick={() => window.location.href = '/'} className="hidden items-center gap-2 md:flex hover:text-[#ff2d2d] transition"><Search size={16} /> Search</button>
            <button type="button" onClick={() => window.location.href = '/'} className="md:hidden p-2"><Search size={20} /></button>
            <Link href="/wishlist" className="flex items-center gap-1 hover:text-[#ff2d2d] transition p-2 md:p-0" aria-label="Wishlist"><Heart size={18} /></Link>
            <button type="button" onClick={() => window.location.href = '/'} className="flex items-center gap-1.5 hover:text-[#ff2d2d] transition p-2 md:p-0"><ShoppingBag size={19} /></button>
            <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="md:hidden p-2"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#ff2d2d] p-6 text-white md:hidden">
          <div className="flex items-center justify-between">
            <span className="text-[22px] font-black leading-[.8] tracking-[-.08em]">THE<br />404<br />STORE</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close"><X size={24} /></button>
          </div>
          <div className="mt-16 flex flex-col gap-4 text-4xl font-black uppercase leading-[.85] tracking-[-.08em]">
            {NAV.map((item) => (
              <button key={item} type="button" className="text-left" onClick={() => handleNav(item)}>{item === 'Newdrop' ? 'New Drop' : item}</button>
            ))}
            <div className="mt-4 h-px w-full bg-white/30" />
            <Link onClick={() => setMenuOpen(false)} href="/wishlist" className="text-2xl">Wishlist</Link>
            {user ? (
              <Link onClick={() => setMenuOpen(false)} href="/account" className="text-2xl">Account</Link>
            ) : (
              <Link onClick={() => setMenuOpen(false)} href="/auth" className="text-2xl">Sign in / Create</Link>
            )}
          </div>
          <p className="mt-auto text-[10px] font-bold uppercase tracking-[0.2em]">Style not found.</p>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="border-b border-black px-5 py-20 md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">The story / 01</p>
            <h1 className="text-6xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-9xl">
              About<br /><span className="text-[#ff2d2d]">the 404</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[12px] leading-[1.6] uppercase tracking-[0.12em] text-black/60 md:text-[14px]">
              We are the ones who found style in the places where nothing was supposed to exist. 
              The 404 Store represents the uncharted, the unconventional, the perfectly imperfect.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="border-b border-black px-5 py-20 md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">Our mission / 02</p>
              <h2 className="text-4xl font-black uppercase leading-[.85] tracking-[-.08em] md:text-6xl">
                Style not<br /><span className="text-[#ff2d2d]">found.</span>
              </h2>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[12px] leading-[1.8] uppercase tracking-[0.12em] text-black/70 md:text-[14px]">
                We believe fashion shouldn't follow rules. It should break them, rewrite them, 
                and sometimes ignore them completely. The 404 Store is for those who understand 
                that the best style is the one that wasn't supposed to work, but does.
              </p>
              <p className="mt-6 text-[12px] leading-[1.8] uppercase tracking-[0.12em] text-black/70 md:text-[14px]">
                Every piece in our collection tells a story of exploration. We curate items that 
                exist in the space between trends and timelessness, between minimal and maximal, 
                between found and lost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-b border-black px-5 py-20 md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">The team / 03</p>
            <h2 className="text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-8xl">
              Meet the<br /><span className="text-[#ff2d2d]">founders</span>
            </h2>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3">
            {TEAM.map((member, index) => (
              <div key={member.name} className="group">
                <div className="mb-6 aspect-square overflow-hidden bg-[#e2ded6]">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-[0.08em]">{member.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff2d2d]">{member.role}</p>
                  </div>
                  <p className="text-[11px] leading-[1.6] uppercase tracking-[0.1em] text-black/60">
                    {member.bio}
                  </p>
                  <a 
                    href={member.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black hover:text-[#ff2d2d] transition"
                  >
                    <Instagram size={14} /> @{member.instagram}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-b border-black px-5 py-20 md:px-10 md:py-32">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black/45">What we believe / 04</p>
            <h2 className="text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-8xl">
              The 404<br /><span className="text-[#ff2d2d]">code</span>
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-t-2 border-black pt-6">
              <div className="mb-4 text-[#ff2d2d]"><Sparkles size={24} /></div>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-[0.08em]">Unconventional</h3>
              <p className="text-[11px] leading-[1.6] uppercase tracking-[0.1em] text-black/60">
                We don't follow trends. We create moments that exist outside the expected.
              </p>
            </div>
            <div className="border-t-2 border-black pt-6">
              <div className="mb-4 text-[#ff2d2d]"><Sparkles size={24} /></div>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-[0.08em]">Authentic</h3>
              <p className="text-[11px] leading-[1.6] uppercase tracking-[0.1em] text-black/60">
                Every piece has a story. Every design has a purpose. No filler, no compromise.
              </p>
            </div>
            <div className="border-t-2 border-black pt-6">
              <div className="mb-4 text-[#ff2d2d]"><Sparkles size={24} /></div>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-[0.08em]">Limited</h3>
              <p className="text-[11px] leading-[1.6] uppercase tracking-[0.1em] text-black/60">
                Because the best things are the ones that don't last forever. scarcity by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#ff2d2d] px-5 py-20 text-white md:px-10 md:py-32">
        <div className="container mx-auto text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">Join the movement / 05</p>
          <h2 className="mb-8 text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-8xl">
            Ready to get<br /><span className="ml-6 md:ml-12">lost?</span>
          </h2>
          <Link 
            href="/"
            className="inline-flex items-center gap-3 border-2 border-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] transition hover:bg-white hover:text-[#ff2d2d]"
          >
            Explore the store <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
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
                <Link key={item} href={`/?cat=${item}`} className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">
                  {item === 'Newdrop' ? 'New Drop' : item}
                </Link>
              ))}
            </div>
            <div>
              <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Account</h4>
              <Link href="/account" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">My account</Link>
              <Link href="/wishlist" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">Wishlist</Link>
              <Link href="/auth/forgot" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">Forgot password</Link>
              <Link href="/about" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">About</Link>
            </div>
            <div>
              <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2d2d]">Follow</h4>
              <a href="https://www.instagram.com/the404store.india/" target="_blank" rel="noopener noreferrer" className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-white/65 hover:text-white">Instagram</a>
            </div>
          </div>
          <div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row">
            <span>© 2026 The 404 Store</span>
            <span>Privacy · Terms · Refund policy</span>
            <span>Made for the not found</span>
            <a href="https://digital-future-32.preview.emergentagent.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-[#ff2d2d] transition">Made by KYRO Digital 💙</a>
          </div>
        </div>
      </footer>
    </div>
  )
}