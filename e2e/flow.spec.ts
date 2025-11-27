import { test, expect } from '@playwright/test';

test.describe('Event Flow', () => {
    let username = `user_${Date.now()}`;

    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/register');
        await page.fill('input[name="username"]', username);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('should create an event and submit a grade', async ({ page }) => {
        // Create Event
        await page.click('text=Create Event'); // Adjust selector based on actual UI
        await page.fill('input[name="eventName"]', 'E2E Test Event');
        await page.click('button:has-text("Create")');

        // Wait for event to appear and click it
        await expect(page.getByText('E2E Test Event')).toBeVisible();
        await page.click('text=E2E Test Event');

        // Should be on event page
        await expect(page).toHaveURL(/\/event\/.+/);

        // Submit Grade
        await page.click('button:has-text("1") >> nth=0'); // Color
        await page.click('button:has-text("4") >> nth=1'); // Smell
        await page.click('button:has-text("7") >> nth=2'); // Taste

        await page.click('button:has-text("Submit Grade")');

        await expect(page.getByText('Already graded this wine')).toBeVisible();
    });
});
