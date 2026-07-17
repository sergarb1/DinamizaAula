import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'
const ROUTES = ['/', '/students', '/mechanics', '/statistics', '/settings']

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
  })

  for (const route of ROUTES) {
    test(`renders ${route} route`, async ({ page }) => {
      await page.goto(`${BASE}#${route}`)
      await expect(page.locator('main')).toBeVisible()
    })
  }

  test('nav links navigate correctly', async ({ page }) => {
    const links = page.locator('nav a')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(ROUTES.length)

    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      await link.click()
      await expect(page.locator('main')).toBeVisible()
      await page.waitForTimeout(200)
    }
  })

  test('mobile nav toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE}#/`)
    await page.waitForTimeout(300)
    const menuBtn = page.locator('header button svg').first()
    await menuBtn.click()
    await page.waitForTimeout(300)
    const mobileLinks = page.locator('.border-t a')
    expect(await mobileLinks.count()).toBeGreaterThanOrEqual(ROUTES.length)
  })

  test('back button from mechanic detail', async ({ page }) => {
    await page.goto(`${BASE}#/students`)
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    await page.goto(`${BASE}#/mechanics/roulette`)
    await page.waitForTimeout(300)
    const backBtn = page.getByText(/Volver a dinámicas|Back to activities/)
    await backBtn.click()
    await expect(page).toHaveURL(/#\/mechanics/)
  })
})
