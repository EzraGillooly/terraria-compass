import { ClassCollection, LoadoutCollection, PhaseCollection } from '../schema';
import type { BossDef } from '../bosses';
import { createRecipeApi } from '../recipes';
import phasesJson from './calamity/phases.json';
import classesJson from './calamity/classes.json';
import bossesJson from './calamity/bosses.json';
import loadoutsJson from './calamity/loadouts.json';
import recipesJson from './calamity/recipes.json';
import { type Pack } from './types';

/**
 * Calamity - data scraped from the Calamity wiki class-setup guides + boss list.
 * Loadouts cover Pre-Boss through the endgame. The recipe graph is built from the
 * same scrape (scripts/build-calamity-recipes.py): recommended gear plus the
 * ingredient chain beneath it, so "view in crafting tree" resolves for Calamity
 * items the same way it does for vanilla.
 */
export const calamityPack: Pack = {
  id: 'calamity',
  name: 'Calamity',
  // Held back while the endgame data is finished: several stages are still
  // wiki-scraped rather than curated. Flipping this back re-enables the
  // selector, no other change needed.
  available: false,
  phases: PhaseCollection.parse(phasesJson),
  classes: ClassCollection.parse(classesJson),
  loadouts: LoadoutCollection.parse(loadoutsJson),
  bosses: bossesJson as BossDef[],
  recipes: createRecipeApi(recipesJson.nodes, recipesJson.roots),
  difficulties: [
    { value: 'normal', label: 'Classic' },
    { value: 'expert', label: 'Expert' },
    { value: 'master', label: 'Master' },
    { value: 'revengeance', label: 'Revengeance' },
    { value: 'death', label: 'Death' },
  ],
};
