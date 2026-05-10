import { expect, test } from '@playwright/test';

test.describe('home to phase persistence flow', () => {
  test('preserves class, subclass, and theme after reload', async ({ page }) => {
    await page.goto('/#/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Terraria Compass' }),
    ).toBeVisible();

    await page.getByRole('link', { name: /melee/i }).click();

    await expect(page).toHaveURL(/#\/phase\/pre-bosses\/melee$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /pre-bosses · melee/i }),
    ).toBeVisible();

    await page.getByRole('link', { name: /ranger/i }).click();

    await expect(page).toHaveURL(/#\/phase\/pre-bosses\/ranger$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /pre-bosses · ranger/i }),
    ).toBeVisible();

    const bowToggle = page.getByRole('button', { name: /bows/i });
    await bowToggle.click();

    await expect(bowToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Platinum Bow')).toBeVisible();
    await expect(page.getByText('Boomstick')).toHaveCount(0);

    const themeToggle = page.getByRole('button', {
      name: /switch to (dark|light) theme/i,
    });
    const themeBefore = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );

    await themeToggle.click();

    const themeAfter = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(themeAfter).not.toBe(themeBefore);

    await page.reload();

    await expect(page).toHaveURL(/#\/phase\/pre-bosses\/ranger$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /pre-bosses · ranger/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /bows/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByText('Platinum Bow')).toBeVisible();
    await expect(page.getByText('Boomstick')).toHaveCount(0);

    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset.theme ?? ''),
      )
      .toBe(themeAfter ?? '');
  });
});
