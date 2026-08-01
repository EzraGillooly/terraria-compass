import { classes as vanillaClasses } from '../../lib/data';
import { bosses as vanillaBosses, type BossDef } from '../bosses';
import { vanillaRecipeApi } from '../recipes';
import { ClassDef, LoadoutCollection, PhaseCollection } from '../schema';
import { parseData } from '../parse';
import phasesJson from './thorium/phases.json';
import loadoutsJson from './thorium/loadouts.json';
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
 * Thorium keeps the four vanilla classes but sorts their weapons with its own
 * Weapons-page taxonomy (Spears, Repeaters, and an Other bucket that vanilla has
 * no name for). So the pack re-declares their subclasses while reusing the
 * vanilla name and blurb - the vanilla pack itself is untouched.
 */
const THORIUM_VANILLA_SUBCLASSES: Record<string, ClassDef['subclasses']> = {
  melee: [
    { id: 'true-melee', name: 'Swords', description: 'Broadswords and shortswords swung in melee.' },
    { id: 'yoyo', name: 'Yoyos', description: 'Yoyos flung out on a string.' },
    { id: 'projectile-melee', name: 'Spears', description: 'Spears and lances that stab through enemies.' },
    { id: 'boomerang', name: 'Boomerangs', description: 'Thrown melee weapons that return to you.' },
    { id: 'flail', name: 'Flails', description: 'Flails swung on a chain.' },
    { id: 'other', name: 'Other', description: 'Melee weapons that fit no standard type.' },
  ],
  ranger: [
    { id: 'bow', name: 'Bows', description: 'Bows that fire arrows.' },
    { id: 'repeater', name: 'Repeaters', description: 'Mechanical bows that auto-fire arrows.' },
    { id: 'gun', name: 'Guns', description: 'Guns that fire bullets.' },
    { id: 'launcher', name: 'Launchers', description: 'Launchers that fire rockets.' },
    { id: 'other', name: 'Other', description: 'Ranged weapons that fit no standard type.' },
  ],
  mage: [
    { id: 'wand', name: 'Wands', description: 'Wands and staves that fire magic bolts.' },
    { id: 'magic-gun', name: 'Magic Guns', description: 'Magic weapons that fire like a gun.' },
    { id: 'spell-tome', name: 'Spell Tomes', description: 'Tomes that cast spells.' },
    { id: 'other', name: 'Other', description: 'Magic weapons that fit no standard type.' },
  ],
  summoner: [
    { id: 'minions', name: 'Minion Summoning', description: 'Staves that summon following minions.' },
    { id: 'sentries', name: 'Sentry Summoning', description: 'Staves that place stationary sentries.' },
    { id: 'whip', name: 'Whips', description: 'Whips that tag enemies for your minions.' },
    { id: 'other', name: 'Other', description: 'Summon weapons that fit no standard type.' },
  ],
};
const thoriumVanillaClasses: ClassDef[] = vanillaClasses
  .filter((c) => c.id in THORIUM_VANILLA_SUBCLASSES)
  .map((c) => ({ ...c, subclasses: THORIUM_VANILLA_SUBCLASSES[c.id]! }));

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
  'king-slime': { stage: 'thor-pre-boss' },
  'eye-of-cthulhu': { stage: 'thor-pre-boss' },
  'eater-of-worlds': { stage: 'thor-pre-evil' },
  'brain-of-cthulhu': { stage: 'thor-pre-evil' },
  // Mid pre-Hardmode: Deerclops reads next to Queen Jellyfish, before Queen Bee.
  deerclops: { stage: 'thor-mid-prehm', tier: 2.8 },
  'queen-bee': { stage: 'thor-mid-prehm' },
  skeletron: { stage: 'thor-pre-skeletron' },
  'wall-of-flesh': { stage: 'thor-pre-wof' },
  'queen-slime': { stage: 'thor-post-wof', tier: 5.8 },
  'the-twins': { stage: 'thor-pre-mech' },
  'the-destroyer': { stage: 'thor-pre-mech' },
  'skeletron-prime': { stage: 'thor-pre-mech' },
  plantera: { stage: 'thor-post-mech' },
  // Post-mech order: Golem before the Empress of Light and Duke Fishron.
  golem: { stage: 'thor-post-mech', tier: 7.0 },
  'empress-of-light': { stage: 'thor-post-mech', tier: 7.5 },
  'duke-fishron': { stage: 'thor-post-mech', tier: 7.7 },
  'lunatic-cultist': { stage: 'thor-pre-lunar' },
  'moon-lord': { stage: 'thor-pre-primordials' },
};
const retieredVanilla = vanillaBosses.map((b) =>
  b.id in VANILLA_PLACEMENT_OVERRIDES ? { ...b, ...VANILLA_PLACEMENT_OVERRIDES[b.id]! } : b,
);

export const thoriumPack: Pack = {
  id: 'thorium',
  name: 'Thorium',
  available: true,
  phases: parseData(PhaseCollection, phasesJson),
  classes: [...thoriumVanillaClasses, ...THORIUM_CLASSES],
  loadouts: parseData(LoadoutCollection, loadoutsJson),
  bosses: [...retieredVanilla, ...(thoriumBossesJson as BossDef[])],
  // Follow the mod's recommended fight order exactly - order by tier, not by the
  // default optional-first grouping (see Pack.strictBossOrder).
  strictBossOrder: true,
  // Clump the roadmap to match the mod's boss diagram (see Pack.bossClusters).
  // Only the parallel "and"/"or" steps are listed; every other boss is its own
  // single clump, placed by tier.
  bossClusters: [
    ['the-grand-thunder-bird', 'king-slime', 'eye-of-cthulhu'],
    ['eater-of-worlds', 'brain-of-cthulhu'],
    ['queen-jellyfish', 'deerclops'],
    ['queen-bee', 'viscount'],
    ['granite-energy-storm', 'buried-champion'],
    ['star-scouter', 'wall-of-flesh'],
    ['borean-strider', 'fallen-beholder', 'queen-slime'],
    ['the-twins', 'the-destroyer', 'skeletron-prime'],
    ['lich', 'plantera', 'golem', 'forgotten-one'],
    ['empress-of-light', 'duke-fishron'],
    ['lunatic-cultist', 'moon-lord', 'the-primordials'],
  ],
  recipes: vanillaRecipeApi,
  difficulties: VANILLA_DIFFICULTIES,
};
