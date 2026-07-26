import { z } from 'zod';

// Phase and class ids are strings, not fixed enums: each content pack (vanilla,
// Calamity, …) defines its own progression phases and class roster. The vanilla
// ids remain 'pre-bosses'…'endgame' and 'melee'|'ranger'|'mage'|'summoner'.
export const PhaseId = z.string();
export const ClassId = z.string();

export const SubclassId = z.string();

export const ItemSlot = z.enum(['weapon', 'armor', 'accessory', 'buff', 'ammo']);

export const Item = z.object({
  id: z.string(),
  name: z.string(),
  slot: ItemSlot,
  icon: z.string(),
  source: z.string(),
  why: z.string(),
  notes: z.string().optional(),
  /** best reforge modifier, e.g. "Warding", "Menacing", "Legendary" */
  modifier: z.string().optional(),
  /**
   * For armor sets with class-specific headpieces (Adamantite, Hallowed, …),
   * the piece this class should craft - the rest of the set is shared.
   */
  headpiece: z.string().optional(),
  /** the full set to craft: [headpiece, breastplate, leggings] */
  pieces: z.array(z.string()).optional(),
  /**
   * A single armour piece rather than a set, worn by mixing it into one.
   * Flagged rather than said in prose so the UI can mark it and explain the
   * trade once, instead of every entry opening with the same disclaimer.
   */
  singlePiece: z.boolean().optional(),
  /** total defense for this class's configuration of the set */
  defense: z.number().int().optional(),
  /** short display stats, e.g. "42 melee damage · fast" */
  stats: z.string().optional(),
  /** crafting station, e.g. "Mythril Anvil or Orichalcum Anvil" */
  station: z.string().optional(),
  /**
   * What the item is crafted from. Kept structured rather than folded into
   * `source` so each material can later link to where it's obtained.
   */
  materials: z.array(z.object({
    name: z.string(),
    qty: z.number().int().positive(),
    wikiUrl: z.string().url().optional(),
  })).optional(),
  /**
   * Armor is crafted a piece at a time, so it carries one recipe per piece
   * rather than a single `materials` list - summing them would quote a total
   * no player pays, since a set lists every class helmet.
   */
  pieceRecipes: z.array(z.object({
    piece: z.string(),
    station: z.string().optional(),
    materials: z.array(z.object({
      name: z.string(),
      qty: z.number().int().positive(),
      wikiUrl: z.string().url().optional(),
    })),
  })).optional(),
  /**
   * Set when every entity in the item's drop table is a Treasure Bag: bags
   * exist only in Expert and above, so a Classic world cannot obtain it.
   * Drop rates themselves do not vary by difficulty, so there is no
   * per-difficulty rate to store.
   */
  expertOnly: z.boolean().optional(),
  /** the rate a player actually sees, e.g. "33%" or "1/7 (14.29%)" */
  dropRate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  topPick: z.boolean().default(false),
  /**
   * How strongly the item is recommended for its phase:
   * 'best'  → best in slot for its subclass (shown in the "All" overview)
   * 'good'  → a genuinely viable alternative ("Also Great")
   * 'other' → kept for reference, hidden behind "show all"
   */
  tier: z.enum(['best', 'good', 'other']).default('good'),
  subclass: SubclassId.optional(),
  /**
   * What an accessory is actually for. Some genuinely serve two roles (Feral
   * Claws is melee and summon; Moon Stone is offense and survivability), so this
   * is a list rather than one value.
   */
  categories: z.array(z.enum([
    'mobility', 'offense', 'survivability', 'melee', 'ranged', 'magic', 'summon',
  ])).optional(),
  /** how strong the pick is at this stage, per the accessory guide */
  quality: z.enum(['great', 'good', 'fine']).optional(),
  /**
   * Caveats worth showing next to an accessory: Expert-only, better in tank
   * builds, locked to one world evil, or only useful with whips or yoyos.
   */
  markers: z.array(z.enum([
    'expert', 'tank', 'corruption', 'crimson', 'whips', 'yoyos',
  ])).optional(),
  wikiUrl: z.string().url().optional(),
});

export const Loadout = z.object({
  phase: PhaseId,
  class: ClassId,
  weapons: z.array(Item),
  armor: z.array(Item),
  accessories: z.array(Item),
  buffs: z.array(Item),
  /**
   * Ranged classes only. Ammo changes what a gun or bow actually does, so
   * it is picked per phase rather than left to the player to guess.
   * Defaults to empty so every other class validates unchanged.
   */
  ammo: z.array(Item).default([]),
  /**
   * Every other accessory worth considering at this phase, grouped by the
   * category it belongs to. The five equipped slots are one build; this is the
   * pool they were picked from, so a player can swap by category instead of
   * being handed a single answer. Sourced from the SilverIsGold sandbox.
   */
  /**
   * Why mixing armour pieces is worth considering at this phase, shown once
   * above the armour list when it offers any single piece. The trade is always
   * the same - you give up the set bonus - so what changes by phase is whether
   * the piece you gain is worth more than the bonus you lose.
   */
  mixNote: z.string().optional(),
  accessoryPool: z.array(z.object({
    category: z.enum(['mobility', 'survivability', 'offense', 'melee', 'ranged', 'magic', 'summon']),
    items: z.array(Item),
  })).default([]),
});

export const PhaseDef = z.object({
  id: PhaseId,
  order: z.number(),
  name: z.string(),
  triggeredBy: z.string(),
  bossIcon: z.string().optional(),
  cues: z.array(z.string()),
  description: z.string(),
});

export const ClassDef = z.object({
  id: ClassId,
  name: z.string(),
  blurb: z.string(),
  subclasses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
    }),
  ),
});

export const PhaseCollection = z.array(PhaseDef);
export const ClassCollection = z.array(ClassDef);
export const LoadoutCollection = z.array(Loadout);

export type PhaseId = z.infer<typeof PhaseId>;
export type ClassId = z.infer<typeof ClassId>;
export type SubclassId = z.infer<typeof SubclassId>;
export type ItemSlot = z.infer<typeof ItemSlot>;
export type Item = z.infer<typeof Item>;
export type Loadout = z.infer<typeof Loadout>;
export type PhaseDef = z.infer<typeof PhaseDef>;
export type ClassDef = z.infer<typeof ClassDef>;
