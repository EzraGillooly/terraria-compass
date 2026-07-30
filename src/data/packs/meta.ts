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
];

export const DEFAULT_PACK_ID = 'vanilla';

export function getPackMeta(id: string): PackMeta {
  return PACK_META.find((p) => p.id === id) ?? PACK_META[0]!;
}
