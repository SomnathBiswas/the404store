'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { setToken, setStoredUser, getStoredUser, clearToken, clearStoredUser } from '@/lib/session'

function AuthInner() {
  const params = useSearchParams()
  const router = useRouter()
  const initialMode = params.get('mode') === 'signup' ? 'signup' : 'login'
  const redirectPath = params.get('redirect') || '/'
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { 
    setMode(initialMode)
    // Clear any admin credentials that might be stored
    const storedUser = getStoredUser()
    if (storedUser?.role === 'admin') {
      clearToken()
      clearStoredUser()
    }
  }, [initialMode])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mode === 'signup' ? { name, email, password } : { email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setBusy(false); return }
      setToken(data.token)
      setStoredUser(data.user)
      // Only redirect to admin dashboard if user is admin AND not trying to checkout
      if (data.user?.role === 'admin' && redirectPath !== '/checkout') router.push('/admin/dashboard')
      else router.push(redirectPath)
    } catch (err) { setError('Network error.') }
    setBusy(false)
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 md:grid-cols-[1fr_1fr]">
        <div className="relative hidden overflow-hidden bg-[#0a0a0a] md:block">
          <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
            <Link href="/" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#ff2d2d]"><ArrowLeft size={14} /> Back to store</Link>
            <div>
              <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">Members only / 404</p>
              <h1 className="text-[clamp(60px,7vw,140px)] font-black uppercase leading-[.78] tracking-[-.09em]">You<br />are<br /><span className="text-[#ff2d2d]">not</span><br />found.</h1>
              <p className="mt-8 max-w-md text-sm leading-[1.7] text-white/60">Sign in to keep your bag, unlock loyal 404 points, save fits to your wishlist and get early access to drops.</p>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">© 2026 THE 404 STORE</p>
          </div>
        </div>
        <div className="flex flex-col justify-center p-6 md:p-16">
          <Link href="/" className="mb-10 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] md:hidden"><ArrowLeft size={14} /> Back</Link>
          <div className="flex gap-6 border-b border-black/15">
            <button onClick={() => setMode('login')} className={`pb-3 text-[12px] font-black uppercase tracking-[0.18em] ${mode === 'login' ? 'border-b-2 border-[#ff2d2d] text-black' : 'text-black/40'}`}>Sign in</button>
            <button onClick={() => setMode('signup')} className={`pb-3 text-[12px] font-black uppercase tracking-[0.18em] ${mode === 'signup' ? 'border-b-2 border-[#ff2d2d] text-black' : 'text-black/40'}`}>Create account</button>
          </div>
          <h2 className="mt-8 text-5xl font-black uppercase leading-[.85] tracking-[-.08em] md:text-7xl">{mode === 'login' ? <>Welcome<br /><span className="text-[#ff2d2d]">back.</span></> : <>Get<br /><span className="text-[#ff2d2d]">found.</span></>}</h2>
          <form onSubmit={submit} className="mt-10 max-w-md space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-b border-black bg-transparent py-3 text-lg font-bold uppercase tracking-[-.02em] outline-none placeholder:text-black/30" placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-b border-black bg-transparent py-3 text-lg outline-none placeholder:text-black/30" placeholder="you@notfound.store" />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="w-full border-b border-black bg-transparent py-3 text-lg outline-none placeholder:text-black/30" placeholder="••••••••" />
            </div>
            {error && <p className="border border-[#ff2d2d] bg-[#ff2d2d]/10 p-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff2d2d]">{error}</p>}
            <button type="submit" disabled={busy} className="group flex w-full items-center justify-center gap-3 bg-black px-4 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2d2d] disabled:opacity-50">{busy ? 'Please wait…' : (mode === 'login' ? 'Enter the 404' : 'Create account')} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></button>
            {mode === 'login' && <Link href="/auth/forgot" className="block text-center text-[10px] font-bold uppercase tracking-[0.18em] text-black/60 hover:text-[#ff2d2d]">Forgot password?</Link>}
            <p className="pt-2 text-[10px] uppercase tracking-[0.15em] text-black/50">By continuing, you agree to be a little different.</p>
            {redirectPath !== '/' && (
              <p className="pt-2 text-[10px] uppercase tracking-[0.15em] text-[#ff2d2d]">
                Sign in to continue to checkout
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f4f1eb]" />}><AuthInner /></Suspense>
}
