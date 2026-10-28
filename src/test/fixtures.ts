import type { Product } from '../domain/types'
export const product: Product = {
  id: 78,
  title: 'Notebook de teste',
  description: 'Produto fictício para testes.',
  category: 'laptops',
  price: 99.9,
  stock: 3,
  rating: 4.5,
  thumbnail:
    'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp',
  images: [],
  brand: 'Marca A',
}
export const products: Product[] = [
  product,
  { ...product, id: 79, title: 'Notebook B', price: 250, brand: 'Marca B', stock: 0, rating: 3 },
  { ...product, id: 80, title: 'Telefone C', category: 'smartphones', price: 150, rating: 4.9 },
  {
    ...product,
    id: 81,
    title: 'Luminária',
    category: 'home-decoration',
    price: 50,
    brand: undefined,
  },
  { ...product, id: 82, title: 'Fora da curadoria', category: 'beauty', price: 10 },
]
