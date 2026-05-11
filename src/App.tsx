import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { PhaseTimeline } from './components/PhaseTimeline';
import { ClassPicker } from './components/ClassPicker';
import { DifficultyToggle } from './components/DifficultyToggle';
import { SubclassToggles } from './components/SubclassToggles';
import { LoadoutGrid } from './components/LoadoutGrid';
import { classes, getLoadoutByPhaseAndClass, phases } from './lib/data';
import { useDifficultyFilter } from './lib/difficulty';
import { useSubclassFilters } from './lib/subclasses';
import type { ClassId, PhaseId } from './data/schema';
import styles from './App.module.css';

export default function App() {
  const [phaseId, setPhaseId] = useState<PhaseId>('pre-bosses');
  const [classId, setClassId] = useState<ClassId>('melee');
  const { difficulty, setDifficulty } = useDifficultyFilter();

  const phase = phases.find((p) => p.id === phaseId)!;
  const classDef = classes.find((c) => c.id === classId)!;
  const loadout = getLoadoutByPhaseAndClass(phaseId, classId);

  const {
    clearSubclassFilters,
    isAllSelected,
    isSubclassEnabled,
    selectedSubclassSet,
    toggleSubclass,
  } = useSubclassFilters(classId);

  // Dummy loadout shape for SubclassToggles when loadout is missing
  const safeLoadout = loadout ?? {
    phase: phaseId,
    class: classId,
    weapons: [],
    armor: [],
    accessories: [],
    buffs: [],
  };

  return (
    <AppShell topBar={<DifficultyToggle difficulty={difficulty} onChange={setDifficulty} />}>
      <PhaseTimeline
        activePhaseId={phaseId}
        onSelect={setPhaseId}
        phase={phase}
        phases={phases}
      />

      <section className={styles.classSection}>
        <ClassPicker
          activeClassId={classId}
          classes={classes}
          onSelect={setClassId}
        />
        {classDef.subclasses.length > 0 && (
          <SubclassToggles
            classDef={classDef}
            isAllSelected={isAllSelected}
            isSubclassEnabled={isSubclassEnabled}
            loadout={safeLoadout}
            onClear={clearSubclassFilters}
            onToggle={toggleSubclass}
          />
        )}
      </section>

      {loadout ? (
        <LoadoutGrid
          difficulty={difficulty}
          loadout={loadout}
          selectedSubclassSet={selectedSubclassSet}
        />
      ) : (
        <p className={styles.noLoadout}>
          No loadout authored for this phase and class yet.
        </p>
      )}
    </AppShell>
  );
}
