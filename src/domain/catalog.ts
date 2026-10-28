import type { Product } from './types'

export const COLLECTIONS = [
  { slug: 'laptops', label: 'Notebooks', group: 'tech' },
  { slug: 'smartphones', label: 'Smartphones', group: 'tech' },
  { slug: 'tablets', label: 'Tablets', group: 'tech' },
  { slug: 'mobile-accessories', label: 'Acessórios', group: 'tech' },
  { slug: 'home-decoration', label: 'Decoração', group: 'home' },
  { slug: 'furniture', label: 'Móveis', group: 'home' },
  { slug: 'kitchen-accessories', label: 'Cozinha', group: 'home' },
  { slug: 'mens-watches', label: 'Relógios', group: 'tech' },
] as const
export const categoryName = (slug: string) =>
  COLLECTIONS.find((c) => c.slug === slug)?.label ?? slug
export const isCurated = (p: Product) => COLLECTIONS.some((c) => c.slug === p.category)
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
export interface Filters {
  query: string
  category: string
  collection: string
  brand: string
  maxPrice: number
  inStock: boolean
  sort: string
  page: number
}
export const PAGE_SIZE = 12
export function readFilters(params: URLSearchParams): Filters {
  const max = Number(params.get('max'))
  const page = Number(params.get('page'))
  return {
    query: (params.get('q') ?? '').slice(0, 120),
    category: params.get('categoria') ?? '',
    collection: params.get('colecao') ?? '',
    brand: params.get('marca') ?? '',
    maxPrice: params.has('max') && Number.isFinite(max) && max >= 0 ? max : Infinity,
    inStock: params.get('estoque') === 'sim',
    sort: params.get('ordem') ?? 'relevancia',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}
export function filterProducts(products: Product[], filters: Filters): Product[] {
  const q = normalize(filters.query.trim())
  const result = products.filter(
    (p) =>
      isCurated(p) &&
      (!q ||
        normalize(
          `${p.title} ${p.brand ?? ''} ${categoryName(p.category)} ${p.description}`,
        ).includes(q)) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.collection ||
        COLLECTIONS.some((c) => c.slug === p.category && c.group === filters.collection)) &&
      (!filters.brand || p.brand === filters.brand) &&
      p.price <= filters.maxPrice &&
      (!filters.inStock || p.stock > 0),
  )
  return result.sort((a, b) => {
    switch (filters.sort) {
      case 'menor-preco':
        return a.price - b.price || a.id - b.id
      case 'maior-preco':
        return b.price - a.price || a.id - b.id
      case 'avaliacao':
        return b.rating - a.rating || a.id - b.id
      case 'nome':
        return a.title.localeCompare(b.title, 'pt-BR')
      default:
        return a.id - b.id
    }
  })
}
export function paginate<T>(items: T[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const page = Math.min(
    pages,
    Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1),
  )
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), page, pages }
}
