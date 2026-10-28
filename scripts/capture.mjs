import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const url = process.env.CAPTURE_URL || 'http://127.0.0.1:4173'
const folder = new URL('../docs/screenshots/', import.meta.url)
await mkdir(folder, { recursive: true })
const browser = await chromium.launch()
const observations = []
async function settleImages(page) {
  const height = page.viewportSize().height
  const fullHeight = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < fullHeight; y += height) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(
    () => [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    undefined,
    { timeout: 20000 },
  )
}
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1080],
    ['mobile', 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await page.goto(url, { waitUntil: 'networkidle' })
    await page.getByTestId('product-card').first().waitFor({ timeout: 25000 })
    await page.evaluate(() => document.fonts.ready)
    await settleImages(page)
    await page.waitForTimeout(500)
    if (name === 'desktop') {
      await page.screenshot({
        path: new URL('desktop-home-fold.png', folder).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
        animations: 'disabled',
      })
    }
    await page.screenshot({
      path: new URL(`${name}-home.png`, folder).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
      fullPage: true,
      animations: 'disabled',
    })
    observations.push({
      name,
      url: page.url(),
      http: response?.status(),
      errors,
      horizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      realProducts: await page.getByTestId('product-card').count(),
    })
    if (name === 'desktop') {
      await page.goto(`${url.replace(/\/$/, '')}/catalogo`)
      await page.getByTestId('product-card').first().waitFor()
      await settleImages(page)
      await page.screenshot({
        path: new URL('catalog.png', folder).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
        fullPage: true,
      })
      await page.goto(`${url.replace(/\/$/, '')}/produto/78`)
      await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).waitFor()
      await settleImages(page)
      await page.screenshot({
        path: new URL('product.png', folder).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
        fullPage: true,
      })
      await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click()
      await page.goto(`${url.replace(/\/$/, '')}/carrinho`)
      await page.getByTestId('cart-line').waitFor()
      await settleImages(page)
      await page.screenshot({
        path: new URL('cart.png', folder).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
        fullPage: true,
      })
    }
    await context.close()
  }
} finally {
  await browser.close()
}
await writeFile(
  new URL('../capture-results.json', folder),
  JSON.stringify(
    {
      source: 'Aplicação executada com API DummyJSON real, sem interceptação de dados.',
      observations,
    },
    null,
    2,
  ),
)
console.log(JSON.stringify(observations, null, 2))
