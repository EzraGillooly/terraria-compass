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
    // rather than asserting on the first synchronous frame. The brand is an image
    // link (the footer no longer carries the name as text), so match its label.
    expect(
      await screen.findByRole('link', { name: /terraria compass/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /world difficulty/i }),
    ).toBeInTheDocument();
  });
});
