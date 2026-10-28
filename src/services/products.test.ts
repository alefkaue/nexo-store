import { expect, it, vi } from 'vitest'
import { ApiError, fetchProduct, fetchProducts, parseProduct } from './products'
import { product } from '../test/fixtures'
it('interpreta produto e mantém imagens HTTPS do provedor', () => {
  const p = parseProduct({
    ...product,
    images: [product.thumbnail, 'javascript:bad', 'https://outro.invalid/image'],
  })
  expect(p.images).toEqual([product.thumbnail])
})
it('rejeita dados incompletos e preços inválidos', () => {
  expect(() => parseProduct(null)).toThrow(ApiError)
  expect(() => parseProduct({ ...product, price: NaN })).toThrow()
  expect(() => parseProduct({ ...product, stock: -1 })).toThrow()
  expect(() => parseProduct({ ...product, id: 1.5 })).toThrow()
})
it('usa campos opcionais defensivamente', () => {
  expect(
    parseProduct({
      ...product,
      brand: 42,
      rating: 99,
      description: null,
      images: null,
      thumbnail: null,
    }),
  ).toMatchObject({ brand: undefined, rating: 5, description: '', images: [], thumbnail: '' })
})
it('consulta a API real pelo contrato, sem dados de formulário', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ products: [product] })))
  vi.stubGlobal('fetch', fetch)
  expect(await fetchProducts()).toHaveLength(1)
  expect(fetch.mock.calls[0][0]).toContain('https://dummyjson.com/products?limit=0')
  expect(fetch.mock.calls[0][1]).not.toHaveProperty('body')
})
it('rejeita envelope inválido, duplicatas e listas excessivas', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response('{}'))
    .mockResolvedValueOnce(new Response(JSON.stringify({ products: [product, product] })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ products: Array(2001).fill(product) })))
  vi.stubGlobal('fetch', fetch)
  await expect(fetchProducts()).rejects.toThrow()
  await expect(fetchProducts()).rejects.toThrow('duplicados')
  await expect(fetchProducts()).rejects.toThrow('limite')
})
it('distingue 404 de falha de rede', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockRejectedValueOnce(new TypeError('offline')),
  )
  await expect(fetchProduct(78)).rejects.toMatchObject({ status: 404 })
  await expect(fetchProducts()).rejects.toThrow('conexão')
})
it('valida o ID antes da consulta e confere correspondência', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...product, id: 79 })))
  vi.stubGlobal('fetch', fetch)
  await expect(fetchProduct(-1)).rejects.toMatchObject({ status: 404 })
  expect(fetch).not.toHaveBeenCalled()
  await expect(fetchProduct(78)).rejects.toThrow('corresponde')
})
it('comunica falha HTTP e JSON inválido', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response('not json')),
  )
  await expect(fetchProducts()).rejects.toThrow('indisponível')
  await expect(fetchProducts()).rejects.toThrow('conexão')
})
