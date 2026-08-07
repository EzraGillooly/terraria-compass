import { useEffect, useRef, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import type { Item } from '../../data/schema';
import { useAppState } from '../../lib/app-context';
import materialsData from '../../data/packs/calamity/materials.json';
import styles from '../BestiaryModal/BestiaryModal.module.css';

const BASE = import.meta.env.BASE_URL;
const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';

/* One-line "how you get it" for a material, so the reader does not have to leave
   the modal for the common case. The full chain lives on the materials page. */
const MATERIAL_SOURCE = new Map(
  (materialsData as { name: string; source: string }[])
    .filter((m) => m.source)
    .map((m) => [m.name, m.source]),
);
const materialSource = (name: string) => MATERIAL_SOURCE.get(name) ?? '';

/* A material's own wiki page, so a recipe ingredient links out even when the
   loadout entry did not carry a wikiUrl of its own. */
const MATERIAL_WIKI = new Map(
  (materialsData as { name: string; wikiUrl?: string }[])
    .filter((m) => m.wikiUrl)
    .map((m) => [m.name, m.wikiUrl as string]),
);
const materialWiki = (name: string) => MATERIAL_WIKI.get(name);

/* Lunar pillar fragments list their drop quantity as "in stacks of 12-60 / 24-100"
   - the first range is Classic, the second Expert. Show only the one that matches
   the world, so the reader is not left to guess which half applies. */
function stacksForDifficulty(source: string, difficulty: string): string {
  return source.replace(
    /in stacks of ([\d–-]+)\s*\/\s*([\d–-]+)/,
    (_, classic, expert) => `in stacks of ${difficulty === 'expert' ? expert : classic}`,
  );
}

/* Materials link out to their wiki page. (The in-app materials index page was
   retired, so an internal link would just bounce to the home redirect.) */
function MaterialLink({ name, wikiUrl }: { name: string; wikiUrl?: string }) {
  if (!wikiUrl) return <span>{name}</span>;
  return <a href={wikiUrl} target="_blank" rel="noreferrer noopener">{name}</a>;
}

const SLOT_LABEL: Record<string, string> = {
  weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory', buff: 'Buff',
  ammo: 'Ammo', material: 'Material', vanity: 'Vanity', mount: 'Mount',
  tool: 'Tool', summon: 'Summon', pet: 'Pet',
};

const OVERRIDES: Record<string, string> = {
  'nights-edge': "Night's_Edge",
  'shield-of-cthulhu': 'Shield_of_Cthulhu',
  'cloud-in-a-bottle': 'Cloud_in_a_Bottle',
};

function makeWikiName(stem: string): string {
  return OVERRIDES[stem]
    ?? stem.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23EAF4FB'/%3E%3Ctext x='24' y='32' text-anchor='middle' font-size='24' fill='%234A6373' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

/* Every boss or mob a drop source can name, mapped to its exact wiki URL. Vanilla
   entities point straight at the Terraria wiki (linking them on the Calamity wiki
   would 30x-redirect and stall); Calamity entities point at the Calamity wiki.
   Plural forms in the text ("Red Devils", "Ice Claspers") map to the singular
   page. Longest names are matched first so "Skeletron Prime" beats "Skeletron". */
const V = 'https://terraria.wiki.gg/wiki';
const C = 'https://calamitymod.wiki.gg/wiki';
const ENTITY_URL: Record<string, string> = {
  // Vanilla bosses that Calamity rebalances (Revengeance / Death) have their own
  // Calamity wiki page, so they link there - not the Terraria wiki.
  'King Slime': `${C}/King_Slime`, 'Eye of Cthulhu': `${C}/Eye_of_Cthulhu`,
  'Eater of Worlds': `${C}/Eater_of_Worlds`, 'Brain of Cthulhu': `${C}/Brain_of_Cthulhu`,
  'Queen Bee': `${C}/Queen_Bee`, 'Skeletron Prime': `${C}/Skeletron_Prime`,
  'Skeletron': `${C}/Skeletron`, 'Deerclops': `${C}/Deerclops`, 'Wall of Flesh': `${C}/Wall_of_Flesh`,
  'The Twins': `${C}/The_Twins`, 'The Destroyer': `${C}/The_Destroyer`, 'Plantera': `${C}/Plantera`,
  'Queen Slime': `${C}/Queen_Slime`, 'Golem': `${C}/Golem`, 'Duke Fishron': `${C}/Duke_Fishron`,
  'Empress of Light': `${C}/Empress_of_Light`, 'Lunatic Cultist': `${C}/Lunatic_Cultist`,
  'Moon Lord': `${C}/Moon_Lord`,
  // Vanilla entities Calamity does NOT give a page (they redirect, which stalls) -
  // link straight to the Terraria wiki.
  'Betsy': `${V}/Betsy`, 'Martian Saucer': `${V}/Martian_Saucer`,
  'Mourning Wood': `${V}/Mourning_Wood`, 'Ice Queen': `${V}/Ice_Queen`, 'Pumpking': `${V}/Pumpking`,
  'Everscream': `${V}/Everscream`,
  // vanilla mobs (plural in text -> singular page)
  'Red Devils': `${V}/Red_Devil`, 'Vampires': `${V}/Vampire`, 'Hellbats': `${V}/Hellbat`,
  'Lava Bats': `${V}/Lava_Bat`, 'Blood Zombies': `${V}/Blood_Zombie`, 'Dripplers': `${V}/Drippler`,
  'Corrupt Mimics': `${V}/Mimic`, 'Clowns': `${V}/Clown`, 'Voodoo Demons': `${V}/Voodoo_Demon`,
  'Goblin Warlocks': `${V}/Goblin_Warlock`, 'Bone Serpents': `${V}/Bone_Serpent`,
  // Calamity bosses/mobs
  'Desert Scourge': `${C}/Desert_Scourge`, 'Crabulon': `${C}/Crabulon`,
  'The Hive Mind': `${C}/The_Hive_Mind`, 'Hive Mind': `${C}/The_Hive_Mind`,
  'The Perforators': `${C}/The_Perforators`, 'Perforators': `${C}/The_Perforators`,
  'Cryogen': `${C}/Cryogen`, 'Calamitas Clone': `${C}/Calamitas_Clone`,
  'Astrum Aureus': `${C}/Astrum_Aureus`, 'Astrum Deus': `${C}/Astrum_Deus`,
  'Ravager': `${C}/Ravager`, 'Leviathan and Anahita': `${C}/Leviathan_and_Anahita`,
  'Providence': `${C}/Providence,_the_Profaned_Goddess`, 'Profaned Guardians': `${C}/Profaned_Guardians`,
  'Ceaseless Void': `${C}/Ceaseless_Void`, 'Storm Weaver': `${C}/Storm_Weaver`,
  'Signus': `${C}/Signus,_Envoy_of_the_Devourer`, 'Polterghast': `${C}/Polterghast`,
  'The Old Duke': `${C}/The_Old_Duke`, 'The Devourer of Gods': `${C}/The_Devourer_of_Gods`,
  'Devourer of Gods': `${C}/The_Devourer_of_Gods`, 'Yharon': `${C}/Yharon,_Dragon_of_Rebirth`,
  'Exo Mechs': `${C}/Exo_Mechs`, 'Supreme Witch, Calamitas': `${C}/Supreme_Witch,_Calamitas`,
  'Supreme Witch': `${C}/Supreme_Witch,_Calamitas`, 'Supreme Calamitas': `${C}/Supreme_Witch,_Calamitas`,
  'The Dragonfolly': `${C}/The_Dragonfolly`, 'Dragonfolly': `${C}/The_Dragonfolly`,
  'Giant Clam': `${C}/Giant_Clam`, 'Cnidrions': `${C}/Cnidrion`, 'Cnidrion': `${C}/Cnidrion`,
  'Wulfrum Rovers': `${C}/Wulfrum_Rover`, 'Ice Claspers': `${C}/Ice_Clasper`,
  'Cloud Elementals': `${C}/Cloud_Elemental`, 'Earth Elemental': `${C}/Earth_Elemental`,
  'Viperfish': `${C}/Viperfish`, 'Eidolon Wyrms': `${C}/Eidolon_Wyrm`, 'Eidolon Wyrm': `${C}/Eidolon_Wyrm`,
  'The Slime God': `${C}/The_Slime_God`, 'Slime God': `${C}/The_Slime_God`,
  'The Plaguebringer Goliath': `${C}/The_Plaguebringer_Goliath`, 'Plaguebringer Goliath': `${C}/The_Plaguebringer_Goliath`,
  'Hemogoblin Sharks': `${C}/Hemogoblin_Shark`, 'Aquatic Scourge': `${C}/Aquatic_Scourge`,
  // vanilla event/mob entities without a Calamity page
  'Martian Engineers': `${V}/Martian_Engineer`, 'Angry Nimbus': `${V}/Angry_Nimbus`,
};
const ENTITY_RE = new RegExp(
  `\\b(${Object.keys(ENTITY_URL).sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g',
);

/** Renders a source string with every known boss or mob name turned into an
    external wiki link (its exact page), underlined so it reads as clickable. */
function SourceText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(ENTITY_RE)) {
    const i = m.index ?? 0;
    if (i < last) continue;
    const name = m[0];
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <a key={i} className={styles.bossLink} href={ENTITY_URL[name]}
        target="_blank" rel="noreferrer noopener">{name}</a>,
    );
    last = i + name.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function ItemModal({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { difficulty } = useAppState();
  /* Which headpiece variant (Spectre Mask vs Hood) the reader is looking at.
     Reset to the first variant whenever the modal opens a different item -
     done during render (React's reset-on-prop-change pattern) rather than in
     an effect, which would cascade an extra render. */
  const [variant, setVariant] = useState(0);
  const [variantFor, setVariantFor] = useState(item?.id);
  if (item && item.id !== variantFor) {
    setVariantFor(item.id);
    setVariant(0);
  }
  /* Many drops double in Expert (Keybrand 0.5% -> 1%), so an Expert world shows
     the Expert rate when the item carries one. */
  const shownDropRate = difficulty === 'expert' && item?.dropRateExpert
    ? item.dropRateExpert : item?.dropRate;

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    // Lock the page behind the modal so scrolling scrolls the modal body, not
    // the loadout page under it.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;
  /* A set page lists a recipe for every class's helmet - Aerospec has five -
     but `pieces` already names the three this class actually wears. Showing
     all of them told a melee reader how to craft the summoner hood. */
  const pieceRecipes = item.pieces?.length
    ? (item.pieceRecipes ?? []).filter((p) => item.pieces?.includes(p.piece))
    : item.pieceRecipes ?? [];
  // any image extension, not only .png - Any Balloon's icon is a gif, and
  // leaving the extension on produced "Any-balloon.gif.png" as the fallback
  const stem = item.icon.replace(/\.(png|gif|jpe?g|webp)$/i, '').split('/').pop() ?? '';
  const local = `${BASE}icons/${item.icon}`;
  const wiki = `${WIKI}/${makeWikiName(stem)}.png`;
  const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.stage) { img.dataset.stage = 'wiki'; img.src = wiki; return; }
    if (img.dataset.stage === 'wiki') { img.dataset.stage = 'fallback'; img.src = FALLBACK; }
  };

  return (
    <div className={styles.backdrop}>
      <button type="button" className={styles.backdropBtn} aria-label="Close" tabIndex={-1} onClick={onClose} />
      {/* .modalTall pins the header and scrolls only the body. A long item -
          Victide armor lists eleven set-bonus lines and five piece recipes -
          used to scroll the whole card, taking the title and close button with
          it and running to a hard clipped edge with nothing to say there was
          more below. */}
      <div className={`${styles.modal} ${styles.modalTall} pixel-frame`} data-mode="dark" role="dialog" aria-modal="true" aria-labelledby="item-title">
        <button ref={closeRef} type="button" className={`${styles.close} pixel-frame`} aria-label="Close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.head}>
          <span className={`${styles.sprite} pixel-frame`}>
            <img src={local} alt={item.name} width="48" height="48" className="pixel-img" onError={onImgError} />
          </span>
          <div>
            <div className={styles.titleRow}>
              <h2 id="item-title" className={styles.name}>{item.name}</h2>
              {item.wikiUrl && (
                <a
                  className={styles.wikiLink}
                  href={item.wikiUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  wiki
                </a>
              )}
            </div>
            <span className={styles.kind}>
              {SLOT_LABEL[item.slot] ?? item.slot}{item.subclass ? ` · ${item.subclass}` : ''}
            </span>
          </div>
        </div>

        <div className={styles.modalBody}>
        {/* One subtext, then the key/value rows - the same shape vanilla has
            always had. It briefly carried three competing blocks (a full wiki
            description, an Effect row and a "Why here" line), which is a lot of
            reading for a card whose job is to say what the item does.

            The subtext is the effect: for armour that is the set bonus, so it
            can run to several lines and stays a list; anything else is prose. */}
        {(() => {
          /* Armour keeps its helmet bonus in a separate field, because only
             this class's helmet should show - the shared set bonus and the
             one helmet's bonus are both part of what wearing it does, so
             they read as one list here. */
          /* Falls back to `why`. Only Calamity items carry `effect`, so
             dropping `why` from the modal blanked every vanilla card -
             65 of vanilla's 67 armour entries describe themselves there
             and have no effect text at all. */
          const list = (bullets: string[]) => bullets.length > 1
            ? <ul className={`${styles.desc} ${styles.effects}`}>{bullets.map((l) => <li key={l}>{l}</li>)}</ul>
            : <p className={styles.desc}>{bullets[0]}</p>;
          const split = (s?: string) => (s || '').split(' · ').map((x) => x.trim()).filter(Boolean);
          /* A set with two interchangeable headpieces (Spectre Mask vs Hood)
             shows a toggle: each variant carries its own bonus and set effect,
             so the reader swaps between them in place. */
          const vars = item.headVariants;
          const v = vars?.[Math.min(variant, vars.length - 1)];
          if (vars && vars.length > 0 && v) {
            const hb = split(v.headpieceBonus);
            const sb = split(v.effect);
            return (
              <div className={styles.bonusGroups}>
                <div className={styles.headToggle} role="group" aria-label="Headpiece">
                  {vars.map((hv, i) => (
                    <button
                      key={hv.name} type="button"
                      className={`${styles.headToggleBtn} pixel-frame ${i === variant ? styles.headToggleOn : ''}`}
                      aria-pressed={i === variant}
                      onClick={() => setVariant(i)}
                    >
                      {hv.name}
                    </button>
                  ))}
                </div>
                {hb.length > 0 && (
                  <div className={styles.bonusGroup}>
                    <span className={styles.bonusLabel}>{v.name} bonus</span>
                    {list(hb)}
                  </div>
                )}
                {sb.length > 0 && (
                  <div className={styles.bonusGroup}>
                    <span className={styles.bonusLabel}>Set bonus</span>
                    {list(sb)}
                  </div>
                )}
              </div>
            );
          }
          const setBullets = split(item.effect || item.why);
          const helmetBullets = split(item.headpieceBonus);
          if (!setBullets.length && !helmetBullets.length) return null;
          /* Armour with a class helmet bonus splits into two labelled blocks so
             the reader can tell the one helmet's bonus from the shared set bonus.
             Everything else (accessories, plain vanilla armour) is one list. */
          if (item.slot !== 'armor' || helmetBullets.length === 0) {
            return list([...helmetBullets, ...setBullets]);
          }
          return (
            <div className={styles.bonusGroups}>
              <div className={styles.bonusGroup}>
                <span className={styles.bonusLabel}>Helmet bonus</span>
                {list(helmetBullets)}
              </div>
              {setBullets.length > 0 && (
                <div className={styles.bonusGroup}>
                  <span className={styles.bonusLabel}>Set bonus</span>
                  {list(setBullets)}
                </div>
              )}
            </div>
          );
        })()}

        {/* An item that stands for a family (Candles) lists its members here,
            each with its own sprite and effect. Grouped when the variants carry
            a `group`, so mutually-exclusive combat candles read apart from the
            spawn-rate ones - and the group is labelled so "pick one" is clear. */}
        {item.variants && item.variants.length > 0 && (() => {
          const GROUPS: { key: string; label: string }[] = [
            { key: 'combat', label: 'Combat - place one, they do not stack' },
            { key: 'spawn', label: 'Spawn control' },
          ];
          const grouped = item.variants!.some((v) => v.group);
          const buckets = grouped
            ? GROUPS
              .map((g) => ({ ...g, items: item.variants!.filter((v) => v.group === g.key) }))
              .filter((g) => g.items.length > 0)
            : [{ key: 'all', label: '', items: item.variants! }];
          return (
            <div className={styles.variants}>
              {buckets.map((b) => (
                <div key={b.key} className={styles.variantGroup}>
                  {b.label && <div className={styles.variantCap}>{b.label}</div>}
                  <ul className={styles.variantList}>
                    {b.items.map((v) => (
                      <li key={v.name} className={styles.variant}>
                        <span className={`${styles.variantSlot} pixel-frame`}>
                          <img
                            src={`${BASE}icons/${v.icon}`} alt="" aria-hidden="true"
                            width="24" height="24" className="pixel-img" loading="lazy"
                          />
                        </span>
                        <span className={styles.variantText}>
                          <span className={styles.variantName}>{v.name}</span>
                          <span className={styles.variantEffect}>{v.effect}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })()}

        <div className={styles.kv}>
          {item.stats && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Stats</span><span>{item.stats}</span></div>
          )}
          {/* Drop rate sits with the stats. On a boss drop the source is implied
              (it is from that boss), so those omit `source` and show this instead. */}
          {shownDropRate && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Drop rate</span><span>{shownDropRate}</span></div>
          )}
          {/* A few entries are category guidance ("Any Double Jump") or buff
              states rather than single items, so they have no acquisition line.
              Omit the row instead of printing an empty one. */}
          {item.source && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Source</span><span><SourceText text={item.source} /></span></div>
          )}
          {pieceRecipes.length > 0 && (
            <div className={styles.kvRow}>
              <span className={styles.kvKey}>Materials</span>
              <div className={styles.pieces}>
                {pieceRecipes.map((p) => (
                  <div key={p.piece} className={styles.piece}>
                    <div className={styles.pieceName}>
                      {p.piece}
                    </div>
                    <ul className={styles.materials}>
                      {p.materials.map((m) => (
                        <li key={m.name}>
                          <span className={styles.matQty}>{m.qty}</span>
                          <MaterialLink
                            name={m.name}
                            wikiUrl={m.wikiUrl ?? materialWiki(m.name)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {item.materials && item.materials.length > 0 && (
            <div className={styles.kvRow}>
              <span className={styles.kvKey}>Materials</span>
              <ul className={`${styles.materials} ${styles.materialsFlat}`}>
                {item.materials.map((m) => {
                  const how = stacksForDifficulty(materialSource(m.name), difficulty);
                  return (
                    <li key={m.name}>
                      <span className={styles.matBody}>
                        <span className={styles.matNameRow}>
                          {/* Calamity deep-links into the materials index with the
                              search prefilled; vanilla goes out to the wiki */}
                          <MaterialLink
                            name={m.name}
                            wikiUrl={m.wikiUrl ?? materialWiki(m.name)}
                          />
                          <span className={styles.matQty}>{m.qty}</span>
                        </span>
                        {how && <span className={styles.matHow}>{how}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {item.modifier && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Best reforge</span><span>{item.modifier}</span></div>
          )}
          {item.notes && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Notes</span><span>{item.notes}</span></div>
          )}
        </div>

        <span className={styles.scrollFade} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
