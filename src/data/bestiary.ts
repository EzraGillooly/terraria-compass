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

/* ── Desert ── */
const DESERT: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Antlion Charger', hp: 80, damage: 25, defense: 10,
    description: 'An aggressive antlion that charges across the sand. Tougher and faster than the stationary kind.',
    drops: [{ name: 'Antlion Mandible', rate: '33.3%' }, { name: 'Mandible Blade', rate: '2%' }] },
  { kind: 'enemy', name: 'Antlion Swarmer', hp: 60, damage: 29, defense: 8,
    description: 'A dragonfly-like flying antlion that dives at you from above.',
    drops: [{ name: 'Antlion Mandible', rate: '33.3%' }, { name: 'Mandible Blade', rate: '2%' }] },
  { kind: 'enemy', name: 'Vulture', hp: 40, damage: 15, defense: 4,
    description: 'A desert bird that hovers, then swoops. Mostly a nuisance while you dig.',
    drops: [] },
  { kind: 'enemy', name: 'Tomb Crawler', hp: 60, damage: 18, defense: 12,
    description: 'A burrowing worm of the Underground Desert. Only the head deals heavy damage.',
    drops: [{ name: 'Sturdy Fossil', rate: '1–2, 50%' }] },
  { kind: 'enemy', name: 'Desert Djinn', wiki: 'Desert_Spirit', hp: 220, damage: 40, defense: 20, hardmode: true,
    description: 'A Hardmode caster of the corrupted Underground Desert that fires homing, exploding curses.',
    drops: [{ name: 'Desert Spirit Lamp', rate: '2.5%' }, { name: "Djinn's Curse", rate: '3.25%' }] },
  { kind: 'loot', name: 'Antlion Mandible', type: 'Material',
    description: 'A sharp jaw dropped by antlions.', source: 'Dropped by Antlions.', usedFor: 'The Mandible Blade and early desert gear.' },
  { kind: 'loot', name: 'Cactus', type: 'Material',
    description: 'Prickly desert plant matter.', source: 'Harvest cactus growing on desert sand.', usedFor: 'A full free early tool/armor set and cactus furniture.' },
  { kind: 'loot', name: 'Forbidden Fragment', type: 'Material',
    description: 'A shard of sandstorm energy.', source: 'Dropped by Sand Elementals during Hardmode Sandstorms.', usedFor: 'Forbidden (Djinn) armor for summoners and mages.' },
  { kind: 'loot', name: 'Desert Spirit Lamp', type: 'Furniture (Light)',
    description: 'A glowing lamp holding a desert spirit.', source: 'Rare drop from Desert Spirits (Hardmode).', usedFor: 'A decorative light source for builds.' },
];

/* ── Snow & Tundra ── */
const SNOW: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Ice Slime', hp: 30, damage: 8, defense: 4,
    description: 'A frosty slime that inflicts Chilled, slowing you down. Otherwise a normal slime.',
    drops: [{ name: 'Gel', rate: '1–2, 100%' }, { name: 'Ice Cream', rate: '0.67%' }] },
  { kind: 'enemy', name: 'Zombie Eskimo', wiki: 'Eskimo_Zombie', hp: 45, damage: 14, defense: 6,
    description: 'The Snow biome zombie, bundled up against the cold. Same threat as a normal Zombie.',
    drops: [{ name: 'Shackle', rate: '2%' }] },
  { kind: 'enemy', name: 'Wolf', hp: 300, damage: 65, defense: 30, hardmode: true,
    description: 'A fast Hardmode predator that leaps and charges at night. One of the trickiest early-Hardmode enemies to dodge.',
    drops: [] },
  { kind: 'enemy', name: 'Ice Bat', hp: 30, damage: 18, defense: 6,
    description: 'A cave bat of the Ice biome that inflicts Frostburn on contact.',
    drops: [{ name: 'Depth Meter', rate: '0.5%' }, { name: 'Bat Bat', rate: '0.33%' }] },
  { kind: 'enemy', name: 'Spiked Ice Slime', hp: 60, damage: 12, defense: 8,
    description: 'An ice slime that fires ice spikes and always chills you on contact.',
    drops: [{ name: 'Gel', rate: '1–2, 100%' }] },
  { kind: 'loot', name: 'Ice Block', type: 'Material (Block)',
    description: 'Frozen water block. Slippery to walk across.', source: 'Mine ice in the Snow biome.', usedFor: 'Ice furniture and frozen builds.' },
  { kind: 'loot', name: 'Frost Core', type: 'Material',
    description: 'A core of pure cold.', source: 'Rare drop from Ice Golems during Hardmode Blizzards.', usedFor: 'Frost armor and the Frostbrand.' },
  { kind: 'loot', name: 'Amarok', type: 'Weapon (Yoyo)',
    description: 'A strong early-Hardmode yoyo that inflicts Frostburn.', source: 'Rare drop from any enemy while in the Snow biome (Hardmode).', usedFor: 'A go-to yoyo until Hardmode ore weapons.' },
  { kind: 'loot', name: 'Ice Skates', type: 'Accessory',
    description: 'Lets you move quickly and safely over ice.', source: 'Found in Frozen Chests in the Ice biome.', usedFor: 'Combines into the Frostspark Boots.' },
  { kind: 'loot', name: 'Blizzard in a Bottle', type: 'Accessory',
    description: 'Grants a double jump on a gust of snow.', source: 'Found in Frozen Chests.', usedFor: 'The Bundle of Balloons and cloud/boot accessories.' },
];

/* ── Dungeon ── */
const DUNGEON: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Skeleton', hp: 60, damage: 20, defense: 8,
    description: 'The basic Dungeon and Cavern skeleton. Common, but hits harder than surface enemies.',
    drops: [{ name: 'Hook', rate: '4%' }, { name: 'Ancient Gold Helmet', rate: '0.5%' }] },
  { kind: 'enemy', name: 'Cursed Skull', hp: 40, damage: 35, defense: 6,
    description: 'A floating skull that phases through Dungeon walls. Fast and surprisingly punchy.',
    drops: [{ name: 'Nazar', rate: '1%' }] },
  { kind: 'enemy', name: 'Dark Caster', hp: 50, damage: 20, defense: 2,
    description: 'A robed Dungeon caster that fires Water Bolt-style projectiles from a distance.',
    drops: [{ name: 'Clothier Voodoo Doll', rate: '0.33%' }] },
  { kind: 'enemy', name: 'Spike Ball', hp: 100, damage: 32, defense: 100,
    description: 'An invincible spiked mace that swings on a chain. You cannot kill it; just avoid it.',
    drops: [] },
  { kind: 'enemy', name: 'Dungeon Slime', hp: 150, damage: 30, defense: 7,
    description: 'A blue Dungeon slime that always carries a Golden Key.',
    drops: [{ name: 'Golden Key', rate: '100%' }] },
  { kind: 'loot', name: 'Water Bolt', type: 'Weapon (Magic)',
    description: 'A bouncing blue bolt that pierces enemies. A standout early mage weapon.', source: 'Found on bookshelves in the Dungeon.', usedFor: 'A strong pre-Hardmode magic weapon.' },
  { kind: 'loot', name: 'Handgun', type: 'Weapon (Gun)',
    description: 'A compact ranged sidearm.', source: 'Found in a Gold Chest in the Dungeon.', usedFor: 'Crafts the Phoenix Blaster with Hellstone Bars.' },
  { kind: 'loot', name: 'Muramasa', type: 'Weapon (Sword)',
    description: 'A fast-swinging broadsword.', source: 'Found in Gold and Locked Chests in the Dungeon.', usedFor: 'Part of the Night’s Edge recipe.' },
  { kind: 'loot', name: 'Shadow Key', type: 'Tool (Key)',
    description: 'A reusable key that never breaks.', source: 'Found in Dungeon chests.', usedFor: 'Opens Shadow Chests in the Underworld.' },
  { kind: 'loot', name: 'Cobalt Shield', type: 'Accessory',
    description: 'Grants immunity to knockback.', source: 'Found in Gold and Locked Chests in the Dungeon.', usedFor: 'Combines into the Obsidian Shield and eventually the Ankh Shield.' },
];

/* ── Underworld ── */
const UNDERWORLD: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Fire Imp', hp: 70, damage: 30, defense: 16,
    description: 'A demon that phases through walls and lobs fireballs at range.',
    drops: [{ name: 'Obsidian Rose', rate: '5%' }] },
  { kind: 'enemy', name: 'Bone Serpent', hp: 300, damage: 36, defense: 12,
    description: 'A large flying skeletal worm that dives through the Underworld. The head hits hardest.',
    drops: [{ name: 'Hotdog', rate: '3.33%' }] },
  { kind: 'enemy', name: 'Lava Bat', hp: 160, damage: 50, defense: 16, hardmode: true,
    description: 'A fiery Hardmode bat that appears after a mechanical boss. Inflicts On Fire.',
    drops: [{ name: 'Magma Stone', rate: '2%' }] },
  { kind: 'enemy', name: 'Demon', hp: 120, damage: 32, defense: 8,
    description: 'A winged demon that summons volleys of spinning Demon Scythe blades.',
    drops: [{ name: 'Demon Scythe', rate: '2.86%' }] },
  { kind: 'enemy', name: 'Voodoo Demon', hp: 140, damage: 32, defense: 8,
    description: 'Carries the Guide Voodoo Doll. Kill it away from lava, or you may summon the Wall of Flesh.',
    drops: [{ name: 'Guide Voodoo Doll', rate: '100%' }, { name: 'Demon Scythe', rate: '2.86%' }] },
  { kind: 'loot', name: 'Hellstone', type: 'Material (Ore)',
    description: 'Molten red ore. Mining it releases lava, so bring Obsidian Skin Potions.', source: 'Mine with a Nightmare/Deathbringer Pickaxe in the Underworld.', usedFor: 'Hellstone Bars for Molten armor and the Fiery Greatsword tier.' },
  { kind: 'loot', name: 'Obsidian', type: 'Material (Block)',
    description: 'Hardened black rock formed where water meets lava.', source: 'Pour water onto lava (or vice versa).', usedFor: 'Obsidian gear, potions, and smelting Hellstone safely.' },
  { kind: 'loot', name: 'Guide Voodoo Doll', type: 'Material',
    description: 'A doll linked to the Guide NPC.', source: 'Dropped by Voodoo Demons.', usedFor: 'Drop it into Underworld lava to summon the Wall of Flesh.' },
  { kind: 'loot', name: 'Hellforge', type: 'Crafting Station',
    description: 'A lava-fed forge hot enough to smelt Hellstone.', source: 'Found in Ruined Houses in the Underworld (mine it to take it home).', usedFor: 'Smelting Hellstone into Hellstone Bars.' },
  { kind: 'loot', name: 'Flare Gun', type: 'Weapon (Utility)',
    description: 'Fires flares that stick and light up dark caves.', source: 'Found in Ruined Houses in the Underworld.', usedFor: 'Free, renewable cave lighting.' },
];

/* ── Corruption ── */
const CORRUPTION: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Eater of Souls', hp: 40, damage: 22, defense: 8,
    description: 'A flying maw that swarms in the Corruption. High defense and knockback resistance make packs dangerous early.',
    drops: [{ name: 'Rotten Chunk', rate: '33.3%' }, { name: 'Ancient Shadow Armor', rate: '0.19% each piece' }] },
  { kind: 'enemy', name: 'Devourer', hp: 100, damage: 31, defense: 6,
    description: 'A pre-Hardmode Corruption worm of 10–14 segments that burrows through blocks.',
    drops: [{ name: 'Worm Tooth', rate: '3–8, 100%' }, { name: 'Rotten Chunk', rate: '33.3%' }] },
  { kind: 'enemy', name: 'Corruptor', hp: 230, damage: 60, defense: 32, hardmode: true,
    description: 'A giant Hardmode Eater of Souls that spits Vile projectiles inflicting Weak.',
    drops: [{ name: 'Rotten Chunk', rate: '33.3%' }, { name: 'Vitamins', rate: '1%' }] },
  { kind: 'enemy', name: 'World Feeder', hp: 500, damage: 70, defense: 36, hardmode: true,
    description: 'A large Hardmode Corruption worm. Loot drops from the head, so kill it head-first.',
    drops: [{ name: 'Cursed Flame', rate: '2–5, 100%' }] },
  { kind: 'enemy', name: 'Slimeling', hp: 90, damage: 45, defense: 10, hardmode: true,
    description: 'Small slimes that split off from a defeated Corrupt Slime. Can inflict Darkness.',
    drops: [{ name: 'Gel', rate: '2–4, 100%' }, { name: 'Blindfold', rate: '1%' }] },
  { kind: 'loot', name: 'Shadow Orb', type: 'Trigger / Reward',
    description: 'A glowing orb hidden in Corruption chasms.', source: 'Smash with a hammer or explosives.', usedFor: 'Gives a random reward; every third orb summons the Eater of Worlds.' },
  { kind: 'loot', name: 'Demonite Ore', type: 'Material (Ore)',
    description: 'The Corruption’s signature dark ore.', source: 'Dropped by the Eater of Worlds; also mined underground in Corruption.', usedFor: 'Demonite Bars for the Corruption weapon and armor tier.' },
  { kind: 'loot', name: 'Rotten Chunk', type: 'Material',
    description: 'A hunk of Corruption flesh.', source: 'Dropped by Corruption enemies.', usedFor: 'Worm Food, the Rotted Fork, and fishing bait.' },
  { kind: 'loot', name: 'Vile Mushroom', type: 'Material',
    description: 'A poisonous purple mushroom.', source: 'Grows on Corruption grass.', usedFor: 'Worm Food and Vile Powder.' },
];

/* ── Crimson ── */
const CRIMSON: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Face Monster', hp: 70, damage: 25, defense: 10,
    description: 'A tough Crimson walker with heavy knockback resistance. Active even during the day.',
    drops: [{ name: 'Vertebra', rate: '33.3%' }] },
  { kind: 'enemy', name: 'Crimera', hp: 40, damage: 22, defense: 8,
    description: 'The Crimson’s flying maw, mirror of the Corruption’s Eater of Souls. Swarms in packs.',
    drops: [{ name: 'Vertebra', rate: '33.3%' }] },
  { kind: 'enemy', name: 'Floaty Gross', hp: 240, damage: 65, defense: 18, hardmode: true,
    description: 'A Hardmode Underground Crimson enemy that floats through blocks like a wraith.',
    drops: [{ name: 'Vertebra', rate: '33.3%' }, { name: 'Vitamins', rate: '1%' }] },
  { kind: 'enemy', name: 'Crimslime', hp: 200, damage: 60, defense: 26, hardmode: true,
    description: 'A Hardmode Crimson slime of congealed flesh. Can inflict Darkness on contact.',
    drops: [{ name: 'Gel', rate: '2–4, 100%' }, { name: 'Blindfold', rate: '1%' }] },
  { kind: 'loot', name: 'Crimtane Ore', type: 'Material (Ore)',
    description: 'The Crimson’s signature red ore.', source: 'Dropped by the Brain of Cthulhu; also mined underground in Crimson.', usedFor: 'Crimtane Bars for the Crimson weapon and armor tier.' },
  { kind: 'loot', name: 'Vertebra', type: 'Material',
    description: 'A bone shard from Crimson creatures.', source: 'Dropped by Crimson enemies.', usedFor: 'The Bloody Spine (summons the Brain of Cthulhu) and Vertebra gear.' },
  { kind: 'loot', name: 'Deathweed', type: 'Herb',
    description: 'A sinister herb that blooms under a Blood or Full Moon.', source: 'Grows on Corruption and Crimson grass.', usedFor: 'Summoning items and debuff potions.' },
  { kind: 'loot', name: 'Crimson Heart', type: 'Trigger / Reward',
    description: 'A pulsing heart hidden in Crimson chasms.', source: 'Smash with a hammer or explosives.', usedFor: 'Gives a random reward; every third heart summons the Brain of Cthulhu.' },
];

/* ── Hallow (Hardmode) ── */
const HALLOW: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Pixie', hp: 150, damage: 55, defense: 20, hardmode: true,
    description: 'A glowing fairy that bounces toward you. Common and a reliable Pixie Dust source.',
    drops: [{ name: 'Pixie Dust', rate: '1–3, 100%' }] },
  { kind: 'enemy', name: 'Unicorn', hp: 400, damage: 65, defense: 30, hardmode: true,
    description: 'A very fast charging enemy of the Hallow. Tanky, but always drops a Unicorn Horn.',
    drops: [{ name: 'Unicorn Horn', rate: '100%' }, { name: 'Blessed Apple', rate: '2.5%' }] },
  { kind: 'enemy', name: 'Gastropod', hp: 220, damage: 60, defense: 22, hardmode: true,
    description: 'A floating Hallow snail that fires pink lasers. Drops a lot of Gel.',
    drops: [{ name: 'Gel', rate: '5–10, 100%' }] },
  { kind: 'enemy', name: 'Chaos Elemental', hp: 370, damage: 40, defense: 30, hardmode: true,
    description: 'A teleporting Underground Hallow enemy. Its ultra-rare drop is the coveted Rod of Discord.',
    drops: [{ name: 'Rod of Discord', rate: '0.2%' }] },
  { kind: 'enemy', name: 'Enchanted Sword', hp: 130, damage: 40, defense: 20, hardmode: true,
    description: 'A floating animated blade of the Hallow that lunges at you. Not to be confused with the shrine sword.',
    drops: [] },
  { kind: 'loot', name: 'Crystal Shard', type: 'Material',
    description: 'A glowing pink-purple crystal.', source: 'Grows on Pearlstone/Pearlsand in the Underground Hallow.', usedFor: 'Crystal gear, the Crystal Storm, and Greater Healing Potions.' },
  { kind: 'loot', name: 'Pixie Dust', type: 'Material',
    description: 'Sparkling fairy dust.', source: 'Dropped by Pixies.', usedFor: 'Holy Water, Hallowed gear, and light-themed items.' },
  { kind: 'loot', name: 'Unicorn Horn', type: 'Material',
    description: 'The magical horn of a Hallow unicorn.', source: 'Dropped by Unicorns (100%).', usedFor: 'The Rainbow Rod, Cutlass, and Holy Arrows.' },
  { kind: 'loot', name: 'Holy Water', type: 'Consumable (Thrown)',
    description: 'A flask that spreads the Hallow where it lands.', source: 'Crafted from Pixie Dust, Purification Powder, and Bottled Water.', usedFor: 'Converting Corruption/Crimson blocks to Hallow.' },
  { kind: 'loot', name: 'Rainbow Rod', type: 'Weapon (Magic)',
    description: 'Fires a rainbow bolt you steer with the cursor.', source: 'Found in Hallowed Chests or crafted with a Unicorn Horn.', usedFor: 'A strong controllable early-Hardmode magic weapon.' },
];

/* ── Glowing Mushroom ── */
const MUSHROOM: BestiaryEntry[] = [
  { kind: 'enemy', name: 'Mushi Ladybug', hp: 220, damage: 60, defense: 16,
    description: 'A fast, flying ladybug of the Glowing Mushroom biome. Dangerous for a pre-Hardmode enemy.',
    drops: [] },
  { kind: 'enemy', name: 'Anomura Fungus', hp: 230, damage: 38, defense: 24,
    description: 'A fungal crab with heavy knockback resistance. Use ranged weapons rather than melee.',
    drops: [] },
  { kind: 'enemy', name: 'Fungi Bulb', hp: 90, damage: 24, defense: 4,
    description: 'A stationary mushroom that fires spore seeds at range.',
    drops: [] },
  { kind: 'enemy', name: 'Spore Bat', hp: 16, damage: 13, defense: 2,
    description: 'A small, fragile bat of the Glowing Mushroom biome.',
    drops: [{ name: 'Shroomerang', rate: '2.5%' }] },
  { kind: 'loot', name: 'Glowing Mushroom', type: 'Material',
    description: 'A blue bioluminescent mushroom.', source: 'Harvest the glowing mushrooms in the biome.', usedFor: 'Mushroom furniture, glowing potions, and Shroomite Bars.' },
  { kind: 'loot', name: 'Truffle Worm', type: 'Critter (Bait)',
    description: 'A rare glowing worm that flees when you approach.', source: 'Catch it with a Bug Net in surface Glowing Mushroom biomes.', usedFor: 'Use it as fishing bait to summon Duke Fishron.' },
  { kind: 'loot', name: 'Autohammer (from Truffle)', wiki: 'Autohammer', type: 'Crafting Station',
    description: 'The station that presses Shroomite Bars.', source: 'Bought from the Truffle NPC (needs a surface Mushroom house, post-Plantera).', usedFor: 'Crafting Shroomite Bars from Chlorophyte Bars and Glowing Mushrooms.' },
  { kind: 'loot', name: 'Shroomite Bar', type: 'Material',
    description: 'A refined bar of Chlorophyte and glowing mushroom.', source: 'Crafted at an Autohammer.', usedFor: 'Shroomite armor and top-tier ranged gear.' },
];

export const bestiary: Record<string, BestiaryEntry> = Object.fromEntries(
  [
    ...FOREST, ...JUNGLE, ...SKY, ...DESERT, ...SNOW, ...DUNGEON,
    ...UNDERWORLD, ...CORRUPTION, ...CRIMSON, ...HALLOW, ...MUSHROOM,
  ].map((e) => [e.name, e]),
);
