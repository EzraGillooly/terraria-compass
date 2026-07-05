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

export const bestiary: Record<string, BestiaryEntry> = Object.fromEntries(
  [...FOREST].map((e) => [e.name, e]),
);
