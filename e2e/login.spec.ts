import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display the login form', async ({ page }) => {
    // Check for common login form elements
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="email"i]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"], input[placeholder*="password"i]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')).toBeVisible();
  });

  test('should allow a user to log in with valid credentials', async ({ page }) => {
    // Replace with actual test credentials and selectors
    // These are placeholders
    const userEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const userPassword = process.env.TEST_USER_PASSWORD || 'password123';

    // Fill in the email field (try common selectors)
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"i]').first().fill(userEmail);

    // Fill in the password field
    await page.locator('input[type="password"], input[name="password"], input[placeholder*="password"i]').first().fill(userPassword);

    // Click the login button
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();

    // Wait for navigation to the dashboard or a dashboard-specific element
    // Option 1: Check URL
    await expect(page).toHaveURL(/\/($|dashboard)/, { timeout: 10000 }); // Matches '/' or '/dashboard'

    // Option 2: Check for a dashboard-specific element
    // Replace '[data-testid="dashboard-header"]' with an actual selector from your dashboard
    // await expect(page.locator('[data-testid="dashboard-header"], h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
  });

  test('should show an error message with invalid credentials', async ({ page }) => {
    // Fill in with invalid credentials
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"i]').first().fill('invalid@example.com');
    await page.locator('input[type="password"], input[name="password"], input[placeholder*="password"i]').first().fill('wrongpassword');

    // Click the login button
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();

    // Check for an error message
    // Replace '[data-testid="login-error-message"]' with an actual selector for error messages
    const errorMessage = page.locator('.text-destructive, [role="alert"], div:has-text("Invalid"), div:has-text("error")'); // Common error message selectors
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    // Optionally, check the text of the error message
    // await expect(errorMessage.first()).toContainText(/invalid credentials/i);

    // Ensure the URL is still /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have a link to the registration page', async ({ page }) => {
    const registerLink = page.locator('a[href="/register"], a:has-text("Register"), a:has-text("Sign Up")');
    await expect(registerLink.first()).toBeVisible();
    await expect(registerLink.first()).toHaveAttribute('href', /\/register/);
  });
});
