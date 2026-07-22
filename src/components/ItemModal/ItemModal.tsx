import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { SyntheticEvent } from 'react';
import type { Item } from '../../data/schema';
import { findCraftable } from '../../data/recipes';
import styles from '../BestiaryModal/BestiaryModal.module.css';

const BASE = import.meta.env.BASE_URL;
const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';

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

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  const craftable = findCraftable(item.name);
  const stem = item.icon.replace(/\.png$/i, '').split('/').pop() ?? '';
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
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="item-title">
        <button ref={closeRef} type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.head}>
          <span className={styles.sprite}>
            <img src={local} alt={item.name} width="48" height="48" className="pixel-img" onError={onImgError} />
          </span>
          <div>
            <h2 id="item-title" className={styles.name}>{item.name}</h2>
            <span className={styles.kind}>
              {SLOT_LABEL[item.slot] ?? item.slot}{item.subclass ? ` · ${item.subclass}` : ''}
            </span>
          </div>
        </div>

        <p className={styles.desc}>{item.why}</p>

        <div className={styles.kv}>
          {item.stats && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Stats</span><span>{item.stats}</span></div>
          )}
          <div className={styles.kvRow}><span className={styles.kvKey}>Source</span><span>{item.source}</span></div>
          {item.modifier && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Best reforge</span><span>{item.modifier}</span></div>
          )}
          {item.notes && (
            <div className={styles.kvRow}><span className={styles.kvKey}>Notes</span><span>{item.notes}</span></div>
          )}
        </div>

        {craftable && (
          <Link
            className={styles.craftLink}
            to={`/crafting?item=${craftable.id}`}
            onClick={onClose}
          >
            View in crafting tree
          </Link>
        )}
      </div>
    </div>
  );
}
