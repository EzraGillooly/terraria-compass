import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../lib/theme';
import { Home } from './Home';

describe('Home page', () => {
  it('renders the roadmap and class shortcuts', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /terraria compass/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /defeating eye of cthulhu or your world evil boss/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Melee/ })).toHaveAttribute(
      'href',
      '/phase/pre-bosses/melee',
    );
  });
});
