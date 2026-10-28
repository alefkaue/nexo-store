import { chromium, expect } from '@playwright/test'

// This check intentionally uses the real API. Keep deterministic tests in tests/e2e.
const base = (process.env.SMOKE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
const browser = await chromium.launch()
const results = []
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const errors = []
    const writes = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) writes.push(request.url())
    })
    const home = await page.goto(`${base}/`)
    expect(home.status()).toBe(200)
    await expect(page.getByTestId('product-card')).toHaveCount(8, { timeout: 25000 })
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.fonts.check('600 16px Manrope'))).toBe(true)
    await page.goto(`${base}/catalogo?categoria=laptops&ordem=menor-preco`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notebooks')
    await expect(page.getByTestId('product-card').first()).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notebooks')
    await page.getByTestId('product-card').first().getByRole('link', { name: /^Ver / }).click()
    await page.getByRole('button', { name: 'Salvar nos favoritos' }).click()
    await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click()
    await page.getByRole('link', { name: 'Ver seu carrinho', exact: true }).click()
    await expect(page.getByTestId('cart-line')).toHaveCount(1)
    await page.getByRole('link', { name: 'Continuar para a simulação' }).click()
    await page.getByLabel('Apelido fictício').fill('Nexo Demo')
    await page.getByLabel('E-mail fictício').fill('demo@example.com')
    await page.getByLabel('Cidade fictícia').fill('Cidade Exemplo')
    await page.getByLabel('Entendo que esta simulação').check()
    await page.getByRole('button', { name: 'Concluir simulação' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Do início ao fim', {
      timeout: 25000,
    })
    await page.getByRole('link', { name: /^Favoritos,/ }).click()
    await expect(page.getByTestId('product-card')).toHaveCount(1)
    await page.reload()
    await expect(page.getByTestId('product-card')).toHaveCount(1)
    const state = await page.evaluate(() => window.localStorage.getItem('nexo:store:v1'))
    expect(state).not.toContain('demo@example.com')
    expect(JSON.parse(state).cart).toEqual([])
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )
    expect(horizontalOverflow).toBe(false)
    expect(writes).toEqual([])
    expect(errors).toEqual([])
    results.push({
      viewport: name,
      homeStatus: home.status(),
      directRouteReload: true,
      checkout: 'confirmed-demo-only',
      favoritesPersisted: true,
      writes,
      errors,
      horizontalOverflow,
    })
    await context.close()
  }
  console.log(JSON.stringify({ base, realAPI: true, results }, null, 2))
} finally {
  await browser.close()
}
