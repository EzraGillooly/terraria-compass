import { z } from 'zod';
import raw from './recipes.json';
import { devParse } from './parse';

export const Ingredient = z.object({
  id: z.string(),
  qty: z.number().int().positive(),
});

export const Recipe = z.object({
  /** e.g. "Tinkerer's Workshop", "Mythril Anvil or Orichalcum Anvil", "By hand" */
  station: z.string(),
  ingredients: z.array(Ingredient).min(1),
});

export const RecipeNode = z.object({
  id: z.string(),
  name: z.string(),
  page: z.string(),
  icon: z.string().nullable(),
  wikiUrl: z.string().url(),
  /** empty for base materials (drops, ores, purchases) - these are the tree's leaves */
  recipes: z.array(Recipe),
  /**
   * Surfaced on the crafting landing by default. Calamity's graph is generated
   * rather than curated, so it has hundreds of roots - every armor piece and
   * potion included. Marking the notable ones keeps the landing readable while
   * the rest stay in `roots`, so deep links into them still resolve.
   */
  featured: z.boolean().optional(),
});

export const RecipeBook = z.object({
  /** the marquee chains surfaced on the crafting page */
  roots: z.array(z.string()),
  nodes: z.record(z.string(), RecipeNode),
});

export type Ingredient = z.infer<typeof Ingredient>;
export type Recipe = z.infer<typeof Recipe>;
export type RecipeNode = z.infer<typeof RecipeNode>;

/**
 * Loadout items and recipe nodes are authored separately, so they're matched on a
 * slug of the display name ("Ankh Shield" → "ankh-shield"). Pure - no graph state.
 */
export function recipeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The recipe graph plus the queries over it, bound to one content pack's nodes. */
export interface RecipeApi {
  nodes: Record<string, RecipeNode>;
  roots: string[];
  findCraftable(name: string): RecipeNode | null;
  pathToItem(rootId: string, targetId: string): string[] | null;
  rootContaining(targetId: string): string | null;
}

/**
 * Build the recipe queries over a specific graph. Each content pack (vanilla,
 * Calamity, …) has its own nodes, so the helpers close over the pack's graph
 * rather than a single module-level one.
 */
export function createRecipeApi(
  nodes: Record<string, RecipeNode>,
  roots: string[],
): RecipeApi {
  const findCraftable = (name: string): RecipeNode | null => {
    const node = nodes[recipeId(name)];
    return node && node.recipes.length > 0 ? node : null;
  };

  const pathToItem = (rootId: string, targetId: string): string[] | null => {
    const walk = (id: string, trail: string[]): string[] | null => {
      if (trail.includes(id)) return null; // recipes can cycle (Shimmer transmutation)
      const next = [...trail, id];
      if (id === targetId) return next;
      for (const ingredient of nodes[id]?.recipes[0]?.ingredients ?? []) {
        const hit = walk(ingredient.id, next);
        if (hit) return hit;
      }
      return null;
    };
    return walk(rootId, []);
  };

  const rootContaining = (targetId: string): string | null => {
    if (roots.includes(targetId)) return targetId;
    return roots.find((root) => pathToItem(root, targetId)) ?? null;
  };

  return { nodes, roots, findCraftable, pathToItem, rootContaining };
}

const book = devParse(RecipeBook, raw);

/** The vanilla recipe graph. Kept as module exports for back-compat. */
export const vanillaRecipeApi = createRecipeApi(book.nodes, book.roots);
export const recipeNodes = vanillaRecipeApi.nodes;
export const recipeRoots = vanillaRecipeApi.roots;
export const findCraftable = vanillaRecipeApi.findCraftable;
export const pathToItem = vanillaRecipeApi.pathToItem;
export const rootContaining = vanillaRecipeApi.rootContaining;
