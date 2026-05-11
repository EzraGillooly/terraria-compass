import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../lib/theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('selects a theme mode', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', {
      name: 'Dark theme',
    });

    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'Dark theme' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
