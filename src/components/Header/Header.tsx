import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../../lib/app-context';
import type { DifficultyFilter } from '../../lib/difficulty';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/bosses',   label: 'Bosses'   },
  { to: '/loadouts', label: 'Loadouts' },
  { to: '/crafting', label: 'Crafting' },
];

const DIFF_OPTIONS = [
  { value: 'normal' as const, label: 'Classic' },
  { value: 'expert' as const, label: 'Expert'  },
  { value: 'master' as const, label: 'Master'  },
];

/* Custom World difficulty dropdown — menu pops out below the control (a native
   <select> can't control its popup placement). */
function WorldSelect() {
  const { difficulty, setDifficulty } = useAppState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = DIFF_OPTIONS.find((o) => o.value === difficulty);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
          {DIFF_OPTIONS.map(({ value, label }) => (
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

interface HeaderProps {
  /** 'photo' = transparent overlay on hero; 'paper' = solid bar */
  variant?: 'photo' | 'paper';
}

export function Header({ variant = 'paper' }: HeaderProps) {
  const { isDayMode, setIsDayMode } = useAppState();
  const isPhoto = variant === 'photo';

  return (
    <header className={`${styles.header} ${isPhoto ? styles.onPhoto : styles.onPaper}`}>
      <div className={styles.inner}>

        {/* Brand */}
        <NavLink to="/" className={styles.brand} aria-label="Terraria Compass — home">
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
          {NAV_LINKS.map(({ to, label }) => (
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
          {/* World difficulty */}
          <WorldSelect />

          {/* Day / night — disabled for now */}
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
