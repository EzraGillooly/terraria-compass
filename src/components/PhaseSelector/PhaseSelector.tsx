import { Link } from 'react-router-dom';
import type { ClassId, PhaseDef } from '../../data/schema';
import styles from './PhaseSelector.module.css';

interface PhaseSelectorProps {
  activePhaseId: string;
  classId: ClassId;
  phases: PhaseDef[];
}

export function PhaseSelector({
  activePhaseId,
  classId,
  phases,
}: PhaseSelectorProps) {
  return (
    <section aria-labelledby="phase-selector-heading">
      <h2 id="phase-selector-heading">Phases</h2>
      <ul className={styles.list}>
        {phases.map((phase) => (
          <li key={phase.id}>
            <Link
              className={styles.link}
              data-active={phase.id === activePhaseId}
              to={`/phase/${phase.id}/${classId}`}
            >
              <span className={styles.name}>{phase.name}</span>
              <span className={styles.description}>{phase.triggeredBy}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
