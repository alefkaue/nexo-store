import { describe, expect, it } from 'vitest'
import { categoryName, filterProducts, normalize, paginate, readFilters } from './catalog'
import { products, product } from '../test/fixtures'
const filters = readFilters(new URLSearchParams())
describe('catálogo', () => {
  it('limita a curadoria sem alterar a lista original', () => {
    expect(filterProducts(products, filters)).toHaveLength(4)
    expect(products).toHaveLength(5)
  })
  it('pesquisa por nome, marca e categoria em português sem acentos', () => {
    expect(filterProducts(products, { ...filters, query: 'luminaria' })[0].id).toBe(81)
    expect(filterProducts(products, { ...filters, query: 'Marca B' })[0].id).toBe(79)
    expect(normalize('Decoração')).toBe('decoracao')
  })
  it('combina categoria, marca, preço e estoque', () => {
    expect(
      filterProducts(products, {
        ...filters,
        category: 'laptops',
        brand: 'Marca A',
        maxPrice: 100,
        inStock: true,
      }),
    ).toEqual([product])
  })
  it('permite filtrar apenas casa', () => {
    expect(filterProducts(products, { ...filters, collection: 'home' }).map((p) => p.id)).toEqual([
      81,
    ])
  })
  it('ordena por menor e maior preço', () => {
    expect(filterProducts(products, { ...filters, sort: 'menor-preco' })[0].id).toBe(81)
    expect(filterProducts(products, { ...filters, sort: 'maior-preco' })[0].id).toBe(79)
  })
  it('ordena por avaliação e por nome', () => {
    expect(filterProducts(products, { ...filters, sort: 'avaliacao' })[0].id).toBe(80)
    expect(filterProducts(products, { ...filters, sort: 'nome' })[0].id).toBe(81)
  })
  it('retorna lista vazia sem desconsiderar filtros', () => {
    expect(filterProducts(products, { ...filters, query: 'impossivel' })).toEqual([])
  })
  it('sanitiza página, preço e tamanho de busca da URL', () => {
    expect(readFilters(new URLSearchParams('page=-20&max=NaN')).page).toBe(1)
    expect(readFilters(new URLSearchParams('page=Infinity&max=-1')).maxPrice).toBe(Infinity)
    expect(readFilters(new URLSearchParams('q=' + 'x'.repeat(200))).query.length).toBe(120)
  })
  it('paginação mantém limites e não perde itens', () => {
    const values = Array.from({ length: 25 }, (_, i) => i)
    expect(paginate(values, 2).items).toEqual(values.slice(12, 24))
    expect(paginate(values, 999).page).toBe(3)
    expect(paginate([], 1)).toEqual({ items: [], page: 1, pages: 1 })
    expect(paginate(values, NaN).page).toBe(1)
  })
  it('retorna slug quando categoria não é conhecida', () => {
    expect(categoryName('custom')).toBe('custom')
  })
})
