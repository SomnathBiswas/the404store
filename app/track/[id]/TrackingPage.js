'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Circle, Package, Truck, Home, Copy } from 'lucide-react'
import { money } from '@/lib/session'

const STEPS = [
  { key: 'placed', label: 'Order placed', icon: Package, description: 'We received your order.' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'On its way to you.' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy the not found.' },
]

export default function TrackingPage({ initialData, orderId }) {
  const [data, setData] = useState(initialData)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!initialData) {
      fetch(`/api/track/${orderId}`).then((r) => r.ok ? r.json() : null).then((d) => setData(d))
    }
    // live refresh every 20s
    const t = window.setInterval(() => {
      fetch(`/api/track/${orderId}`).then((r) => r.ok ? r.json() : null).then((d) => { if (d) setData(d) })
    }, 20000)
    return () => window.clearInterval(t)
  }, [initialData, orderId])

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }

  if (!data || !data.order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] px-6 text-black">
        <div className="text-center">
          <h1 className="text-[clamp(120px,25vw,320px)] font-black leading-[.7] tracking-[-.14em]">404<span className="text-[#ff2d2d]">.</span></h1>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">This order could not be found.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-[11px] font-bold uppercase tracking-[0.2em]"><ArrowLeft size={14} /> Back to the store</Link>
        </div>
      </main>
    )
  }

  const order = data.order
  const activeIndex = order.status === 'cancelled' ? -1 : STEPS.findIndex((s) => s.key === order.status)

  const stepDate = (key) => {
    if (key === 'placed') return order.createdAt
    if (key === 'shipped') return order.shippedAt
    if (key === 'delivered') return order.deliveredAt
    return null
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-black selection:bg-[#ff2d2d] selection:text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/15 bg-[#f4f1eb]/95 px-5 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] hover:text-[#ff2d2d]"><ArrowLeft size={14} /> Store</Link>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Tracking / 404</span>
        <Link href="/" className="font-black leading-[.78] tracking-[-.08em] text-[14px]">THE<br />404<br />STORE</Link>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-16">
        {/* Order header */}
        <div className="flex flex-col justify-between gap-6 border-b border-black/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">Order tracking</p>
            <h1 className="text-4xl font-black uppercase leading-[.85] tracking-[-.08em] md:text-7xl">Order<br /><span className="text-[#ff2d2d]">#{order.id.slice(0, 8)}</span></h1>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-black/50">Placed for {order.customerName} · {new Date(order.createdAt).toDateString()}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${order.status === 'delivered' ? 'bg-[#ff2d2d] text-white' : order.status === 'shipped' ? 'bg-black text-white' : order.status === 'cancelled' ? 'border border-black bg-white' : 'border-2 border-black'}`}>{order.status}</span>
            <button onClick={copyLink} className="flex items-center gap-2 border border-black/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] hover:border-black"><Copy size={12} /> {copied ? 'Copied!' : 'Copy tracking link'}</button>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-10">
          {/* Mobile: vertical */}
          <div className="md:hidden">
            <ol className="relative border-l-2 border-black/15 pl-6">
              {STEPS.map((s, i) => {
                const done = i <= activeIndex
                const current = i === activeIndex
                const Icon = s.icon
                return (
                  <li key={s.key} className="mb-8 last:mb-0">
                    <span className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-[#ff2d2d] text-white' : 'bg-white border border-black/25 text-black/40'}`}>{done ? <Check size={12} /> : <Circle size={8} />}</span>
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                      <Icon size={14} /> {s.label}
                      {current && <span className="h-2 w-2 rounded-full bg-[#ff2d2d] animate-pulse" />}
                    </div>
                    <p className="mt-1 text-[11px] text-black/60">{s.description}</p>
                    {stepDate(s.key) && <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/45">{new Date(stepDate(s.key)).toLocaleString()}</p>}
                  </li>
                )
              })}
            </ol>
          </div>
          {/* Desktop: horizontal */}
          <div className="hidden md:block">
            <div className="relative grid grid-cols-3">
              <div className="absolute left-[16.66%] right-[16.66%] top-6 h-1 bg-black/15">
                <div className="h-full bg-[#ff2d2d] transition-all duration-700" style={{ width: activeIndex <= 0 ? '0%' : activeIndex === 1 ? '50%' : '100%' }} />
              </div>
              {STEPS.map((s, i) => {
                const done = i <= activeIndex
                const current = i === activeIndex
                const Icon = s.icon
                return (
                  <div key={s.key} className="relative flex flex-col items-center text-center">
                    <span className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition ${done ? 'bg-[#ff2d2d] text-white' : 'bg-white border-2 border-black/20 text-black/40'}`}>{done ? <Check size={20} /> : <Icon size={20} />}{current && <span className="absolute inset-0 -m-2 rounded-full border-2 border-[#ff2d2d]/40 animate-ping" />}</span>
                    <p className="mt-4 text-[12px] font-black uppercase tracking-[0.14em]">{s.label}</p>
                    <p className="mt-1 max-w-[180px] text-[11px] text-black/55">{s.description}</p>
                    {stepDate(s.key) && <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">{new Date(stepDate(s.key)).toLocaleString()}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Loyalty note */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="mt-12 border-l-4 border-[#ff2d2d] bg-black p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ff2d2d]">On the way · Loyal 404</p>
            <p className="mt-3 text-2xl font-black uppercase leading-[.9] tracking-[-.05em]">+{order.pointsEarned} pts land in your account once this is delivered.</p>
          </div>
        )}
        {order.status === 'delivered' && (
          <div className="mt-12 border-l-4 border-[#ff2d2d] bg-[#ff2d2d] p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]">Delivered · Loyal 404</p>
            <p className="mt-3 text-2xl font-black uppercase leading-[.9] tracking-[-.05em]">+{order.pointsEarned} pts credited to your account.</p>
          </div>
        )}

        {/* Items */}
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-black uppercase leading-[.85] tracking-[-.06em]">In this order</h2>
          <div className="space-y-3">
            {order.items.map((i, k) => (
              <div key={k} className="flex items-center gap-4 border border-black/15 p-3 md:p-4">
                <img src={i.image} alt={i.name} className="h-20 w-16 shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-bold uppercase tracking-[0.08em]">{i.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">
                    <span className="font-bold text-black">{i.color}</span> · Size {i.size} · qty {i.quantity}
                  </p>
                </div>
                <p className="text-[12px] font-bold">{money(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between border-t border-black pt-4 text-lg font-bold uppercase tracking-[0.06em]">
            <span>Total paid</span>
            <span>{money(order.total)}</span>
          </div>
        </section>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-black/15 pt-8 md:flex-row md:items-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Anyone with this link can view the status of this order.</p>
          <Link href="/" className="flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#ff2d2d]">Continue shopping <ArrowRight size={14} /></Link>
        </div>
      </div>
    </main>
  )
}
