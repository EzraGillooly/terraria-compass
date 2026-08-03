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
    // The boss roadmap ships; the loadouts are still mid-conversion. So Thorium is
    // available, but the header only offers it on the Bosses page - see
    // PACK_PAGE_SCOPE and the reset guard in app-context. Same behaviour in dev and
    // production, so the dev preview matches the live site exactly.
    available: true,
    // Same world types as vanilla - Thorium adds no difficulty axis of its own.
    difficulties: VANILLA_DIFFICULTIES,
    // Vanilla four plus Thorium's Bard, Healer, and the kept Throwing class.
    classIds: ['melee', 'ranger', 'mage', 'summoner', 'bard', 'healer', 'throwing'],
  },
];

export const DEFAULT_PACK_ID = 'vanilla';

/**
 * Packs that are only offered on a subset of pages. Thorium's boss roadmap is
 * ready but its loadouts are not, so it may be selected on the Bosses page only.
 * A pack absent from this map is available everywhere. Paths are the router
 * pathnames (hash-router, so no base path).
 */
export const PACK_PAGE_SCOPE: Record<string, string[]> = {
  thorium: ['/bosses'],
};

/**
 * Whether `packId` may be selected/active on `pathname`. The page scope is a
 * production gate only: in the dev build every pack is available everywhere, so
 * the loadouts can be built out on the Loadouts page while the live site keeps
 * Thorium to the Bosses page.
 */
export function isPackAllowedOnPath(packId: string, pathname: string): boolean {
  if (import.meta.env.DEV) return true;
  const scope = PACK_PAGE_SCOPE[packId];
  return !scope || scope.includes(pathname);
}

export function getPackMeta(id: string): PackMeta {
  return PACK_META.find((p) => p.id === id) ?? PACK_META[0]!;
}
