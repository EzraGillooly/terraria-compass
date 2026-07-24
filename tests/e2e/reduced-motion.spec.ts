import { expect, test } from '@playwright/test';

function parseDurationMs(value: string): number {
  if (value.endsWith('ms')) return parseFloat(value);
  if (value.endsWith('s')) return parseFloat(value) * 1000;
  return 0;
}

test('reduced-motion: transitions are zeroed when prefers-reduced-motion is reduce', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/loadouts');
  await page.waitForLoadState('networkidle');

  // A nav tab has a transition under normal motion; it must be zeroed here.
  // (Class selection lives in a header dropdown, so there is no class tab to probe.)
  const tab = page.getByRole('link', { name: /^Bosses/ });
  await expect(tab).toBeVisible();

  const duration = await tab.evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(
    parseDurationMs(duration),
    `transition-duration "${duration}" should be < 1ms under reduced-motion`,
  ).toBeLessThan(1);
});

test('reduced-motion: no long running animations on the page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/');
  await page.waitForLoadState('networkidle');

  const longestAnimationMs = await page.evaluate(() => {
    const values = [...document.querySelectorAll<HTMLElement>('*')]
      .map((el) => getComputedStyle(el).animationDuration)
      .filter((d) => d !== '' && d !== '0s' && d !== '0ms');

    function parse(value: string): number {
      if (value.endsWith('ms')) return parseFloat(value);
      if (value.endsWith('s')) return parseFloat(value) * 1000;
      return 0;
    }

    return values.length === 0 ? 0 : Math.max(...values.map(parse));
  });

  expect(
    longestAnimationMs,
    `longest animation-duration should be < 1ms under reduced-motion, got ${longestAnimationMs}ms`,
  ).toBeLessThan(1);
});
