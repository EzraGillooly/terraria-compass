import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '../../src/App';
import { ThemeProvider } from '../../src/lib/theme';

describe('App', () => {
  it('renders the home route by default', () => {
    render(
      <HashRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HashRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /terraria compass/i }),
    ).toBeInTheDocument();
  });
});
