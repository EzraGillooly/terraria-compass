import { expect, test, type Page } from '@playwright/test';

async function expectVisibleIconsToResolve(page: Page) {
  const icons = page.locator('img.pixel-img');
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
    await expect(
      page.getByRole('button', { name: /world difficulty/i }),
    ).toBeVisible();
  });

  test('loadouts loads visible item icons across a phase change', async ({ page }) => {
    await page.goto('/#/loadouts');
    await page.waitForLoadState('networkidle');

    await expectVisibleIconsToResolve(page);

    // Switch class + phase and confirm icons still resolve. Class lives in a
    // header dropdown, so it has to be opened before the option is clickable.
    // exact: name matching is substring-based, and armor blurbs mention "class"
    await page.getByRole('button', { name: 'Class', exact: true }).click();
    await page.getByRole('listbox', { name: 'Class' }).getByRole('button', { name: 'Mage' }).click();
    await page.getByRole('button', { name: /Endgame/ }).click();
    await expectVisibleIconsToResolve(page);
  });
});
