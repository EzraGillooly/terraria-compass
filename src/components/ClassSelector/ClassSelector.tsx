import { Link } from 'react-router-dom';
import type { ClassDef, PhaseId } from '../../data/schema';
import styles from './ClassSelector.module.css';

interface ClassSelectorProps {
  activeClassId: string;
  classes: ClassDef[];
  phaseId: PhaseId;
}

export function ClassSelector({
  activeClassId,
  classes,
  phaseId,
}: ClassSelectorProps) {
  return (
    <section aria-labelledby="class-selector-heading">
      <h2 id="class-selector-heading">Classes</h2>
      <ul className={styles.list}>
        {classes.map((classDef) => (
          <li key={classDef.id}>
            <Link
              className={styles.link}
              data-active={classDef.id === activeClassId}
              to={`/phase/${phaseId}/${classDef.id}`}
            >
              <span className={styles.name}>{classDef.name}</span>
              <span className={styles.blurb}>{classDef.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
