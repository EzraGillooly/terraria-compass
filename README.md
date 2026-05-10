# Terraria Compass

Terraria Compass is a beginner-friendly companion site that shows the best class
builds for every progression phase in vanilla Terraria 1.4.5.

## Quickstart

```bash
npm install
npm run dev     # dev server → http://localhost:5173/terraria-compass/
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on `:5173` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (fails on warnings) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest watch mode |
| `npm run test:ci` | Vitest single-run with coverage |
| `npm run test:e2e` | Playwright E2E specs |
| `npm run data:validate` | Zod-validate every JSON file in `src/data/` |
| `npm run icons:fetch` | Download missing item icons from the wiki |

## How to edit data

All loadout content lives in `src/data/loadouts/`. Each file covers one phase and
all four classes. The schema is defined in `src/data/schema.ts`.

**Editing a `why` blurb:**

1. Open the relevant file, e.g. `src/data/loadouts/pre-mech.json`.
2. Find the item by its `"id"` or `"name"`.
3. Edit the `"why"` field. Keep it to 1–2 sentences.
4. Run `npm run data:validate` — it must exit 0 before you commit.

Example diff:

```diff
 {
   "id": "daedalus-stormbow",
   "name": "Daedalus Stormbow",
   "slot": "weapon",
-  "why": "Strong against mechanical bosses.",
+  "why": "Fires a volley of Holy Arrows that rain down from above, making it devastating against The Destroyer's exposed segments and any boss with a large hitbox.",
   "topPick": true
 }
```

**Adding a new item:**

Copy an existing item object, fill in all fields (every field is required except
`notes`, `tags`, `subclass`, `wikiUrl`), and ensure exactly one item per slot has
`"topPick": true`. Run `npm run data:validate` to confirm.

## How to add a new icon

Icons are served from `public/icons/` and are committed to the repo.

1. Add the item to the relevant JSON file with an `"icon"` path, e.g.
   `"icon": "items/copper-sword.png"`.
2. Run `npm run icons:fetch` — this downloads any icon path referenced in JSON
   files that does not yet exist under `public/icons/`. It throttles requests and
   respects `robots.txt`.
3. Commit both the JSON change and the new file(s) under `public/icons/`.

Never hot-link images from `terraria.wiki.gg` at runtime. All assets must be
vendored locally.

## Architecture overview

```
src/
  components/   # Reusable UI: PhaseSelector, ClassSelector, LoadoutGrid, ItemCard, …
  pages/        # Route components: Home, Phase, About, NotFound
  data/         # Static JSON content + Zod schema
  lib/          # Utilities: theme, subclass state, URL sync
  styles/       # CSS tokens, reset, pixel utilities
scripts/        # validate-data, fetch-icons (run locally, not in CI build)
tests/
  unit/         # Vitest + RTL
  e2e/          # Playwright specs (smoke, persistence, a11y, reduced-motion)
```

**Styling** uses CSS Modules with CSS custom properties from `src/styles/tokens.css`.
Never hard-code colors — always reference a token. Both light and dark themes are
defined there.

**Routing** uses React Router v6 in `HashRouter` mode (required for GitHub Pages
without server rewrites). All URLs start with `/#/`.

**State** that must survive a page reload (theme, subclass toggles, last-visited
route) is stored in `localStorage` under the `tc-` prefix.

**Data validation** runs on every CI push via `npm run data:validate`. The build
will fail if any item is missing a `why` blurb or if JSON is malformed.
