import { expect, test } from '@playwright/test'

test('loads the DaySpark activity flow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'What would feel good right now?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suggest Activities' })).toBeDisabled()
})
