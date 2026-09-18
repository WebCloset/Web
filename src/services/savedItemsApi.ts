import { Product, SavedItem } from '../types/api'

const getBaseApiUrl = () => {
  if (import.meta.env.DEV) {
    return '/api'
  }
  const envApi = import.meta.env.VITE_API_URL
  if (envApi && typeof envApi === 'string') {
    return envApi.replace(/\/$/, '')
  }
  return '/api'
}

const BASE_API_URL = getBaseApiUrl()

const requestJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_API_URL}${path}`, options)
  if (!response.ok) {
    const text = await response.text()
    let message = text || `Request failed with ${response.status}`
    try {
      const parsed = JSON.parse(text) as { detail?: string | Array<{ msg?: string }> }
      if (typeof parsed.detail === 'string') {
        message = parsed.detail
      } else if (Array.isArray(parsed.detail)) {
        const parts = parsed.detail.map((d) => d.msg).filter(Boolean)
        if (parts.length) message = parts.join(', ')
      }
    } catch {
      /* use raw text */
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export const savedItemKey = (marketplace: string, productId: string) =>
  `${marketplace.trim().toLowerCase()}::${productId}`

export const productToSavedKey = (product: Pick<Product, 'id' | 'marketplace'>) =>
  savedItemKey(product.marketplace, product.id)

const toPriceCents = (product: Product): number | null => {
  if (typeof product.price !== 'number' || Number.isNaN(product.price)) return null
  const currency = (product.currency || 'USD').trim().toUpperCase()
  if (currency === 'USD' || currency.includes('USD')) {
    return Math.round(product.price * 100)
  }
  return Math.round(product.price * 100)
}

export const listSavedItems = async (email: string): Promise<SavedItem[]> => {
  const data = await requestJson<{ items: SavedItem[] }>(
    `/saved-items?email=${encodeURIComponent(email)}`
  )
  return data.items ?? []
}

export const saveProduct = async (email: string, product: Product): Promise<SavedItem> => {
  const data = await requestJson<{ item: SavedItem }>('/saved-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      product_id: product.id,
      title: product.title,
      brand: product.brand || null,
      condition: product.condition,
      price_cents: toPriceCents(product),
      currency: product.currency || 'USD',
      image_url: product.imageUrl || null,
      seller_url: product.sellerUrl || null,
      size: product.size ?? null,
      color: product.color ?? null,
      category: product.category ?? null,
      marketplace_code: product.marketplace,
    }),
  })
  return data.item
}

export const deleteSavedItem = async (email: string, itemId: number): Promise<void> => {
  await requestJson<{ deleted: boolean }>(
    `/saved-items/${itemId}?email=${encodeURIComponent(email)}`,
    { method: 'DELETE' }
  )
}
