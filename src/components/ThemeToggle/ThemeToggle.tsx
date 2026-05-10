import { type ThemeMode, useTheme } from '../../lib/theme';
import styles from './ThemeToggle.module.css';

const modes: Array<{ value: ThemeMode; glyph: string; label: string }> = [
  { value: 'light', glyph: '☀', label: 'Light theme' },
  { value: 'system', glyph: '⊙', label: 'System theme' },
  { value: 'dark', glyph: '☾', label: 'Dark theme' },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className={styles.group} role="group" aria-label="Theme selection">
      {modes.map(({ value, glyph, label }) => (
        <button
          key={value}
          type="button"
          className={styles.button}
          data-active={String(mode === value)}
          aria-label={label}
          aria-pressed={mode === value}
          onClick={() => setMode(value)}
        >
          <span className={styles.glyph} aria-hidden="true">
            {glyph}
          </span>
        </button>
      ))}
    </div>
  );
}
