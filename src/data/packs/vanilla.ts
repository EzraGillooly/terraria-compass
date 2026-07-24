import { phases, classes, loadouts } from '../../lib/data';
import { bosses } from '../bosses';
import { vanillaRecipeApi } from '../recipes';
import { VANILLA_DIFFICULTIES, type Pack } from './types';

/** Vanilla Terraria - the default pack. Wraps the existing data unchanged. */
export const vanillaPack: Pack = {
  id: 'vanilla',
  name: 'Vanilla',
  available: true,
  phases,
  classes,
  loadouts,
  bosses,
  recipes: vanillaRecipeApi,
  difficulties: VANILLA_DIFFICULTIES,
};
