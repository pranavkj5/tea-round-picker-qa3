// tests/e2e/teaRoundPicker.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

//  Reusable login function
async function login(page, email, password = 'test123') {
  await page.goto(`{BASE_URL}/login`);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`{BASE_URL}/dashboard`);
}

//  Group all tests for Tea Round Picker
test.describe('Tea Round Picker E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // Test 1: Round Initiator Journey
  test('Round Initiator can start and complete a tea round', async ({ page }) => {
    await login(page, 'initiator@test.com');

    await page.click('button#start-round');
    await page.fill('#team-members', 'member1@test.com,member2@test.com');
    await page.click('button#send-invitations');
    await expect(page.locator('.notification')).toContainText('Invitations sent successfully');

    // Mock 15 minutes wait (if your app supports this mock)
    await page.evaluate(() => window.mockTimer?.(15 * 60 * 1000));

    await page.click('button#refresh-participants');
    await expect(page.locator('#participant-list')).toContainText('member1@test.com');

    await page.click('button#choose-tea-maker');
    const teaMakerNotification = page.locator('.tea-maker-notification');
    await expect(teaMakerNotification).toBeVisible();
    await expect(teaMakerNotification).toContainText('Selected tea-maker:');

    await page.click('a#view-history');
    await expect(page.locator('.history-table')).toContainText('Round #1');
  });

  // Test 2: Team Member Journey
  test('Team Member can accept invitation and see tea-maker notification', async ({ page, context }) => {
    const initiatorPage = await context.newPage();
    await login(initiatorPage, 'initiator@test.com');
    await initiatorPage.click('button#start-round');
    await initiatorPage.fill('#team-members', 'member1@test.com');
    await initiatorPage.click('button#send-invitations');

    await login(page, 'member1@test.com');
    await page.click('button#accept-invitation');
    await expect(page.locator('.notification')).toContainText('Invitation accepted');

    await initiatorPage.evaluate(() => window.mockTimer?.(15 * 60 * 1000));
    await initiatorPage.click('button#choose-tea-maker');

    await page.reload();
    const notification = page.locator('.tea-maker-notification');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('Your turn to make the tea!');

    await page.click('a#view-history');
    await expect(page.locator('.history-table')).toContainText('Round #1');
  });

  // Test 3: Auto-cancel after timeout
  test('Round auto-cancels if not initiated within 25 minutes', async ({ page }) => {
    await login(page, 'initiator@test.com');
    await page.click('button#start-round');
    await page.fill('#team-members', 'member1@test.com');
    await page.click('button#send-invitations');

    await page.evaluate(() => window.mockTimer?.(25 * 60 * 1000));
    await page.reload();

    await expect(page.locator('.notification')).toContainText('Round canceled due to timeout');
  });

  //  Test 4: No participants case
  test('Round cancels if no participants accept', async ({ page }) => {
    await login(page, 'initiator@test.com');
    await page.click('button#start-round');
    await page.fill('#team-members', 'member1@test.com');
    await page.click('button#send-invitations');

    await page.evaluate(() => window.mockTimer?.(15 * 60 * 1000));
    await page.click('button#choose-tea-maker');

    await expect(page.locator('.notification')).toContainText('Round canceled: No participants');
  });
});

//  Playwright test config overrides
test.use({
  viewport: { width: 1280, height: 720 },
  headless: true,
  timeout: 30000,
});
