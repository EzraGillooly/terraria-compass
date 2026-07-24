# Terraria Compass

Terraria Compass is a fan-made companion site for Terraria progression. Pick your
stage and class to see the gear worth using at that point: weapons, armor,
accessories and buffs, plus what each item is made from and where its materials
come from.

**Live site:** https://ezragillooly.github.io/terraria-compass/

## Features

- **Vanilla and Calamity** - switch content packs from the header and every page
  rewires to that mod's data
- **9 vanilla phases** (Pre-Bosses to Endgame) and **19 Calamity phases**
  (Pre-Boss to Supreme Calamitas)
- **4 classes**, plus **Rogue** in Calamity, with subclass filters where they apply
- **Recommended loadouts** for weapons, armor, accessories and buffs, with armor
  shown as the one set matching your class rather than every class helmet
- **Crafting trees** that expand down to the raw drops and ores, with a
  "what to farm" shopping list
- **Materials index** (Calamity) - search any material to see how it is obtained
- **Boss roadmap** and biome guides
- **Difficulty filter** - Classic / Expert / Master, plus Revengeance and Death
  under Calamity
- No ads, no tracking, no external fonts

## Tech stack

Vite + React + TypeScript, CSS Modules, React Router v6 (HashRouter), Zod for
data validation. Content is static JSON under `src/data/`, with each content pack
in `src/data/packs/`. Deployments run through GitHub Actions and GitHub Pages.

The pixel-stepped corners used throughout the UI are a CSS utility
(`src/styles/pixel.css`) built from `clip-path` polygons, so no images or SVGs are
needed for the frames.

## Development

```bash
npm run dev         # http://localhost:3003/terraria-compass/
npm run build       # tsc -b && vite build
npm run typecheck
npm run lint        # eslint, --max-warnings 0
npm test            # vitest
npm run test:e2e    # playwright, includes axe accessibility checks
npm run data:validate
```

## Licensing and attribution

The source code is **all rights reserved** - see [`LICENSE`](LICENSE) for what is
and is not permitted. The game data derived from the wikis is CC BY-NC-SA 3.0 and
is deliberately carved out, because that license is ShareAlike.

Item data and sprites are adapted from [terraria.wiki.gg](https://terraria.wiki.gg)
and [calamitymod.wiki.gg](https://calamitymod.wiki.gg) under
[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/). Biome
backdrops are community builds by flor3nce2456 and Eiv.

See [`docs/ATTRIBUTIONS.md`](docs/ATTRIBUTIONS.md) for full credits and contact
details.

This is an unofficial fan project. It is not affiliated with, endorsed by, or
sponsored by Re-Logic or the Calamity Mod team. Terraria is a trademark of
Re-Logic.
