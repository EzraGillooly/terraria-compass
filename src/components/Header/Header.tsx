import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../../lib/app-context';
import type { DifficultyFilter } from '../../lib/difficulty';
import { PACKS } from '../../data/packs';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/bosses',   label: 'Bosses'   },
  { to: '/loadouts', label: 'Loadouts' },
  { to: '/crafting', label: 'Crafting' },
  /** the materials index is scraped from the Calamity wiki, so it is pack-gated */
  { to: '/materials', label: 'Materials', packs: ['calamity'] },
];

/** Shared dismiss-on-outside-click / Escape behaviour for the pop-out selects. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref]);
}

/* World difficulty - options come from the active pack (Calamity adds Revengeance/Death). */
function WorldSelect() {
  const { difficulty, setDifficulty, pack } = useAppState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), ref);
  const current = pack.difficulties.find((o) => o.value === difficulty);

  return (
    <div className={styles.diffSelect} ref={ref}>
      <button
        type="button"
        className={styles.diffTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="World difficulty"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.diffCap}>World</span>
        <span className={styles.diffValue}>{current?.label}</span>
        <span className={`${styles.diffCaret} ${open ? styles.diffCaretOpen : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className={styles.diffMenu} role="listbox" aria-label="World difficulty">
          {pack.difficulties.map(({ value, label }) => (
            <li key={value} role="option" aria-selected={value === difficulty}>
              <button
                type="button"
                className={`${styles.diffItem} ${value === difficulty ? styles.diffItemOn : ''}`}
                onClick={() => { setDifficulty(value as DifficultyFilter); setOpen(false); }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Class selector - the loadout class moved here from the page so it stops reading
   as a second nav bar. Only meaningful on the Loadouts page, so the header shows
   it there alone (see Header). Subclass toggles stay on the page. */
function ClassSelect() {
  const { classId, setClassId, pack } = useAppState();
  const BASE = import.meta.env.BASE_URL;

  /* Always open rather than behind a trigger: the class is the axis the whole
     page is read through, so needing a click to see which one you were on was a
     click too many. The stack keeps the menu's own vertical shape and sits where
     the trigger did - out of flow, so hanging past the header cannot grow it.
     Radios, not a listbox: with every option on screen it is a radiogroup. */
  return (
    <div className={styles.classStack}>
      <div className={styles.classStackList} role="radiogroup" aria-label="Class">
        {pack.classes.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === classId}
            className={`${styles.classStackItem} ${c.id === classId ? styles.classStackItemOn : ''}`}
            onClick={() => setClassId(c.id)}
          >
            <img
              src={`${BASE}icons/classes/${c.id}.png`}
              alt="" aria-hidden="true" width="18" height="18"
              className={`${styles.classItemIcon} pixel-img`}
            />
            <span className={styles.classStackName}>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Mod / content-pack selector - rewires every page's data. Packs that aren't
   populated yet are listed but disabled. */
function ModSelect() {
  const { packId, setPackId, pack } = useAppState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), ref);

  return (
    <div className={styles.diffSelect} ref={ref}>
      <button
        type="button"
        className={styles.diffTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Mod"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.diffCap}>Mod</span>
        <span className={styles.diffValue}>{pack.name}</span>
        <span className={`${styles.diffCaret} ${open ? styles.diffCaretOpen : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className={styles.diffMenu} role="listbox" aria-label="Mod">
          {PACKS.map((p) => (
            <li key={p.id} role="option" aria-selected={p.id === packId} aria-disabled={!p.available}>
              <button
                type="button"
                className={`${styles.diffItem} ${p.id === packId ? styles.diffItemOn : ''}`}
                disabled={!p.available}
                onClick={() => { setPackId(p.id); setOpen(false); }}
              >
                {p.name}
                {!p.available && <span className={styles.diffSoon}>Soon</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface HeaderProps {
  /** 'photo' = transparent overlay on hero; 'paper' = solid bar */
  variant?: 'photo' | 'paper';
}

export function Header({ variant = 'paper' }: HeaderProps) {
  const { isDayMode, setIsDayMode, packId } = useAppState();
  const isPhoto = variant === 'photo';
  // class only matters on the loadouts page, so its selector rides the header there
  const onLoadouts = useLocation().pathname === '/loadouts';

  return (
    <header className={`${styles.header} ${isPhoto ? styles.onPhoto : styles.onPaper}`}>
      <div className={styles.inner}>

        {/* Brand */}
        <NavLink to="/" className={styles.brand} aria-label="Terraria Compass - home">
          <img
            className={`${styles.brandLogo} pixel-img`}
            src={`${import.meta.env.BASE_URL}brand/logo.png`}
            alt="Terraria Compass"
            width="546"
            height="95"
          />
        </NavLink>

        {/* Nav */}
        <nav className={styles.topnav} aria-label="Site navigation">
          {NAV_LINKS.filter((l) => !l.packs || l.packs.includes(packId)).map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} pixel-frame ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Controls */}
        <div className={styles.controls}>
          {onLoadouts && <ClassSelect />}
          <ModSelect />
          <WorldSelect />

          {/* Day / night - disabled for now */}
          <button
            type="button"
            className={styles.modeToggle}
            aria-pressed={!isDayMode}
            aria-label={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
            title={isDayMode ? 'Night mode' : 'Day mode'}
            onClick={() => setIsDayMode(!isDayMode)}
            hidden
          >
            {isDayMode ? <SunMark /> : <MoonMark />}
          </button>
        </div>

      </div>
    </header>
  );
}

/* Toggle icons (SVG, not emoji) */
function SunMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2" />
      </g>
    </svg>
  );
}
function MoonMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
