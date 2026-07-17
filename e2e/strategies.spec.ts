import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}#/students`)
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
  })

  test('idle state shows strategy info', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/challenge`)
    await page.waitForTimeout(500)
    await expect(page.getByText('Bola caliente')).toBeVisible()
  })
})
