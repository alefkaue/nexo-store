import { useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { MAX_LINES, MAX_QUANTITY, storeReducer } from '../domain/cart'
import { readStore, serializeStore, STORAGE_KEY } from './persistence'
import { StoreContext } from './store-context'
import type { StoreContextValue } from './store-context'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readStore)
  const [state, dispatch] = useReducer(storeReducer, initial.state)
  const [message, setMessage] = useState('')
  const [storageUnavailable, setStorageUnavailable] = useState(initial.unavailable)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeStore(state))
    } catch {
      setStorageUnavailable(true)
    }
  }, [state])
  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      message,
      storageUnavailable,
      add(product) {
        const current = state.cart.find((i) => i.id === product.id)
        if (!current && state.cart.length >= MAX_LINES) {
          setMessage('Limite de 30 produtos diferentes no carrinho.')
          return
        }
        if (Math.min(product.stock, MAX_QUANTITY) <= (current?.quantity ?? 0)) {
          setMessage('Limite disponível deste produto atingido.')
          return
        }
        dispatch({ type: 'add', id: product.id, stock: product.stock })
        setMessage(`${product.title} adicionado ao carrinho.`)
      },
      quantity: (id, quantity, stock) => dispatch({ type: 'quantity', id, quantity, stock }),
      remove(id) {
        dispatch({ type: 'remove', id })
        setMessage('Produto removido do carrinho.')
      },
      favorite(id) {
        dispatch({ type: 'favorite', id })
        setMessage(
          state.favorites.includes(id)
            ? 'Produto removido dos favoritos.'
            : 'Produto salvo nos favoritos.',
        )
      },
      clear: () => dispatch({ type: 'clear' }),
      dismiss: () => setMessage(''),
    }),
    [state, message, storageUnavailable],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
