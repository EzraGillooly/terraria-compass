import type { PhaseDef, ClassDef, Loadout } from '../schema';
import type { BossDef } from '../bosses';
import type { RecipeApi } from '../recipes';

/** One selectable difficulty for the World dropdown (packs vary - Calamity adds Revengeance/Death). */
export interface DifficultyDef {
  value: string;
  label: string;
}

/**
 * A content pack is one self-contained data bundle behind the mod selector:
 * vanilla Terraria, Calamity, etc. Every page reads the *active* pack, so
 * switching packs rewires Loadouts / Bosses / Crafting wholesale.
 */
export interface Pack {
  id: string;
  /** shown in the mod dropdown */
  name: string;
  /** false = listed but not yet populated ("coming soon"), so it can't be selected into empty pages */
  available: boolean;
  phases: PhaseDef[];
  classes: ClassDef[];
  loadouts: Loadout[];
  bosses: BossDef[];
  recipes: RecipeApi;
  /** difficulty options this pack exposes in the World dropdown */
  difficulties: DifficultyDef[];
}

export const VANILLA_DIFFICULTIES: DifficultyDef[] = [
  { value: 'normal', label: 'Classic' },
  { value: 'expert', label: 'Expert' },
];
