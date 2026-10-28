import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { ProductCard } from './ProductCard'
import { StoreProvider } from '../state/StoreProvider'
import { product } from '../test/fixtures'
it('adiciona produto e favorito com controles acessíveis', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <StoreProvider>
        <ProductCard product={product} />
      </StoreProvider>
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('button', { name: `Adicionar ${product.title} ao carrinho` }))
  await user.click(screen.getByRole('button', { name: `Adicionar ${product.title} aos favoritos` }))
  expect(
    screen.getByRole('button', { name: `Remover ${product.title} dos favoritos` }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(localStorage.getItem('nexo:store:v1')).toContain('"quantity":1')
})
it('desabilita compra de produto sem estoque', () => {
  render(
    <MemoryRouter>
      <StoreProvider>
        <ProductCard product={{ ...product, stock: 0 }} />
      </StoreProvider>
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('button', { name: `Adicionar ${product.title} ao carrinho` }),
  ).toBeDisabled()
  expect(screen.getByText('Indisponível')).toBeVisible()
})
