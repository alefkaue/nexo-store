import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '../domain/types'
import { fetchProducts } from '../services/products'
import { CatalogContext } from './catalog-context'

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const sequence = useRef(0)
  const reload = useCallback(async (signal?: AbortSignal) => {
    const current = ++sequence.current
    setLoading(true)
    setError('')
    try {
      const result = await fetchProducts(signal)
      if (current === sequence.current && !signal?.aborted) {
        setProducts(result)
        setLoading(false)
      }
      return result
    } catch (cause) {
      if (current === sequence.current && !signal?.aborted) {
        setError(cause instanceof Error ? cause.message : 'Catálogo indisponível.')
        setLoading(false)
      }
      throw cause
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    void reload(controller.signal).catch(() => undefined)
    return () => controller.abort()
  }, [reload])
  const value = useMemo(
    () => ({ products, loading, error, reload }),
    [products, loading, error, reload],
  )
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
