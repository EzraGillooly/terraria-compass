import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '../../src/App';
import { AppProvider } from '../../src/lib/app-context';

describe('App', () => {
  it('renders the home route by default', () => {
    render(
      <HashRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <AppProvider>
          <App />
        </AppProvider>
      </HashRouter>,
    );

    expect(screen.getAllByText('Terraria Compass').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /world difficulty/i }),
    ).toBeInTheDocument();
  });
});
