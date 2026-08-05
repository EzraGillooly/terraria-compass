# Calamity hardening - handoff / trade-off notes

Written 2026-08-04, mid-session, when switching machines.
Everything below is committed and pushed to `dev` (through `cec3e81`).

## The overall trade-off: vanilla first, then Calamity per phase

We hardened **all vanilla data first** and made it the **source of truth** (weapons, armor,
accessories, buffs, boss drops). That work is merged to `main` (PR #7, v1.2.4).

Now we are hardening **Calamity**, one phase at a time, against the class-guide videos (the
"Clotz" series). The guiding rule for anything shared between the two packs:

> Any change to a weapon / accessory / armor must reflect across every phase (and class)
> it appears in - within the pack we are editing.

Vanilla and Calamity are separate data:
- Vanilla: `src/data/loadouts/*.json` (one file per phase).
- Calamity: `src/data/packs/calamity/loadouts.json` (one big array; `phase` + `class` keys).
  Phases: `cal-pre-boss`, `cal-pre-evil`, `cal-pre-hive-perf`, `cal-pre-skeletron`,
  `cal-pre-wof`, `cal-pre-mech`, ... `cal-endgame`, `cal-post-calamitas`, `cal-post-exo`.

## The Calamity "reset" (already done, all classes)

We normalized every item that also exists in vanilla to match the **vanilla display data**
(description, source, drop rate, stats, wiki link, slot, subclass, materials, defense,
headpiece bonus). This was a one-time reset so we can layer Calamity's real changes on top.

- **Kept per-pack:** icons (`calamity/...`), and curation (`tier`, `support`, `altOf`, markers).
- **Excluded:** items marked `markers: ['calamity-changed']` (Master Ninja Gear, Terraspark
  Boots, Sniper Scope, Soaring Insignia, Eye of the Golem, wing variants) - Calamity rebalances
  these, so they keep their Calamity values.
- **Risk to watch:** any vanilla item Calamity rebalances *without* the `calamity-changed`
  marker got reset to vanilla stats. Re-flag those as we hit them and restore the Calamity value.

## Wiki-link convention (Calamity pack)

- Shared **non-armor** items -> their **Calamity** wiki page (calamitymod.wiki.gg/...).
- Shared **vanilla armor** -> the single page `Armor#Vanilla_Armor_Changes`.
- Calamity-original armor / items -> their own Calamity page.

## Ranking - the `curated` flag

Calamity loadouts default to an **unranked** list (they were scraped; tier only meant row order).
A phase becomes **ranked** (Best / Other Options split, like vanilla) only when we set
`curated: true` on that loadout after hand-curating it.

Tiering rule per phase, from the video:
- **Green-highlighted weapon = Top Pick** -> `tier: 'best'` (shows in the Top Picks overview
  and as the Best row of its subclass).
- **Everything else the video lists (red) + wiki fallback picks** -> `tier: 'good'` (Other Options).
- Quirk: a subclass with no green pick shows its good picks as co-equal "best" when you drill
  into that subclass tab, but they stay out of Top Picks. Acceptable.

## Showing Calamity's differences (recipes / changes)

We do NOT use a separate "In Calamity" block (tried it, reverted). Instead:
- If Calamity adds a **craft recipe** to a normally-found item: append the method to `source`
  ("Found in ..., and craftable by hand.") and put the recipe in the item's `materials`.
- If Calamity **rebalances behaviour**: show the actual difference (don't just say "different
  in Calamity").
- Reference for recipes: **`calamitymod.wiki.gg/wiki/Vanilla_item_recipes`** (frequent it).
- "Item makes each other" (Worm Scarf <-> Brain of Confusion) = Calamity's way of letting you
  craft both world-evil variants regardless of your world. Intended.

## Support items ("or")

Two interchangeable support picks (e.g. Brittle Star Staff / Wulfrum Controller) go in the
loadout's `tools` array; set `altOf: "<primary name>"` on the alternative and the Support Items
row renders them as "Primary **or** Alt".

## Progress

- **Done & curated:** Mage `cal-pre-boss`, Mage `cal-pre-hive-perf`.
- **New Calamity weapons built this session:** Frost Bolt, Mana Rose, Icicle Staff (pre-boss);
  Aquamarine Staff (pre-hive/perf). Icons downloaded for Icicle Staff + Aquamarine Staff.
- **Craftable-source flow filled** for 8 accessories (Sandstorm in a Bottle, Fledgling Wings,
  Frog Leg, Hermes Boots, Putrid Scent, Worm Scarf, Brain of Confusion; Warrior Emblem via
  Shimmer). Some recipes need a second look (Hermes Boots read as 10 Silk + 5 Swiftness Potion).
- **App fixes this session:** material links now go to the wiki (the in-app materials page was
  retired); removed the dead "View in crafting tree" button; support-item "or"; ranked/`curated`.

## Next

- Continue **Mage** through the remaining Calamity phases (pre-evil, pre-skeletron, pre-wof,
  pre-mech, ... endgame), then the other classes.
- Per phase: retier to the video (green=best), set `curated: true`, build any missing Calamity
  weapons (fetch from calamitymod.wiki.gg), align armor/accessories, fill `source`+`materials`
  for Calamity-added recipes.
- Keep the bar green: `npm run data:validate`, `npm run typecheck`, `npm run lint`, `npm test`.
  For Calamity JSON edits, prefer raw string-replace or `json.dump(..., ensure_ascii=False,
  indent=2)` + trailing newline (the file uses literal `·`, not `·`).

## Uncommitted vanilla boss-hardening (separate track)

Earlier we started a **boss roadmap drops** hardening pass (`src/data/bosses.ts`) - fixed the
Ninja set to armor, scrubbed hype wording. That is committed (`8e28e42`). More boss review is
still pending (Ezra flags items).
