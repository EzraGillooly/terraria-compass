import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { SyntheticEvent } from 'react';
import type { Item } from '../../data/schema';
import { usePack, useAppState } from '../../lib/app-context';
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

/* The materials index only covers Calamity, so a vanilla material must not link
   into it - the page would just tell the reader to switch packs. Vanilla links
   go to the wiki instead, which is where that material is actually documented. */
function MaterialLink(
  { name, wikiUrl, internal, onClose }:
  { name: string; wikiUrl?: string; internal: boolean; onClose: () => void },
) {
  if (internal) {
    return <Link to={`/materials?q=${encodeURIComponent(name)}`} onClick={onClose}>{name}</Link>;
  }
  if (!wikiUrl) return <span>{name}</span>;
  return <a href={wikiUrl} target="_blank" rel="noreferrer noopener">{name}</a>;
}

const SLOT_LABEL: Record<string, string> = {
  weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory', buff: 'Buff',
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

export function ItemModal({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { recipes } = usePack();
  const { packId } = useAppState();

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  const craftable = recipes.findCraftable(item.name);
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
      <div className={`${styles.modal} ${styles.modalTall} pixel-frame`} role="dialog" aria-modal="true" aria-labelledby="item-title">
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
            <h2 id="item-title" className={styles.name}>{item.name}</h2>
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
          const parts = [item.effect, item.headpieceBonus].filter(Boolean).join(' · ');
          if (!parts) return null;
          return parts.includes(' · ')
            ? (
              <ul className={`${styles.desc} ${styles.effects}`}>
                {parts.split(' · ').map((line) => <li key={line}>{line}</li>)}
              </ul>
            )
            : <p className={styles.desc}>{parts}</p>;
        })()}

        <div className={styles.kv}>
          {item.stats && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Stats</span><span>{item.stats}</span></div>
          )}
          {/* A few entries are category guidance ("Any Double Jump") or buff
              states rather than single items, so they have no acquisition line.
              Omit the row instead of printing an empty one. */}
          {item.source && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Source</span><span>{item.source}</span></div>
          )}
          {pieceRecipes.length > 0 && (
            <div className={styles.kvRow}>
              <span className={styles.kvKey}>Craft</span>
              <div className={styles.pieces}>
                {pieceRecipes.map((p) => (
                  <div key={p.piece} className={styles.piece}>
                    <div className={styles.pieceName}>
                      {p.piece}
                      {p.station && <span className={styles.pieceAt}>at {p.station}</span>}
                    </div>
                    <ul className={styles.materials}>
                      {p.materials.map((m) => (
                        <li key={m.name}>
                          <span className={styles.matQty}>{m.qty}</span>
                          <MaterialLink
                            name={m.name}
                            wikiUrl={m.wikiUrl}
                            internal={packId === 'calamity'}
                            onClose={onClose}
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
                  const how = materialSource(m.name);
                  return (
                    <li key={m.name}>
                      <span className={styles.matBody}>
                        <span className={styles.matNameRow}>
                          {/* Calamity deep-links into the materials index with the
                              search prefilled; vanilla goes out to the wiki */}
                          <MaterialLink
                            name={m.name}
                            wikiUrl={m.wikiUrl}
                            internal={packId === 'calamity'}
                            onClose={onClose}
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

        {craftable && (
          <Link
            className={`${styles.craftLink} pixel-frame`}
            to={`/crafting?item=${craftable.id}`}
            onClick={onClose}
          >
            View in crafting tree
          </Link>
        )}
        <span className={styles.scrollFade} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
