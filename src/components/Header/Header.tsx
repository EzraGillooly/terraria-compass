import { NavLink } from 'react-router-dom';
import { useAppState } from '../../lib/app-context';
import type { DifficultyFilter } from '../../lib/difficulty';
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
  /** 'photo' = transparent overlay on hero; 'paper' = solid bar */
  variant?: 'photo' | 'paper';
}

export function Header({ variant = 'paper' }: HeaderProps) {
  const { difficulty, setDifficulty } = useAppState();
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

      </div>
    </header>
  );
}
