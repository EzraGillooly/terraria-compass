import { useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import type { BestiaryEntry } from '../../data/bestiary';
import styles from './BestiaryModal.module.css';

const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';

function wikiStem(entry: BestiaryEntry): string {
  if (entry.wiki) return entry.wiki;
  return entry.name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23EAF4FB'/%3E%3Ctext x='24' y='32' text-anchor='middle' font-size='24' fill='%234A6373' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

export function BestiaryModal({ entry, onClose }: { entry: BestiaryEntry | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!entry) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [entry, onClose]);

  if (!entry) return null;

  const wiki = `${WIKI}/${wikiStem(entry)}.png`;
  const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.stage === 'fallback') return;
    img.dataset.stage = 'fallback';
    img.src = FALLBACK;
  };

  return (
    <div className={styles.backdrop}>
      <button type="button" className={styles.backdropBtn} aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bestiary-title"
      >
        <button ref={closeRef} type="button" className={styles.close} aria-label="Close" onClick={onClose}>×</button>

        <div className={styles.head}>
          <span className={styles.sprite}>
            <img src={wiki} alt={entry.name} width="48" height="48" className="pixel-img" onError={onImgError} />
          </span>
          <div>
            <h2 id="bestiary-title" className={styles.name}>{entry.name}</h2>
            <span className={styles.kind}>
              {entry.kind === 'enemy' ? (entry.hardmode ? 'Hardmode enemy' : 'Enemy') : entry.type}
            </span>
          </div>
        </div>

        <p className={styles.desc}>{entry.description}</p>

        {entry.kind === 'enemy' ? (
          <>
            <div className={styles.stats}>
              <div className={styles.stat}><span className={styles.statNum}>{entry.hp}</span><span className={styles.statLbl}>HP</span></div>
              <div className={styles.stat}><span className={styles.statNum}>{entry.damage}</span><span className={styles.statLbl}>Damage</span></div>
              <div className={styles.stat}><span className={styles.statNum}>{entry.defense}</span><span className={styles.statLbl}>Defense</span></div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionLbl}>Drops</div>
              {entry.drops.length > 0 ? (
                <ul className={styles.drops}>
                  {entry.drops.map((d) => (
                    <li key={d.name} className={styles.dropRow}>
                      <span>{d.name}</span>
                      <span className={styles.dropRate}>{d.rate}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>Drops nothing.</p>
              )}
            </div>
            <p className={styles.note}>Stats shown for Classic mode.</p>
          </>
        ) : (
          <div className={styles.kv}>
            <div className={styles.kvRow}><span className={styles.kvKey}>Source</span><span>{entry.source}</span></div>
            {entry.usedFor && <div className={styles.kvRow}><span className={styles.kvKey}>Used for</span><span>{entry.usedFor}</span></div>}
          </div>
        )}
      </div>
    </div>
  );
}
