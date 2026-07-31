/**
 * A boss drop or summon item rich enough to open the shared ItemModal - the same
 * card weapons and accessories use on the Loadouts page. `mode` gates it to a
 * difficulty (undefined = drops in every mode); the Drops row greys anything the
 * current world/Calamity mode cannot get. A plain string drop still works (older
 * bosses not yet converted) and renders as a non-clickable pill.
 */
export interface BossDrop {
  name: string;
  /** icons/ path, e.g. "calamity/sahara-slicers.png" */
  icon: string;
  /** display type for the modal subtitle: weapon | accessory | vanity | summon | material | ... */
  slot?: string;
  subclass?: string;
  /** what it does - the modal's one-line subtext */
  effect?: string;
  /** short stats line for the modal, e.g. "23 damage" */
  stats?: string;
  /** the rate a player sees, e.g. "25%" or "25% (33% Expert)" */
  dropRate?: string;
  /** only for a summon item - how it is obtained (drops omit it; it is implied) */
  source?: string;
  /** difficulty gate; omitted = every mode */
  mode?: 'expert' | 'revengeance' | 'death' | 'master';
  wikiUrl?: string;
  /** craft recipe, shown for a summon item so the reader can make it */
  materials?: { name: string; qty: number; wikiUrl?: string }[];
}

export interface BossDef {
  id: string;
  name: string;
  /** phase gate this boss belongs to (a pack's phase id) */
  stage: string;
  tier: number;
  /** optional side boss - not required for progression (drives layout) */
  side?: boolean;
  /**
   * How the boss sits in the progression:
   *   required    - a hard gate; you cannot reach Moon Lord without it
   *   recommended - skippable, but it gates materials most players want
   *   optional    - side content that unlocks no world progression
   */
  role?: 'required' | 'recommended' | 'optional';
  /** what beating it actually opens up; omitted when it opens nothing */
  unlocks?: string;
  /** world-variant boss (corruption | crimson) */
  world?: string;
  summon: string;
  /** the craftable/obtainable item that summons it, clickable in the Summon row */
  summonItem?: BossDrop;
  drops: (string | BossDrop)[];
  blurb: string;
  color: string;
  /** an animated bosses/<id>.gif exists; the big detail card uses it (the small
   *  roadmap icons stay the static .png). */
  animated?: boolean;
}

export const bosses: BossDef[] = [
  // ── Pre-Bosses ────────────────────────────────────────────
  {
    id: 'king-slime',
    role: 'optional',
    name: 'King Slime',
    stage: 'pre-bosses',
    tier: 0,
    side: true,
    summon: 'Use it in any biome, at any time. King Slime also spawns on its own during a Slime Rain.',
    summonItem: {
      name: 'Slime Crown',
      icon: 'items/slime-crown.png',
      slot: 'summon',
      effect: 'Summons King Slime when used, in any biome at any time.',
      source: 'Crafted at a Demon or Crimson Altar',
      wikiUrl: 'https://terraria.wiki.gg/wiki/Slime_Crown',
      materials: [
        { name: 'Gel', qty: 20, wikiUrl: 'https://terraria.wiki.gg/wiki/Gel' },
        { name: 'Gold or Platinum Crown', qty: 1, wikiUrl: 'https://terraria.wiki.gg/wiki/Gold_Crown' },
      ],
    },
    drops: [
      { name: 'Slimy Saddle', icon: 'items/slimy-saddle.png', slot: 'mount',
        effect: 'Summons the Slime Mount, which hovers and slams down onto enemies.',
        dropRate: '25%', wikiUrl: 'https://terraria.wiki.gg/wiki/Slimy_Saddle' },
      { name: 'Slime Staff', icon: 'items/slime-staff.png', slot: 'weapon', subclass: 'minions',
        effect: 'Summons a Baby Slime to fight for you - the rarest summon staff in the game.',
        stats: '8 damage', dropRate: '3.33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Slime_Staff' },
      { name: 'Slime Gun', icon: 'items/slime-gun.png', slot: 'weapon',
        effect: 'Sprays harmless slime - a novelty item that deals no damage.',
        dropRate: '66.67%', wikiUrl: 'https://terraria.wiki.gg/wiki/Slime_Gun' },
      { name: 'Slime Hook', icon: 'items/slime-hook.png', slot: 'tool',
        effect: 'A single-claw grappling hook with slime-green reach.',
        dropRate: '33.33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Slime_Hook' },
      { name: 'Ninja Hood', icon: 'items/ninja-hood.png', slot: 'vanity',
        effect: 'Vanity headpiece from the ninja trapped inside King Slime.',
        dropRate: '33.33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Ninja_Hood' },
      { name: 'Ninja Shirt', icon: 'items/ninja-shirt.png', slot: 'vanity',
        effect: 'Vanity shirt from the ninja trapped inside King Slime.',
        dropRate: '33.33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Ninja_Shirt' },
      { name: 'Ninja Pants', icon: 'items/ninja-pants.png', slot: 'vanity',
        effect: 'Vanity leggings from the ninja trapped inside King Slime.',
        dropRate: '33.33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Ninja_Pants' },
      { name: 'King Slime Mask', icon: 'items/king-slime-mask.png', slot: 'vanity',
        effect: "A vanity mask shaped like King Slime's crown and face.",
        dropRate: '14.29%', wikiUrl: 'https://terraria.wiki.gg/wiki/King_Slime_Mask' },
      { name: 'Royal Gel', icon: 'accessories/royal-gel.png', slot: 'accessory', mode: 'expert',
        effect: 'Slimes become friendly and no longer harm you.',
        dropRate: '100% (Expert Treasure Bag)', wikiUrl: 'https://terraria.wiki.gg/wiki/Royal_Gel' },
    ],
    blurb: 'A giant slime with a ninja trapped inside. It teleports, spawns smaller slimes, and shrinks as it loses health.',
    color: '#5BB3FF',
    animated: true,
  },
  {
    id: 'eye-of-cthulhu',
    role: 'recommended',
    unlocks: 'Can now smelt Demonite/Crimtane Bars for the first evil-metal weapons (Light’s Bane, the Demon Bow, and more).',
    name: 'Eye of Cthulhu',
    stage: 'pre-bosses',
    tier: 1,
    summon: 'Use it at night to summon the Eye. It can also spawn on its own at night once you have 200 HP and a few defeated town NPCs.',
    summonItem: {
      name: 'Suspicious Looking Eye',
      icon: 'items/suspicious-looking-eye.png',
      slot: 'summon',
      effect: 'Summons the Eye of Cthulhu when used at night.',
      source: 'Crafted at a Demon or Crimson Altar',
      wikiUrl: 'https://terraria.wiki.gg/wiki/Suspicious_Looking_Eye',
      materials: [
        { name: 'Lens', qty: 6, wikiUrl: 'https://terraria.wiki.gg/wiki/Lens' },
      ],
    },
    drops: [
      { name: 'Demonite Ore', icon: 'materials/demonite-ore.png', slot: 'material',
        effect: "The Corruption world's first upgrade ore; smelt it into Demonite Bars.",
        dropRate: '100% (Corruption worlds)', wikiUrl: 'https://terraria.wiki.gg/wiki/Demonite_Ore' },
      { name: 'Corrupt Seeds', icon: 'items/corrupt-seeds.png', slot: 'material',
        effect: 'Plants a patch of Corruption where used.',
        dropRate: '100% (Corruption worlds)', wikiUrl: 'https://terraria.wiki.gg/wiki/Corrupt_Seeds' },
      { name: 'Crimtane Ore', icon: 'materials/crimtane-ore.png', slot: 'material',
        effect: "The Crimson world's first upgrade ore; smelt it into Crimtane Bars.",
        dropRate: '100% (Crimson worlds)', wikiUrl: 'https://terraria.wiki.gg/wiki/Crimtane_Ore' },
      { name: 'Crimson Seeds', icon: 'items/crimson-seeds.png', slot: 'material',
        effect: 'Plants a patch of Crimson where used.',
        dropRate: '100% (Crimson worlds)', wikiUrl: 'https://terraria.wiki.gg/wiki/Crimson_Seeds' },
      { name: 'Binoculars', icon: 'items/binoculars.png', slot: 'tool',
        effect: 'Hold to zoom the camera out for a wider view.',
        dropRate: '2.5%', wikiUrl: 'https://terraria.wiki.gg/wiki/Binoculars' },
      { name: 'Eye of Cthulhu Mask', icon: 'items/eye-of-cthulhu-mask.png', slot: 'vanity',
        effect: 'A vanity mask shaped like the Eye of Cthulhu.',
        dropRate: '14.29%', wikiUrl: 'https://terraria.wiki.gg/wiki/Eye_of_Cthulhu_Mask' },
      { name: "Badger's Hat", icon: 'items/badgers-hat.png', slot: 'vanity',
        effect: 'A promotional vanity hat - only drops if the Eye is beaten on the same day as the Wall of Flesh.',
        dropRate: '100% (conditional)', wikiUrl: 'https://terraria.wiki.gg/wiki/Badger%27s_Hat' },
      { name: 'Shield of Cthulhu', icon: 'accessories/shield-of-cthulhu.png', slot: 'accessory', mode: 'expert',
        effect: 'Dash into enemies to damage and knock them back; also cancels fall damage.',
        dropRate: '100% (Expert Treasure Bag)', wikiUrl: 'https://terraria.wiki.gg/wiki/Shield_of_Cthulhu' },
    ],
    blurb: 'Summoned at night with a Suspicious Looking Eye. It circles and spawns Servants until half health, then stops summoning and charges instead.',
    color: '#E84A4A',
    animated: true,
  },
  {
    id: 'eater-of-worlds',
    role: 'recommended',
    unlocks: 'Can now craft Shadow armor and the Nightmare Pickaxe.',
    name: 'Eater of Worlds',
    stage: 'pre-bosses',
    tier: 2,
    world: 'corruption',
    summon: 'Use it in the Corruption or Underground Corruption. It is also summoned by smashing three Shadow Orbs.',
    summonItem: {
      name: 'Worm Food',
      icon: 'items/worm-food.png',
      slot: 'summon',
      effect: 'Summons the Eater of Worlds when used in the Corruption.',
      source: 'Crafted at a Demon or Crimson Altar',
      wikiUrl: 'https://terraria.wiki.gg/wiki/Worm_Food',
      materials: [
        { name: 'Vile Powder', qty: 30, wikiUrl: 'https://terraria.wiki.gg/wiki/Vile_Powder' },
        { name: 'Rotten Chunk', qty: 15, wikiUrl: 'https://terraria.wiki.gg/wiki/Rotten_Chunk' },
      ],
    },
    drops: [
      { name: 'Shadow Scale', icon: 'items/shadow-scale.png', slot: 'material',
        effect: 'Corruption crafting material for Shadow armor and demonite tools.',
        dropRate: '100%', wikiUrl: 'https://terraria.wiki.gg/wiki/Shadow_Scale' },
      { name: 'Demonite Ore', icon: 'materials/demonite-ore.png', slot: 'material',
        effect: 'Smelt it into Demonite Bars - the Eater drops it in bulk.',
        dropRate: '100%', wikiUrl: 'https://terraria.wiki.gg/wiki/Demonite_Ore' },
      { name: "Eater's Bone", icon: 'items/eaters-bone.png', slot: 'pet',
        effect: 'Summons a miniature Eater of Worlds to follow you.',
        dropRate: '5%', wikiUrl: 'https://terraria.wiki.gg/wiki/Eater%27s_Bone' },
      { name: 'Eater of Worlds Mask', icon: 'items/eater-of-worlds-mask.png', slot: 'vanity',
        effect: "A vanity mask shaped like the Eater of Worlds' head.",
        dropRate: '14.29%', wikiUrl: 'https://terraria.wiki.gg/wiki/Eater_of_Worlds_Mask' },
      { name: 'Worm Scarf', icon: 'accessories/worm-scarf.png', slot: 'accessory', mode: 'expert',
        effect: 'Reduces all damage taken by 17%.',
        dropRate: '100% (Expert Treasure Bag)', wikiUrl: 'https://terraria.wiki.gg/wiki/Worm_Scarf' },
    ],
    blurb: 'A segmented worm, Corruption worlds only. Destroying a middle segment splits it into two shorter worms, so piercing weapons hit many segments at once.',
    color: '#8B5BC9',
  },
  {
    id: 'brain-of-cthulhu',
    role: 'recommended',
    unlocks: 'Can now craft Crimson armor and the Deathbringer Pickaxe.',
    name: 'Brain of Cthulhu',
    stage: 'pre-bosses',
    tier: 2,
    world: 'crimson',
    summon: 'Use it in the Crimson. It is also summoned by smashing three Crimson Hearts.',
    summonItem: {
      name: 'Bloody Spine',
      icon: 'items/bloody-spine.png',
      slot: 'summon',
      effect: 'Summons the Brain of Cthulhu when used in the Crimson.',
      source: 'Crafted at a Demon or Crimson Altar',
      wikiUrl: 'https://terraria.wiki.gg/wiki/Bloody_Spine',
      materials: [
        { name: 'Vicious Powder', qty: 30, wikiUrl: 'https://terraria.wiki.gg/wiki/Vicious_Powder' },
        { name: 'Vertebra', qty: 15, wikiUrl: 'https://terraria.wiki.gg/wiki/Vertebra' },
      ],
    },
    drops: [
      { name: 'Tissue Sample', icon: 'items/tissue-sample.png', slot: 'material',
        effect: 'Crimson crafting material for Crimson armor and crimtane tools - dropped by the Creepers that swarm the Brain.',
        dropRate: 'From the Creepers', wikiUrl: 'https://terraria.wiki.gg/wiki/Tissue_Sample' },
      { name: 'Crimtane Ore', icon: 'materials/crimtane-ore.png', slot: 'material',
        effect: 'Smelt it into Crimtane Bars - the Brain drops it in bulk.',
        dropRate: '100%', wikiUrl: 'https://terraria.wiki.gg/wiki/Crimtane_Ore' },
      { name: 'Bone Rattle', icon: 'items/bone-rattle.png', slot: 'pet',
        effect: 'Summons a Baby Face Monster pet to follow you.',
        dropRate: '5%', wikiUrl: 'https://terraria.wiki.gg/wiki/Bone_Rattle' },
      { name: 'Brain of Cthulhu Mask', icon: 'items/brain-of-cthulhu-mask.png', slot: 'vanity',
        effect: 'A vanity mask shaped like the Brain of Cthulhu.',
        dropRate: '14.29%', wikiUrl: 'https://terraria.wiki.gg/wiki/Brain_of_Cthulhu_Mask' },
      { name: 'Brain of Confusion', icon: 'accessories/brain-of-confusion.png', slot: 'accessory', mode: 'expert',
        effect: 'A chance to dodge attacks, and confuses nearby enemies when you are hit.',
        dropRate: '100% (Expert Treasure Bag)', wikiUrl: 'https://terraria.wiki.gg/wiki/Brain_of_Confusion' },
    ],
    blurb: 'Crimson worlds only. It is invulnerable until its ring of Creepers is killed, then teleports and spawns illusions of itself.',
    color: '#D24A6A',
    animated: true,
  },

  // ── Pre-Skeletron ─────────────────────────────────────────
  {
    id: 'queen-bee',
    role: 'optional',
    unlocks: 'The Witch Doctor NPC can now move in - he sells summoner gear and the Imbuing Station.',
    name: 'Queen Bee',
    stage: 'pre-skeletron',
    tier: 3,
    side: true,
    summon: 'Use it anywhere in the Jungle. She also spawns if you break a Larva inside a Bee Hive.',
    summonItem: {
      name: 'Abeemination',
      icon: 'items/abeemination.png',
      slot: 'summon',
      effect: 'Summons the Queen Bee when used in a Jungle biome.',
      source: 'Crafted by hand',
      wikiUrl: 'https://terraria.wiki.gg/wiki/Abeemination',
      materials: [
        { name: 'Honey Block', qty: 5, wikiUrl: 'https://terraria.wiki.gg/wiki/Honey_Block' },
        { name: 'Hive', qty: 5, wikiUrl: 'https://terraria.wiki.gg/wiki/Hive' },
        { name: 'Stinger', qty: 1, wikiUrl: 'https://terraria.wiki.gg/wiki/Stinger' },
        { name: 'Bottled Honey', qty: 1, wikiUrl: 'https://terraria.wiki.gg/wiki/Bottled_Honey' },
      ],
    },
    drops: [
      { name: 'Bee Keeper', icon: 'items/bee-keeper.png', slot: 'weapon', subclass: 'true-melee',
        effect: 'A broadsword that releases bees on every hit.',
        stats: '30 damage', dropRate: '33% (one of three weapons)', wikiUrl: 'https://terraria.wiki.gg/wiki/Bee_Keeper' },
      { name: 'Bee Gun', icon: 'items/bee-gun.png', slot: 'weapon', subclass: 'magic-gun',
        effect: 'Fires a swarm of homing bees.',
        stats: '9 damage', dropRate: '33% (one of three weapons)', wikiUrl: 'https://terraria.wiki.gg/wiki/Bee_Gun' },
      { name: "The Bee's Knees", icon: 'items/the-bees-knees.png', slot: 'weapon', subclass: 'bow',
        effect: 'Turns wooden arrows into homing bees.',
        stats: '23 damage', dropRate: '33% (one of three weapons)', wikiUrl: 'https://terraria.wiki.gg/wiki/The_Bee%27s_Knees' },
      { name: 'Hive Wand', icon: 'items/hive-wand.png', slot: 'tool',
        effect: 'Places Hive blocks.',
        dropRate: '33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Hive_Wand' },
      { name: 'Honey Comb', icon: 'accessories/honey-comb.png', slot: 'accessory',
        effect: 'Releases a swarm of bees when you take damage.',
        dropRate: '33%', wikiUrl: 'https://terraria.wiki.gg/wiki/Honey_Comb' },
      { name: 'Nectar', icon: 'items/nectar.png', slot: 'pet',
        effect: 'Summons a Baby Hornet to follow you.',
        dropRate: '6.7%', wikiUrl: 'https://terraria.wiki.gg/wiki/Nectar' },
      { name: 'Honeyed Goggles', icon: 'items/honeyed-goggles.png', slot: 'mount',
        effect: 'Summons the Bee Mount, which grants limited flight.',
        dropRate: '5%', wikiUrl: 'https://terraria.wiki.gg/wiki/Honeyed_Goggles' },
      { name: 'Beenade', icon: 'items/beenade.png', slot: 'weapon',
        effect: 'A thrown grenade that bursts into bees on impact.',
        stats: '12 damage', dropRate: '75%', wikiUrl: 'https://terraria.wiki.gg/wiki/Beenade' },
      { name: 'Bee Wax', icon: 'items/bee-wax.png', slot: 'material',
        effect: 'Crafting material for Bee armor and bee-themed gear.',
        dropRate: '100%', wikiUrl: 'https://terraria.wiki.gg/wiki/Bee_Wax' },
      { name: 'Queen Bee Mask', icon: 'items/queen-bee-mask.png', slot: 'vanity',
        effect: 'A vanity mask shaped like the Queen Bee.',
        dropRate: '14.29%', wikiUrl: 'https://terraria.wiki.gg/wiki/Queen_Bee_Mask' },
      { name: 'Hive Pack', icon: 'accessories/hive-pack.png', slot: 'accessory', mode: 'expert',
        effect: 'Bees and wasps from your weapons become larger and more damaging.',
        dropRate: '100% (Expert Treasure Bag)', wikiUrl: 'https://terraria.wiki.gg/wiki/Hive_Pack' },
    ],
    blurb: 'Fought in the Jungle. She alternates between charging horizontally, firing stingers, and spawning bees, so a long flat arena suits her.',
    color: '#F2C24A',
    animated: true,
  },
  {
    id: 'skeletron',
    role: 'recommended',
    unlocks: 'The Dungeon, and with it the Muramasa, Cobalt Shield and Bone Key',
    name: 'Skeletron',
    stage: 'pre-skeletron',
    tier: 4,
    summon: 'Speak to the Old Man at the Dungeon entrance at night. Kill both hands before the head.',
    drops: ['Skeletron Hand', 'Book of Skulls', 'Bone Glove', 'Skeletron Mask'],
    blurb: 'Guards the Dungeon entrance and is summoned by speaking to the Old Man at night. The head is invulnerable until both hands are destroyed, and he kills instantly at dawn.',
    color: '#D8D2BD',
  },
  {
    id: 'deerclops',
    role: 'optional',
    name: 'Deerclops',
    stage: 'pre-skeletron',
    tier: 3,
    side: true,
    summon: 'Use a Deer Thing in a Snow biome at midnight, or wait for a natural spawn during a Blizzard.',
    drops: ['Eye Bone', 'Lucy the Axe', 'Houndius Shootius', 'Deerclops Mask'],
    blurb: 'A Don\'t Starve crossover fought in the Snow biome. Ground-based, with a shadow attack that reaches through blocks.',
    color: '#A8C8E0',
  },

  // ── Pre-WoF ───────────────────────────────────────────────
  {
    id: 'wall-of-flesh',
    role: 'required',
    unlocks: 'Hardmode: Cobalt through Titanium ore, the Hallow, and a Demon Altar smash',
    name: 'Wall of Flesh',
    stage: 'pre-wof',
    tier: 5,
    summon: 'Throw a Guide Voodoo Doll into lava in the Underworld.',
    drops: ['Pwnhammer', 'Emblem (class-specific)', 'Breaker Blade', 'Clockwork Assault Rifle', 'Demon Heart (Expert)'],
    blurb: 'Summoned by throwing a Guide Voodoo Doll into Underworld lava. It moves across the world at a steady speed, so the fight happens on a long bridge, and it speeds up as it loses health.',
    color: '#E07A4A',
  },

  // ── Pre-Mech (Hardmode) ───────────────────────────────────
  {
    id: 'the-twins',
    role: 'required',
    unlocks: 'Hallowed Bars and Souls of Sight. All three mechs are needed for Plantera',
    name: 'The Twins',
    stage: 'pre-mech',
    tier: 6,
    summon: 'Craft a Mechanical Eye at a Mythril/Orichalcum Anvil, or wait for a nighttime natural spawn.',
    drops: ['Hallowed Bars', 'Soul of Sight', 'Twins Mask', 'Spaz\'s Eye (Expert)'],
    blurb: 'Two mechanical eyes. Spazmatism deals contact damage and cursed flames, Retinazer fires lasers, and each changes form below half health.',
    color: '#E84A4A',
  },
  {
    id: 'the-destroyer',
    role: 'required',
    unlocks: 'Hallowed Bars and Souls of Might. All three mechs are needed for Plantera',
    name: 'The Destroyer',
    stage: 'pre-mech',
    tier: 6,
    summon: 'Craft a Mechanical Worm at a Mythril/Orichalcum Anvil, or wait for a nighttime natural spawn.',
    drops: ['Hallowed Bars', 'Soul of Might', 'Destroyer Mask', 'Greater Healing Potions'],
    blurb: 'A mechanical worm that releases Probes as it takes damage. Its segments overlap, so piercing weapons hit several at once.',
    color: '#5BB3FF',
  },
  {
    id: 'skeletron-prime',
    role: 'required',
    unlocks: 'Hallowed Bars and Souls of Fright. All three mechs are needed for Plantera',
    name: 'Skeletron Prime',
    stage: 'pre-mech',
    tier: 6,
    summon: 'Craft a Mechanical Skull at a Mythril/Orichalcum Anvil, or wait for a nighttime natural spawn.',
    drops: ['Hallowed Bars', 'Soul of Fright', 'Skeletron Prime Mask'],
    blurb: 'Four arms - Vice, Saw, Cannon and Laser - each with its own attack. Like Skeletron, it kills instantly at dawn.',
    color: '#D8D2BD',
  },

  // ── Pre-Plantera ──────────────────────────────────────────
  {
    id: 'plantera',
    role: 'required',
    unlocks: 'The Jungle Temple, the Hardmode Dungeon and its Ectoplasm',
    name: 'Plantera',
    stage: 'pre-plantera',
    tier: 7,
    summon: 'Break a Plantera\'s Bulb that spawns in the Underground Jungle after all three Mechanical Bosses are defeated.',
    drops: ['Temple Key', 'Grenade Launcher', 'Venus Magnum', 'Flower Pow', 'Pygmy Staff', 'Plantera Mask'],
    blurb: 'Summoned by breaking a Plantera\'s Bulb in the Underground Jungle. It is tethered to hooks in the first phase, then breaks free and pursues directly below half health.',
    color: '#6EC96E',
  },
  {
    id: 'queen-slime',
    role: 'optional',
    name: 'Queen Slime',
    stage: 'pre-plantera',
    tier: 6,
    side: true,
    summon: 'Use a Gelatin Crystal found in the Hallow.',
    drops: ['Crystal Assassin set', 'Volatile Gelatin', 'Blade Staff', 'Hook of Dissonance', 'Queen Slime Mask'],
    blurb: 'Summoned in the Hallow with a Gelatin Crystal. She gains flight in her later phases and spawns crystal slimes throughout.',
    color: '#FF98DF',
  },

  // ── Pre-Golem ─────────────────────────────────────────────
  {
    id: 'golem',
    role: 'required',
    unlocks: 'Cultists appear at the Dungeon, which leads to the Lunatic Cultist',
    name: 'Golem',
    stage: 'pre-golem',
    tier: 8,
    summon: 'Use a Lihzahrd Power Cell on the Lihzahrd Altar inside the Jungle Temple.',
    drops: ['Golem Fist', 'Possessed Hatchet', 'Sun Stone', 'Eye of the Golem', 'Golem Mask'],
    blurb: 'Fought in the Jungle Temple using a Lihzahrd Power Cell. Its fists and head detach, and the head keeps fighting after the body falls.',
    color: '#B87A3A',
  },
  {
    id: 'duke-fishron',
    role: 'optional',
    name: 'Duke Fishron',
    stage: 'pre-golem',
    tier: 7,
    side: true,
    summon: 'Fish in the Ocean with a Truffle Worm as bait.',
    drops: ['Tsunami', 'Razorblade Typhoon', 'Fishron Wings', 'Bubble Gun', 'Duke Fishron Mask'],
    blurb: 'Summoned by fishing in the Ocean with a Truffle Worm. Three phases, each faster than the last, with charges that cross the arena.',
    color: '#4A8FD2',
  },
  {
    id: 'empress-of-light',
    role: 'optional',
    name: 'Empress of Light',
    stage: 'pre-golem',
    tier: 7,
    side: true,
    summon: 'Kill a Prismatic Lacewing in the Hallow at night.',
    drops: ['Terraprisma (daytime kill)', 'Kaleidoscope', 'Empress Wings', 'Stellar Tune', 'Empress of Light Mask'],
    blurb: 'Summoned by killing a Prismatic Lacewing in the Hallow at night. Killing her in daylight makes every one of her attacks an instant kill, which is the only way she drops the Terraprisma.',
    color: '#FFB7E2',
  },

  // ── Pre-Cultist ───────────────────────────────────────────
  {
    id: 'lunatic-cultist',
    role: 'required',
    unlocks: 'The Lunar Events and the four Celestial Pillars',
    name: 'Lunatic Cultist',
    stage: 'pre-cultist',
    tier: 9,
    summon: 'Kill all four Cultists outside the Dungeon after Golem is dead.',
    drops: ['Lunatic Cultist Mask', 'Ancient Manipulator'],
    blurb: 'Appears at the Dungeon once Golem is defeated. It creates clones that must be ignored, and killing it starts the Lunar Events.',
    color: '#9F7AE0',
  },

  // ── Pre-Moon Lord ─────────────────────────────────────────
  {
    id: 'moon-lord',
    role: 'required',
    unlocks: 'Luminite, and with it the Lunar armor sets and endgame tools',
    name: 'Moon Lord',
    stage: 'pre-moonlord',
    tier: 10,
    summon: 'Defeat all four Celestial Pillars, or use a Celestial Sigil.',
    drops: ['Meowmere', 'Star Wrath', 'Terrarian', 'S.D.M.G.', 'Last Prism', 'Rainbow Crystal Staff', 'Lunar Portal Staff', 'Moon Lord Mask'],
    blurb: 'Summoned once all four Celestial Pillars fall, or with a Celestial Sigil. Two eyes and a forehead eye open in turn, and the core is only exposed once all three are destroyed.',
    color: '#6B8FFF',
  },
];
