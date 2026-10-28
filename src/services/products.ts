import type { Product } from '../domain/types'
export const API_URL = 'https://dummyjson.com'
export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
const imageUrl = (v: unknown) =>
  typeof v === 'string' && /^https:\/\/cdn\.dummyjson\.com\//.test(v) ? v : ''
export function parseProduct(value: unknown): Product {
  if (!value || typeof value !== 'object')
    throw new ApiError('O catálogo retornou dados inesperados.')
  const p = value as Record<string, unknown>
  if (
    typeof p.id !== 'number' ||
    !Number.isSafeInteger(p.id) ||
    p.id <= 0 ||
    typeof p.title !== 'string' ||
    typeof p.category !== 'string' ||
    typeof p.price !== 'number' ||
    !Number.isFinite(p.price) ||
    p.price < 0 ||
    typeof p.stock !== 'number' ||
    !Number.isSafeInteger(p.stock) ||
    p.stock < 0
  )
    throw new ApiError('O catálogo retornou dados inesperados.')
  return {
    id: p.id,
    title: p.title,
    description: typeof p.description === 'string' ? p.description : '',
    category: p.category,
    price: p.price,
    stock: p.stock,
    rating:
      typeof p.rating === 'number' && Number.isFinite(p.rating)
        ? Math.min(5, Math.max(0, p.rating))
        : 0,
    thumbnail: imageUrl(p.thumbnail),
    images: Array.isArray(p.images) ? p.images.map(imageUrl).filter(Boolean) : [],
    brand: typeof p.brand === 'string' ? p.brand : undefined,
  }
}
async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) controller.abort()
  const timeout = setTimeout(abort, 12000)
  try {
    const response = await fetch(API_URL + path, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok)
      throw new ApiError(
        response.status === 404
          ? 'Produto não encontrado.'
          : 'O catálogo está indisponível no momento.',
        response.status,
      )
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (signal?.aborted) throw error
    throw new ApiError(
      'Não foi possível conectar ao catálogo. Confira sua conexão e tente novamente.',
    )
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const data = await request(
    '/products?limit=0&select=id,title,description,category,price,stock,rating,thumbnail,images,brand',
    signal,
  )
  if (!data || typeof data !== 'object' || !('products' in data) || !Array.isArray(data.products))
    throw new ApiError('Não foi possível interpretar o catálogo.')
  if (data.products.length > 2000)
    throw new ApiError('O catálogo ultrapassou o limite desta demonstração.')
  const products = data.products.map(parseProduct)
  if (new Set(products.map((p) => p.id)).size !== products.length)
    throw new ApiError('O catálogo retornou produtos duplicados.')
  return products
}
export async function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError('Produto não encontrado.', 404)
  const product = parseProduct(await request(`/products/${id}`, signal))
  if (product.id !== id) throw new ApiError('O produto recebido não corresponde ao solicitado.')
  return product
}
