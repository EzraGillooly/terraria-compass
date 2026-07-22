import { z } from 'zod';
import raw from './recipes.json';

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
  /** empty for base materials (drops, ores, purchases) — these are the tree's leaves */
  recipes: z.array(Recipe),
});

export const RecipeBook = z.object({
  /** the marquee chains surfaced on the crafting page */
  roots: z.array(z.string()),
  nodes: z.record(z.string(), RecipeNode),
});

export type Ingredient = z.infer<typeof Ingredient>;
export type Recipe = z.infer<typeof Recipe>;
export type RecipeNode = z.infer<typeof RecipeNode>;

const book = RecipeBook.parse(raw);

export const recipeNodes: Record<string, RecipeNode> = book.nodes;
export const recipeRoots: string[] = book.roots;

/**
 * Loadout items and recipe nodes are authored separately, so they're matched on a
 * slug of the display name ("Ankh Shield" → "ankh-shield").
 */
export function recipeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The node for a display name, but only when it's actually craftable. */
export function findCraftable(name: string): RecipeNode | null {
  const node = recipeNodes[recipeId(name)];
  return node && node.recipes.length > 0 ? node : null;
}

/** Every id on the path from a root down to `target`, so the tree can auto-expand to it. */
export function pathToItem(rootId: string, targetId: string): string[] | null {
  const walk = (id: string, trail: string[]): string[] | null => {
    if (trail.includes(id)) return null; // recipes can cycle (Shimmer transmutation)
    const next = [...trail, id];
    if (id === targetId) return next;
    for (const ingredient of recipeNodes[id]?.recipes[0]?.ingredients ?? []) {
      const hit = walk(ingredient.id, next);
      if (hit) return hit;
    }
    return null;
  };
  return walk(rootId, []);
}

/** The root whose tree contains `targetId` — preferring the item itself when it is one. */
export function rootContaining(targetId: string): string | null {
  if (recipeRoots.includes(targetId)) return targetId;
  return recipeRoots.find((root) => pathToItem(root, targetId)) ?? null;
}
