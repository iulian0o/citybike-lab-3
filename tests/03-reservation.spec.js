const { test, expect } = require('@playwright/test');

// MISSION 3 — Add two realistic tests:
// (a) invalid email gives visible error without a POST to /api/reservations
// (b) a successful reservation; intercept/mock POST /api/reservations and assert
//     the JSON request payload and success message.

test('invalid email blocks reservation', async ({ page }) => {
  let posted = false;
  await page.route('**/api/reservations', route => {
    posted = true;
    route.abort();
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await page.locator('#email').fill('not-an-email');
  await page.locator('#confirm').click();

  await expect(page.locator('#email-error')).toBeVisible();
  expect(posted).toBe(false);
});

test('reservation sends correct payload and confirms booking', async ({ page }) => {
  let payload;
  await page.route('**/api/reservations', route => {
    payload = route.request().postDataJSON();
    route.fulfill({ status: 201, contentType: 'application/json', body: '{"reservationId":"RES-123"}' });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await page.locator('#email').fill('student@example.com');
  await page.locator('#confirm').click();

  await expect(page.locator('#result')).toHaveText('Reservation confirmed: RES-123');
  expect(payload.email).toBe('student@example.com');
});
