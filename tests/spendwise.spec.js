// ─────────────────────────────────────────────────────────────────────────────
// SpendWise Mini — Manual Testing Checklist (automated with Playwright)
//
// Covers:
//   1. Income per period (each month/year stores its own value)
//   2. Balance math (income - expenses, green/red states)
//   3. Arrow navigation isolation (expenses scoped to their period)
//   4. PDF export (generates without errors)
//   5. Edge cases (empty income, zero expenses, disabled Add button)
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test'

// ── Helpers ──────────────────────────────────────────────────────────────────

// Clear localStorage before each test so tests don't bleed into each other
async function clearStorage(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

// Add a single expense via the form
async function addExpense(page, { name, price, category }) {
  await page.fill('#item-name', name)
  await page.fill('#item-price', String(price))
  await page.selectOption('#item-category', category)
  await page.click('#add-btn')
}

// Click the ‹ (previous period) arrow
async function clickPrev(page) {
  await page.click('button[aria-label="Previous period"]')
}

// Click the › (next period) arrow
async function clickNext(page) {
  await page.click('button[aria-label="Next period"]')
}

// Read the text of the period label between the arrows
async function getPeriodLabel(page) {
  return page.locator('.flex.items-center.justify-between.-mt-3 p').textContent()
}

// Read the income input value
async function getIncomeValue(page) {
  return page.locator('input[type="number"][placeholder="0.00"]').first().inputValue()
}

// Read the balance text
async function getBalance(page) {
  // Balance is the 3rd cell in the Income/Expenses/Balance grid
  const cells = page.locator('.grid.grid-cols-3 > div')
  return cells.nth(2).locator('span').last().textContent()
}

// Read the expenses total text
async function getExpensesTotal(page) {
  const cells = page.locator('.grid.grid-cols-3 > div')
  return cells.nth(1).locator('span').last().textContent()
}

// Switch timeframe: 'Month' or 'Year'
async function switchTimeframe(page, label) {
  // Target the toggle buttons directly by their text inside the Statistics section
  await page.locator(`h2:has-text("Statistics") ~ div button:has-text("${label}")`).click()
}

// ── Test Suite ────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────
// GROUP 1: Income Per Period
// ─────────────────────────────────────────────────
test.describe('Income Per Period', () => {

  test('each month stores its own income value', async ({ page }) => {
    await clearStorage(page)

    // Enter income for current month
    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('3000')

    // Navigate to previous month
    await clickPrev(page)

    // Previous month's income should be empty
    const prevIncome = await getIncomeValue(page)
    expect(prevIncome).toBe('')

    // Enter a different income for this month
    await incomeInput.fill('2500')

    // Go back to current month
    await clickNext(page)

    // Current month should still show 3000
    const currentIncome = await getIncomeValue(page)
    expect(currentIncome).toBe('3000')
  })

  test('income persists after page reload', async ({ page }) => {
    await clearStorage(page)

    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('4500')

    await page.reload()

    const afterReload = await getIncomeValue(page)
    expect(afterReload).toBe('4500')
  })

  test('year view income is separate from monthly income', async ({ page }) => {
    await clearStorage(page)

    // Set monthly income
    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('3000')

    // Switch to year view
    await switchTimeframe(page, 'Year')

    // Year income should be empty (separate key)
    const yearIncome = await getIncomeValue(page)
    expect(yearIncome).toBe('')

    // Set year income
    await incomeInput.fill('36000')

    // Switch back to month — monthly income unchanged
    await switchTimeframe(page, 'Month')
    const monthIncome = await getIncomeValue(page)
    expect(monthIncome).toBe('3000')
  })

})

// ─────────────────────────────────────────────────
// GROUP 2: Balance Math
// ─────────────────────────────────────────────────
test.describe('Balance Math', () => {

  test('positive balance: income 3000, expenses 1200 → balance 1800 in green', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Groceries', price: 1200, category: 'Food' })

    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('3000')

    const balance = await getBalance(page)
    expect(balance).toContain('1800.00')

    // Balance span should have green color class
    const balanceSpan = page.locator('.grid.grid-cols-3 > div').nth(2).locator('span').last()
    await expect(balanceSpan).toHaveClass(/text-emerald-400/)
  })

  test('negative balance: income 1000, expenses 1500 → balance -500 in red', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Laptop', price: 1500, category: 'Shopping' })

    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('1000')

    const balance = await getBalance(page)
    expect(balance).toContain('-500.00')

    const balanceSpan = page.locator('.grid.grid-cols-3 > div').nth(2).locator('span').last()
    await expect(balanceSpan).toHaveClass(/text-red-400/)
  })

  test('empty income treated as 0 → balance is negative when expenses exist', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Coffee', price: 15, category: 'Food' })

    // Leave income empty
    const balance = await getBalance(page)
    expect(balance).toContain('-15.00')

    const balanceSpan = page.locator('.grid.grid-cols-3 > div').nth(2).locator('span').last()
    await expect(balanceSpan).toHaveClass(/text-red-400/)
  })

  test('no expenses, income 3000 → balance equals income in green', async ({ page }) => {
    await clearStorage(page)

    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('3000')

    const balance = await getBalance(page)
    expect(balance).toContain('3000.00')

    const balanceSpan = page.locator('.grid.grid-cols-3 > div').nth(2).locator('span').last()
    await expect(balanceSpan).toHaveClass(/text-emerald-400/)
  })

})

// ─────────────────────────────────────────────────
// GROUP 3: Arrow Navigation Isolation
// ─────────────────────────────────────────────────
test.describe('Arrow Navigation Isolation', () => {

  test('expense only appears in the month it was created', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Roti Canai', price: 3.50, category: 'Food' })

    // Current month shows RM 3.50
    const currentTotal = await getExpensesTotal(page)
    expect(currentTotal).toContain('3.50')

    // Navigate to previous month — should show RM 0.00
    await clickPrev(page)
    const prevTotal = await getExpensesTotal(page)
    expect(prevTotal).toContain('0.00')
  })

  test('pie chart shows empty state for a month with no expenses', async ({ page }) => {
    await clearStorage(page)

    // Navigate to previous month (no expenses there)
    await clickPrev(page)

    // Empty state illustration should be visible
    await expect(page.locator('text=No expenses for this month')).toBeVisible()
  })

  test('forward arrow disabled on current period', async ({ page }) => {
    await clearStorage(page)

    const nextBtn = page.locator('button[aria-label="Next period"]')
    await expect(nextBtn).toBeDisabled()
  })

  test('forward arrow enabled after navigating back', async ({ page }) => {
    await clearStorage(page)

    await clickPrev(page)

    const nextBtn = page.locator('button[aria-label="Next period"]')
    await expect(nextBtn).toBeEnabled()
  })

})

// ─────────────────────────────────────────────────
// GROUP 4: PDF Export
// ─────────────────────────────────────────────────
test.describe('PDF Export', () => {

  test('PDF download triggers without errors when expenses exist', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Lunch', price: 12, category: 'Food' })

    const incomeInput = page.locator('input[type="number"][placeholder="0.00"]').first()
    await incomeInput.fill('2000')

    // Listen for the download event — if it fires the PDF was generated
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download PDF")')
    ])

    expect(download.suggestedFilename()).toMatch(/SpendWise_.*\.pdf/)
  })

  test('PDF download works even with no expenses (empty state)', async ({ page }) => {
    await clearStorage(page)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download PDF")')
    ])

    expect(download.suggestedFilename()).toMatch(/SpendWise_.*\.pdf/)
  })

})

// ─────────────────────────────────────────────────
// GROUP 5: Edge Cases & Form Validation
// ─────────────────────────────────────────────────
test.describe('Edge Cases', () => {

  test('Add button disabled when name is empty', async ({ page }) => {
    await clearStorage(page)

    await page.fill('#item-price', '10')
    await page.selectOption('#item-category', 'Food')

    await expect(page.locator('#add-btn')).toBeDisabled()
  })

  test('Add button disabled when price is 0 or empty', async ({ page }) => {
    await clearStorage(page)

    await page.fill('#item-name', 'Test')
    await page.selectOption('#item-category', 'Food')
    // price left empty

    await expect(page.locator('#add-btn')).toBeDisabled()
  })

  test('Add button disabled when category is not selected', async ({ page }) => {
    await clearStorage(page)

    await page.fill('#item-name', 'Test')
    await page.fill('#item-price', '10')
    // category left at default placeholder

    await expect(page.locator('#add-btn')).toBeDisabled()
  })

  test('deleting all expenses resets total to RM 0.00', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Teh Tarik', price: 2.50, category: 'Food' })

    // Delete the expense
    await page.click('button[aria-label="Delete expense"]')

    const total = await getExpensesTotal(page)
    expect(total).toContain('0.00')
  })

  test('expenses total in all-time card updates after delete', async ({ page }) => {
    await clearStorage(page)

    await addExpense(page, { name: 'Nasi Lemak', price: 5, category: 'Food' })

    // All-time card should show 5.00
    await expect(page.locator('text=RM 5.00').first()).toBeVisible()

    await page.click('button[aria-label="Delete expense"]')

    // All-time card should now show 0.00
    await expect(page.locator('text=RM 0.00').first()).toBeVisible()
  })

})
