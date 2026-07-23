import { ClassCollection, LoadoutCollection, PhaseCollection } from '../schema';
import type { BossDef } from '../bosses';
import { createRecipeApi } from '../recipes';
import phasesJson from './calamity/phases.json';
import classesJson from './calamity/classes.json';
import bossesJson from './calamity/bosses.json';
import loadoutsJson from './calamity/loadouts.json';
import { type Pack } from './types';

/**
 * Calamity — data scraped from the Calamity wiki class-setup guides + boss list.
 * Loadouts cover Pre-Boss through the endgame; the deepest post-Moon-Lord
 * loadouts are still being backfilled. Crafting recipes are a later pass, so the
 * recipe graph is empty for now (the Crafting page degrades gracefully).
 */
export const calamityPack: Pack = {
  id: 'calamity',
  name: 'Calamity',
  available: true,
  phases: PhaseCollection.parse(phasesJson),
  classes: ClassCollection.parse(classesJson),
  loadouts: LoadoutCollection.parse(loadoutsJson),
  bosses: bossesJson as BossDef[],
  recipes: createRecipeApi({}, []),
  difficulties: [
    { value: 'normal', label: 'Classic' },
    { value: 'expert', label: 'Expert' },
    { value: 'master', label: 'Master' },
    { value: 'revengeance', label: 'Revengeance' },
    { value: 'death', label: 'Death' },
  ],
};
