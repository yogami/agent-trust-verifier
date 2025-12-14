import { test, expect } from '@playwright/test';

test.describe('Trust Dashboard', () => {
    test('homepage renders correctly', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page.locator('h1')).toContainText('Agent Trust Verifier');

        // Check inputs exist
        await expect(page.getByRole('button', { name: /Verify Agent/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Issue VC/i })).toBeVisible();
    });

    test('can input DID', async ({ page }) => {
        await page.goto('/');
        const input = page.locator('input[type="text"]');
        await input.fill('did:web:test-agent');
        await expect(input).toHaveValue('did:web:test-agent');
    });

    // Cannot test full flow without DB connection, mocking is handled in unit tests
});
