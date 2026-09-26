'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react'
import { setToken, setStoredUser } from '@/lib/session'

export default function ForgotPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [issuedCode, setIssuedCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const request = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
    setIssuedCode(data.code); setCode(data.code); setStep(2)
  }

  const reset = async (e) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 4) { setError('Password too short.'); return }
    setBusy(true)
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, password }) })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
    setToken(data.token); setStoredUser(data.user)
    router.push('/account')
  }

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(issuedCode); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch {}
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 md:grid-cols-[1fr_1fr]">
        <div className="relative hidden overflow-hidden bg-[#0a0a0a] md:block">
          <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
            <Link href="/auth" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#ff2d2d]"><ArrowLeft size={14} /> Back to sign in</Link>
            <div>
              <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff2d2d]">Access recovery / 404</p>
              <h1 className="text-[clamp(60px,7vw,120px)] font-black uppercase leading-[.78] tracking-[-.09em]">Password<br /><span className="text-[#ff2d2d]">not</span><br />found.</h1>
              <p className="mt-8 max-w-md text-sm leading-[1.7] text-white/60">We'll generate a one-time reset code on the next screen. Use it to set a new password without waiting for anyone.</p>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">© 2026 THE 404 STORE</p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 md:p-16">
          <Link href="/auth" className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] md:hidden"><ArrowLeft size={14} /> Back to sign in</Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Step {step} of 2</p>
          <h2 className="mt-4 text-5xl font-black uppercase leading-[.85] tracking-[-.08em] md:text-7xl">{step === 1 ? <>Forgot<br /><span className="text-[#ff2d2d]">password.</span></> : <>Set new<br /><span className="text-[#ff2d2d]">password.</span></>}</h2>

          {step === 1 && (
            <form onSubmit={request} className="mt-10 max-w-md space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-b border-black bg-transparent py-3 text-lg outline-none placeholder:text-black/30" placeholder="you@notfound.store" />
              </div>
              {error && <p className="border border-[#ff2d2d] bg-[#ff2d2d]/10 p-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff2d2d]">{error}</p>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-3 bg-black px-4 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2d2d] disabled:opacity-50">{busy ? 'Working…' : <>Generate reset code <ArrowRight size={14} /></>}</button>
            </form>
          )}

          {step === 2 && (
            <>
              <div className="mt-8 border-2 border-black bg-[#ff2d2d] p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]">Your one-time code</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-4xl font-black tracking-[.25em] md:text-6xl">{issuedCode}</span>
                  <button onClick={copyCode} className="flex items-center gap-2 border border-white/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-[#ff2d2d]"><Copy size={12} /> {copied ? 'Copied' : 'Copy'}</button>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-white/70">Valid for 15 minutes. Would normally arrive on your email.</p>
              </div>
              <form onSubmit={reset} className="mt-8 max-w-md space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Reset code</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} required className="w-full border-b border-black bg-transparent py-3 text-lg tracking-widest outline-none" placeholder="000000" />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">New password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="w-full border-b border-black bg-transparent py-3 text-lg outline-none" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Confirm password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={4} className="w-full border-b border-black bg-transparent py-3 text-lg outline-none" placeholder="••••••••" />
                </div>
                {error && <p className="border border-[#ff2d2d] bg-[#ff2d2d]/10 p-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff2d2d]">{error}</p>}
                <button disabled={busy} className="flex w-full items-center justify-center gap-3 bg-black px-4 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2d2d] disabled:opacity-50">{busy ? 'Working…' : <>Set new password <Check size={14} /></>}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
