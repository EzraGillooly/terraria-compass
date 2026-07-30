import { ClassCollection, LoadoutCollection, PhaseCollection } from '../schema';
import { parseData } from '../parse';
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
  // Unlocked so the data pass can be reviewed in the app. The data is still
  // mid-pass - 28 of 95 loadouts have unranked weapons, rogue has no weapon
  // subclasses, and there is no accessory pool, since the Calamity wiki has no
  // graded accessory guide to build one from.
  available: true,
  phases: parseData(PhaseCollection, phasesJson),
  classes: parseData(ClassCollection, classesJson),
  loadouts: parseData(LoadoutCollection, loadoutsJson),
  bosses: bossesJson as BossDef[],
  recipes: createRecipeApi(recipesJson.nodes, recipesJson.roots),
  /* Classic and Expert only, same as vanilla. Revengeance and Death are not
     world types - they are toggled on top of an Expert world through the
     Difficulty Indicator, so they live on their own axis (see calamityMode in
     app-context) rather than as two more entries here. */
  difficulties: [
    { value: 'normal', label: 'Classic' },
    { value: 'expert', label: 'Expert' },
  ],
};
