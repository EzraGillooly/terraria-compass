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

  it('returns authored data for pre-golem loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-golem', 'mage');

    expect(loadout?.phase).toBe('pre-golem');
    expect(loadout?.class).toBe('mage');
    expect(loadout?.weapons[0]?.name).toBe('Razorblade Typhoon');
  });

  it('returns authored data for pre-cultist loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-cultist', 'ranger');

    expect(loadout?.phase).toBe('pre-cultist');
    expect(loadout?.class).toBe('ranger');
    expect(loadout?.weapons[0]?.name).toBe('Xenopopper');
  });

  it('returns authored data for pre-moonlord loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-moonlord', 'mage');

    expect(loadout?.phase).toBe('pre-moonlord');
    expect(loadout?.class).toBe('mage');
    expect(loadout?.weapons[0]?.name).toBe('Nebula Blaze');
  });

  it('returns authored data for endgame loadouts', () => {
    const loadout = getLoadoutByPhaseAndClass('endgame', 'mage');

    expect(loadout?.phase).toBe('endgame');
    expect(loadout?.class).toBe('mage');
    expect(loadout?.weapons[0]?.name).toBe('Last Prism');
  });

  it('returns undefined for missing loadouts', () => {
    expect(
      getLoadoutByPhaseAndClass('not-a-phase' as never, 'mage'),
    ).toBeUndefined();
  });
});
