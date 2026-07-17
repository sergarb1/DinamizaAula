import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}#/`)
  })

  test('skip link is present and focusable', async ({ page }) => {
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeVisible()
    await expect(skipLink).toHaveText('Saltar al contenido principal')

    await skipLink.focus()
    const isFocused = await skipLink.evaluate(el => el === document.activeElement)
    expect(isFocused).toBe(true)
  })

  test('skip link points to main content', async ({ page }) => {
    const skipLink = page.locator('.skip-link')
    const href = await skipLink.getAttribute('href')
    expect(href).toBe('#main-content')
  })

  test('main content has id', async ({ page }) => {
    const main = page.locator('main')
    const id = await main.getAttribute('id')
    expect(id).toBe('main-content')
  })

  test('header logo has alt text', async ({ page }) => {
    const logo = page.locator('header img')
    await expect(logo).toBeVisible()
    const alt = await logo.getAttribute('alt')
    expect(alt).toBeTruthy()
  })

  test('dark mode toggle has title attribute', async ({ page }) => {
    const toggle = page.locator('header button[title]').first()
    const title = await toggle.getAttribute('title')
    expect(title).toBeTruthy()
  })

  test('empty home has load template options', async ({ page }) => {
    await expect(page.getByText('Cargar plantilla de ejemplo')).toBeVisible()
    await expect(page.getByText('Añadir alumnos')).toBeVisible()
  })
})
