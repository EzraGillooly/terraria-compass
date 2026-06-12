import { NavLink } from 'react-router-dom';
import styles from './Footer.module.css';

const NAV_LINKS = [
  { to: '/',         label: 'Home'     },
  { to: '/bosses',   label: 'Bosses'   },
  { to: '/biomes',   label: 'Biomes'   },
  { to: '/loadouts', label: 'Loadouts' },
  { to: '/crafting', label: 'Crafting' },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandDot} aria-hidden="true" />
          Terraria Compass
        </div>
        <nav className={styles.links} aria-label="Footer navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={styles.link}>{label}</NavLink>
          ))}
        </nav>
        <p className={styles.note}>
          Fan project — not affiliated with Re-Logic.
          Icons adapted from <a href="https://terraria.wiki.gg" rel="noopener noreferrer" target="_blank">terraria.wiki.gg</a> under CC BY-NC-SA 3.0.
        </p>
      </div>
    </footer>
  );
}
