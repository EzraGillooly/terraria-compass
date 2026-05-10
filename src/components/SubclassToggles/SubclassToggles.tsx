import type { ClassDef, Loadout } from '../../data/schema';
import styles from './SubclassToggles.module.css';

interface SubclassTogglesProps {
  classDef: ClassDef;
  isAllSelected: boolean;
  isSubclassEnabled: (subclassId: string) => boolean;
  loadout: Loadout;
  onClear: () => void;
  onToggle: (subclassId: string) => void;
}

function getSubclassCount(loadout: Loadout, subclassId: string) {
  const groups = [
    ...loadout.weapons,
    ...loadout.armor,
    ...loadout.accessories,
    ...loadout.buffs,
  ];

  return groups.filter((item) => item.subclass === subclassId).length;
}

export function SubclassToggles({
  classDef,
  isAllSelected,
  isSubclassEnabled,
  loadout,
  onClear,
  onToggle,
}: SubclassTogglesProps) {
  return (
    <section className={styles.wrap} aria-labelledby="subclass-toggles-heading">
      <h2 id="subclass-toggles-heading">Subclasses</h2>
      <div aria-label="Filter by subclass" className={styles.row} role="group">
        <button
          aria-pressed={isAllSelected}
          className={styles.pill}
          data-active={isAllSelected}
          onClick={onClear}
          type="button"
        >
          All
        </button>

        {classDef.subclasses.map((subclass) => {
          const count = getSubclassCount(loadout, subclass.id);

          return (
            <button
              aria-label={`${subclass.name} (${count})`}
              aria-pressed={!isAllSelected && isSubclassEnabled(subclass.id)}
              className={styles.pill}
              data-active={!isAllSelected && isSubclassEnabled(subclass.id)}
              disabled={count === 0}
              key={subclass.id}
              onClick={() => onToggle(subclass.id)}
              type="button"
            >
              {subclass.name} <span className={styles.count}>({count})</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
