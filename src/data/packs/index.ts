import type { Pack } from './types';
import { getPackMeta } from './meta';
import { retryChunk } from '../../lib/lazy-retry';

export type { Pack, DifficultyDef } from './types';
export { PACK_META, DEFAULT_PACK_ID, getPackMeta, PACK_PAGE_SCOPE, isPackAllowedOnPath, type PackMeta } from './meta';

/**
 * Load a pack's full data. Each pack is a dynamic import, so its loadouts,
 * bosses and recipe graph become their own chunk that the browser fetches only
 * when the pack is first opened - the main bundle carries neither. Resolved
 * packs are cached, so switching back to one is instant after the first visit.
 */
const cache = new Map<string, Pack>();

export async function loadPack(id: string): Promise<Pack> {
  const key = getPackMeta(id).id; // normalise an unknown id to the default
  const cached = cache.get(key);
  if (cached) return cached;

  // retryChunk so a stale data chunk after a deploy reloads rather than leaving
  // the app stuck on the loading splash.
  const pack = key === 'calamity'
    ? (await retryChunk(() => import('./calamity'))).calamityPack
    : key === 'thorium'
      ? (await retryChunk(() => import('./thorium'))).thoriumPack
      : (await retryChunk(() => import('./vanilla'))).vanillaPack;
  cache.set(key, pack);
  return pack;
}
