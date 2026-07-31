import { expect, test, type Page } from '@playwright/test';

/* Below the mobile breakpoint the nav and selectors collapse behind a hamburger,
   so a test that touches a header control has to open the panel first. On
   desktop the toggle is hidden and this is a no-op. Calling it again closes the
   panel, which is how these tests get the class list out of the way before
   clicking something in the page body. */
async function toggleMenuIfMobile(page: Page) {
  const toggle = page.getByRole('button', { name: 'Menu' });
  if (await toggle.isVisible()) await toggle.click();
}

async function expectVisibleIconsToResolve(page: Page) {
  // `:visible` matters on mobile: the class icons live in the collapsed
  // hamburger panel (display:none), and scrollIntoViewIfNeeded would hang on a
  // hidden element. This also reads truer to the name - it checks what's shown.
  const icons = page.locator('img.pixel-img:visible');
  const count = await icons.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < Math.min(count, 12); index += 1) {
    const icon = icons.nth(index);
    await icon.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        icon.evaluate((element) => {
          const img = element as HTMLImageElement;
          return { complete: img.complete, naturalWidth: img.naturalWidth };
        }),
      )
      .toEqual({ complete: true, naturalWidth: expect.any(Number) });

    const naturalWidth = await icon.evaluate(
      (element) => (element as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  }
}

test.describe('main screens', () => {
  test('home renders the shell and difficulty control', async ({ page }) => {
    await page.goto('/#/');

    await expect(page.getByText('Terraria Compass').first()).toBeVisible();
    await toggleMenuIfMobile(page); // difficulty lives in the menu on mobile
    await expect(
      page.getByRole('button', { name: /world difficulty/i }),
    ).toBeVisible();
  });

  test('loadouts loads visible item icons across a phase change', async ({ page }) => {
    await page.goto('/#/loadouts');
    await page.waitForLoadState('networkidle');

    await expectVisibleIconsToResolve(page);

    // Switch class + phase and confirm icons still resolve. The class control is
    // in the header menu, which is a hamburger panel on mobile - open it, pick
    // the class, close it, then click the phase in the page body.
    await toggleMenuIfMobile(page);
    await page.getByRole('radiogroup', { name: 'Class' })
      .getByRole('radio', { name: 'Mage' }).click();
    await toggleMenuIfMobile(page);
    await page.getByRole('button', { name: /Endgame/ }).click();
    await expectVisibleIconsToResolve(page);
  });
});
