import { NavLink } from 'react-router-dom';
import { useAppState } from '../../lib/app-context';
import type { DifficultyFilter } from '../../lib/difficulty';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/bosses',   label: 'Bosses'   },
  { to: '/biomes',   label: 'Biomes'   },
  { to: '/loadouts', label: 'Loadouts' },
];

const DIFF_OPTIONS = [
  { value: 'normal' as const, label: 'Classic' },
  { value: 'expert' as const, label: 'Expert'  },
  { value: 'master' as const, label: 'Master'  },
];

interface HeaderProps {
  /** 'photo' = transparent overlay on hero; 'paper' = solid bar */
  variant?: 'photo' | 'paper';
}

export function Header({ variant = 'paper' }: HeaderProps) {
  const { difficulty, setDifficulty, isDayMode, setIsDayMode } = useAppState();
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
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Controls */}
        <div className={styles.controls}>
          {/* World difficulty */}
          <label className={styles.diffSelect}>
            <span className={styles.diffCap}>World</span>
            <select
              className={styles.diffField}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
              aria-label="World difficulty"
            >
              {DIFF_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          {/* Day / night */}
          <button
            type="button"
            className={styles.modeToggle}
            aria-pressed={!isDayMode}
            aria-label={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
            title={isDayMode ? 'Night mode' : 'Day mode'}
            onClick={() => setIsDayMode(!isDayMode)}
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
