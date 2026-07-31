# Contributing

Thanks for wanting to help. The most useful contribution is a **new content pack**
- a mod's worth of loadouts, bosses and crafting - since the whole site is built
so that Vanilla and Calamity are each just one self-contained data bundle, and a
third mod slots in the same way.

Before starting a pack, check the **Currently adding mods** list in the
[README](README.md#currently-adding-mods) so we don't both build the same thing.
If the mod you want isn't listed there and isn't already in the site, it's fair
game - open an issue first if you'd like a quick "yes, go for it".

## How the flow works

You don't push to this repo directly. The standard GitHub flow is:

1. **Fork** this repo to your own account.
2. **Branch** and make your changes in the fork.
3. **Open a pull request** back to `main`. CI (lint, typecheck, tests, a11y) runs
   automatically on the PR.
4. It gets **reviewed and merged**. Once merged it auto-deploys to the live site.

Nothing goes live until it's merged, so there's no risk in opening a work-in-progress
PR to get feedback early.

## Adding a content pack

Everything a pack needs lives under `src/data/`. To add one - call it `mymod`:

1. **Create `src/data/packs/mymod.ts`** exporting a `Pack` object. Copy
   `src/data/packs/vanilla.ts` as the template. The `Pack` shape is defined in
   `src/data/packs/types.ts`:

   ```ts
   export interface Pack {
     id: string;            // 'mymod' - must be unique
     name: string;          // 'My Mod' - shown in the mod dropdown
     available: boolean;    // true once it has real data
     phases: PhaseDef[];    // the progression stages
     classes: ClassDef[];   // melee / ranger / mage / ... for this mod
     loadouts: Loadout[];   // the actual gear picks per phase + class
     bosses: BossDef[];     // the boss roadmap
     recipes: RecipeApi;    // crafting trees (can start empty)
     difficulties: DifficultyDef[]; // e.g. Classic / Expert
   }
   ```

   The data shapes (`Item`, `Loadout`, `PhaseDef`, `ClassDef`) are the Zod schemas
   in `src/data/schema.ts` - that file is the contract, and the app validates
   against it at load, so a malformed pack fails loudly rather than shipping broken.

2. **Register it in `src/data/packs/meta.ts`** - add a `PackMeta` entry (`id`,
   `name`, `available`, `difficulties`, `classIds`). This is the lightweight
   description the header dropdown reads without pulling in the heavy data.

3. **Wire the loader in `src/data/packs/index.ts`** - add a branch to `loadPack`
   so `import('./mymod')` is fetched when the pack is opened. Each pack is a
   dynamic import, so it becomes its own chunk and only downloads when selected.

4. **Add item icons** under `public/icons/` (see the existing `accessories/`,
   `armor/`, `bosses/` folders for the layout and naming). Sprites are pixel art -
   keep them at native resolution; the UI upscales with `image-rendering: pixelated`.

That's the whole surface: one data file, one meta entry, one loader line, plus icons.
No core UI changes are needed - every page reads the active pack.

## Before you open the PR

Keep the bar green - these all run in CI and a PR won't merge red:

```bash
npm run lint          # eslint, --max-warnings 0
npm run typecheck
npm test              # vitest
npm run data:validate # checks your pack against the schema
npm run build
```

Match the existing style: reference design tokens via `var(--...)`, never hardcode
hex or fonts, and keep changes surgical.

## Data, sprites and licensing

Game data and sprites on this site come from the Terraria and Calamity wikis under
[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/). A pack you
contribute should source its data and sprites the same way - from the mod's own
wiki - and by opening a PR you confirm you have the right to contribute it under
those terms. The site's own source code is separately licensed; see
[`LICENSE`](LICENSE).

## Other contributions

Bug fixes, data corrections, and UI/accessibility improvements are welcome too -
same fork-and-PR flow. For anything larger than a fix, open an issue first so we
can talk through the approach before you sink time into it.
