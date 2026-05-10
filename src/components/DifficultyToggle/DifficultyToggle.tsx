import type { DifficultyFilter } from '../../lib/difficulty';
import styles from './DifficultyToggle.module.css';

const options: DifficultyFilter[] = ['normal', 'expert', 'master'];

interface DifficultyToggleProps {
  difficulty: DifficultyFilter;
  onChange: (difficulty: DifficultyFilter) => void;
}

export function DifficultyToggle({
  difficulty,
  onChange,
}: DifficultyToggleProps) {
  return (
    <section className={styles.wrap} aria-labelledby="difficulty-toggle-heading">
      <h2 id="difficulty-toggle-heading">Difficulty</h2>
      <div className={styles.row} role="group" aria-label="Filter by difficulty">
        {options.map((option) => (
          <button
            aria-pressed={difficulty === option}
            className={styles.button}
            data-active={difficulty === option}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option[0]!.toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </section>
  );
}
