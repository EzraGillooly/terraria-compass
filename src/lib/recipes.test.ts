import { describe, expect, it } from 'vitest';
import {
  recipeNodes,
  recipeRoots,
  recipeId,
  findCraftable,
  pathToItem,
  rootContaining,
} from '../data/recipes';

describe('recipe graph', () => {
  it('has roots, and every root is craftable', () => {
    expect(recipeRoots.length).toBeGreaterThan(0);
    for (const id of recipeRoots) {
      const node = recipeNodes[id];
      expect(node, `missing root ${id}`).toBeDefined();
      expect(node?.recipes.length, `root ${id} has no recipe`).toBeGreaterThan(0);
    }
  });

  it('has no dangling ingredient references', () => {
    const dangling = Object.values(recipeNodes).flatMap((node) =>
      node.recipes.flatMap((recipe) =>
        recipe.ingredients.filter((i) => !recipeNodes[i.id]).map((i) => i.id),
      ),
    );
    expect(dangling).toEqual([]);
  });

  it('every node has an icon so the tree never falls back to a placeholder', () => {
    const iconless = Object.values(recipeNodes).filter((n) => !n.icon).map((n) => n.id);
    expect(iconless).toEqual([]);
  });

  /**
   * Conversion recipes (Celestial Fragments transmuting into each other, Obsidian
   * "crafted" from Obsidian Wall) are pruned at build time - without that, walking
   * the tree never bottoms out.
   */
  it('bottoms out at base materials, with no conversion cycles left', () => {
    const reaches = (start: string) => {
      const seen = new Set<string>();
      const stack = [start];
      while (stack.length) {
        for (const ing of recipeNodes[stack.pop()!]?.recipes[0]?.ingredients ?? []) {
          if (ing.id === start) return true;
          if (!seen.has(ing.id)) { seen.add(ing.id); stack.push(ing.id); }
        }
      }
      return false;
    };
    expect(Object.keys(recipeNodes).filter(reaches)).toEqual([]);
  });

  it('resolves the Ankh Shield chain', () => {
    const recipe = findCraftable('Ankh Shield')?.recipes[0];
    expect(recipe).toBeDefined();
    expect(recipe?.station).toBe("Tinkerer's Workshop");
    expect(recipe?.ingredients.map((i) => i.id).sort())
      .toEqual(['ankh-charm', 'obsidian-shield']);

    // the deep-link path a modal produces for a nested component
    expect(pathToItem('ankh-shield', 'nazar'))
      .toEqual(['ankh-shield', 'ankh-charm', 'countercurse-mantra', 'nazar']);
    expect(rootContaining('countercurse-mantra')).toBe('ankh-shield');
  });

  it('matches loadout display names to nodes, and rejects uncraftable ones', () => {
    expect(recipeId("True Night's Edge")).toBe('true-nights-edge');
    expect(findCraftable('Terra Blade')).not.toBeNull();
    expect(findCraftable('Not A Real Item')).toBeNull();
    // dropped, never crafted - must not offer a crafting-tree link
    expect(findCraftable('Muramasa')).toBeNull();
  });
});
