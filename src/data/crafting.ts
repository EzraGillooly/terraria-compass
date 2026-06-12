export interface CraftPart {
  name: string;
  from: string;
}

export interface CraftingTree {
  id: string;
  output: string;
  dmg: number | null;
  type: 'weapon' | 'armor' | 'accessory' | 'material';
  station: string;
  tier: 'pre-boss' | 'pre-hm' | 'hardmode' | 'endgame';
  class?: string;
  parts: CraftPart[];
  note?: string;
}

export const craftingTrees: CraftingTree[] = [
  // ── Pre-HM weapons ────────────────────────────────────────
  {
    id: 'nights-edge',
    output: "Night's Edge",
    dmg: 42,
    type: 'weapon',
    station: 'Demon / Crimson Altar',
    tier: 'pre-hm',
    class: 'melee',
    parts: [
      { name: 'Muramasa',                        from: 'Dungeon gold chest' },
      { name: "Light's Bane / Blood Butcherer",  from: 'Demonite / Crimtane Bars at Anvil' },
      { name: 'Blade of Grass',                  from: '12 Jungle Spores + 3 Stingers at Anvil' },
      { name: 'Fiery Greatsword',                from: '20 Hellstone Bars at Anvil' },
    ],
    note: 'The best pre-WoF melee weapon. Combine all four swords at a Demon/Crimson Altar.',
  },
  {
    id: 'phoenix-blaster',
    output: 'Phoenix Blaster',
    dmg: 17,
    type: 'weapon',
    station: 'Iron / Lead Anvil',
    tier: 'pre-hm',
    class: 'ranger',
    parts: [
      { name: 'Handgun',          from: 'Dungeon gold chest' },
      { name: 'Hellstone Bar ×10', from: 'Smelt Hellstone + Obsidian' },
    ],
    note: 'Top pre-WoF gun. Fast, powerful, and extremely reliable on the Wall of Flesh bridge run.',
  },
  {
    id: 'snapthorn',
    output: 'Snapthorn',
    dmg: 12,
    type: 'weapon',
    station: 'Iron / Lead Anvil',
    tier: 'pre-boss',
    class: 'summoner',
    parts: [
      { name: 'Jungle Spores ×6', from: 'Underground Jungle glowing orbs' },
      { name: 'Stinger ×3',       from: 'Hornets in the Jungle' },
      { name: 'Vine ×3',          from: 'Man Eaters in the Jungle' },
    ],
    note: 'Best early whip — tags enemies so minions focus and deal more damage.',
  },

  // ── Materials ─────────────────────────────────────────────
  {
    id: 'hellstone-bar',
    output: 'Hellstone Bar',
    dmg: null,
    type: 'material',
    station: 'Hellforge',
    tier: 'pre-hm',
    parts: [
      { name: 'Hellstone ×3',  from: 'Mine in the Underworld (Nightmare Pickaxe or better)' },
      { name: 'Obsidian ×1',   from: 'Pour Water onto Lava' },
    ],
    note: 'Core material for Molten tier. Hellforges spawn in the Underworld — you need one to smelt.',
  },
  {
    id: 'demonite-bar',
    output: 'Demonite Bar / Crimtane Bar',
    dmg: null,
    type: 'material',
    station: 'Iron / Lead Furnace',
    tier: 'pre-boss',
    parts: [
      { name: 'Demonite Ore ×4 (or Crimtane Ore ×4)', from: 'Eye of Cthulhu / Eater of Worlds / Brain of Cthulhu drops' },
    ],
    note: 'Evil biome ore unlocked from first boss kills. Enables Shadow/Crimson armor and class-specific weapons.',
  },

  // ── Armor ─────────────────────────────────────────────────
  {
    id: 'molten-armor',
    output: 'Molten Armor',
    dmg: null,
    type: 'armor',
    station: 'Iron / Lead Anvil',
    tier: 'pre-hm',
    class: 'melee',
    parts: [
      { name: 'Hellstone Bar ×45', from: '135× Hellstone + 45× Obsidian at Hellforge' },
    ],
    note: 'Best melee defense set before Hardmode. The 17% melee damage boost is the reason every melee build farms Hellstone.',
  },
  {
    id: 'necro-armor',
    output: 'Necro Armor',
    dmg: null,
    type: 'armor',
    station: 'Iron / Lead Anvil',
    tier: 'pre-hm',
    class: 'ranger',
    parts: [
      { name: 'Cobweb ×200',  from: 'Underground / Dungeon cobweb sources' },
      { name: 'Bone ×150',    from: 'Skeletons in the Dungeon (post-Skeletron)' },
    ],
    note: '+15% ranged damage and +10% crit. The Dungeon is the source — bring a Grappling Hook.',
  },
  {
    id: 'jungle-armor',
    output: 'Jungle Armor',
    dmg: null,
    type: 'armor',
    station: 'Iron / Lead Anvil',
    tier: 'pre-boss',
    class: 'mage',
    parts: [
      { name: 'Jungle Spores ×16', from: 'Underground Jungle glowing orbs' },
      { name: 'Stinger ×16',       from: 'Hornets in the Jungle' },
    ],
    note: '-16% mana cost and +crit. The best early mage armor — grab it before any boss.',
  },

  // ── Accessories ───────────────────────────────────────────
  {
    id: 'lightning-boots',
    output: 'Lightning Boots',
    dmg: null,
    type: 'accessory',
    station: 'Tinkerer\'s Workshop',
    tier: 'pre-hm',
    parts: [
      { name: 'Spectre Boots',   from: 'Tinkerer: Hermes/Sailfish/Flurry Boots + Rocket Boots' },
      { name: 'Aglet',           from: 'Underground chests' },
      { name: 'Anklet of the Wind', from: 'Jungle Shrines / Ivy Chests' },
    ],
    note: 'Essential mobility. Combine all boots-tier items at the Tinkerer\'s Workshop.',
  },
  {
    id: 'obsidian-shield',
    output: 'Obsidian Shield',
    dmg: null,
    type: 'accessory',
    station: 'Tinkerer\'s Workshop',
    tier: 'pre-hm',
    parts: [
      { name: 'Cobalt Shield',       from: 'Dungeon gold chests' },
      { name: 'Obsidian Skull',      from: 'Craft: 20× Obsidian at Furnace' },
    ],
    note: 'Knockback immunity + 2 defense. A universal pre-hardmode staple across all classes.',
  },

  // ── Hardmode ──────────────────────────────────────────────
  {
    id: 'terra-blade',
    output: 'Terra Blade',
    dmg: 95,
    type: 'weapon',
    station: 'Mythril / Orichalcum Anvil',
    tier: 'hardmode',
    class: 'melee',
    parts: [
      { name: "True Night's Edge",   from: "Night's Edge + 20× Soul of Night at Anvil" },
      { name: 'True Excalibur',      from: 'Excalibur (Hallowed Bars) + 20× Soul of Light at Anvil' },
    ],
    note: 'Fires a large green beam. One of the strongest pre-endgame melee weapons and a crafting benchmark.',
  },
  {
    id: 'megashark',
    output: 'Megashark',
    dmg: 23,
    type: 'weapon',
    station: 'Mythril / Orichalcum Anvil',
    tier: 'hardmode',
    class: 'ranger',
    parts: [
      { name: 'Minishark',          from: 'Arms Dealer (35 gold)' },
      { name: 'Illegal Gun Parts',  from: 'Arms Dealer at night' },
      { name: 'Shark Fin ×5',       from: 'Sharks in the Ocean' },
      { name: 'Soul of Might ×20',  from: 'The Destroyer' },
    ],
    note: '50% chance not to consume ammo. The definitive early Hardmode ranged workhorse.',
  },
  {
    id: 'spectre-armor',
    output: 'Spectre Armor',
    dmg: null,
    type: 'armor',
    station: 'Mythril / Orichalcum Anvil',
    tier: 'hardmode',
    class: 'mage',
    parts: [
      { name: 'Spectre Bar ×54',   from: 'Chlorophyte Bar + Ectoplasm (post-Plantera Dungeon) at Furnace' },
    ],
    note: 'Two helmet options: Hood for healing aura, Mask for damage. The Hood build can sustain through hard fights.',
  },
];
