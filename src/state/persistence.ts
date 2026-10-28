import { EMPTY_STORE, MAX_LINES, MAX_QUANTITY } from '../domain/cart'
import type { StoreState } from '../domain/types'
export const STORAGE_KEY = 'nexo:store:v1'
export function parseStored(raw: string | null): StoreState {
  try {
    const value: unknown = raw ? JSON.parse(raw) : null
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1)
      return EMPTY_STORE
    const stored = value as Record<string, unknown>
    const seen = new Set<number>()
    const cart = Array.isArray(stored.cart)
      ? stored.cart
          .flatMap((item) => {
            if (
              !item ||
              typeof item !== 'object' ||
              !Number.isSafeInteger(item.id) ||
              item.id <= 0 ||
              seen.has(item.id) ||
              !Number.isFinite(item.quantity) ||
              item.quantity <= 0
            )
              return []
            seen.add(item.id)
            return [
              {
                id: item.id as number,
                quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.floor(item.quantity as number))),
              },
            ]
          })
          .slice(0, MAX_LINES)
      : []
    const favorites = Array.isArray(stored.favorites)
      ? [
          ...new Set(
            stored.favorites.filter(
              (id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
            ),
          ),
        ].slice(0, 100)
      : []
    return { cart, favorites }
  } catch {
    return EMPTY_STORE
  }
}
export function readStore(): { state: StoreState; unavailable: boolean } {
  try {
    return { state: parseStored(localStorage.getItem(STORAGE_KEY)), unavailable: false }
  } catch {
    return { state: EMPTY_STORE, unavailable: true }
  }
}
export const serializeStore = (state: StoreState) => JSON.stringify({ version: 1, ...state })
