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
      { id: 'instrument', name: 'Instruments', description: 'Wind and string instruments that fire symphonic projectiles.' },
      { id: 'guitar', name: 'Guitars', description: 'Guitars that strum piercing sound waves.' },
      { id: 'drum', name: 'Drums', description: 'Percussion weapons dealing close-range burst damage.' },
      { id: 'other', name: 'Other', description: 'Miscellaneous symphonic weapons that fit no standard type.' },
    ],
  },
  {
    id: 'healer',
    name: 'Healer',
    blurb: "Thorium's dedicated support class: Radiant weapons damage enemies while healing allies, making it built for multiplayer - though its self-sustain helps in single-player too.",
    subclasses: [
      { id: 'radiant', name: 'Radiant', description: 'Healing weapons that damage enemies and heal allies at once.' },
      { id: 'staff', name: 'Healing Staves', description: 'Staves that channel healing to allies.' },
      { id: 'other', name: 'Other', description: 'Miscellaneous healing weapons that fit no standard type.' },
    ],
  },
  {
    id: 'throwing',
    name: 'Throwing',
    blurb: 'The consumable-thrown class Thorium keeps alive and expands: javelins, knives, and thrown explosives that scale with dedicated throwing armor and accessories.',
    subclasses: [
      { id: 'javelin', name: 'Javelins', description: 'Thrown javelins and spears.' },
      { id: 'knife', name: 'Knives', description: 'Thrown knives and shurikens.' },
      { id: 'other', name: 'Other', description: 'Miscellaneous thrown weapons that fit no standard type.' },
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
export const thoriumPack: Pack = {
  id: 'thorium',
  name: 'Thorium',
  available: true,
  phases,
  classes: [...vanillaClasses, ...THORIUM_CLASSES],
  loadouts: [],
  bosses: [...vanillaBosses, ...(thoriumBossesJson as BossDef[])],
  recipes: vanillaRecipeApi,
  difficulties: VANILLA_DIFFICULTIES,
};
