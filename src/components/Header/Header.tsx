import { Link, NavLink } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} to="/">
          <span className={styles.brandMark} aria-hidden="true">
            ✦
          </span>
          <span className={styles.brandText}>
            <span className={styles.title}>Terraria Compass</span>
            <span className={styles.subtitle}>
              Class builds by progression phase
            </span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <NavLink className={styles.navLink} to="/">
            Home
          </NavLink>
          <NavLink className={styles.navLink} to="/phase/pre-bosses/melee">
            Phases
          </NavLink>
          <NavLink className={styles.navLink} to="/about">
            About
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <a
            className={styles.repoLink}
            href="https://github.com/ezragillooly/terraria-compass"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
