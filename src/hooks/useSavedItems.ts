import { useCallback, useEffect, useMemo, useState } from 'react'
import { Product, SavedItem } from '../types/api'
import {
  deleteSavedItem,
  listSavedItems,
  productToSavedKey,
  saveProduct,
  savedItemKey,
} from '../services/savedItemsApi'

export function useSavedItems(email: string | null | undefined) {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [togglingKey, setTogglingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!email) {
      setItems([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const next = await listSavedItems(email)
      setItems(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved items')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const keyToItem = useMemo(() => {
    const map = new Map<string, SavedItem>()
    items.forEach((item) => {
      map.set(savedItemKey(item.marketplace_code, item.product_id), item)
    })
    return map
  }, [items])

  const isSaved = useCallback(
    (product: Pick<Product, 'id' | 'marketplace'>) =>
      keyToItem.has(productToSavedKey(product)),
    [keyToItem]
  )

  const getSavedItem = useCallback(
    (product: Pick<Product, 'id' | 'marketplace'>) =>
      keyToItem.get(productToSavedKey(product)) ?? null,
    [keyToItem]
  )

  const toggleSave = useCallback(
    async (product: Product): Promise<'saved' | 'removed' | 'needs_auth'> => {
      if (!email) return 'needs_auth'

      const key = productToSavedKey(product)
      const existing = keyToItem.get(key)
      setTogglingKey(key)
      setError(null)

      try {
        if (existing) {
          await deleteSavedItem(email, existing.id)
          setItems((prev) => prev.filter((item) => item.id !== existing.id))
          return 'removed'
        }
        const saved = await saveProduct(email, product)
        setItems((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)])
        return 'saved'
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update saved item')
        throw err
      } finally {
        setTogglingKey(null)
      }
    },
    [email, keyToItem]
  )

  const removeById = useCallback(
    async (itemId: number) => {
      if (!email) return
      setError(null)
      await deleteSavedItem(email, itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    },
    [email]
  )

  return {
    items,
    loading,
    error,
    togglingKey,
    isSaved,
    getSavedItem,
    toggleSave,
    removeById,
    refresh,
  }
}
