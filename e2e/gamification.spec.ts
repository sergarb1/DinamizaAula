import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Gamification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}#/students`)
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
  })

  test('home shows empty state when no students', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined })
    const page = await ctx.newPage()
    await page.goto(`${BASE}#/`)
    await page.waitForTimeout(500)
    await expect(page.getByText('Cargar plantilla de ejemplo')).toBeVisible()
    await ctx.close()
  })

  test('home has gamification section with students', async ({ page }) => {
    await page.goto(`${BASE}#/`)
    await page.waitForTimeout(500)
    const hasSection = await page.getByText(/estrella|xp|nivel|insignias|logros|🏆/i).isVisible().catch(() => false)
    expect(hasSection).toBe(true)
  })
})
