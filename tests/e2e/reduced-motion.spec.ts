import { expect, test } from '@playwright/test';

function parseDurationMs(value: string): number {
  if (value.endsWith('ms')) return parseFloat(value);
  if (value.endsWith('s')) return parseFloat(value) * 1000;
  return 0;
}

test('reduced-motion: all transitions are zeroed when prefers-reduced-motion is reduce', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/phase/pre-bosses/melee');
  await page.waitForLoadState('networkidle');

  const cardDuration = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>('[class*="card"]');
    return card ? getComputedStyle(card).transitionDuration : null;
  });

  expect(cardDuration, 'card element must have a transition-duration').not.toBeNull();
  expect(
    parseDurationMs(cardDuration!),
    `card transition-duration "${cardDuration}" should be < 1ms under reduced-motion`,
  ).toBeLessThan(1);

  const toggleDuration = await page.evaluate(() => {
    const toggle = document.querySelector<HTMLElement>('button[class*="button"]');
    return toggle ? getComputedStyle(toggle).transitionDuration : null;
  });

  expect(toggleDuration, 'button element must have a transition-duration').not.toBeNull();
  expect(
    parseDurationMs(toggleDuration!),
    `button transition-duration "${toggleDuration}" should be < 1ms under reduced-motion`,
  ).toBeLessThan(1);
});

test('reduced-motion: phase change completes without CSS animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/phase/pre-bosses/melee');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /^Ranger/ }).click();

  await expect(
    page.getByRole('button', { name: /^Ranger/ }),
  ).toHaveAttribute('aria-pressed', 'true');

  const longestAnimationMs = await page.evaluate(() => {
    const values = [...document.querySelectorAll<HTMLElement>('*')]
      .map((el) => getComputedStyle(el).animationDuration)
      .filter((d) => d !== '' && d !== '0s' && d !== '0ms');

    function parseDurationMs(value: string): number {
      if (value.endsWith('ms')) return parseFloat(value);
      if (value.endsWith('s')) return parseFloat(value) * 1000;
      return 0;
    }

    return values.length === 0 ? 0 : Math.max(...values.map(parseDurationMs));
  });

  expect(
    longestAnimationMs,
    `longest animation-duration should be < 1ms under reduced-motion, got ${longestAnimationMs}ms`,
  ).toBeLessThan(1);
});
