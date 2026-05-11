# Terraria Compass

Terraria Compass is a fan-made companion site for vanilla Terraria progression.
It helps players choose strong gear, weapons, accessories, and buffs for each
stage of the game across the four main classes.

**Live site:** https://ezragillooly.github.io/terraria-compass/

## Features

Pick a progression phase and class to see recommended loadouts and progression
guidance in a quick, browseable format.

- **9 phases** from Pre-Bosses through Endgame
- **4 classes** — Melee, Ranger, Mage, Summoner — each with subclass toggles
- **Recommended loadouts** for weapons, armor, accessories, and buffs
- **Boss roadmap** for quick navigation
- **Difficulty filter** — Normal / Expert / Master
- **Light and dark theme**, with OS preference support
- No ads, no tracking, no external fonts

## Development

### Prerequisites

- Node.js 20+
- npm

### Run locally

```bash
npm install
npm run dev     # http://localhost:5173/terraria-compass/
```

### Available scripts

```bash
npm run build
npm run lint
npm run typecheck
npm run test:ci
npm run test:e2e
```

## Tech stack

Vite + React + TypeScript, CSS Modules, React Router v6 (HashRouter), Zod for
data validation. Site content is stored as static JSON in `src/data/loadouts/`.
Deployments run through GitHub Actions and GitHub Pages.

## Attribution

Item icons and gameplay content adapted from
[terraria.wiki.gg](https://terraria.wiki.gg) under
[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
See [`docs/ATTRIBUTIONS.md`](/Users/ezragillooly/Desktop/Personal/terraria-compass/docs/ATTRIBUTIONS.md) for project attribution notes.

This is a fan project and is not affiliated with Re-Logic.
