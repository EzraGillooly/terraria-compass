import { useTheme } from '../../lib/theme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      onClick={toggle}
    >
      <span className={styles.glyph} aria-hidden="true">
        {isDark ? '☾' : '☀'}
      </span>
    </button>
  );
}
