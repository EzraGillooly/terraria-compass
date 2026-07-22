import { z } from 'zod';

export const PhaseId = z.enum([
  'pre-bosses',
  'pre-skeletron',
  'pre-wof',
  'pre-mech',
  'pre-plantera',
  'pre-golem',
  'pre-cultist',
  'pre-moonlord',
  'endgame',
]);

export const ClassId = z.enum(['melee', 'ranger', 'mage', 'summoner']);

export const SubclassId = z.string();

export const ItemSlot = z.enum(['weapon', 'armor', 'accessory', 'buff']);

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
   * the piece this class should craft — the rest of the set is shared.
   */
  headpiece: z.string().optional(),
  /** the full set to craft: [headpiece, breastplate, leggings] */
  pieces: z.array(z.string()).optional(),
  /** short display stats, e.g. "42 melee damage · fast" */
  stats: z.string().optional(),
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
  wikiUrl: z.string().url().optional(),
});

export const Loadout = z.object({
  phase: PhaseId,
  class: ClassId,
  weapons: z.array(Item),
  armor: z.array(Item),
  accessories: z.array(Item),
  buffs: z.array(Item),
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
