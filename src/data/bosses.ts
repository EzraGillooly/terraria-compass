export interface BossDef {
  id: string;
  name: string;
  /** phase gate this boss belongs to */
  stage: 'pre-bosses' | 'pre-skeletron' | 'pre-wof' | 'pre-mech' | 'pre-plantera' | 'pre-golem' | 'pre-cultist' | 'pre-moonlord' | 'endgame';
  tier: number;
  /** optional side boss — not required for progression */
  side?: boolean;
  /** world-variant boss (corruption | crimson) */
  world?: string;
  summon: string;
  drops: string[];
  blurb: string;
  color: string;
}

export const bosses: BossDef[] = [
  // ── Pre-Bosses ────────────────────────────────────────────
  {
    id: 'king-slime',
    name: 'King Slime',
    stage: 'pre-bosses',
    tier: 0,
    side: true,
    summon: 'Craft a Slime Crown at a Demon Altar, or wait for a rare natural spawn.',
    drops: ['Slimy Saddle', 'Royal Gel', 'Ninja Hood / Shirt / Pants', 'Slime Hook'],
    blurb: 'A giant blue slime with a ninja trapped inside. A friendly first scrap — nothing to fear.',
    color: '#5BB3FF',
  },
  {
    id: 'eye-of-cthulhu',
    name: 'Eye of Cthulhu',
    stage: 'pre-bosses',
    tier: 1,
    summon: 'Craft a Suspicious Looking Eye at a Demon Altar, or wait for a natural spawn once you have 200 HP and 3 Demonite Ore.',
    drops: ['Demonite Ore', 'Corrupt Seeds', 'Binoculars', 'Eye of Cthulhu Mask', 'Shield of Cthulhu (Expert)'],
    blurb: 'The classic first boss. Fast in its second phase, but predictable. Expect the Suspicious Looking Eye challenge early.',
    color: '#E84A4A',
  },
  {
    id: 'eater-of-worlds',
    name: 'Eater of Worlds',
    stage: 'pre-bosses',
    tier: 2,
    world: 'corruption',
    summon: 'Craft Worm Food at a Demon Altar, or smash 3 Shadow Orbs in the Corruption.',
    drops: ['Demonite Ore', 'Shadow Scale', 'Eater of Worlds Mask'],
    blurb: 'A colossal segmented worm. Corruption worlds only — bring piercing weapons and attack each segment.',
    color: '#8B5BC9',
  },
  {
    id: 'brain-of-cthulhu',
    name: 'Brain of Cthulhu',
    stage: 'pre-bosses',
    tier: 2,
    world: 'crimson',
    summon: 'Craft a Bloody Spine at a Demon Altar, or smash 3 Crimson Hearts in the Crimson.',
    drops: ['Crimtane Ore', 'Tissue Sample', 'Brain of Cthulhu Mask', 'Brain of Confusion (Expert)'],
    blurb: 'A floating brain surrounded by Creepers. Crimson worlds only — kill the Creepers first to expose the brain.',
    color: '#D24A6A',
  },

  // ── Pre-Skeletron ─────────────────────────────────────────
  {
    id: 'queen-bee',
    name: 'Queen Bee',
    stage: 'pre-skeletron',
    tier: 3,
    side: true,
    summon: 'Craft an Abeemination in the Jungle, or break a Larva inside a Bee Hive.',
    drops: ['Bee Gun', 'Bee Keeper', 'Honeyed Goggles', 'Bee Wax', 'Honey Comb (Expert)'],
    blurb: 'The hive boss. Fast, stingy, and worth every drop. Build a long arena in the Jungle — she charges hard.',
    color: '#F2C24A',
  },
  {
    id: 'skeletron',
    name: 'Skeletron',
    stage: 'pre-skeletron',
    tier: 4,
    summon: 'Speak to the Old Man at the Dungeon entrance at night. Kill both hands before the head.',
    drops: ['Skeletron Hand', 'Book of Skulls', 'Bone Glove', 'Skeletron Mask'],
    blurb: 'Guardian of the Dungeon. Kill him before sunrise or his spinning head deals instant death.',
    color: '#D8D2BD',
  },
  {
    id: 'deerclops',
    name: 'Deerclops',
    stage: 'pre-skeletron',
    tier: 3,
    side: true,
    summon: 'Use a Deer Thing in a Snow biome at midnight, or wait for a natural spawn during a Blizzard.',
    drops: ['Eye Bone', 'Lucy the Axe', 'Houndius Shootius', 'Deerclops Mask'],
    blurb: 'A Don\'t Starve crossover. Hulking, vertical, punishing. The Snow biome is your arena.',
    color: '#A8C8E0',
  },

  // ── Pre-WoF ───────────────────────────────────────────────
  {
    id: 'wall-of-flesh',
    name: 'Wall of Flesh',
    stage: 'pre-wof',
    tier: 5,
    summon: 'Throw a Guide Voodoo Doll into lava in the Underworld.',
    drops: ['Pwnhammer', 'Emblem (class-specific)', 'Breaker Blade', 'Clockwork Assault Rifle', 'Demon Heart (Expert)'],
    blurb: 'The wall ends Pre-Hardmode. Defeat it to unlock Hardmode. Build a long bridge — survival is everything.',
    color: '#E07A4A',
  },

  // ── Pre-Mech (Hardmode) ───────────────────────────────────
  {
    id: 'the-twins',
    name: 'The Twins',
    stage: 'pre-mech',
    tier: 6,
    summon: 'Craft a Mechanical Eye at a Mythril/Orichalcum Anvil, or wait for a nighttime natural spawn.',
    drops: ['Hallowed Bars', 'Soul of Sight', 'Twins Mask', 'Spaz\'s Eye (Expert)'],
    blurb: 'Two mechanical eyes — Spazmatism spews fire, Retinazer fires lasers. Kill one completely before the other enrages.',
    color: '#E84A4A',
  },
  {
    id: 'the-destroyer',
    name: 'The Destroyer',
    stage: 'pre-mech',
    tier: 6,
    summon: 'Craft a Mechanical Worm at a Mythril/Orichalcum Anvil, or wait for a nighttime natural spawn.',
    drops: ['Hallowed Bars', 'Soul of Might', 'Destroyer Mask', 'Greater Healing Potions'],
    blurb: 'The mechanical Eater of Worlds. Probe waves are the real threat — pierce weapons shred it.',
    color: '#5BB3FF',
  },
  {
    id: 'skeletron-prime',
    name: 'Skeletron Prime',
    stage: 'pre-mech',
    tier: 6,
    summon: 'Craft a Mechanical Skull at a Mythril/Orichalcum Anvil, or wait for a nighttime natural spawn.',
    drops: ['Hallowed Bars', 'Soul of Fright', 'Skeletron Prime Mask'],
    blurb: 'Four limbs — Vice, Saw, Cannon, Laser — each with their own attack pattern. Destroy the arms first.',
    color: '#D8D2BD',
  },

  // ── Pre-Plantera ──────────────────────────────────────────
  {
    id: 'plantera',
    name: 'Plantera',
    stage: 'pre-plantera',
    tier: 7,
    summon: 'Break a Plantera\'s Bulb that spawns in the Underground Jungle after all three Mechanical Bosses are defeated.',
    drops: ['Temple Key', 'Grenade Launcher', 'Venus Magnum', 'Flower Pow', 'Pygmy Staff', 'Plantera Mask'],
    blurb: 'The Jungle\'s gatekeeper. Stage two Plantera is fast and chases relentlessly — you want a huge circular arena.',
    color: '#6EC96E',
  },
  {
    id: 'queen-slime',
    name: 'Queen Slime',
    stage: 'pre-plantera',
    tier: 6,
    side: true,
    summon: 'Use a Gelatin Crystal found in the Hallow.',
    drops: ['Crystal Assassin set', 'Volatile Gelatin', 'Blade Staff', 'Hook of Dissonance', 'Queen Slime Mask'],
    blurb: 'Hardmode counterpart to King Slime. Aerial phase two makes her trickier. Worth the Blade Staff alone.',
    color: '#FF98DF',
  },

  // ── Pre-Golem ─────────────────────────────────────────────
  {
    id: 'golem',
    name: 'Golem',
    stage: 'pre-golem',
    tier: 8,
    summon: 'Use a Lihzahrd Power Cell on the Lihzahrd Altar inside the Jungle Temple.',
    drops: ['Golem Fist', 'Possessed Hatchet', 'Sun Stone', 'Eye of the Golem', 'Golem Mask'],
    blurb: 'Temple boss. Dense, methodical, and an easier fight than Plantera — just don\'t fall below the fist range.',
    color: '#B87A3A',
  },
  {
    id: 'duke-fishron',
    name: 'Duke Fishron',
    stage: 'pre-golem',
    tier: 7,
    side: true,
    summon: 'Fish in the Ocean with a Truffle Worm as bait.',
    drops: ['Tsunami', 'Razorblade Typhoon', 'Fishron Wings', 'Bubble Gun', 'Duke Fishron Mask'],
    blurb: 'Optional but brutally rewarding. Three phases of increasing speed. Great wings are the payoff.',
    color: '#4A8FD2',
  },
  {
    id: 'empress-of-light',
    name: 'Empress of Light',
    stage: 'pre-golem',
    tier: 7,
    side: true,
    summon: 'Kill a Prismatic Lacewing in the Hallow at night.',
    drops: ['Terraprisma (daytime kill)', 'Kaleidoscope', 'Empress Wings', 'Stellar Tune', 'Empress of Light Mask'],
    blurb: 'One of the hardest optional bosses. Daytime kill rewards the Terraprisma — a summoner\'s best weapon.',
    color: '#FFB7E2',
  },

  // ── Pre-Cultist ───────────────────────────────────────────
  {
    id: 'lunatic-cultist',
    name: 'Lunatic Cultist',
    stage: 'pre-cultist',
    tier: 9,
    summon: 'Kill all four Cultists outside the Dungeon after Golem is dead.',
    drops: ['Lunatic Cultist Mask', 'Ancient Manipulator'],
    blurb: 'Triggers the Lunar Events. Clones, ancient doom projectiles, and a strict interrupt cycle define this fight.',
    color: '#9F7AE0',
  },

  // ── Pre-Moon Lord ─────────────────────────────────────────
  {
    id: 'moon-lord',
    name: 'Moon Lord',
    stage: 'pre-moonlord',
    tier: 10,
    summon: 'Defeat all four Celestial Pillars, or use a Celestial Sigil.',
    drops: ['Meowmere', 'Star Wrath', 'Terrarian', 'S.D.M.G.', 'Last Prism', 'Stardust Dragon Staff', 'Lunar Portal Staff', 'Moon Lord Mask'],
    blurb: 'The final boss of vanilla Terraria. Three eye targets, then the core. One of the most punishing DPS checks in the game.',
    color: '#6B8FFF',
  },
];
