import { expect, it, vi } from 'vitest'
import { parseStored, readStore, serializeStore } from './persistence'
import { MAX_LINES } from '../domain/cart'
it('recupera versão suportada sem dados pessoais', () => {
  const state = { cart: [{ id: 78, quantity: 2 }], favorites: [78] }
  expect(parseStored(serializeStore(state))).toEqual(state)
  expect(JSON.parse(serializeStore(state))).not.toHaveProperty('email')
})
it('ignora JSON corrompido e versões desconhecidas', () => {
  expect(parseStored('broken')).toEqual({ cart: [], favorites: [] })
  expect(parseStored('{"version":9}').cart).toEqual([])
  expect(parseStored(null).favorites).toEqual([])
})
it('rejeita IDs, quantidades e duplicatas inválidos', () => {
  const raw = JSON.stringify({
    version: 1,
    cart: [
      { id: 78, quantity: 2 },
      { id: 78, quantity: 7 },
      { id: -1, quantity: 1 },
      { id: 80, quantity: 200 },
      { id: 81, quantity: 0 },
    ],
    favorites: [78, 78, -1, '80', 80],
  })
  expect(parseStored(raw)).toEqual({
    cart: [
      { id: 78, quantity: 2 },
      { id: 80, quantity: 99 },
    ],
    favorites: [78, 80],
  })
})
it('limita o tamanho de dados de persistência', () => {
  const raw = JSON.stringify({
    version: 1,
    cart: Array.from({ length: 200 }, (_, i) => ({ id: i + 1, quantity: 1 })),
    favorites: Array.from({ length: 200 }, (_, i) => i + 1),
  })
  expect(parseStored(raw).cart).toHaveLength(MAX_LINES)
  expect(parseStored(raw).favorites).toHaveLength(100)
})
it('funciona quando localStorage está bloqueado', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied')
  })
  expect(readStore()).toEqual({ state: { cart: [], favorites: [] }, unavailable: true })
})
