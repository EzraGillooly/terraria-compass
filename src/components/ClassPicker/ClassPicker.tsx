import type { ClassDef, ClassId } from '../../data/schema';
import styles from './ClassPicker.module.css';

interface ClassPickerProps {
  activeClassId: ClassId;
  classes: ClassDef[];
  onSelect: (id: ClassId) => void;
}

export function ClassPicker({ activeClassId, classes, onSelect }: ClassPickerProps) {
  return (
    <div className={styles.root} role="group" aria-label="Select class">
      {classes.map((cls) => (
        <button
          key={cls.id}
          type="button"
          className={styles.card}
          data-active={String(cls.id === activeClassId)}
          aria-pressed={cls.id === activeClassId}
          onClick={() => onSelect(cls.id as ClassId)}
        >
          <span className={styles.name}>{cls.name}</span>
          <span className={styles.blurb}>{cls.blurb}</span>
        </button>
      ))}
    </div>
  );
}
