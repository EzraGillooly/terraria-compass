import type { DifficultyFilter } from '../../lib/difficulty';
import styles from './DifficultyToggle.module.css';

const OPTIONS: Array<{ value: DifficultyFilter; label: string }> = [
  { value: 'normal', label: 'Classic' },
  { value: 'expert', label: 'Expert' },
  { value: 'master', label: 'Master' },
];

interface DifficultyToggleProps {
  difficulty: DifficultyFilter;
  onChange: (difficulty: DifficultyFilter) => void;
}

export function DifficultyToggle({ difficulty, onChange }: DifficultyToggleProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerInner} role="group" aria-label="Select world difficulty">
        <span className={styles.bannerLabel}>World Difficulty</span>
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={styles.option}
            data-active={String(difficulty === value)}
            aria-pressed={difficulty === value}
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
