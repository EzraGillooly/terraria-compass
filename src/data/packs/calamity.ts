import { createRecipeApi } from '../recipes';
import { type Pack } from './types';

/**
 * Calamity — placeholder pack. Listed in the mod dropdown but not yet populated;
 * `available: false` keeps it from being selected into empty pages. The phases,
 * classes (incl. Rogue), loadouts, bosses and recipes are filled in by the data
 * research phase. Difficulties include Calamity's Revengeance and Death modes.
 */
export const calamityPack: Pack = {
  id: 'calamity',
  name: 'Calamity',
  available: false,
  phases: [],
  classes: [],
  loadouts: [],
  bosses: [],
  recipes: createRecipeApi({}, []),
  difficulties: [
    { value: 'normal', label: 'Classic' },
    { value: 'expert', label: 'Expert' },
    { value: 'master', label: 'Master' },
    { value: 'revengeance', label: 'Revengeance' },
    { value: 'death', label: 'Death' },
  ],
};
