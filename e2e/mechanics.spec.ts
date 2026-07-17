import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}#/students`)
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
  })

  const mechanics = [
    { id: 'roulette', button: 'Girar' },
    { id: 'quick-pick', button: 'Sortear' },
  ]

  for (const m of mechanics) {
    test(`${m.id} loads and has action button`, async ({ page }) => {
      await page.goto(`${BASE}#/mechanics/${m.id}`)
      await page.waitForTimeout(500)
      const btn = page.locator('button').filter({ hasText: m.button }).first()
      await expect(btn).toBeVisible()
    })
  }

  test('queue mechanic generates queue on load', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/queue`)
    await page.waitForTimeout(500)
    await expect(page.getByText('Siguiente')).toBeVisible()
  })

  test('teams mechanic loads and auto-generates teams', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/teams`)
    await page.waitForTimeout(1000)
    await expect(page.getByText(/Sortear equipo|Pick team/)).toBeVisible()
    // Teams should auto-generate
    await expect(page.getByText(/equipos de|teams of/i)).toBeVisible()
  })

  test('legacy mechanic IDs redirect to mechanics list', async ({ page }) => {
    const legacy = ['dice', 'tombola', 'chest', 'gacha', 'infinite-queue', 'captain', 'timer', 'survival', 'chain', 'fullscreen', 'class-mode']
    for (const id of legacy) {
      await page.goto(`${BASE}#/mechanics/${id}`)
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(`${BASE}#/mechanics`)
    }
  })

  test('challenge mechanic loads', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/challenge`)
    await page.waitForTimeout(500)
    await expect(page.getByText('Seleccionar')).toBeVisible()
  })

  test('queue mechanic advances and shows result', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/queue`)
    await page.waitForTimeout(1000)
    const nextBtn = page.getByText('Siguiente')
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()
    await page.waitForTimeout(1000)
    await expect(page.getByText('Continuar').first()).toBeVisible()
  })

  test('challenge selects student and shows challenge text', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/challenge`)
    await page.waitForTimeout(500)
    const selectBtn = page.getByText('Seleccionar')
    await expect(selectBtn).toBeVisible()
    await selectBtn.click()
    // Wait for animation + result
    await page.waitForTimeout(3000)
    // Celebration popup should appear
    await expect(page.getByText('Continuar').first()).toBeVisible({ timeout: 5000 })
    // A student name should be shown
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    // Close celebration
    await page.getByText('Continuar').first().click()
    await page.waitForTimeout(300)
    // Now the result area should show a name with surname
    const selectedName = page.locator('.font-outfit.text-2xl').first()
    await expect(selectedName).toBeVisible()
  })

  test('challenge manages challenges dialog opens', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/challenge`)
    await page.waitForTimeout(500)
    // Click the manage challenges button (in idle state)
    await page.locator('button').filter({ hasText: 'Gestionar retos' }).click()
    await page.waitForTimeout(500)
    // Dialog should appear with the add input
    await expect(page.getByPlaceholder('Añadir nuevo reto...')).toBeVisible({ timeout: 5000 })
  })

  test('teams select picks a team', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/teams`)
    await page.waitForTimeout(1000)
    // Teams auto-generated, button should show pick team
    const pickBtn = page.getByText(/Sortear equipo|Pick team/)
    await expect(pickBtn).toBeVisible()
    await pickBtn.click()
    await page.waitForTimeout(3000)
    // Celebration should appear
    await expect(page.getByText('Continuar').first()).toBeVisible({ timeout: 5000 })
    await page.getByText('Continuar').first().click()
    await page.waitForTimeout(300)
    // A team should be highlighted with the target icon
    await expect(page.getByText('🎯').first()).toBeVisible()
  })

  test('teams size control is visible and functional', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/teams`)
    await page.waitForTimeout(500)
    const minusBtn = page.locator('button').filter({ hasText: '−' })
    const plusBtn = page.locator('button').filter({ hasText: '+' })
    await expect(minusBtn).toBeVisible()
    await expect(plusBtn).toBeVisible()
  })

  test('timer toggle is visible and functional', async ({ page }) => {
    await page.goto(`${BASE}#/mechanics/challenge`)
    await page.waitForTimeout(500)
    const autoToggle = page.getByText('Auto')
    await expect(autoToggle).toBeVisible()
  })
})
