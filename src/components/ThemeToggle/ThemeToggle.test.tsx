import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../lib/theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('toggles the theme and updates the aria-label', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', {
      name: 'Switch to dark theme',
    });

    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
