import { NavLink } from 'react-router-dom';
import { useAppState } from '../../lib/app-context';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/bosses',   label: 'Bosses'   },
  { to: '/biomes',   label: 'Biomes'   },
  { to: '/loadouts', label: 'Loadouts' },
  { to: '/crafting', label: 'Crafting' },
];

const DIFF_OPTIONS = [
  { value: 'normal' as const, label: 'Classic' },
  { value: 'expert' as const, label: 'Expert'  },
  { value: 'master' as const, label: 'Master'  },
];

interface HeaderProps {
  /** 'photo' = transparent overlay on hero; 'paper' = sticky parchment */
  variant?: 'photo' | 'paper';
}

export function Header({ variant = 'paper' }: HeaderProps) {
  const { difficulty, setDifficulty, isDayMode, setIsDayMode } = useAppState();
  const isPhoto = variant === 'photo';

  return (
    <header className={`${styles.header} ${isPhoto ? styles.onPhoto : styles.onPaper}`}>
      <div className={styles.inner}>

        {/* Brand */}
        <NavLink to="/" className={styles.brand}>
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandName}>Terraria Compass</span>
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
        <div className={styles.topctrl}>
          {/* Difficulty segmented control */}
          <div className={styles.diffSeg} role="group" aria-label="World difficulty">
            {DIFF_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.diffPill} ${difficulty === value ? styles[`diff${label}`] : ''}`}
                aria-pressed={difficulty === value}
                onClick={() => setDifficulty(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Day / Night toggle */}
          <button
            type="button"
            className={`${styles.dayNight} ${isDayMode ? '' : styles.isNight}`}
            aria-label={isDayMode ? 'Switch to night' : 'Switch to day'}
            onClick={() => setIsDayMode(!isDayMode)}
          >
            <span className={styles.dnTrack}>
              <span className={styles.dnKnob} aria-hidden="true">
                {isDayMode ? '☀' : '☾'}
              </span>
            </span>
            <span>{isDayMode ? 'Day' : 'Night'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
