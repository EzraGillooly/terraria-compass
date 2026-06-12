export interface BiomePalette {
  sky: string;
  mid: string;
  deep: string;
  accent: string;
}

export interface BiomeDef {
  id: string;
  name: string;
  blurb: string;
  palette: BiomePalette;
  mobs: string[];
  items: string[];
  danger: number;
  hardmodeOnly?: boolean;
}

export const biomes: BiomeDef[] = [
  {
    id: 'forest',
    name: 'Forest',
    blurb: 'Where every adventure starts. Trees, slimes, and gentle hills hide your first ore veins.',
    palette: { sky: '#5DA9E9', mid: '#69B96B', deep: '#2F6B3F', accent: '#F4E3B2' },
    mobs: ['Green Slime', 'Zombie', 'Demon Eye', 'Pinky', 'Bunny', 'Blood Crawler'],
    items: ['Wood', 'Acorn', 'Gel', 'Mushroom', 'Daybloom'],
    danger: 1,
  },
  {
    id: 'jungle',
    name: 'Jungle',
    blurb: 'Dense, dangerous, and packed with Hornets, Man Eaters, and Jungle traps. Home of Queen Bee.',
    palette: { sky: '#7BB36A', mid: '#3F7A3A', deep: '#1F4222', accent: '#F2D45A' },
    mobs: ['Hornet', 'Man Eater', 'Jungle Slime', 'Piranha', 'Angry Trapper', 'Derpling'],
    items: ['Jungle Spores', 'Stinger', 'Vine', 'Rich Mahogany', 'Moonglow'],
    danger: 3,
  },
  {
    id: 'sky',
    name: 'Sky Islands',
    blurb: 'Float up to find rare chests on cloud-borne islands. Home of the Starfury and Shiny Red Balloon.',
    palette: { sky: '#6FA8FF', mid: '#A9C8FF', deep: '#3B6BC0', accent: '#FFF1A1' },
    mobs: ['Harpy', 'Wyvern'],
    items: ['Sky Crate', 'Skyware Chest', 'Shiny Red Balloon', 'Lucky Horseshoe'],
    danger: 2,
  },
  {
    id: 'desert',
    name: 'Desert',
    blurb: 'Sun-blasted dunes hiding Antlion warrens, Tomb Crawlers, and a buried Underground Pyramid.',
    palette: { sky: '#F2C26B', mid: '#E08A4A', deep: '#8B4828', accent: '#FFE8B5' },
    mobs: ['Antlion Charger', 'Antlion Swarmer', 'Vulture', 'Tomb Crawler', 'Desert Djinn'],
    items: ['Antlion Mandible', 'Cactus', 'Forbidden Fragment', 'Desert Spirit Lamp'],
    danger: 2,
  },
  {
    id: 'snow',
    name: 'Snow & Tundra',
    blurb: 'Frozen plains with Ice Slimes, Wolf packs, and the Frost Legion event. Amarok drops here.',
    palette: { sky: '#A8C8E0', mid: '#D8E6F0', deep: '#5A7C9C', accent: '#FFFFFF' },
    mobs: ['Ice Slime', 'Zombie Eskimo', 'Wolf', 'Ice Bat', 'Spiked Ice Slime'],
    items: ['Ice Block', 'Frost Core', 'Amarok', 'Ice Skates', 'Blizzard in a Bottle'],
    danger: 2,
  },
  {
    id: 'dungeon',
    name: 'Dungeon',
    blurb: 'Unlocked after Skeletron. Dangerous enemies guard powerful chests — Water Bolt, Handgun, and more.',
    palette: { sky: '#1A1F4A', mid: '#2D3672', deep: '#0F1331', accent: '#C9D3FF' },
    mobs: ['Skeleton', 'Cursed Skull', 'Dark Caster', 'Spike Ball', 'Dungeon Slime'],
    items: ['Water Bolt', 'Handgun', 'Muramasa', 'Shadow Key', 'Cobalt Shield'],
    danger: 4,
  },
  {
    id: 'underworld',
    name: 'Underworld',
    blurb: 'The deepest layer. Hellstone, Obsidian, and the Wall of Flesh await. Craft your pre-hardmode finale here.',
    palette: { sky: '#3A1E0A', mid: '#7A3218', deep: '#4A1A08', accent: '#FF8040' },
    mobs: ['Fire Imp', 'Bone Serpent', 'Lava Bat', 'Demon', 'Voodoo Demon'],
    items: ['Hellstone', 'Obsidian', 'Guide Voodoo Doll', 'Hellforge', 'Flare Gun'],
    danger: 5,
  },
  {
    id: 'corruption',
    name: 'Corruption',
    blurb: 'Purple wastes pocked with chasms. Break Shadow Orbs to progress — but at a cost.',
    palette: { sky: '#6B3D8C', mid: '#3F1F5C', deep: '#1C0A2E', accent: '#C49EF0' },
    mobs: ['Eater of Souls', 'Devourer', 'Corruptor', 'World Feeder', 'Slimeling'],
    items: ['Shadow Orb', 'Demonite Ore', 'Rotten Chunk', 'Vile Mushroom'],
    danger: 4,
  },
  {
    id: 'crimson',
    name: 'Crimson',
    blurb: 'A blood-red alternative to the Corruption. Face Flesh Crawlers and the Brain of Cthulhu boss.',
    palette: { sky: '#8C1A1A', mid: '#5C0F0F', deep: '#2E0707', accent: '#FF8080' },
    mobs: ['Face Monster', 'Crimera', 'Blood Crawler', 'Floaty Gross', 'Crimslime'],
    items: ['Crimtane Ore', 'Vertebra', 'Deathweed', 'Crimson Heart'],
    danger: 4,
  },
  {
    id: 'hallow',
    name: 'Hallow',
    blurb: 'A pastel paradise (with teeth) that appears after defeating the Wall of Flesh in Hardmode.',
    palette: { sky: '#B998FF', mid: '#FFB7E2', deep: '#6B47C9', accent: '#FFF4A8' },
    mobs: ['Pixie', 'Unicorn', 'Gastropod', 'Chaos Elemental', 'Enchanted Sword'],
    items: ['Crystal Shard', 'Pixie Dust', 'Unicorn Horn', 'Holy Water', 'Rainbow Rod'],
    danger: 4,
    hardmodeOnly: true,
  },
  {
    id: 'mushroom',
    name: 'Glowing Mushroom',
    blurb: 'A blue-glowing fungal biome. Surface variant lets the Truffle NPC move in.',
    palette: { sky: '#3D8BC0', mid: '#7FA8C9', deep: '#1F4A6B', accent: '#9FD4FF' },
    mobs: ['Mushi Ladybug', 'Anomura Fungus', 'Fungi Bulb', 'Spore Bat'],
    items: ['Glowing Mushroom', 'Truffle Worm', 'Autohammer (from Truffle)', 'Shroomite Bar'],
    danger: 2,
  },
];
