import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  { name: 'Home', path: '/#/' },
  { name: 'Phase', path: '/#/phase/pre-bosses/melee' },
  { name: 'About', path: '/#/about' },
  { name: '404', path: '/#/garbage' },
];

for (const { name, path } of pages) {
  test(`${name} page — zero axe-core violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).analyze();

    expect(
      results.violations,
      `axe violations on ${name}:\n${results.violations
        .map((v) => `  [${v.id}] ${v.description}\n    ${v.nodes.map((n) => n.html).join('\n    ')}`)
        .join('\n')}`,
    ).toEqual([]);
  });
}
