'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Package, Tag, ShoppingBag, Users, Plus, Trash2, Save } from 'lucide-react'
import { authFetch, getStoredUser, clearToken, clearStoredUser, money } from '@/lib/session'

const CATS = ['Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']

// Image compression utility
const compressImage = async (base64String, maxWidth = 800, quality = 0.7) => {
  if (!base64String) return ''
  
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64String
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      // Compress the image
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(base64String) // Return original if compression fails
  })
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('products')
  const [ready, setReady] = useState(false)
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [coupons, setCoupons] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  const [newProduct, setNewProduct] = useState({ name: '', slug: '', category: 'Shirt', price: '', color: 'Black', image: '', hoverImage: '', description: '', sizes: 'S,M,L,XL', badge: 'New', variants: [] })
  const [imagePreview, setImagePreview] = useState('')
  const [hoverImagePreview, setHoverImagePreview] = useState('')
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percent', value: 10, minOrder: 0, expiresAt: '' })
  const [newVariant, setNewVariant] = useState({ color: '', image: '', hoverImage: '', price: '', stock: 25 })
  const [variantImagePreview, setVariantImagePreview] = useState('')
  const [variantHoverImagePreview, setVariantHoverImagePreview] = useState('')

  useEffect(() => {
    const u = getStoredUser()
    if (u?.role !== 'admin') { router.push('/admin'); return }
    setReady(true)
    refresh()
  }, [router])

  const refresh = async () => {
    try {
      const [s, p, c, o, u] = await Promise.all([
        authFetch('/api/admin/stats').then(async (r) => {
          if (!r.ok) {
            const error = await r.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Stats fetch error:', error)
            return { stats: {} }
          }
          return r.json()
        }),
        authFetch('/api/admin/products').then(async (r) => {
          if (!r.ok) {
            const error = await r.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Products fetch error:', error)
            return { products: [] }
          }
          return r.json()
        }),
        authFetch('/api/admin/coupons').then(async (r) => {
          if (!r.ok) {
            const error = await r.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Coupons fetch error:', error)
            return { coupons: [] }
          }
          return r.json()
        }),
        authFetch('/api/admin/orders').then(async (r) => {
          if (!r.ok) {
            const error = await r.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Orders fetch error:', error)
            return { orders: [] }
          }
          return r.json()
        }),
        authFetch('/api/admin/users').then(async (r) => {
          if (!r.ok) {
            const error = await r.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Users fetch error:', error)
            return { users: [] }
          }
          return r.json()
        }),
      ])
      setStats(s.stats); setProducts(p.products || []); setCoupons(c.coupons || []); setOrders(o.orders || []); setUsers(u.users || [])
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('Failed to load data. Please try again.')
    }
  }

  const doLogout = () => { clearToken(); clearStoredUser(); router.push('/') }

  const addProduct = async (e) => {
    e.preventDefault()
    
    // Compress images before sending
    const compressedImage = await compressImage(newProduct.image)
    const compressedHoverImage = newProduct.hoverImage ? await compressImage(newProduct.hoverImage) : ''
    
    // Compress variant images
    const compressedVariants = await Promise.all(newProduct.variants.map(async (variant) => ({
      ...variant,
      image: variant.image ? await compressImage(variant.image) : '',
      hoverImage: variant.hoverImage ? await compressImage(variant.hoverImage) : '',
      price: Number(variant.price) || Number(newProduct.price),
      stock: Number(variant.stock) || 25
    })))
    
    const body = { 
      ...newProduct, 
      price: Number(newProduct.price), 
      sizes: newProduct.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      image: compressedImage,
      hoverImage: compressedHoverImage,
      variants: compressedVariants
    }
    
    try {
      const res = await authFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(body) })
      if (res.ok) { 
        setNewProduct({ name: '', slug: '', category: 'Shirt', price: '', color: 'Black', image: '', hoverImage: '', description: '', sizes: 'S,M,L,XL', badge: 'New', variants: [] })
        setImagePreview('')
        setHoverImagePreview('')
        refresh() 
      }
      else { const d = await res.json(); alert(d.error || 'Failed') }
    } catch (error) {
      alert('Error adding product: ' + error.message)
    }
  }

  const addVariant = () => {
    if (!newVariant.color) {
      alert('Color is required')
      return
    }
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { ...newVariant, price: Number(newVariant.price) || Number(newProduct.price) }]
    })
    setNewVariant({ color: '', image: '', hoverImage: '', price: '', stock: 25 })
    setVariantImagePreview('')
    setVariantHoverImagePreview('')
  }

  const removeVariant = (index) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter((_, i) => i !== index)
    })
  }

  const deleteProduct = async (slug) => {
    if (!confirm('Delete this product?')) return
    await authFetch(`/api/admin/products/${slug}`, { method: 'DELETE' })
    refresh()
  }

  // Fetch individual product with full image data
  const fetchProductDetails = async (slug) => {
    try {
      const res = await authFetch(`/api/admin/products/${slug}`)
      if (res.ok) {
        const data = await res.json()
        return data.product
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
    return null
  }

  const updateProductPrice = async (slug, price) => {
    await authFetch(`/api/admin/products/${slug}`, { method: 'PUT', body: JSON.stringify({ price: Number(price) }) })
    refresh()
  }

  const addCoupon = async (e) => {
    e.preventDefault()
    const body = { ...newCoupon, value: Number(newCoupon.value), minOrder: Number(newCoupon.minOrder || 0), expiresAt: newCoupon.expiresAt || null }
    const res = await authFetch('/api/admin/coupons', { method: 'POST', body: JSON.stringify(body) })
    if (res.ok) { setNewCoupon({ code: '', type: 'percent', value: 10, minOrder: 0, expiresAt: '' }); refresh() }
    else { const d = await res.json(); alert(d.error || 'Failed') }
  }

  const toggleCoupon = async (c) => {
    await authFetch(`/api/admin/coupons/${c.id}`, { method: 'PUT', body: JSON.stringify({ active: !c.active }) })
    refresh()
  }

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return
    await authFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    refresh()
  }

  const setOrderStatus = async (id, status) => {
    await authFetch(`/api/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
    refresh()
  }

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-black text-white text-[10px] uppercase tracking-[0.2em]">Checking access…</main>

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/15 bg-[#0a0a0a] px-5 py-4 md:px-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#ff2d2d]"><ArrowLeft size={14} /> Store</Link>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-[11px] font-black uppercase tracking-[0.18em]"><span className="text-[#ff2d2d]">404</span> admin</span>
        </div>
        <button onClick={doLogout} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] hover:text-[#ff2d2d]"><LogOut size={13} /> Log out</button>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
        {/* Stats */}
        {stats && (
          <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[{ k: 'products', label: 'Products', icon: Package }, { k: 'coupons', label: 'Coupons', icon: Tag }, { k: 'orders', label: 'Orders', icon: ShoppingBag }, { k: 'users', label: 'Users', icon: Users }].map(({ k, label, icon: Icon }) => (
              <div key={k} className="border border-white/15 p-5">
                <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{label}</span><Icon size={16} className="text-[#ff2d2d]" /></div>
                <p className="mt-3 text-4xl font-black">{stats[k] ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex gap-1 border-b border-white/15 overflow-auto">
          {['products', 'coupons', 'orders', 'users'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${tab === t ? 'border-b-2 border-[#ff2d2d] text-white' : 'text-white/40'}`}>{t}</button>
          ))}
        </div>

        {tab === 'products' && (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h3 className="mb-4 text-xl font-black uppercase tracking-[-.05em]">Add product</h3>
              <form onSubmit={addProduct} className="space-y-3 border border-white/15 p-5">
                <input required placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm" />
                <input required placeholder="Slug" value={newProduct.slug} onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="border border-white/25 bg-black px-3 py-2 text-sm">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                  <input type="number" required placeholder="Price ₹" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="border border-white/25 bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Color" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} className="border border-white/25 bg-transparent px-3 py-2 text-sm" />
                  <input placeholder="Badge" value={newProduct.badge} onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })} className="border border-white/25 bg-transparent px-3 py-2 text-sm" />
                </div>
                <input placeholder="Sizes (comma separated)" value={newProduct.sizes} onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm" />
                
                {/* Main Image Upload */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Main image</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-2 border border-white/25 bg-transparent px-3 py-2 text-sm hover:border-[#ff2d2d]">
                        <Plus size={14} />
                        <span>Choose file</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = async () => {
                                const compressedImage = await compressImage(reader.result)
                                setImagePreview(compressedImage)
                                setNewProduct({ ...newProduct, image: compressedImage })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      {newProduct.image && <span className="text-[10px] text-white/50">Image selected</span>}
                    </div>
                    {imagePreview && (
                      <div className="relative h-32 w-full overflow-hidden border border-white/25">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setImagePreview(''); setNewProduct({ ...newProduct, image: '' }) }}
                          className="absolute right-2 top-2 rounded bg-black/50 p-1 text-white hover:bg-[#ff2d2d]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Image Upload */}
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Hover image (optional)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-2 border border-white/25 bg-transparent px-3 py-2 text-sm hover:border-[#ff2d2d]">
                        <Plus size={14} />
                        <span>Choose file</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = async () => {
                                const compressedImage = await compressImage(reader.result)
                                setHoverImagePreview(compressedImage)
                                setNewProduct({ ...newProduct, hoverImage: compressedImage })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      {newProduct.hoverImage && <span className="text-[10px] text-white/50">Image selected</span>}
                    </div>
                    {hoverImagePreview && (
                      <div className="relative h-32 w-full overflow-hidden border border-white/25">
                        <img src={hoverImagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setHoverImagePreview(''); setNewProduct({ ...newProduct, hoverImage: '' }) }}
                          className="absolute right-2 top-2 rounded bg-black/50 p-1 text-white hover:bg-[#ff2d2d]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Variants Section */}
                <div className="border border-white/15 p-4">
                  <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Color variants</label>
                  
                  {/* Add new variant form */}
                  <div className="mb-4 space-y-2 border-b border-white/10 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Color name" 
                        value={newVariant.color} 
                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} 
                        className="border border-white/25 bg-transparent px-2 py-1 text-sm" 
                      />
                      <input 
                        type="number" 
                        placeholder="Price (optional)" 
                        value={newVariant.price} 
                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })} 
                        className="border border-white/25 bg-transparent px-2 py-1 text-sm" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-white/50">Variant image</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="w-full text-xs"
                          onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = async () => {
                                const compressedImage = await compressImage(reader.result)
                                setVariantImagePreview(compressedImage)
                                setNewVariant({ ...newVariant, image: compressedImage })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/50">Hover image (optional)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="w-full text-xs"
                          onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = async () => {
                                const compressedImage = await compressImage(reader.result)
                                setVariantHoverImagePreview(compressedImage)
                                setNewVariant({ ...newVariant, hoverImage: compressedImage })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      className="w-full border border-[#ff2d2d] bg-[#ff2d2d]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-[#ff2d2d] hover:text-white"
                    >
                      + Add color variant
                    </button>
                  </div>

                  {/* Existing variants list */}
                  {newProduct.variants.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[9px] text-white/50">Current variants:</label>
                      {newProduct.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between border border-white/10 p-2">
                          <div className="flex items-center gap-2">
                            {variant.image && (
                              <img src={variant.image} alt={variant.color} className="h-8 w-8 object-cover" />
                            )}
                            <div>
                              <p className="text-xs font-bold">{variant.color}</p>
                              <p className="text-[10px] text-white/50">{variant.price ? `₹${variant.price}` : 'Default price'}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-1 text-white/60 hover:text-[#ff2d2d]"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm" />
                <button className="flex w-full items-center justify-center gap-2 bg-[#ff2d2d] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em]"><Plus size={14} /> Add product</button>
              </form>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-black uppercase tracking-[-.05em]">All products ({products.length})</h3>
              <div className="space-y-2 max-h-[70vh] overflow-auto pr-2">
                {products.map((p) => (
                  <div key={p.slug} className="border border-white/15 p-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-16 w-14 object-cover" />
                      ) : (
                        <div className="h-16 w-14 bg-white/10 flex items-center justify-center text-white/30">
                          <Package size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">{p.category} · {p.slug}</p>
                        {p.variants && p.variants.length > 0 && (
                          <p className="text-[9px] text-[#ff2d2d]">{p.variants.length} color variants</p>
                        )}
                      </div>
                      <input type="number" defaultValue={p.price} onBlur={(e) => { if (Number(e.target.value) !== p.price) updateProductPrice(p.slug, e.target.value) }} className="w-24 border border-white/25 bg-transparent px-2 py-1 text-sm" />
                      <button onClick={() => deleteProduct(p.slug)} className="p-2 text-white/60 hover:text-[#ff2d2d]"><Trash2 size={14} /></button>
                    </div>
                    
                    {/* Show color variants */}
                    {p.variants && p.variants.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-2">
                        {p.variants.map((variant, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white/5 px-2 py-1">
                            {variant.image && (
                              <img src={variant.image} alt={variant.color} className="h-6 w-6 object-cover" />
                            )}
                            <span className="text-[10px] font-bold uppercase">{variant.color}</span>
                            <span className="text-[9px] text-white/50">₹{variant.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'coupons' && (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h3 className="mb-4 text-xl font-black uppercase tracking-[-.05em]">Create coupon</h3>
              <form onSubmit={addCoupon} className="space-y-3 border border-white/15 p-5">
                <input required placeholder="CODE (e.g. NOTFOUND10)" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm uppercase tracking-widest" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newCoupon.type} onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })} className="border border-white/25 bg-black px-3 py-2 text-sm">
                    <option value="percent">% off</option>
                    <option value="flat">₹ flat</option>
                  </select>
                  <input required type="number" placeholder="Value" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} className="border border-white/25 bg-transparent px-3 py-2 text-sm" />
                </div>
                <input type="number" placeholder="Min order (optional)" value={newCoupon.minOrder} onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm" />
                <input type="date" placeholder="Expires" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} className="w-full border border-white/25 bg-transparent px-3 py-2 text-sm" />
                <button className="flex w-full items-center justify-center gap-2 bg-[#ff2d2d] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em]"><Plus size={14} /> Create coupon</button>
              </form>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-black uppercase tracking-[-.05em]">All coupons ({coupons.length})</h3>
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-3 border border-white/15 p-3">
                    <span className="bg-[#ff2d2d] px-3 py-1 text-[11px] font-black tracking-widest">{c.code}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em]">{c.type === 'percent' ? `${c.value}% off` : money(c.value) + ' off'}</span>
                    {c.minOrder > 0 && <span className="text-[10px] text-white/50">min {money(c.minOrder)}</span>}
                    {c.expiresAt && <span className="text-[10px] text-white/50">exp {new Date(c.expiresAt).toDateString()}</span>}
                    <button onClick={() => toggleCoupon(c)} className={`ml-auto px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${c.active ? 'bg-white text-black' : 'border border-white/40'}`}>{c.active ? 'Active' : 'Off'}</button>
                    <button onClick={() => deleteCoupon(c.id)} className="p-2 text-white/60 hover:text-[#ff2d2d]"><Trash2 size={14} /></button>
                  </div>
                ))}
                {!coupons.length && <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">No coupons yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            <h3 className="mb-2 text-xl font-black uppercase tracking-[-.05em]">All orders ({orders.length})</h3>
            {orders.map((o) => (
              <div key={o.id} className="border border-white/15 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">#{o.id.slice(0, 8)} · {new Date(o.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-sm font-bold">{o.userName || 'Guest'} · {o.userEmail || '—'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={`/track/${o.id}`} target="_blank" rel="noreferrer" className="border border-[#ff2d2d] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#ff2d2d] hover:bg-[#ff2d2d] hover:text-white">Track ↗</a>
                    {['placed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <button key={s} onClick={() => setOrderStatus(o.id, s)} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${o.status === s ? (s === 'delivered' ? 'bg-[#ff2d2d]' : 'bg-white text-black') : 'border border-white/25'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">{o.items?.map((i, k) => <div key={k} className="flex items-center gap-2 border border-white/15 px-2 py-1 text-[10px]"><img src={i.image} alt="" className="h-8 w-7 object-cover" /><span>{i.name} · {i.size} · x{i.quantity}</span></div>)}</div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-[0.14em]">
                  <span>Sub {money(o.subtotal)}</span>
                  {o.couponCode && <span className="text-[#ff2d2d]">{o.couponCode} −{money(o.couponDiscount)}</span>}
                  {o.pointsRedeemed > 0 && <span className="text-[#ff2d2d]">{o.pointsRedeemed}pts −{money(o.pointsDiscount)}</span>}
                  <span>Total {money(o.total)}</span>
                  {o.status === 'delivered' && <span className="text-white/50">+{o.pointsEarned}pts credited</span>}
                </div>
              </div>
            ))}
            {!orders.length && <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">No orders yet.</p>}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-2">
            <h3 className="mb-2 text-xl font-black uppercase tracking-[-.05em]">Registered users ({users.length})</h3>
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 border border-white/15 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff2d2d] font-bold">{u.name?.[0] || 'U'}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{u.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">{u.email}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff2d2d]">{u.loyaltyPoints || 0} pts</span>
                <span className="text-[9px] uppercase tracking-[0.14em] text-white/40">Joined {new Date(u.createdAt).toDateString()}</span>
              </div>
            ))}
            {!users.length && <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">No users yet.</p>}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black px-5 py-8 text-white md:px-10">
        <div className="container mx-auto flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/40 md:flex-row">
          <span>© 2026 The 404 Store</span>
          <span>Privacy · Terms · Refund policy</span>
          <a href="https://digital-future-32.preview.emergentagent.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff2d2d] transition">Made by KYRO Digital 💙</a>
        </div>
      </footer>
    </main>
  )
}
