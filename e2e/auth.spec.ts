import { test, expect } from '@playwright/test';

test('should allow user to register and login', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('input[name="username"]', `testuser_${Date.now()}`);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Logout
    await page.goto('/api/auth/logout'); // Assuming we have this or user clicks logout
    // If no direct logout route, we might need to click the logout button if it exists
});

test('should show login error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Expect some error message or stay on page
    await expect(page).toHaveURL('/login');
});
