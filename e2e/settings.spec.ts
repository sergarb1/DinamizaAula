import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Settings', () => {
  test('renders settings page', async ({ page }) => {
    await page.goto(`${BASE}#/settings`)
    await page.waitForTimeout(500)
    await expect(page.locator('h2').filter({ hasText: 'Ajustes' })).toBeVisible()
  })

  test('renders all setting sections', async ({ page }) => {
    await page.goto(`${BASE}#/settings`)
    await page.waitForTimeout(500)
    await expect(page.getByText('Apariencia')).toBeVisible()
    await expect(page.locator('main h3').filter({ hasText: 'Sonido y efectos' })).toBeVisible()
    await expect(page.locator('main h3').filter({ hasText: 'Privacidad' })).toBeVisible()
    await expect(page.locator('main h3').filter({ hasText: 'Gamificación' })).toBeVisible()
  })

  test('toggles dark mode', async ({ page }) => {
    await page.goto(`${BASE}#/settings`)
    await page.waitForTimeout(500)
    const toggle = page.locator('button.relative.w-12.h-6').first()
    await toggle.click()
    await page.waitForTimeout(300)
  })

  test('shows privacy info', async ({ page }) => {
    await page.goto(`${BASE}#/settings`)
    await page.waitForTimeout(500)
    await expect(page.locator('main').getByText('Todo funciona en tu navegador')).toBeVisible()
  })

  test('clear data with confirmation', async ({ page }) => {
    await page.goto(`${BASE}#/settings`)
    await page.waitForTimeout(500)
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByText('Borrar todos los datos').click()
    await page.waitForTimeout(500)
  })

  test('switches language to English and back to Spanish', async ({ page }) => {
    await page.goto(`${BASE}#/settings`)
    await page.waitForTimeout(500)
    const langSelect = page.locator('select')
    await expect(langSelect).toBeVisible()
    await langSelect.selectOption('en')
    await page.waitForTimeout(300)
    await expect(page.locator('h2').filter({ hasText: 'Settings' })).toBeVisible()
    await expect(page.getByText('🌐 Language').first()).toBeVisible()
    await langSelect.selectOption('es')
    await page.waitForTimeout(300)
    await expect(page.locator('h2').filter({ hasText: 'Ajustes' })).toBeVisible()
  })
})
