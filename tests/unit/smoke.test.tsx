import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '../../src/App';
import { AppProvider } from '../../src/lib/app-context';

describe('App', () => {
  it('renders the home route by default', async () => {
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

    // The active pack's data is loaded lazily now, so the provider shows a
    // loading splash for a tick before the page mounts - await the content
    // rather than asserting on the first synchronous frame.
    expect((await screen.findAllByText('Terraria Compass')).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /world difficulty/i }),
    ).toBeInTheDocument();
  });
});
