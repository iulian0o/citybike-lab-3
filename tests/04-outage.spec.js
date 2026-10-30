const { test, expect } = require('@playwright/test');

// MISSION 4 — Mock the first /api/stations GET as 503, confirm the error banner,
// then let Retry loading reach the real server and recover to 4 stations.

test('station API outage shows an error and retry restores results', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/stations', route => {
    calls++;
    if (calls === 1) {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    }
    return route.continue();
  });

  await page.goto('/');

  const banner = page.locator('#notification');
  await expect(banner).toContainText('Unable to load stations.');
  await expect(page.getByTestId('station-card')).toHaveCount(0);

  await page.getByRole('button', { name: 'Retry loading' }).click();

  await expect(page.getByTestId('station-card')).toHaveCount(4);
  await expect(banner).toBeHidden();
});
