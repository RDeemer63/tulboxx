import { test, expect, devices } from '@playwright/test';

const V2_NAV_FLAG_LOCAL_STORAGE_KEY = 'tulboxx_nav_v2_enabled';

async function enableV2Navigation(page: any, viaQueryParam = false) {
  if (viaQueryParam) {
    await page.goto('/?nav_v2=true');
  } else {
    await page.goto('/');
    await page.evaluate((key) => localStorage.setItem(key, 'true'), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
    await page.reload();
  }
  // Wait for V2 navigation to be present (e.g., a V2 specific element)
  await expect(page.locator('nav a[href="/v2/leads"]')).toBeVisible({ timeout: 10000 });
}

async function enableV1Navigation(page: any, viaQueryParam = false) {
  if (viaQueryParam) {
    await page.goto('/?nav_v2=false');
  } else {
    await page.goto('/');
    await page.evaluate((key) => localStorage.setItem(key, 'false'), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
    await page.reload();
  }
   // Wait for V1 navigation to be present (e.g., a V1 specific element like the old dashboard link)
   await expect(page.locator('nav a[href="/pipeline"]')).toBeVisible({ timeout: 10000 });
}

async function clearNavFlag(page: any) {
  await page.goto('/'); // Go to a page to ensure localStorage is accessible
  await page.evaluate((key) => localStorage.removeItem(key), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
  await page.reload();
}

test.describe('V2 Navigation System', () => {
  test.describe('Feature Flag Toggling', () => {
    test.afterEach(async ({ page }) => {
      // Clean up localStorage after each flag test
      await clearNavFlag(page);
    });

    test('should default to V1 navigation if no flag is set', async ({ page }) => {
      await page.goto('/');
      // Check for a V1 specific element (e.g., a link from the old sidebar)
      await expect(page.locator('nav a[href="/pipeline"]')).toBeVisible();
      await expect(page.locator('nav a[href="/v2/leads"]')).not.toBeVisible();
      const flag = await page.evaluate((key) => localStorage.getItem(key), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
      expect(flag).toBeNull(); // Or 'false' if it defaults to setting it
    });

    test('should enable V2 navigation via ?nav_v2=true query parameter', async ({ page }) => {
      await page.goto('/?nav_v2=true');
      await expect(page.locator('nav a[href="/v2/leads"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Leads & Customers Module (V2)")')).toBeVisible();
      const flag = await page.evaluate((key) => localStorage.getItem(key), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
      expect(flag).toBe('true');
    });

    test('should enable V1 navigation via ?nav_v2=false query parameter', async ({ page }) => {
      await page.goto('/?nav_v2=false');
      await expect(page.locator('nav a[href="/pipeline"]')).toBeVisible(); // V1 link
      await expect(page.locator('nav a[href="/v2/leads"]')).not.toBeVisible();
      const flag = await page.evaluate((key) => localStorage.getItem(key), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
      expect(flag).toBe('false');
    });

    test('should toggle from V1 to V2 using UI button and persist', async ({ page }) => {
      await enableV1Navigation(page); // Start with V1
      await expect(page.locator('nav a[href="/pipeline"]')).toBeVisible();

      // Locate the V2 toggle button (assuming it's visible in V1 mode for switching)
      // This button is in the V2NavWrapper, so it should be there if V2NavWrapper is rendered.
      // The V2FeatureFlagToggle component is what we're looking for.
      const v2ToggleButton = page.locator('button[title*="Switch to V2 Nav"]');
      await expect(v2ToggleButton).toBeVisible();
      await v2ToggleButton.click(); // This should reload the page

      await expect(page.locator('nav a[href="/v2/leads"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('h2:has-text("Leads & Customers Module (V2)")')).toBeVisible();
      const flag = await page.evaluate((key) => localStorage.getItem(key), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
      expect(flag).toBe('true');
    });

    test('should toggle from V2 to V1 using UI button and persist', async ({ page }) => {
      await enableV2Navigation(page); // Start with V2
      await expect(page.locator('nav a[href="/v2/leads"]')).toBeVisible();

      const v1ToggleButton = page.locator('button[title*="Switch to V1 Nav"]');
      await expect(v1ToggleButton).toBeVisible();
      await v1ToggleButton.click(); // This should reload the page

      await expect(page.locator('nav a[href="/pipeline"]')).toBeVisible({ timeout: 10000 }); // V1 link
      await expect(page.locator('nav a[href="/v2/leads"]')).not.toBeVisible();
      const flag = await page.evaluate((key) => localStorage.getItem(key), V2_NAV_FLAG_LOCAL_STORAGE_KEY);
      expect(flag).toBe('false');
    });
  });

  test.describe('V2 Desktop Navigation (V2 Flag Enabled)', () => {
    test.beforeEach(async ({ page }) => {
      await enableV2Navigation(page);
      await page.setViewportSize({ width: 1280, height: 720 }); // Desktop viewport
    });

    test('sidebar should be collapsible and expandable', async ({ page }) => {
      const sidebar = page.locator('div.md\\:flex-col[class*="md:w-64"]'); // Expanded
      const collapseButton = page.locator('button[aria-label="Collapse sidebar"]');
      const expandButton = page.locator('button[aria-label="Expand sidebar"]');
      const tulboxxLogoText = page.locator('span:has-text("TULBOXX")');

      // Initially expanded
      await expect(sidebar).toBeVisible();
      await expect(tulboxxLogoText).toBeVisible();
      await expect(collapseButton).toBeVisible();

      // Collapse
      await collapseButton.click();
      await expect(page.locator('div.md\\:flex-col[class*="md:w-20"]')).toBeVisible(); // Collapsed width
      await expect(tulboxxLogoText).not.toBeVisible();
      await expect(expandButton).toBeVisible();

      // Expand
      await expandButton.click();
      await expect(sidebar).toBeVisible(); // Expanded width
      await expect(tulboxxLogoText).toBeVisible();
      await expect(collapseButton).toBeVisible();
    });

    const desktopNavItems = [
      { name: 'Leads', href: '/v2/leads', placeholderText: 'Leads & Customers Module (V2)' },
      { name: 'Estimates', href: '/v2/estimates', placeholderText: 'Estimates Module (V2)' },
      { name: 'Jobs', href: '/v2/jobs', placeholderText: 'Jobs & Scheduling Module (V2)' },
      { name: 'Work', href: '/v2/work-session', placeholderText: 'Work Session (Field) Module (V2)' },
      { name: 'Billing', href: '/v2/billing', placeholderText: 'Billing & Invoices Module (V2)' },
      { name: 'Insights', href: '/v2/insights', placeholderText: 'Insights & Reports Module (V2)' },
      // Secondary (Settings) items - assuming sidebar is expanded for these
      { name: 'Business Profile', href: '/v2/settings/profile', placeholderText: 'Business Profile (V2)' },
      { name: 'Employees', href: '/v2/settings/employees', placeholderText: 'Employees (V2)' },
      { name: 'App Settings', href: '/v2/settings/application', placeholderText: 'Application Settings (V2)' },
    ];

    for (const item of desktopNavItems) {
      test(`should navigate to ${item.name} page`, async ({ page }) => {
        // Ensure sidebar is expanded if testing secondary items that might be hidden when collapsed
        if (['Business Profile', 'Employees', 'App Settings'].includes(item.name)) {
            const expandButton = page.locator('button[aria-label="Expand sidebar"]');
            if (await expandButton.isVisible()) {
                await expandButton.click();
            }
        }
        await page.locator(`nav a[href="${item.href}"]`).click();
        await expect(page).toHaveURL(item.href, { timeout: 5000 });
        await expect(page.locator(`h2:has-text("${item.placeholderText}")`)).toBeVisible();
      });
    }
  });

  test.describe('V2 Mobile Navigation (V2 Flag Enabled)', () => {
    test.beforeEach(async ({ page }) => {
      await enableV2Navigation(page);
      await page.setViewportSize(devices['iPhone 12'].viewport); // Mobile viewport
    });

    const mobileNavItems = [
      { name: 'Leads', href: '/v2/leads', placeholderText: 'Leads & Customers Module (V2)', inBottomNav: true },
      { name: 'Estimates', href: '/v2/estimates', placeholderText: 'Estimates Module (V2)', inBottomNav: true },
      { name: 'Jobs', href: '/v2/jobs', placeholderText: 'Jobs & Scheduling Module (V2)', inBottomNav: true },
      { name: 'Work', href: '/v2/work-session', placeholderText: 'Work Session (Field) Module (V2)', inBottomNav: true },
      // These are in the "More" sheet
      { name: 'Billing', href: '/v2/billing', placeholderText: 'Billing & Invoices Module (V2)', inBottomNav: false },
      { name: 'Insights', href: '/v2/insights', placeholderText: 'Insights & Reports Module (V2)', inBottomNav: false },
      { name: 'Business Profile', href: '/v2/settings/profile', placeholderText: 'Business Profile (V2)', inBottomNav: false },
      { name: 'Employees', href: '/v2/settings/employees', placeholderText: 'Employees (V2)', inBottomNav: false },
      { name: 'App Settings', href: '/v2/settings/application', placeholderText: 'Application Settings (V2)', inBottomNav: false },
    ];

    for (const item of mobileNavItems) {
      test(`should navigate to ${item.name} page via ${item.inBottomNav ? 'bottom nav' : 'More sheet'}`, async ({ page }) => {
        if (item.inBottomNav) {
          await page.locator(`div.fixed.bottom-0 nav a[href="${item.href}"]`).click();
        } else {
          await page.locator('button[aria-label="More options"]').click();
          // Wait for sheet to be visible
          await expect(page.locator('div[role="dialog"] h2:has-text("More Options")')).toBeVisible();
          await page.locator(`div[role="dialog"] nav a[href="${item.href}"]`).click();
        }
        await expect(page).toHaveURL(item.href, { timeout: 5000 });
        await expect(page.locator(`h2:has-text("${item.placeholderText}")`)).toBeVisible();
      });
    }

    test('V2 Mobile Header should be visible', async ({ page }) => {
        // This test assumes V2MobileHeader is rendered when V2 nav is active on mobile.
        // Based on v2-navigation.tsx, the V2MobileHeader is not part of V2NavigationWrapper,
        // but rather intended to be used in App.tsx.
        // If App.tsx renders V2MobileHeader when isV2 is true, this test would target its elements.
        // For now, let's check for the generic mobile header structure that might be present.
        await expect(page.locator('div.md\\:hidden.bg-slate-900 button svg.lucide-menu').first()).toBeVisible(); // Hamburger menu icon
        await expect(page.locator('div.md\\:hidden.bg-slate-900 span:has-text("TULBOXX")')).toBeVisible(); // Logo text
    });
  });
});
