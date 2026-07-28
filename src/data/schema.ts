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
  /**
   * What the item does - the modal's subtext, and the only prose it shows.
   * Sourced from the in-game tooltip, the behaviour sentences of the wiki's
   * description, or (for armour) the set bonus, whichever says most. Several
   * effects are joined with " · " and render as a list; a single one renders
   * as a paragraph.
   *
   * `why` is still carried for ordering and for the accessory pool, but is no
   * longer shown in the modal: three blocks of text competing for the same
   * card is more reading than the card is for.
   */
  effect: z.string().optional(),
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
  /**
   * What this class's headpiece actually gives, for sets whose bonus changes
   * with the headpiece. Reciting all three at once told the reader about two
   * classes they are not playing.
   */
  headpieceBonus: z.string().optional(),
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
  /**
   * Names a family rather than a single item ("Wings", "Extra jump"). Worth
   * listing as an option, but it can never fill a slot - you cannot equip
   * "Wings" - so substitution has to skip it.
   */
  isGroup: z.boolean().optional(),
  /**
   * The source page footnotes this as "excessively tedious to obtain". Worth
   * listing as an option, but it should never be auto-equipped over something
   * a player can realistically get.
   */
  tedious: z.boolean().optional(),
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
    // Calamity's guide separates these, and the distinction is the point:
    // primary mobility is the one movement item a build is built around,
    // extra mobility is what it stacks on top. 'mobility' stays for vanilla.
    'primary-mobility', 'extra-mobility', 'all-around',
  ])).optional(),
  /** how strong the pick is at this stage, per the accessory guide */
  quality: z.enum(['great', 'good', 'fine']).optional(),
  /**
   * Caveats worth showing next to an accessory.
   *
   * The two packs draw theirs from different sources and the sets do not
   * overlap, so the legend is rendered per pack rather than as one list:
   *
   *  - vanilla, from the community accessory guide: Expert-only, better in a
   *    tank build, locked to one world evil, or only useful with whips or yoyos
   *  - calamity, from the symbols Guide:Class setups defines for itself:
   *    * tedious, † risky, C crowd-control, + support, ≤ upgradeable,
   *    Δ changed by Calamity, Ω used as a pair
   */
  markers: z.array(z.enum([
    'expert', 'tank', 'corruption', 'crimson', 'whips', 'yoyos',
    'tedious', 'risky', 'crowd-control', 'support', 'upgradeable',
    'calamity-changed', 'pairs',
  ])).optional(),
  wikiUrl: z.string().url().optional(),
});

export const Loadout = z.object({
  phase: PhaseId,
  class: ClassId,
  weapons: z.array(Item),
  /**
   * Utility items the guide lists beside the weapons but which are not that
   * class's weapons: true tools (Rod of Discord), classless weapons that scale
   * with nothing (Lunic Eye, Eye of Magnus), and support summons carried by a
   * non-summoner (Wulfrum Controller). They have no subclass and never will,
   * so leaving them in `weapons` meant a card with no type pill sitting among
   * the class's actual picks.
   */
  tools: z.array(Item).default([]),
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
    // Must track Item.categories - these are the same vocabulary, and only
    // updating one of them is what broke the schema when Calamity's
    // mobility buckets were split.
    category: z.enum(['mobility', 'survivability', 'offense', 'melee', 'ranged',
      'magic', 'summon', 'primary-mobility', 'extra-mobility', 'all-around']),
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
  /**
   * The section intro from the mod's own progression guide - what this phase
   * opens up and what to do in it. Preferred over `cues` in the banner: a cue
   * is a checklist item written for this site ("Slime God fight now
   * available"), where this says what the phase is for. Calamity only; vanilla
   * has no equivalent guide page, so its banner still falls back to a cue.
   */
  guideNote: z.string().optional(),
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
