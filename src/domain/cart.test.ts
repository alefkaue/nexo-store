import { describe, expect, it } from 'vitest'
import {
  cartChanged,
  cartLines,
  cents,
  EMPTY_STORE,
  MAX_LINES,
  MAX_QUANTITY,
  money,
  storeReducer,
  totals,
} from './cart'
import { product, products } from '../test/fixtures'

describe('carrinho e favoritos', () => {
  it('adiciona e agrega por ID sem duplicar linhas', () => {
    const a = storeReducer(EMPTY_STORE, { type: 'add', id: 78, stock: 3 })
    expect(storeReducer(a, { type: 'add', id: 78, stock: 3 }).cart).toEqual([
      { id: 78, quantity: 2 },
    ])
  })
  it('limita adição ao estoque', () => {
    const a = { cart: [{ id: 78, quantity: 3 }], favorites: [] }
    expect(storeReducer(a, { type: 'add', id: 78, stock: 3 }).cart[0].quantity).toBe(3)
  })
  it('rejeita adição sem estoque e IDs inválidos', () => {
    expect(storeReducer(EMPTY_STORE, { type: 'add', id: 78, stock: 0 })).toBe(EMPTY_STORE)
    expect(storeReducer(EMPTY_STORE, { type: 'add', id: -1, stock: 3 })).toBe(EMPTY_STORE)
  })
  it('limita quantidade à segurança de 99 unidades', () => {
    const a = storeReducer(EMPTY_STORE, { type: 'add', id: 78, stock: 200 })
    expect(
      storeReducer(a, { type: 'quantity', id: 78, quantity: 300, stock: 200 }).cart[0].quantity,
    ).toBe(MAX_QUANTITY)
  })
  it('remove com quantidade zero e trata estoque esgotado', () => {
    const a = { cart: [{ id: 78, quantity: 2 }], favorites: [] }
    expect(storeReducer(a, { type: 'quantity', id: 78, quantity: 0, stock: 3 }).cart).toEqual([])
    expect(storeReducer(a, { type: 'quantity', id: 78, quantity: 1, stock: 0 }).cart).toEqual([])
  })
  it('ignora valores não finitos', () => {
    const a = { cart: [{ id: 78, quantity: 2 }], favorites: [] }
    expect(storeReducer(a, { type: 'quantity', id: 78, quantity: NaN, stock: 3 })).toBe(a)
  })
  it('limita diferentes produtos', () => {
    const a = {
      cart: Array.from({ length: MAX_LINES }, (_, id) => ({ id: id + 1, quantity: 1 })),
      favorites: [],
    }
    expect(storeReducer(a, { type: 'add', id: 500, stock: 3 })).toBe(a)
  })
  it('remove apenas o produto solicitado', () => {
    const a = {
      cart: [
        { id: 78, quantity: 1 },
        { id: 79, quantity: 2 },
      ],
      favorites: [],
    }
    expect(storeReducer(a, { type: 'remove', id: 78 }).cart).toEqual([{ id: 79, quantity: 2 }])
  })
  it('alterna favoritos e rejeita ID inválido', () => {
    const a = storeReducer(EMPTY_STORE, { type: 'favorite', id: 78 })
    expect(a.favorites).toEqual([78])
    expect(storeReducer(a, { type: 'favorite', id: 78 }).favorites).toEqual([])
    expect(storeReducer(a, { type: 'favorite', id: 0 })).toBe(a)
  })
  it('concluir esvazia carrinho preservando favoritos', () => {
    expect(
      storeReducer({ cart: [{ id: 78, quantity: 1 }], favorites: [78] }, { type: 'clear' }),
    ).toEqual({ cart: [], favorites: [78] })
  })
  it('identifica mudança de estoque sem alterar a quantidade do usuário', () => {
    const lines = cartLines([{ id: 78, quantity: 9 }], products)
    expect(lines[0].available).toBe(false)
    expect(lines[0].quantity).toBe(9)
  })
  it('não fabrica produto ausente da API', () => {
    expect(cartLines([{ id: 999, quantity: 1 }], products)).toEqual([])
  })
})
describe('valores em centavos', () => {
  it('não acumula erro de ponto flutuante', () => {
    expect(cents(19.9)).toBe(1990)
    expect(
      totals([{ product: { ...product, price: 19.9 }, quantity: 3, available: true }]).subtotal,
    ).toBe(5970)
  })
  it('cobra frete abaixo de 299', () => {
    expect(totals([{ product, quantity: 1, available: true }])).toEqual({
      subtotal: 9990,
      shipping: 1990,
      total: 11980,
      count: 1,
    })
  })
  it('frete grátis exatamente no limiar', () => {
    expect(
      totals([{ product: { ...product, price: 299 }, quantity: 1, available: true }]).shipping,
    ).toBe(0)
  })
  it('retirada é gratuita e carrinho vazio não gera frete', () => {
    expect(totals([{ product, quantity: 1, available: true }], 'pickup').shipping).toBe(0)
    expect(totals([]).total).toBe(0)
  })
  it('formata reais', () => {
    expect(money(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56')
  })
  it('detecta preço ou estoque alterado antes da confirmação', () => {
    const before = cartLines([{ id: 78, quantity: 2 }], products)
    expect(cartChanged(before, products)).toBe(false)
    expect(cartChanged(before, [{ ...product, price: 100 }])).toBe(true)
    expect(cartChanged(before, [{ ...product, stock: 1 }])).toBe(true)
    expect(cartChanged(before, [])).toBe(true)
  })
})
