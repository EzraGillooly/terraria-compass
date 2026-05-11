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

          return {
            complete: img.complete,
            naturalWidth: img.naturalWidth,
          };
        }),
      )
      .toEqual({ complete: true, naturalWidth: expect.any(Number) });

    const naturalWidth = await icon.evaluate(
      (element) => (element as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  }
}

test.describe('main planner screen', () => {
  test('keeps the difficulty banner compact and loads visible icons', async ({
    page,
  }) => {
    await page.goto('/#/');

    await expect(page.getByText('Terraria Compass')).toBeVisible();

    const difficultyGroup = page.getByRole('group', {
      name: 'Select world difficulty',
    });
    await expect(difficultyGroup).toBeVisible();

    const bannerBox = await difficultyGroup.evaluate((group) => {
      const banner = group.parentElement;
      const rect = banner?.getBoundingClientRect();
      return rect
        ? {
            left: rect.left,
            width: rect.width,
          }
        : null;
    });

    expect(bannerBox).not.toBeNull();
    expect(bannerBox?.left).toBeLessThanOrEqual(40);
    expect(bannerBox?.width).toBeLessThan(
      page.viewportSize()?.width ?? Number.MAX_SAFE_INTEGER,
    );

    await expectVisibleIconsToResolve(page);

    await page.getByRole('button', { name: 'Endgame' }).click();
    await page.getByRole('button', { name: /^Mage/ }).click();
    await expect(page.getByText('Last Prism')).toBeVisible();
    await expectVisibleIconsToResolve(page);
  });
});
