import { getLoadoutByPhaseAndClass, getPhaseById } from './data';

describe('data helpers', () => {
  it('returns the requested phase metadata', () => {
    expect(getPhaseById('pre-bosses')?.name).toBe('Pre-Bosses');
  });

  it('returns the requested phase and class loadout', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-bosses', 'melee');

    expect(loadout?.phase).toBe('pre-bosses');
    expect(loadout?.class).toBe('melee');
    expect(loadout?.weapons[0]?.name).toBe('Starfury');
  });

  it('returns authored data for the next progression phase too', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-skeletron', 'mage');

    expect(loadout?.phase).toBe('pre-skeletron');
    expect(loadout?.class).toBe('mage');
    expect(loadout?.weapons[0]?.name).toBe('Space Gun');
  });

  it('returns authored data for pre-wof loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-wof', 'ranger');

    expect(loadout?.phase).toBe('pre-wof');
    expect(loadout?.class).toBe('ranger');
    expect(loadout?.weapons[0]?.name).toBe('Molten Fury');
  });

  it('returns authored data for pre-mech loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-mech', 'mage');

    expect(loadout?.phase).toBe('pre-mech');
    expect(loadout?.class).toBe('mage');
    expect(loadout?.weapons[0]?.name).toBe('Crystal Serpent');
  });

  it('returns authored data for pre-plantera loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-plantera', 'ranger');

    expect(loadout?.phase).toBe('pre-plantera');
    expect(loadout?.class).toBe('ranger');
    expect(loadout?.weapons[0]?.name).toBe('Megashark');
  });

  it('returns undefined for missing loadouts', () => {
    expect(getLoadoutByPhaseAndClass('pre-golem', 'mage')).toBeUndefined();
  });
});
