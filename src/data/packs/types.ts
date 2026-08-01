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
  /**
   * Order the boss roadmap strictly by each boss's `tier`, ignoring the default
   * "optional bosses first within a stage" grouping. Thorium sets this so its
   * roadmap follows the mod's own recommended fight order exactly (e.g. the
   * required Golem before the optional Empress of Light and Duke Fishron).
   */
  strictBossOrder?: boolean;
  /**
   * Explicit boss-roadmap clustering for the Bosses page, independent of the
   * loadout phases. Each inner array is one visual clump of bosses (by id) that
   * sit tightly together - the parallel "and"/"or" steps of the mod's own boss
   * diagram. Bosses not listed render as their own single-node clump, placed by
   * tier. When omitted, the roadmap clumps by loadout phase (the default).
   */
  bossClusters?: string[][];
  recipes: RecipeApi;
  /** difficulty options this pack exposes in the World dropdown */
  difficulties: DifficultyDef[];
}

export const VANILLA_DIFFICULTIES: DifficultyDef[] = [
  { value: 'normal', label: 'Classic' },
  { value: 'expert', label: 'Expert' },
];
