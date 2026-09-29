'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShoppingBag, X, Tag, Sparkles, Check } from 'lucide-react'
import { authFetch, getStoredUser, getToken, money } from '@/lib/session'

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  
  // Order form state
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })
  
  // Coupon and loyalty state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponMsg, setCouponMsg] = useState('')
  const [redeemPoints, setRedeemPoints] = useState(false)
  
  useEffect(() => {
    const u = getStoredUser()
    if (!u) {
      router.push('/auth?redirect=/checkout')
      return
    }
    // Prevent admin users from accessing checkout
    if (u?.role === 'admin') {
      router.push('/admin/dashboard')
      return
    }
    setUser(u)
    
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('404-cart') || '[]')
    setCart(savedCart)
    
    // Pre-fill form with user data if available
    if (u) {
      setFormData(prev => ({
        ...prev,
        contactName: u.name || '',
        contactEmail: u.email || ''
      }))
    }
    
    setLoading(false)
  }, [router])

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // Calculate discounts
  const couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? Math.round((subtotal * appliedCoupon.value) / 100) : appliedCoupon.value) : 0
  const pointsUsable = Math.floor((user?.loyaltyPoints || 0) / 100) * 100
  const pointsDiscount = redeemPoints ? Math.min((pointsUsable / 100) * 25, Math.max(0, subtotal - couponDiscount)) : 0
  const total = Math.max(0, subtotal - couponDiscount - pointsDiscount)

  const applyCoupon = async () => {
    if (!couponInput) return
    setCouponMsg('')
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput)}&subtotal=${subtotal}`)
    const data = await res.json()
    if (!res.ok) { setCouponMsg(data.error || 'Coupon invalid'); setAppliedCoupon(null); return }
    setAppliedCoupon(data.coupon)
    setCouponMsg(`✓ Coupon ${data.coupon.code} applied`)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponMsg('')
    setCouponInput('')
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!cart.length) return
    
    // Validate form
    if (!formData.contactName || !formData.contactEmail || !formData.address || !formData.phone) {
      alert('Please fill in all required fields')
      return
    }

    setPlacingOrder(true)

    try {
      const body = {
        items: cart,
        couponCode: appliedCoupon?.code || null,
        redeemPoints: redeemPoints,
        ...formData
      }

      const res = await authFetch('/api/orders', { 
        method: 'POST', 
        body: JSON.stringify(body) 
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to place order')
        setPlacingOrder(false)
        return
      }

      const data = await res.json()
      
      // Clear cart
      localStorage.removeItem('404-cart')
      
      // Redirect to success page or track order
      router.push(`/track/${data.order.id}`)
    } catch (error) {
      alert('Failed to place order')
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Loading checkout...</p>
        </div>
      </main>
    )
  }

  if (!cart.length) {
    return (
      <main className="min-h-screen bg-[#f4f1eb]">
        <header className="sticky top-0 z-40 border-b border-black bg-[#f4f1eb] px-5 py-4 md:px-10">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between">
            <Link href="/" className="font-black leading-[.78] tracking-[-.09em] text-black">THE<br />404<br />STORE</Link>
            <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#ff2d2d]">
              <ArrowLeft size={14} /> Back to store
            </Link>
          </div>
        </header>
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-5 py-20 md:px-10">
          <ShoppingBag size={48} className="mb-6 text-black/30" />
          <h2 className="text-4xl font-black uppercase leading-[.8] tracking-[-.08em]">Your bag is<br /><span className="text-[#ff2d2d]">empty</span></h2>
          <Link href="/" className="mt-8 flex items-center gap-2 border-b-2 border-black pb-2 text-[10px] font-bold uppercase tracking-[0.18em] hover:border-[#ff2d2d] hover:text-[#ff2d2d]">
            Continue shopping <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb]">
      <header className="sticky top-0 z-40 border-b border-black bg-[#f4f1eb] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <Link href="/" className="font-black leading-[.78] tracking-[-.09em] text-black">THE<br />404<br />STORE</Link>
          <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#ff2d2d]">
            <ArrowLeft size={14} /> Back to store
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-5 py-10 md:px-10 md:py-16">
        <div className="mb-8">
          <h1 className="text-5xl font-black uppercase leading-[.8] tracking-[-.08em] md:text-7xl">
            Checkout<span className="text-[#ff2d2d]">.</span>
          </h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-black/50">
            Complete your order • {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Order Form */}
          <div>
            <form onSubmit={placeOrder} className="space-y-8">
              {/* Contact Information */}
              <div className="border border-black p-6">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.14em]">Contact information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">Full name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">Email *</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-black p-6">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.14em]">Shipping address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">PIN code</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full border border-black bg-transparent px-3 py-2 text-sm focus:border-[#ff2d2d] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-black p-6">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.14em]">Order items</h3>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.slug}-${item.color}-${item.size}-${index}`} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="h-20 w-16 object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-black/50">
                          <span className="font-bold text-black">{item.color}</span> · {item.size} · Qty: {item.quantity}
                        </p>
                        <p className="mt-1 text-sm font-bold">{money(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-black p-6">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.14em]">Order summary</h3>
              
              {/* Coupon */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-[#ff2d2d] bg-[#ff2d2d]/10 p-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ff2d2d]">
                        Coupon applied
                      </p>
                      <p className="text-sm font-bold">{appliedCoupon.code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="p-1 text-[#ff2d2d] hover:text-black"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 border border-black bg-transparent px-3 py-2 text-sm uppercase focus:border-[#ff2d2d] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="border border-black bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#ff2d2d] hover:border-[#ff2d2d]"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponMsg && (
                  <p className={`mt-2 text-[10px] ${couponMsg.includes('✓') ? 'text-green-600' : 'text-[#ff2d2d]'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Loyalty Points */}
              {user && user.loyaltyPoints > 0 && (
                <div className="mb-6 border border-black p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/50">
                        Your points
                      </p>
                      <p className="text-lg font-bold">{user.loyaltyPoints} pts</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(e) => setRedeemPoints(e.target.checked)}
                        className="h-4 w-4 accent-[#ff2d2d]"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                        Redeem (100 pts = ₹25)
                      </span>
                    </label>
                  </div>
                  {redeemPoints && (
                    <p className="mt-2 text-[10px] text-[#ff2d2d]">
                      Using {pointsUsable} points = −{money(pointsDiscount)}
                    </p>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-black pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#ff2d2d]">
                    <span>Coupon discount</span>
                    <span>−{money(couponDiscount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#ff2d2d]">
                    <span>Points discount</span>
                    <span>−{money(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-black pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="mt-6 flex w-full items-center justify-center gap-3 bg-black px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff2d2d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Placing order...
                  </>
                ) : (
                  <>
                    Place order <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="mt-4 space-y-2 text-[9px] uppercase tracking-[0.14em] text-black/45">
                <p>✓ Cash on delivery available</p>
                <p>✓ Free shipping on orders over ₹1,999</p>
                <p>✓ Earn 100 loyalty points on delivery</p>
              </div>
            </div>
          </div>
        </div>
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