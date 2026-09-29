'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react'
import { setToken, setStoredUser, getStoredUser, clearToken, clearStoredUser } from '@/lib/session'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Clear any existing admin session to prevent auto-login
    const u = getStoredUser()
    if (u?.role === 'admin') {
      clearToken()
      clearStoredUser()
    }
  }, [])

  const clearSession = () => {
    clearToken()
    clearStoredUser()
    window.location.reload()
  }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.')
        return
      }
      
      if (data.user?.role !== 'admin') {
        setError('Not an admin account.')
        return
      }
      
      setToken(data.token)
      setStoredUser(data.user)
      router.push('/admin/dashboard')
    } catch (error) {
      setError('Login failed. Please try again.')
      console.error('Admin login error:', error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#ff2d2d]"><ArrowLeft size={14} /> Back to store</Link>
        <div className="flex items-center gap-3"><Shield className="text-[#ff2d2d]" size={24} /><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">Restricted / 404 admin</p></div>
        <h1 className="mt-6 text-6xl font-black uppercase leading-[.8] tracking-[-.09em]">Admin<br /><span className="text-[#ff2d2d]">gate.</span></h1>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full border-b border-white/40 bg-transparent py-3 text-lg outline-none focus:border-[#ff2d2d]" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full border-b border-white/40 bg-transparent py-3 text-lg outline-none focus:border-[#ff2d2d]" />
          </div>
          {error && <p className="bg-[#ff2d2d]/20 p-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff2d2d]">{error}</p>}
          <button className="group flex w-full items-center justify-center gap-3 bg-[#ff2d2d] px-4 py-5 text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-white hover:text-black">Enter admin <ArrowRight size={15} className="transition group-hover:translate-x-1" /></button>
          <button type="button" onClick={clearSession} className="w-full text-[10px] uppercase tracking-[0.14em] text-white/40 hover:text-white">Clear saved session</button>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-black px-5 py-8 text-white md:px-10">
        <div className="container mx-auto flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row">
          <span>© 2026 The 404 Store</span>
          <span>Privacy · Terms · Refund policy</span>
          <a href="https://digital-future-32.preview.emergentagent.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-[#ff2d2d] transition">Made by KYRO Digital 💙</a>
        </div>
      </footer>
    </main>
  )
}
