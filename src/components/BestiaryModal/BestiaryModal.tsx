import { useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import { localSprite, wikiSprite, type BestiaryEntry } from '../../data/bestiary';
import { useAppState } from '../../lib/app-context';
import styles from './BestiaryModal.module.css';

const SCALE = { normal: 1, expert: 2, master: 3 } as const;
const MODE_LABEL = { normal: 'Classic', expert: 'Expert', master: 'Master' } as const;

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23EAF4FB'/%3E%3Ctext x='24' y='32' text-anchor='middle' font-size='24' fill='%234A6373' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

export function BestiaryModal({ entry, onClose }: { entry: BestiaryEntry | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { difficulty } = useAppState();

  useEffect(() => {
    if (!entry) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [entry, onClose]);

  if (!entry) return null;

  const mult = SCALE[difficulty];
  const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.stage) { img.dataset.stage = 'wiki'; img.src = wikiSprite(entry); return; }
    if (img.dataset.stage === 'wiki') { img.dataset.stage = 'fallback'; img.src = FALLBACK; }
  };

  return (
    <div className={styles.backdrop}>
      <button type="button" className={styles.backdropBtn} aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div
        className={`${styles.modal} pixel-frame`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bestiary-title"
      >
        <button ref={closeRef} type="button" className={`${styles.close} pixel-frame`} aria-label="Close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.head}>
          <span className={`${styles.sprite} pixel-frame`}>
            <img src={localSprite(entry)} alt={entry.name} width="48" height="48" className="pixel-img" onError={onImgError} />
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
              <div className={styles.stat}><span className={styles.statNum}>{entry.hp * mult}</span><span className={styles.statLbl}>HP</span></div>
              <div className={styles.stat}><span className={styles.statNum}>{entry.damage * mult}</span><span className={styles.statLbl}>Damage</span></div>
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
            <p className={styles.note}>
              HP &amp; damage shown for {MODE_LABEL[difficulty]} mode. Change it with the World selector.
            </p>
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
