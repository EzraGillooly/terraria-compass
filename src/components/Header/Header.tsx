import { ThemeToggle } from '../ThemeToggle';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">✦</span>
          <span className={styles.brandText}>
            <h1 className={styles.title}>Terraria Compass</h1>
            <span className={styles.subtitle}>Class builds by progression phase</span>
          </span>
        </div>

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
