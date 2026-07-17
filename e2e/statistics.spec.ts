import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}#/students`)
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
  })

  test('shows statistics page', async ({ page }) => {
    await page.goto(`${BASE}#/statistics`)
    await page.waitForTimeout(500)
    await expect(page.locator('h2').filter({ hasText: 'Estadísticas' })).toBeVisible()
  })

  test('shows sections on statistics page', async ({ page }) => {
    await page.goto(`${BASE}#/statistics`)
    await page.waitForTimeout(500)
    await expect(page.locator('h3').filter({ hasText: 'Participaciones por alumno' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Equidad' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Últimas participaciones' })).toBeVisible()
  })

  test('shows equity section', async ({ page }) => {
    await page.goto(`${BASE}#/statistics`)
    await page.waitForTimeout(500)
    await expect(page.getByText('Índice Gini')).toBeVisible()
  })
})
