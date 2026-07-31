import { VANILLA_DIFFICULTIES, type DifficultyDef } from './types';

/**
 * The small, always-loaded description of a content pack: everything the header
 * dropdown and the app's initial state need, without any of the heavy data.
 *
 * Kept apart from the pack itself so listing the packs, validating a stored
 * pack id, or picking the initial class never pulls a pack's multi-megabyte
 * loadout data into the main bundle. The data lives behind `loadPack`, which is
 * a dynamic import - so a visitor downloads a pack's loadouts only once they
 * actually open it.
 */
export interface PackMeta {
  id: string;
  name: string;
  /** false = listed but not yet populated ("coming soon") */
  available: boolean;
  difficulties: DifficultyDef[];
  /** class roster, so the initial/ clamped class can be resolved without the data */
  classIds: string[];
}

export const PACK_META: PackMeta[] = [
  {
    id: 'vanilla',
    name: 'Vanilla',
    available: true,
    difficulties: VANILLA_DIFFICULTIES,
    classIds: ['melee', 'ranger', 'mage', 'summoner'],
  },
  {
    id: 'calamity',
    name: 'Calamity',
    available: true,
    // Classic and Expert only - Revengeance/Death ride on their own axis, see
    // calamityMode in app-context.
    difficulties: [
      { value: 'normal', label: 'Classic' },
      { value: 'expert', label: 'Expert' },
    ],
    classIds: ['melee', 'ranger', 'mage', 'summoner', 'rogue'],
  },
  {
    id: 'thorium',
    name: 'Thorium',
    // Mid-conversion (bosses in progress, loadouts not started), so it is
    // selectable in the dev preview but shows as "Soon" on the live site until
    // the pass finishes. Flip to a plain `true` to ship it.
    available: import.meta.env.DEV,
    // Same world types as vanilla - Thorium adds no difficulty axis of its own.
    difficulties: VANILLA_DIFFICULTIES,
    // Vanilla four plus Thorium's Bard, Healer, and the kept Throwing class.
    classIds: ['melee', 'ranger', 'mage', 'summoner', 'bard', 'healer', 'throwing'],
  },
];

export const DEFAULT_PACK_ID = 'vanilla';

export function getPackMeta(id: string): PackMeta {
  return PACK_META.find((p) => p.id === id) ?? PACK_META[0]!;
}
