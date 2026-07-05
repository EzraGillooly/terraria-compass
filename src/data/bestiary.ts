/* ════════════════════════════════════════════════
   BESTIARY — enemy + loot detail, keyed by display name.
   Referenced by biome `mobs` / `items` name strings.
   Stats are Classic (Normal) mode, sourced from
   terraria.wiki.gg. Authored biome-by-biome.
═══════════════════════════════════════════════════ */

export interface EnemyDrop {
  name: string;
  rate: string; // display string, e.g. "100%", "1/3", "0.01%"
}

export interface Enemy {
  kind: 'enemy';
  name: string;
  /** wiki file stem override; defaults to the name with spaces → underscores */
  wiki?: string;
  hp: number;
  damage: number;
  defense: number;
  description: string;
  drops: EnemyDrop[];
  hardmode?: boolean;
}

export interface LootItem {
  kind: 'loot';
  name: string;
  wiki?: string;
  type: string; // e.g. "Material", "Herb", "Weapon"
  description: string;
  source: string;
  usedFor?: string;
}

export type BestiaryEntry = Enemy | LootItem;

/* ── Forest ── */
const FOREST: BestiaryEntry[] = [
  {
    kind: 'enemy',
    name: 'Green Slime',
    hp: 14, damage: 6, defense: 0,
    description: 'The most common early enemy. Harmless in the open, but dangerous when they pile up or drop on you from above.',
    drops: [
      { name: 'Gel', rate: '1–2, 100%' },
      { name: 'Slime Staff', rate: '0.01% (very rare)' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Zombie',
    hp: 45, damage: 14, defense: 6,
    description: 'Spawns on the surface at night. During a Blood Moon it can open doors, so bar your house up.',
    drops: [
      { name: 'Shackle', rate: '2%' },
      { name: 'Zombie Arm', rate: '0.33%' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Demon Eye',
    hp: 60, damage: 18, defense: 0,
    description: 'Floating eyes that drift toward you at night. Their Lenses are the summon material for the Eye of Cthulhu.',
    drops: [
      { name: 'Lens', rate: '1/3 (33%)' },
      { name: 'Black Lens', rate: '0.5%' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Pinky',
    hp: 100, damage: 20, defense: 0,
    description: 'A rare, fast pink slime. Tanky for its size, but it drops Pink Gel and a big pile of coins.',
    drops: [
      { name: 'Pink Gel', rate: '7–17, 100%' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Bunny',
    hp: 5, damage: 0, defense: 0,
    description: 'A harmless critter. Catch it with a Bug Net for a pet or sell it. A Blood Moon turns it into a vicious Corrupt/Crimson Bunny.',
    drops: [],
  },
  {
    kind: 'enemy',
    name: 'Blood Crawler',
    hp: 55, damage: 30, defense: 6,
    description: 'A fast, spider-like enemy from the Crimson caverns that clings to walls. Aggressive in packs.',
    drops: [
      { name: 'Vertebrae', rate: '1/3 (33%)' },
    ],
  },
  {
    kind: 'loot',
    name: 'Wood',
    type: 'Material',
    description: 'The most basic building and crafting material. You will need a lot of it.',
    source: 'Chop down trees with any axe.',
    usedFor: 'Torches, the Work Bench, wooden gear, walls, and countless recipes.',
  },
  {
    kind: 'loot',
    name: 'Acorn',
    type: 'Material (placeable)',
    description: 'A seed that grows into a tree of the biome it is planted in.',
    source: 'Shake trees or chop their tops.',
    usedFor: 'Replanting trees to regrow a renewable Wood supply.',
  },
  {
    kind: 'loot',
    name: 'Gel',
    type: 'Material',
    description: 'A sticky crafting staple dropped by nearly every slime.',
    source: 'Dropped by slimes.',
    usedFor: 'Torches, flasks, the Flamethrower, and Slime Blocks.',
  },
  {
    kind: 'loot',
    name: 'Mushroom',
    type: 'Material (consumable)',
    description: 'The common white mushroom. Restores 15 HP when eaten in a pinch.',
    source: 'Grows on the surface Forest floor.',
    usedFor: 'Lesser Healing Potions and Bowls of Soup.',
  },
  {
    kind: 'loot',
    name: 'Daybloom',
    type: 'Herb',
    description: 'A bright yellow herb that blooms during the day.',
    source: 'Grows on Forest grass; harvest while in bloom for seeds too.',
    usedFor: 'Ironskin, Shine, Regeneration, and many other potions.',
  },
];

/* ── Jungle ── */
const JUNGLE: BestiaryEntry[] = [
  {
    kind: 'enemy',
    name: 'Hornet',
    hp: 48, damage: 26, defense: 12,
    description: 'Flying insects that dart around and fire stingers from a distance. Common and a real nuisance in swarms.',
    drops: [
      { name: 'Stinger', rate: '66%' },
      { name: 'Bezoar', rate: '1%' },
      { name: 'Ancient Cobalt Armor', rate: '0.33% each piece' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Man Eater',
    hp: 110, damage: 34, defense: 10,
    description: 'A rooted jungle plant with a snapping pincher. The stem is safe to walk through; only the head bites.',
    drops: [
      { name: 'Vine', rate: '50%' },
      { name: 'Ancient Cobalt Armor', rate: '0.33% each piece' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Jungle Slime',
    hp: 60, damage: 18, defense: 6,
    description: 'A tougher green slime tinted for the jungle. Behaves like any slime, just with more health.',
    drops: [
      { name: 'Gel', rate: '1–2, 100%' },
      { name: 'Slime Staff', rate: '0.01% (very rare)' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Piranha',
    hp: 30, damage: 25, defense: 2,
    description: 'Swims in straight lines through jungle water. Dangerous out of water, where it flops around wildly.',
    drops: [
      { name: 'Hook', rate: '3.3%' },
      { name: 'Compass', rate: '1.33%' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Angry Trapper',
    hp: 300, damage: 100, defense: 30, hardmode: true,
    description: 'A Hardmode jungle vine-plant that lashes out at range. Hits hard, so clear it before it stacks up.',
    drops: [
      { name: 'Uzi', rate: '1%' },
      { name: 'Coffee', rate: '3.33%' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Derpling',
    hp: 300, damage: 80, defense: 26, hardmode: true,
    description: 'A Hardmode jungle beetle that spawns fast during the day and can quickly overwhelm you.',
    drops: [
      { name: 'Grapes', rate: '2.5%' },
      { name: "Glommer's Flower", rate: '1%' },
    ],
  },
  {
    kind: 'loot',
    name: 'Jungle Spores',
    type: 'Material',
    description: 'Glowing spores that grow on jungle background walls.',
    source: 'Break the glowing spore clusters on Jungle walls with any tool.',
    usedFor: 'Jungle armor and the Blade of Grass.',
  },
  {
    kind: 'loot',
    name: 'Stinger',
    type: 'Material',
    description: 'A sharp barb dropped by jungle creatures.',
    source: 'Dropped by Hornets, Man Eaters, and Spiked Jungle Slimes.',
    usedFor: 'Blade of Grass, Snapthorn, Thorn Chakram, and Stinger gear.',
  },
  {
    kind: 'loot',
    name: 'Vine',
    type: 'Material',
    description: 'A length of living jungle vine.',
    source: 'Dropped by Man Eaters and Snatchers.',
    usedFor: 'The Ivy Whip grappling hook.',
  },
  {
    kind: 'loot',
    name: 'Rich Mahogany',
    type: 'Material (Wood)',
    description: 'The reddish wood of jungle trees.',
    source: 'Chop down Jungle trees.',
    usedFor: 'Rich Mahogany furniture and early jungle-themed builds.',
  },
  {
    kind: 'loot',
    name: 'Moonglow',
    type: 'Herb',
    description: 'A glowing blue herb that blooms at night.',
    source: 'Grows in the Jungle; harvest while it glows for seeds too.',
    usedFor: 'Many potions, including summoning and utility brews.',
  },
];

/* ── Sky Islands ── */
const SKY: BestiaryEntry[] = [
  {
    kind: 'enemy',
    name: 'Harpy',
    hp: 100, damage: 25, defense: 8,
    description: 'Winged humanoids that circle at high altitude and fling feathers. Common around Floating Islands and Space.',
    drops: [
      { name: 'Feather', rate: '50%' },
      { name: 'Giant Harpy Feather', rate: '0.67%' },
    ],
  },
  {
    kind: 'enemy',
    name: 'Wyvern',
    hp: 4000, damage: 80, defense: 20, hardmode: true,
    description: 'A Hardmode sky serpent that flies through blocks with worm-type AI. Head hits hardest; its Souls of Flight craft wings.',
    drops: [
      { name: 'Soul of Flight', rate: '5, 100%' },
      { name: 'Wyvern Kite', rate: '4% (Windy Days)' },
    ],
  },
  {
    kind: 'loot',
    name: 'Sky Crate',
    type: 'Crate',
    description: 'A crate that yields floating-island loot when opened.',
    source: 'Fished up from water in the Sky and Space layers.',
    usedFor: 'Open for sky treasures: Starfury, Shiny Red Balloon, Lucky Horseshoe, and sky furniture.',
  },
  {
    kind: 'loot',
    name: 'Skyware Chest',
    type: 'Chest',
    description: 'The treasure chest found on Floating Islands and in Sky Lakes.',
    source: 'Found on Floating Islands and in Sky Lakes.',
    usedFor: 'Holds one island treasure (Starfury, Shiny Red Balloon, Lucky Horseshoe, or Fledgling Wings) plus Skyware furniture.',
  },
  {
    kind: 'loot',
    name: 'Shiny Red Balloon',
    type: 'Accessory',
    description: 'A festive balloon that increases jump height.',
    source: 'Found in Skyware Chests and Sky Crates.',
    usedFor: 'Crafts Cloud in a Balloon and later balloon mobility accessories.',
  },
  {
    kind: 'loot',
    name: 'Lucky Horseshoe',
    type: 'Accessory',
    description: 'A charm that negates all fall damage.',
    source: 'Found on Floating Islands, in Skyware Chests and Sky Crates.',
    usedFor: 'Combines into Obsidian Horseshoe, wings, and other mobility accessories.',
  },
];

export const bestiary: Record<string, BestiaryEntry> = Object.fromEntries(
  [...FOREST, ...JUNGLE, ...SKY].map((e) => [e.name, e]),
);
