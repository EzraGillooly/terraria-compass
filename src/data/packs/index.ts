import { vanillaPack } from './vanilla';
import { calamityPack } from './calamity';
import type { Pack } from './types';

export type { Pack, DifficultyDef } from './types';

/** Every content pack, in dropdown order. Vanilla is first and is the default. */
export const PACKS: Pack[] = [vanillaPack, calamityPack];

export const DEFAULT_PACK_ID = 'vanilla';

export function getPack(id: string): Pack {
  return PACKS.find((p) => p.id === id) ?? vanillaPack;
}
