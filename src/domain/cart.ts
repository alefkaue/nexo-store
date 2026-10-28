import type { CartItem, CartLine, Delivery, Product, StoreState } from './types'

export const MAX_QUANTITY = 99
export const MAX_LINES = 30
export const EMPTY_STORE: StoreState = { cart: [], favorites: [] }
export type StoreAction =
  | { type: 'add'; id: number; stock: number }
  | { type: 'quantity'; id: number; quantity: number; stock: number }
  | { type: 'remove'; id: number }
  | { type: 'favorite'; id: number }
  | { type: 'clear' }

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'add': {
      const max = Math.min(MAX_QUANTITY, Math.max(0, Math.floor(action.stock)))
      if (!Number.isSafeInteger(action.id) || action.id <= 0 || !Number.isFinite(max) || max === 0)
        return state
      const found = state.cart.find((i) => i.id === action.id)
      if (!found && state.cart.length >= MAX_LINES) return state
      return {
        ...state,
        cart: found
          ? state.cart.map((i) =>
              i.id === action.id ? { ...i, quantity: Math.min(i.quantity + 1, max) } : i,
            )
          : [...state.cart, { id: action.id, quantity: 1 }],
      }
    }
    case 'quantity': {
      if (!Number.isFinite(action.quantity) || !Number.isFinite(action.stock)) return state
      if (action.quantity <= 0 || action.stock <= 0)
        return { ...state, cart: state.cart.filter((i) => i.id !== action.id) }
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.id === action.id
            ? {
                ...i,
                quantity: Math.min(
                  MAX_QUANTITY,
                  Math.floor(action.stock),
                  Math.floor(action.quantity),
                ),
              }
            : i,
        ),
      }
    }
    case 'remove':
      return { ...state, cart: state.cart.filter((i) => i.id !== action.id) }
    case 'favorite': {
      if (!Number.isSafeInteger(action.id) || action.id <= 0) return state
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id].slice(-100),
      }
    }
    case 'clear':
      return { ...state, cart: [] }
  }
}
export const cents = (value: number) => Math.round(value * 100)
export const money = (valueInCents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueInCents / 100)
export function cartLines(items: CartItem[], products: Product[]): CartLine[] {
  return items.flatMap((item) => {
    const product = products.find((p) => p.id === item.id)
    return product
      ? [
          {
            product,
            quantity: item.quantity,
            available: product.stock >= item.quantity && product.stock > 0,
          },
        ]
      : []
  })
}
export function totals(lines: CartLine[], delivery: Delivery = 'standard') {
  const subtotal = lines.reduce((sum, l) => sum + cents(l.product.price) * l.quantity, 0)
  const shipping = subtotal === 0 || delivery === 'pickup' || subtotal >= 29900 ? 0 : 1990
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
  }
}
export function cartChanged(before: CartLine[], fresh: Product[]) {
  return before.some((line) => {
    const current = fresh.find((p) => p.id === line.product.id)
    return (
      !current ||
      current.stock < line.quantity ||
      cents(current.price) !== cents(line.product.price)
    )
  })
}
