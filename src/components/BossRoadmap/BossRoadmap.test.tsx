import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { classes, phases } from '../../lib/data';
import { BossRoadmap } from './BossRoadmap';

describe('BossRoadmap', () => {
  it('renders phase progression links that point to the next route', () => {
    const defaultClass = classes[0];

    if (!defaultClass) {
      throw new Error('Expected default class to exist');
    }

    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <BossRoadmap classId={defaultClass.id} phases={phases} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', {
        name: /defeating eye of cthulhu or your world evil boss/i,
      }),
    ).toHaveAttribute('href', '/phase/pre-skeletron/melee');
    expect(
      screen.getByRole('link', {
        name: /defeating the lunatic cultist/i,
      }),
    ).toHaveAttribute('href', '/phase/pre-moonlord/melee');
  });
});
