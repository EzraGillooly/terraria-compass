import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../../lib/app-context';
import type { DifficultyFilter } from '../../lib/difficulty';
import { PACK_META } from '../../data/packs';
import styles from './Header.module.css';

const NAV_LINKS = [
  /** Boss progression is fully converted for vanilla; Calamity's bosses are
   *  mid-conversion, so the tab is hidden under Calamity on the live site but
   *  shown in the dev preview (matching the page's own env gate). */
  { to: '/bosses', label: 'Bosses', ...(import.meta.env.DEV ? {} : { packs: ['vanilla'] }) },
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

/* Calamity's own difficulty, which is not a world type: it is toggled on top of
   an existing world through the Difficulty Indicator, and Revengeance "can only
   be activated from Expert Mode" with Death reached from Revengeance. So it sits
   under the World selector as its own axis rather than as two more entries
   inside it, and it is inert until the world is Expert. */
const CAL_MODES = [
  { id: 'off', label: 'Off' },
  { id: 'revengeance', label: 'Rev' },
  { id: 'death', label: 'Death' },
] as const;

function CalamityModeToggle() {
  const { calamityMode, setCalamityMode, difficulty } = useAppState();
  const needsExpert = difficulty !== 'expert';

  return (
    <div
      className={styles.calModeRow}
      title={needsExpert ? 'Revengeance can only be activated in an Expert world' : undefined}
    >
      <span className={styles.calModeCap}>Calamity</span>
      <div className={styles.calModeOpts} role="radiogroup" aria-label="Calamity difficulty">
        {CAL_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={calamityMode === m.id}
            disabled={needsExpert && m.id !== 'off'}
            className={`${styles.calModeItem} ${calamityMode === m.id ? styles.calModeItemOn : ''}`}
            onClick={() => setCalamityMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Class selector - the loadout class moved here from the page so it stops reading
   as a second nav bar. Only meaningful on the Loadouts page, so the header shows
   it there alone (see Header). A pop-out dropdown like Mod / World, carrying each
   class's weapon sprite. Subclass toggles stay on the page. */
function ClassSelect() {
  const { classId, setClassId, pack } = useAppState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), ref);
  const BASE = import.meta.env.BASE_URL;
  const current = pack.classes.find((c) => c.id === classId);

  return (
    <div className={styles.diffSelect} ref={ref}>
      <button
        type="button"
        className={styles.diffTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Class"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.diffCap}>Class</span>
        <span className={styles.diffValue}>{current?.name}</span>
        <span className={`${styles.diffCaret} ${open ? styles.diffCaretOpen : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className={styles.diffMenu} role="listbox" aria-label="Class">
          {pack.classes.map((c) => (
            <li key={c.id} role="option" aria-selected={c.id === classId}>
              <button
                type="button"
                className={`${styles.diffItem} ${styles.classPick} ${c.id === classId ? styles.diffItemOn : ''}`}
                onClick={() => { setClassId(c.id); setOpen(false); }}
              >
                <img
                  src={`${BASE}icons/classes/${c.id}.png`}
                  alt="" aria-hidden="true" width="18" height="18"
                  className={`${styles.classItemIcon} pixel-img`}
                />
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
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
          {PACK_META.map((p) => (
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
  const { pathname } = useLocation();
  // class only matters on the loadouts page, so its selector rides the header there
  const onLoadouts = pathname === '/loadouts';

  /* The nav and selectors do not fit a phone's width, so below the mobile
     breakpoint they collapse behind this button into a dropdown panel (see
     .menuToggle / .headerMenu in the CSS - both are desktop no-ops). Tapping a
     nav link closes it (below), so it never hangs open after navigating. */
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Mobile menu toggle - hidden on desktop via CSS */}
        <button
          type="button"
          className={styles.menuToggle}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="header-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={styles.menuBars} aria-hidden="true" />
        </button>

        {/* Nav + controls. `display: contents` on desktop, so these stay grid
            items of .inner exactly as before; on mobile the wrapper becomes the
            dropdown panel. */}
        <div className={styles.headerMenu} id="header-menu" data-open={menuOpen}>

        {/* Nav */}
        <nav className={styles.topnav} aria-label="Site navigation">
          {NAV_LINKS.filter((l) => !l.packs || l.packs.includes(packId)).map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
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
          {/* The Calamity mode rides under World rather than beside it - it is a
              layer on the world, not a peer of it. Out of flow, so it cannot
              stretch the header. */}
          <div className={styles.worldColumn}>
            <WorldSelect />
            {packId === 'calamity' && <CalamityModeToggle />}
          </div>

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

        </div>{/* .headerMenu */}

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
