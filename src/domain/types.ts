export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  stock: number
  rating: number
  thumbnail: string
  images: string[]
  brand?: string
}
export interface CartItem {
  id: number
  quantity: number
}
export interface StoreState {
  cart: CartItem[]
  favorites: number[]
}
export interface CartLine {
  product: Product
  quantity: number
  available: boolean
}
export type Delivery = 'standard' | 'pickup'
export interface DemoOrder {
  reference: string
  count: number
  total: number
}
