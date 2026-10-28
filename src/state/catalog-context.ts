import { createContext, useContext } from 'react'
import type { Product } from '../domain/types'
export interface CatalogValue {
  products: Product[]
  loading: boolean
  error: string
  reload: (signal?: AbortSignal) => Promise<Product[]>
}
export const CatalogContext = createContext<CatalogValue | null>(null)
export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('CatalogProvider ausente.')
  return value
}
