import { createContext, useContext } from 'react'
import type { Product, StoreState } from '../domain/types'
export interface StoreContextValue extends StoreState {
  add: (product: Product) => void
  quantity: (id: number, quantity: number, stock: number) => void
  remove: (id: number) => void
  favorite: (id: number) => void
  clear: () => void
  message: string
  dismiss: () => void
  storageUnavailable: boolean
}
export const StoreContext = createContext<StoreContextValue | null>(null)
export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('StoreProvider ausente.')
  return context
}
