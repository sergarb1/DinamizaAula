import { test, expect } from '@playwright/test'

const BASE = '/DinamizaAula/'

test.describe('Students CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}#/students`)
    await page.waitForTimeout(500)
  })

  test('shows empty state with load template buttons', async ({ page }) => {
    await expect(page.getByText('No hay alumnos todavía')).toBeVisible()
    const templateBtns = page.locator('button').filter({ hasText: /5º|4º|3º/ })
    expect(await templateBtns.count()).toBe(3)
  })

  test('loads example template from empty state', async ({ page }) => {
    const templateBtn = page.locator('button').filter({ hasText: '5º Primaria' }).first()
    await templateBtn.click()
    await page.waitForTimeout(300)
    const cards = page.locator('.grid > div')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('adds a new student', async ({ page }) => {
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('+ Añadir').click()
    await page.fill('#student-name', 'María')
    await page.fill('input[placeholder="Apellidos"]', 'García')
    await page.getByText('Añadir', { exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('María García')).toBeVisible()
  })

  test('validates required name field', async ({ page }) => {
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('+ Añadir').click()
    await page.getByText('Añadir', { exact: true }).click()
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible()
  })

  test('edits a student', async ({ page }) => {
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    const editBtn = page.locator('[title="Editar"]').first()
    await editBtn.click()
    await page.waitForTimeout(200)
    const nameInput = page.locator('#student-name')
    await nameInput.fill('Andrea')
    await page.getByText('Guardar').click()
    await page.waitForTimeout(200)
    await expect(page.getByText('Andrea')).toBeVisible()
  })

  test('deletes a student with confirmation', async ({ page }) => {
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    page.on('dialog', (dialog) => dialog.accept())
    const deleteBtn = page.locator('[title="Eliminar"]').first()
    await deleteBtn.click()
    await page.waitForTimeout(300)
  })

  test('loads different example data', async ({ page }) => {
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    await page.getByText('Ejemplos').click()
    await page.waitForTimeout(200)
    await page.getByText('3º ESO').click()
    await page.waitForTimeout(300)
  })

  test('exports data', async ({ page }) => {
    await page.locator('button').filter({ hasText: '5º Primaria' }).first().click()
    await page.waitForTimeout(300)
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      page.getByText('Exportar').click(),
    ])
    expect(download.suggestedFilename()).toContain('.json')
  })
})
