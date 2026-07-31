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
    summon: 'Craft a Slime Crown at a Demon Altar, or wait for a rare natural spawn.',
    drops: ['Slimy Saddle', 'Royal Gel', 'Ninja Hood / Shirt / Pants', 'Slime Hook'],
    blurb: 'A giant slime with a ninja trapped inside. It teleports, spawns smaller slimes, and shrinks as it loses health.',
    color: '#5BB3FF',
  },
  {
    id: 'eye-of-cthulhu',
    role: 'recommended',
    unlocks: 'Demonite / Crimtane Ore, and the Corruption or Crimson spreads faster afterwards',
    name: 'Eye of Cthulhu',
    stage: 'pre-bosses',
    tier: 1,
    summon: 'Craft a Suspicious Looking Eye at a Demon Altar, or wait for a natural spawn once you have 200 HP and 3 Demonite Ore.',
    drops: ['Demonite Ore', 'Corrupt Seeds', 'Binoculars', 'Eye of Cthulhu Mask', 'Shield of Cthulhu (Expert)'],
    blurb: 'Summoned at night with a Suspicious Looking Eye. It circles and spawns Servants until half health, then stops summoning and charges instead.',
    color: '#E84A4A',
  },
  {
    id: 'eater-of-worlds',
    role: 'recommended',
    unlocks: 'Shadow Scales for Shadow armor, and the Nightmare Pickaxe, which is the first that can mine Hellstone',
    name: 'Eater of Worlds',
    stage: 'pre-bosses',
    tier: 2,
    world: 'corruption',
    summon: 'Craft Worm Food at a Demon Altar, or smash 3 Shadow Orbs in the Corruption.',
    drops: ['Demonite Ore', 'Shadow Scale', 'Eater of Worlds Mask'],
    blurb: 'A segmented worm, Corruption worlds only. Destroying a middle segment splits it into two shorter worms, so piercing weapons hit many segments at once.',
    color: '#8B5BC9',
  },
  {
    id: 'brain-of-cthulhu',
    role: 'recommended',
    unlocks: 'Tissue Samples for Crimson armor, and the Deathbringer Pickaxe, which is the first that can mine Hellstone',
    name: 'Brain of Cthulhu',
    stage: 'pre-bosses',
    tier: 2,
    world: 'crimson',
    summon: 'Craft a Bloody Spine at a Demon Altar, or smash 3 Crimson Hearts in the Crimson.',
    drops: ['Crimtane Ore', 'Tissue Sample', 'Brain of Cthulhu Mask', 'Brain of Confusion (Expert)'],
    blurb: 'Crimson worlds only. It is invulnerable until its ring of Creepers is killed, then teleports and spawns illusions of itself.',
    color: '#D24A6A',
  },

  // ── Pre-Skeletron ─────────────────────────────────────────
  {
    id: 'queen-bee',
    role: 'optional',
    unlocks: 'The Witch Doctor moves in',
    name: 'Queen Bee',
    stage: 'pre-skeletron',
    tier: 3,
    side: true,
    summon: 'Craft an Abeemination in the Jungle, or break a Larva inside a Bee Hive.',
    drops: ['Bee Gun', 'Bee Keeper', 'Honeyed Goggles', 'Bee Wax', 'Honey Comb (Expert)'],
    blurb: 'Fought in the Jungle. She alternates between charging horizontally, firing stingers, and spawning bees, so a long flat arena suits her.',
    color: '#F2C24A',
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
