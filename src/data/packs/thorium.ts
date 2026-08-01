import { phases, classes as vanillaClasses } from '../../lib/data';
import { bosses as vanillaBosses, type BossDef } from '../bosses';
import { vanillaRecipeApi } from '../recipes';
import type { ClassDef } from '../schema';
import thoriumBossesJson from './thorium/bosses.json';
import { VANILLA_DIFFICULTIES, type Pack } from './types';

/**
 * Thorium adds two brand-new classes on top of the vanilla four - Bard (buffing
 * symphonic weapons) and Healer (support), plus it keeps Throwing as a full
 * class. Their subclasses follow the mod's own class-setup guides.
 */
const THORIUM_CLASSES: ClassDef[] = [
  {
    id: 'bard',
    name: 'Bard',
    blurb: "Thorium's support-damage class: symphonic instruments deal damage while building Empowerments that buff the whole team, and Inspiration is its resource instead of mana.",
    subclasses: [
      { id: 'brass', name: 'Brass Instruments', description: 'Horns and shells that fire symphonic blasts.' },
      { id: 'percussion', name: 'Percussion Instruments', description: 'Drums and struck instruments dealing close-range burst damage.' },
      { id: 'string', name: 'String Instruments', description: 'Guitars and harps that strum piercing sound waves.' },
      { id: 'wind', name: 'Wind Instruments', description: 'Flutes and pipes that fire sustained symphonic notes.' },
      { id: 'electronic', name: 'Electronic Instruments', description: 'Amplified instruments that fire energised sound.' },
    ],
  },
  {
    id: 'healer',
    name: 'Healer',
    blurb: "Thorium's dedicated support class: Radiant weapons damage enemies while healing allies, making it built for multiplayer - though its self-sustain helps in single-player too.",
    subclasses: [
      { id: 'scythe', name: 'Scythes', description: 'Radiant scythes that gather soul essence to heal allies.' },
      { id: 'mace', name: 'Maces', description: 'Radiant maces that heal allies on hit.' },
      { id: 'other', name: 'Other', description: 'Miscellaneous radiant weapons that fit no standard type.' },
    ],
  },
  {
    id: 'throwing',
    name: 'Throwing',
    blurb: 'The consumable-thrown class Thorium keeps alive and expands: javelins, knives, and thrown explosives that scale with dedicated throwing armor and accessories.',
    subclasses: [
      { id: 'consumable', name: 'Consumable Weapons', description: 'Thrown weapons that are used up as ammo.' },
      { id: 'non-consumable', name: 'Non-Consumable Weapons', description: 'Reusable thrown weapons that return or never deplete.' },
    ],
  },
];

/**
 * Thorium - a large content mod that slots its bosses into the vanilla
 * progression rather than reworking vanilla drops (unlike Calamity). So this
 * pack reuses the vanilla phases, boss data and recipe graph unchanged, then
 * layers on Thorium's own bosses and its two extra classes. Boss data is
 * scraped from thoriummod.wiki.gg the same way Calamity's was; loadouts are a
 * later pass, so the class roster is present but the loadout list is still empty.
 */
/**
 * Thorium's own boss guide slots several vanilla bosses differently from
 * vanilla's roadmap: Queen Slime is fought before the mechs, and after Plantera
 * the order is Golem, then the Forgotten One, then the Empress and Duke Fishron
 * (the reverse of vanilla's tier order). So the pack re-places those vanilla
 * bosses for its own roadmap. Each entry is applied as a fresh copy, so the
 * shared vanilla data - and the vanilla and Calamity packs - stay untouched.
 */
const VANILLA_PLACEMENT_OVERRIDES: Record<string, { stage?: string; tier?: number }> = {
  // Pre-Skeletron: fight Deerclops next to Queen Jellyfish, before Queen Bee.
  deerclops: { tier: 2.8 },
  'queen-slime': { stage: 'pre-mech', tier: 5.8 },
  golem: { tier: 7.0 },
  'empress-of-light': { tier: 7.5 },
  'duke-fishron': { tier: 7.7 },
};
const retieredVanilla = vanillaBosses.map((b) =>
  b.id in VANILLA_PLACEMENT_OVERRIDES ? { ...b, ...VANILLA_PLACEMENT_OVERRIDES[b.id]! } : b,
);

export const thoriumPack: Pack = {
  id: 'thorium',
  name: 'Thorium',
  available: true,
  phases,
  classes: [...vanillaClasses, ...THORIUM_CLASSES],
  loadouts: [],
  bosses: [...retieredVanilla, ...(thoriumBossesJson as BossDef[])],
  // Follow the mod's recommended fight order exactly - order by tier, not by the
  // default optional-first grouping (see Pack.strictBossOrder).
  strictBossOrder: true,
  recipes: vanillaRecipeApi,
  difficulties: VANILLA_DIFFICULTIES,
};
