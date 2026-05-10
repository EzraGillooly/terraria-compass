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

  it('returns undefined for missing loadouts', () => {
    expect(getLoadoutByPhaseAndClass('pre-mech', 'mage')).toBeUndefined();
  });
});
