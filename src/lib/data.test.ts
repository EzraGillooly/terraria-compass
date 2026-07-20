import { classes } from './data';
import { getLoadoutByPhaseAndClass, getPhaseById, phases } from './data';
import type { ClassId, PhaseId } from '../data/schema';

const subclassIdsByClass = new Map<string, Set<string>>(
  classes.map((c) => [c.id, new Set(c.subclasses.map((s) => s.id))]),
);

describe('data helpers', () => {
  it('returns the requested phase metadata', () => {
    expect(getPhaseById('pre-bosses')?.name).toBe('Pre-Bosses');
  });

  it('returns the requested phase and class loadout', () => {
    const loadout = getLoadoutByPhaseAndClass('pre-bosses', 'melee');

    expect(loadout?.phase).toBe('pre-bosses');
    expect(loadout?.class).toBe('melee');
    expect(loadout?.weapons.length).toBeGreaterThan(0);
  });

  it('every phase/class loadout has valid, well-formed weapons', () => {
    for (const phase of phases) {
      for (const cls of classes) {
        const loadout = getLoadoutByPhaseAndClass(
          phase.id as PhaseId,
          cls.id as ClassId,
        );
        expect(loadout).toBeDefined();
        expect(loadout?.phase).toBe(phase.id);
        expect(loadout?.class).toBe(cls.id);

        const validSubclasses = subclassIdsByClass.get(cls.id)!;
        for (const weapon of loadout!.weapons) {
          expect(weapon.slot).toBe('weapon');
          expect(weapon.id).toBeTruthy();
          expect(weapon.name).toBeTruthy();
          expect(weapon.source).toBeTruthy();
          if (weapon.subclass) {
            expect(validSubclasses.has(weapon.subclass)).toBe(true);
          }
        }
      }
    }
  });

  it('returns undefined for missing loadouts', () => {
    expect(
      getLoadoutByPhaseAndClass('not-a-phase' as never, 'mage'),
    ).toBeUndefined();
  });
});
