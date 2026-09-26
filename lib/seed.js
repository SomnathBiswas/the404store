import { getDb } from './mongo'
import { v4 as uuid } from 'uuid'

// Only clothing images (the 5 editorial photos user uploaded).
const IMG = {
  hoodies: 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/z86lx0kg_file_0000000091908211b979c011be24a43a.png',
  denimOnGround: 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/7t5y1xpl_file_000000003f508211bff835467c511012.png',
  linenShirt: 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/uui4654j_file_00000000c1b88211bd75e52d376dca02.png',
  denimTagged: 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/u3ixlku2_file_00000000ac908211af2cb10fe70a1e09.png',
  denimClose: 'https://customer-assets-lqy194kg.emergentagent.net/job_not-found-style/artifacts/deavzcwm_file_00000000a4c48211a4f3e355ddb9da99.png',
}

export const IMAGES = IMG

const PRODUCTS = [
  // SHIRT
  { slug: '404-overshirt', name: '404 Overshirt', category: 'Shirt', price: 2799, color: 'Bone', sizes: ['S','M','L','XL'], image: IMG.linenShirt, hoverImage: IMG.hoodies, badge: 'New', rating: 4.8, reviews: 62, description: 'Heavyweight overshirt cut in an unresolved silhouette. Boxy, dropped shoulders, structured collar. Made for the ones still looking.' },
  { slug: 'null-oxford-shirt', name: 'Null Oxford Shirt', category: 'Shirt', price: 2299, color: 'Charcoal', sizes: ['S','M','L','XL','XXL'], image: IMG.hoodies, hoverImage: IMG.linenShirt, badge: 'Drop 01', rating: 4.7, reviews: 41, description: 'Oxford weave with a subtle 404 chest stamp. Relaxed fit, hand-finished seams, meant to be worn until it forgets what season it is.' },
  { slug: 'void-linen-shirt', name: 'Void Linen Shirt', category: 'Shirt', price: 2499, color: 'Off White', sizes: ['S','M','L','XL'], image: IMG.linenShirt, hoverImage: IMG.denimOnGround, badge: 'Editorial', rating: 4.9, reviews: 33, description: 'Slow woven linen with a raw hem and an unfinished attitude. Wear it open, closed, twisted. There is no right way.' },

  // TSHIRT
  { slug: '404-oversized-tee', name: '404 Oversized Tee', category: 'Tshirt', price: 1499, color: 'Washed Black', sizes: ['S','M','L','XL'], image: IMG.hoodies, hoverImage: IMG.linenShirt, badge: 'Bestseller', rating: 4.9, reviews: 184, description: 'The 404 uniform. 240 GSM heavyweight cotton, dropped shoulder, boxy fit. A tee that behaves like an oversize shirt.' },
  { slug: 'error-boxy-tee', name: 'Error Boxy Tee', category: 'Tshirt', price: 1299, color: 'Bone', sizes: ['XS','S','M','L','XL'], image: IMG.linenShirt, hoverImage: IMG.hoodies, badge: 'Everyday', rating: 4.8, reviews: 121, description: 'A blank canvas with a broken barcode print. Boxy through the chest, slightly cropped, perfectly wrong.' },
  { slug: 'undefined-longsleeve', name: 'Undefined Long Sleeve', category: 'Tshirt', price: 1799, color: 'Charcoal', sizes: ['S','M','L','XL','XXL'], image: IMG.hoodies, hoverImage: IMG.denimClose, badge: 'New', rating: 4.7, reviews: 58, description: 'Extended sleeves, dropped shoulders, a soft brushed handfeel. Meant to be layered under everything or nothing.' },

  // JEANS
  { slug: '404-wide-denim', name: '404 Wide Denim', category: 'Jeans', price: 2799, color: 'Raw Indigo', sizes: ['28','30','32','34','36'], image: IMG.denimTagged, hoverImage: IMG.denimClose, badge: 'Restocked', rating: 4.8, reviews: 96, description: 'Rigid Japanese denim in a wide, uncorrected fit. Pool the hem, break it in, let it become yours.' },
  { slug: 'not-found-cargo-denim', name: 'Not Found Cargo Denim', category: 'Jeans', price: 2999, color: 'Concrete', sizes: ['28','30','32','34','36'], image: IMG.denimClose, hoverImage: IMG.denimOnGround, badge: 'New', rating: 4.7, reviews: 47, description: 'A cargo silhouette translated into denim. Utility pockets, relaxed thigh, tapered ankle. Built for the long walk home.' },
  { slug: 'baggy-fit-denim', name: 'Baggy Fit Denim', category: 'Jeans', price: 2599, color: 'Washed Black', sizes: ['28','30','32','34'], image: IMG.denimOnGround, hoverImage: IMG.denimTagged, badge: 'Drop 01', rating: 4.6, reviews: 71, description: 'A wide, slouchy leg with a mid-rise and a slight taper. Washed to a soft, worn-in black.' },

  // NEWDROP
  { slug: 'error-hoodie', name: 'Error Hoodie', category: 'Newdrop', price: 2499, color: 'Charcoal', sizes: ['S','M','L','XL','XXL'], image: IMG.hoodies, hoverImage: IMG.linenShirt, badge: 'Just landed', rating: 5.0, reviews: 148, description: '450 GSM heavyweight fleece, dropped shoulder, oversized hood. Brushed interior, boxed print at the back.' },
  { slug: '404-zip-jacket', name: '404 Zip Jacket', category: 'Newdrop', price: 3499, color: 'Ink', sizes: ['S','M','L','XL'], image: IMG.denimClose, hoverImage: IMG.hoodies, badge: 'Limited', rating: 4.8, reviews: 52, description: 'Cropped zip jacket with a stiff standing collar, rubberised trims and a boxy 404 stamp. Built like armour, worn like weather.' },
  { slug: 'utility-jacket', name: '404 Utility Jacket', category: 'Newdrop', price: 3999, color: 'Black', sizes: ['M','L','XL'], image: IMG.denimTagged, hoverImage: IMG.denimClose, badge: 'New', rating: 4.9, reviews: 44, description: 'Field-inspired jacket with oversized cargo pockets, magnetic closure and a broken-grid liner. A shell for anything unexpected.' },

  // SALE
  { slug: '404-essential-tee', name: '404 Essential Tee', category: 'Sale', price: 899, originalPrice: 1499, color: 'Bone', sizes: ['XS','S','M','L'], image: IMG.linenShirt, hoverImage: IMG.hoodies, badge: '-40%', rating: 4.8, reviews: 212, description: 'The everyday 404 tee. Now marked down. Same weight, same fit, less on the receipt.' },
  { slug: 'origin-cap', name: 'Origin 404 Cap', category: 'Sale', price: 699, originalPrice: 999, color: 'Washed Black', sizes: ['OS'], image: IMG.hoodies, hoverImage: IMG.denimClose, badge: '-30%', rating: 4.9, reviews: 88, description: 'Six panel cap in washed twill. Curved brim, brushed metal buckle, small 404 stamp above the eye.' },
  { slug: 'base-cargo', name: 'Base Cargo', category: 'Sale', price: 1899, originalPrice: 2599, color: 'Concrete', sizes: ['28','30','32','34'], image: IMG.denimOnGround, hoverImage: IMG.denimTagged, badge: '-27%', rating: 4.6, reviews: 63, description: 'A wide-leg cargo in soft cotton twill. Dual thigh pockets, drawcord hem. On sale, off the internet.' },
]

export async function ensureSeeded(force = false) {
  const db = await getDb()
  const col = db.collection('products')
  const count = await col.countDocuments()
  if (count > 0 && !force) return { seeded: false, count }
  if (force) await col.deleteMany({})
  const docs = PRODUCTS.map((p) => ({ id: uuid(), createdAt: new Date(), stock: 25, ...p }))
  await col.insertMany(docs)
  return { seeded: true, count: docs.length }
}

export const CATEGORIES = ['Shirt', 'Tshirt', 'Jeans', 'Newdrop', 'Sale']
