'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, User, X, LogOut, Sparkles } from 'lucide-react'
import { getStoredUser, clearToken, clearStoredUser, authFetch } from '@/lib/session'

const NAV = ['Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']

export default function StoreNav({ activeCategory, onCategory, onSearch, onCart, cartCount = 0, wishlistCount = 0 }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    // refresh loyalty points on nav mount
    authFetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((d) => { if (d?.user) { setUser(d.user); window.localStorage.setItem('404-user', JSON.stringify(d.user)) } }).catch(() => {})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const doLogout = () => { clearToken(); clearStoredUser(); setUser(null); setShowProfile(false); if (window.location.pathname !== '/') window.location.href = '/' }

  const handleCat = (item) => {
    if (onCategory) onCategory(item)
    else window.location.href = `/#drop`
  }

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#f4f1eb]/95 backdrop-blur-md py-2 shadow-[0_1px_0_rgba(0,0,0,0.15)]' : 'bg-gradient-to-b from-black/50 via-black/25 to-transparent py-3 md:py-4'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 md:px-10">
          <Link href="/" className={`font-black leading-[.78] tracking-[-.09em] transition-all ${scrolled ? 'text-[18px] text-black md:text-[22px]' : 'text-[20px] text-white md:text-[38px]'}`}>THE<br />404<br />STORE</Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {NAV.map((item) => (
              <button key={item} type="button" onClick={() => handleCat(item)} className={`relative text-[13px] font-black uppercase tracking-[0.14em] transition ${activeCategory === item ? 'text-[#ff2d2d]' : 'hover:text-[#ff2d2d]'}`}>
                {item === 'Newdrop' ? 'New Drop' : item}
                {activeCategory === item && <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#ff2d2d]" />}
              </button>
            ))}
          </nav>
          <div className={`flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.14em] md:gap-5 ${scrolled ? 'text-black' : 'text-white md:text-black'}`}>
            <button type="button" onClick={() => (onSearch ? onSearch() : (window.location.href = '/'))} className="hidden items-center gap-2 md:flex hover:text-[#ff2d2d] transition"><Search size={16} /> Search</button>
            <button type="button" aria-label="Search" onClick={() => (onSearch ? onSearch() : (window.location.href = '/'))} className="md:hidden p-2"><Search size={20} /></button>

            {/* Profile */}
            <div className="relative hidden md:block">
              <button type="button" onClick={() => setShowProfile((v) => !v)} className="flex items-center gap-1.5 hover:text-[#ff2d2d] transition">
                <User size={16} /> {user ? user.name?.split(' ')[0] : 'Account'}
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-3 w-[260px] border border-black bg-[#f4f1eb] p-4 shadow-xl">
                  {user ? (
                    <div className="space-y-3">
                      <div className="border-b border-black/15 pb-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">Signed in as</p>
                        <p className="mt-1 text-sm font-bold">{user.name}</p>
                        <p className="text-[11px] text-black/60">{user.email}</p>
                      </div>
                      <div className="flex items-center justify-between bg-[#ff2d2d] px-3 py-2 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Loyal 404 pts</span>
                        <span className="text-lg font-black">{user.loyaltyPoints || 0}</span>
                      </div>
                      <Link href="/account" className="block border border-black px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-black hover:text-white">My account</Link>
                      <Link href="/wishlist" className="block border border-black px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-black hover:text-white">Wishlist ({wishlistCount})</Link>
                      <button onClick={doLogout} className="flex w-full items-center justify-center gap-2 border border-black bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#ff2d2d] hover:border-[#ff2d2d]"><LogOut size={12} /> Log out</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">You are not signed in.</p>
                      <Link href="/auth" className="block bg-black px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#ff2d2d]">Sign in</Link>
                      <Link href="/auth?mode=signup" className="block border border-black px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-black hover:text-white">Create account</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/wishlist" className="flex items-center gap-1 hover:text-[#ff2d2d] transition p-2 md:p-0" aria-label="Wishlist"><Heart size={18} /> <span className="hidden md:inline">({wishlistCount})</span></Link>
            <button type="button" onClick={() => (onCart ? onCart() : (window.location.href = '/'))} className="flex items-center gap-1.5 hover:text-[#ff2d2d] transition p-2 md:p-0"><ShoppingBag size={19} /> <span className="hidden md:inline">Bag</span><span className="text-[10px] md:text-[11px]">({cartCount})</span></button>
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
              <button key={item} type="button" className="text-left" onClick={() => { handleCat(item); setMenuOpen(false) }}>{item === 'Newdrop' ? 'New Drop' : item}</button>
            ))}
            <div className="mt-4 h-px w-full bg-white/30" />
            <Link onClick={() => setMenuOpen(false)} href="/wishlist" className="text-2xl">Wishlist ({wishlistCount})</Link>
            {user ? (
              <>
                <Link onClick={() => setMenuOpen(false)} href="/account" className="text-2xl">Account · {user.loyaltyPoints || 0} pts</Link>
                <button onClick={doLogout} className="text-left text-2xl">Log out</button>
              </>
            ) : (
              <Link onClick={() => setMenuOpen(false)} href="/auth" className="text-2xl">Sign in / Create</Link>
            )}
          </div>
          <p className="mt-auto text-[10px] font-bold uppercase tracking-[0.2em]">Style not found.</p>
        </div>
      )}
    </>
  )
}
