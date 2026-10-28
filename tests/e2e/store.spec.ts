import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fixture from '../fixtures/products.json' with { type: 'json' }

async function api(page: Page) {
  // Deterministic E2E tests never depend on the external API or its image CDN.
  // Real integration and screenshots are checked separately by scripts/smoke.mjs and capture.mjs.
  await page.route('https://cdn.dummyjson.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f3f4ee"/></svg>',
    }),
  )
  await page.route('https://dummyjson.com/products**', (route) => {
    const url = new URL(route.request().url())
    const last = url.pathname.split('/').pop()
    const product = fixture.products.find((p) => String(p.id) === last)
    return route.fulfill({
      status: url.pathname === '/products' ? 200 : product ? 200 : 404,
      contentType: 'application/json',
      body: JSON.stringify(
        url.pathname === '/products' ? fixture : (product ?? { message: 'Product not found' }),
      ),
    })
  })
}
async function addProduct(page: Page) {
  await page.goto('/produto/78')
  await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click()
}
async function fillCheckout(page: Page) {
  await page.getByLabel('Apelido fictício').fill('Nexo Demo')
  await page.getByLabel('E-mail fictício').fill('demo@example.com')
  await page.getByLabel('Cidade fictícia').fill('Cidade Exemplo')
  await page.getByLabel('Entendo que esta simulação').check()
}
test.beforeEach(async ({ page }) => {
  await api(page)
})

test('home, categorias, produto e imagens funcionam', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('perspectiva')
  await expect(page.getByTestId('product-card')).toHaveCount(8)
  await page.getByRole('link', { name: 'Para criar Notebooks & possibilidades' }).click()
  await expect(page).toHaveURL(/categoria=laptops/)
  await page.getByRole('link', { name: 'Ver Apple MacBook Pro 14 Inch Space Grey' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Apple MacBook Pro 14 Inch Space Grey',
  )
  await page.getByRole('button', { name: 'Ver imagem 2', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ver imagem 2', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
test('busca, combinação de filtros, ordenação e paginação persistem na URL', async ({
  page,
  isMobile,
}) => {
  await page.goto('/catalogo')
  await expect(page.getByTestId('product-card')).toHaveCount(12)
  await page.getByRole('button', { name: 'Página 2', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await page.getByRole('searchbox', { name: 'Pesquisar produtos no catálogo' }).fill('Apple')
  await expect(page).toHaveURL(/q=Apple/)
  await expect(page).not.toHaveURL(/page=2/)
  if (isMobile) await page.getByRole('button', { name: 'Filtros', exact: true }).click()
  await page.getByRole('radio', { name: 'Notebooks', exact: false }).check()
  const price = isMobile
    ? page.getByRole('dialog').getByLabel('Preço máximo')
    : page.getByLabel('Preço máximo').first()
  await price.selectOption('2000')
  if (isMobile) await page.getByRole('button', { name: /Ver \d+ produtos/ }).click()
  await page.getByRole('combobox', { name: 'Ordenar produtos' }).selectOption('menor-preco')
  await expect(page).toHaveURL(/categoria=laptops/)
  await expect(page).toHaveURL(/max=2000/)
  await expect(page.getByTestId('product-card')).toHaveCount(1)
  await page.reload()
  await expect(page.getByTestId('product-card')).toHaveCount(1)
})
test('busca vazia permite limpar a seleção', async ({ page }) => {
  await page.goto('/catalogo?q=naoexiste123456')
  await expect(page.getByRole('heading', { name: 'Ainda não é essa conexão.' })).toBeVisible()
  await page.getByRole('link', { name: 'Recomeçar a busca' }).click()
  await expect(page.getByTestId('product-card')).toHaveCount(12)
})
test('carrinho altera quantidade, remove e persiste após recarregar', async ({ page }) => {
  await addProduct(page)
  await page.goto('/carrinho')
  await expect(page.getByTestId('cart-line')).toHaveCount(1)
  const before = await page.getByTestId('subtotal').innerText()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(page.getByLabel('Quantidade', { exact: true })).toHaveText('2')
  await expect(page.getByTestId('subtotal')).not.toHaveText(before)
  await page.reload()
  await expect(page.getByLabel('Quantidade', { exact: true })).toHaveText('2')
  await page.getByRole('button', { name: 'Remover', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Seu próximo favorito está lá fora.' }),
  ).toBeVisible()
})
test('favoritos persistem e podem ser removidos', async ({ page }) => {
  await page.goto('/produto/78')
  await page.getByRole('button', { name: 'Salvar nos favoritos' }).click()
  await page.goto('/favoritos')
  await expect(page.getByTestId('product-card')).toHaveCount(1)
  await page.reload()
  await expect(page.getByTestId('product-card')).toHaveCount(1)
  await page.getByRole('button', { name: /Remover .* dos favoritos/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Sua curadoria começa com um coração.' }),
  ).toBeVisible()
})
test('checkout valida campos, recalcula retirada e não transmite o formulário', async ({
  page,
}) => {
  await addProduct(page)
  await page.goto('/checkout')
  await page.getByRole('button', { name: 'Concluir simulação' }).click()
  await expect(page.getByText('Use um apelido fictício entre 2 e 60 caracteres.')).toBeVisible()
  await expect(page.getByLabel('Apelido fictício')).toBeFocused()
  await fillCheckout(page)
  await page.getByRole('radio', { name: /Retirada demonstrativa/ }).check()
  const expectedTotal = await page.getByTestId('total').innerText()
  const transmitted: string[] = []
  page.on('request', (request) => {
    if (request.postData()?.includes('demo@example.com')) transmitted.push(request.url())
  })
  await page.getByRole('button', { name: 'Concluir simulação' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Do início ao fim')
  await expect(page.getByText(expectedTotal, { exact: true })).toBeVisible()
  expect(transmitted).toEqual([])
  const storage = await page.evaluate(() => localStorage.getItem('nexo:store:v1'))
  expect(storage).not.toContain('demo@example.com')
  expect(JSON.parse(storage!).cart).toEqual([])
})
test('checkout revalida estoque e preserva o carrinho quando muda', async ({ page }) => {
  await addProduct(page)
  await page.goto('/checkout')
  await fillCheckout(page)
  await page.route('https://dummyjson.com/products?**', (route) =>
    route.fulfill({
      json: {
        ...fixture,
        products: fixture.products.map((p) => (p.id === 78 ? { ...p, stock: 0 } : p)),
      },
    }),
  )
  await page.getByRole('button', { name: 'Concluir simulação' }).click()
  await expect(page.getByRole('alert')).toContainText('preço ou o estoque mudou')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('nexo:store:v1')!).cart),
  ).toHaveLength(1)
})
test('API com falha apresenta tentativa novamente; produto inexistente é tratado', async ({
  page,
}) => {
  await page.route('https://dummyjson.com/products?**', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  )
  await page.goto('/catalogo')
  await expect(page.getByRole('alert')).toContainText('indisponível')
  await page.route('https://dummyjson.com/products?**', (route) => route.fulfill({ json: fixture }))
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByTestId('product-card')).toHaveCount(12)
  await page.goto('/produto/99999')
  await expect(page.getByRole('heading', { name: 'Esse produto não está por aqui.' })).toBeVisible()
})
test('carregamento e falta de conexão são visíveis, sem resultados falsos', async ({ page }) => {
  await page.route('https://dummyjson.com/products?**', async (route) => {
    await new Promise((r) => setTimeout(r, 500))
    await route.abort('internetdisconnected')
  })
  await page.goto('/catalogo')
  await expect(page.getByRole('status', { name: 'Carregando produtos' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('conexão')
})
test('localStorage inválido não quebra a loja; produto esgotado não é comprável', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('nexo:store:v1', 'invalid-json'))
  await page.goto('/produto/999')
  await expect(page.getByRole('button', { name: 'Indisponível', exact: true })).toBeDisabled()
  await page.goto('/carrinho')
  await expect(
    page.getByRole('heading', { name: 'Seu próximo favorito está lá fora.' }),
  ).toBeVisible()
})
test('navegação por teclado, foco e filtros mobile têm saída por Escape', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
  if (isMobile) {
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
test('acessibilidade automatizada das cinco páginas de compra', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('product-card')).toHaveCount(8)
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
  await page.goto('/catalogo')
  await expect(page.getByTestId('product-card')).toHaveCount(12)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
  await addProduct(page)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
  await page.goto('/carrinho')
  await expect(page.getByTestId('cart-line')).toHaveCount(1)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
  await page.goto('/checkout')
  await expect(page.getByLabel('Apelido fictício')).toBeVisible()
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
})

test('checkout preserva o carrinho se a revalidação ficar sem conexão', async ({ page }) => {
  await addProduct(page)
  await page.goto('/checkout')
  await fillCheckout(page)
  await page.route('https://dummyjson.com/products?**', (route) =>
    route.abort('internetdisconnected'),
  )
  await page.getByRole('button', { name: 'Concluir simulação' }).click()
  await expect(page.getByRole('alert')).toContainText('Seu carrinho foi preservado')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('nexo:store:v1')!).cart),
  ).toHaveLength(1)
})

test('busca do cabeçalho e links de privacidade levam ao destino correto', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  if (isMobile) {
    await page.getByRole('button', { name: 'Abrir busca' }).click()
    await page.getByLabel('Buscar produtos', { exact: true }).fill('Apple')
    await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  } else {
    await page.getByLabel('Buscar na loja').fill('Apple')
    await page.getByRole('button', { name: 'Pesquisar', exact: true }).click()
  }
  await expect(page).toHaveURL(/q=Apple/)
  await expect(page.getByTestId('product-card').first()).toBeVisible()
  await page.getByRole('link', { name: 'Privacidade', exact: true }).click()
  await expect(page.locator('#privacidade')).toBeInViewport()
})
