import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../lib/theme';
import { Phase } from './Phase';

describe('Phase page', () => {
  it('renders the pilot pre-bosses loadout data', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-bosses/melee']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /pre-bosses · melee/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /weapons/i })).toBeInTheDocument();
    expect(screen.getByText('Starfury')).toBeInTheDocument();
    expect(screen.getAllByText(/top pick/i)).toHaveLength(4);
  });

  it('shows a placeholder when a loadout has not been authored yet', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-golem/mage']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/loadout content for this phase and class is coming next/i),
    ).toBeInTheDocument();
  });

  it('renders authored content for pre-skeletron too', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-skeletron/mage']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /pre-skeletron · mage/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Space Gun')).toBeInTheDocument();
    expect(screen.getByText('Meteor Armor')).toBeInTheDocument();
  });

  it('renders authored content for pre-wof routes', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-wof/ranger']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /pre-wall of flesh · ranger/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Molten Fury')).toBeInTheDocument();
    expect(screen.getByText('Necro Armor')).toBeInTheDocument();
  });

  it('renders authored content for pre-mech routes', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-mech/mage']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /pre-mech · mage/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Crystal Serpent')).toBeInTheDocument();
    expect(screen.getByText('Forbidden Armor')).toBeInTheDocument();
  });

  it('renders authored content for pre-plantera routes', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-plantera/ranger']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /pre-plantera · ranger/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Megashark')).toBeInTheDocument();
    expect(screen.getByText('Sniper Scope')).toBeInTheDocument();
  });

  it('filters subclass-specific items when a subclass toggle is selected', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-bosses/melee']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /yoyo/i }));

    expect(screen.getByText('Code 1')).toBeInTheDocument();
    expect(screen.queryByText('Trimarang')).not.toBeInTheDocument();
    expect(screen.queryByText('Blade of Grass')).not.toBeInTheDocument();
    expect(screen.queryByText('Starfury')).not.toBeInTheDocument();
    expect(screen.getByText('Platinum Armor')).toBeInTheDocument();
  });

  it('de-emphasizes expert-only items in normal mode and restores them in expert mode', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
        initialEntries={['/phase/pre-bosses/melee']}
      >
        <ThemeProvider>
          <Routes>
            <Route path="/phase/:phaseId/:classId" element={<Phase />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    const shieldCard = screen.getByText('Shield of Cthulhu').closest('article');
    expect(shieldCard).toHaveAttribute('data-dimmed', 'true');

    await user.click(screen.getByRole('button', { name: /expert/i }));

    expect(shieldCard).toHaveAttribute('data-dimmed', 'false');
  });
});
