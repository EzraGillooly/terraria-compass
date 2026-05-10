# Terraria Compass

A beginner-friendly companion site that shows the best class builds for every
progression phase in vanilla Terraria 1.4.5.

**Live site:** https://ezragillooly.github.io/terraria-compass/

## What it does

Pick your current phase and class, and the site tells you exactly which weapon
to craft, which armor to wear, which accessories to slot, and which potions to
use — and *why* each one is worth your time.

- **9 phases** from Pre-Bosses through Endgame
- **4 classes** — Melee, Ranger, Mage, Summoner — each with subclass toggles
- **All viable picks** per slot, with the consensus best-in-slot highlighted
- **Boss roadmap** for quick navigation
- **Difficulty filter** — Normal / Expert / Master
- **Dark and light theme**, respects your OS preference
- Zero ads, no tracking, no external fonts

## Running locally

```bash
npm install
npm run dev     # http://localhost:5173/terraria-compass/
```

## Tech

Vite + React + TypeScript, CSS Modules, React Router v6 (HashRouter), Zod for
data validation. All content lives in `src/data/loadouts/` as static JSON.
Deployed to GitHub Pages via GitHub Actions.

## Attribution

Item icons and gameplay content adapted from
[terraria.wiki.gg](https://terraria.wiki.gg) under
[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
See `docs/ATTRIBUTIONS.md` for the full list.

This is a fan project and is not affiliated with Re-Logic.
