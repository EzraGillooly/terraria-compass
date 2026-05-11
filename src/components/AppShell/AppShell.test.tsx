import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from '../../lib/theme';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the global shell landmarks and skip link', () => {
    render(
      <HashRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <ThemeProvider>
          <AppShell>
            <div>Page content</div>
          </AppShell>
        </ThemeProvider>
      </HashRouter>,
    );

    expect(
      screen.getByRole('link', { name: /skip to main content/i }),
    ).toHaveAttribute('href', '#main');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Terraria Compass')).toBeInTheDocument();
  });
});
