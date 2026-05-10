import { ClassSelector } from '../components/ClassSelector';
import { DifficultyToggle } from '../components/DifficultyToggle';
import { LoadoutGrid } from '../components/LoadoutGrid';
import { PhaseGuide } from '../components/PhaseGuide';
import { PhaseSelector } from '../components/PhaseSelector';
import { SubclassToggles } from '../components/SubclassToggles';
import { Navigate, useParams } from 'react-router-dom';
import {
  classes,
  getClassById,
  getLoadoutByPhaseAndClass,
  getPhaseById,
  phases,
} from '../lib/data';
import { useDifficultyFilter } from '../lib/difficulty';
import { useSubclassFilters } from '../lib/subclasses';
import type { ClassId, PhaseId } from '../data/schema';

export function Phase() {
  const { phaseId, classId } = useParams();
  const { difficulty, setDifficulty } = useDifficultyFilter();
  const {
    clearSubclassFilters,
    isAllSelected,
    isSubclassEnabled,
    selectedSubclassSet,
    toggleSubclass,
  } = useSubclassFilters(classId ?? 'melee');
  const phase = phaseId ? getPhaseById(phaseId) : undefined;
  const classDef = classId ? getClassById(classId) : undefined;

  if (!phase || !classDef) {
    return <Navigate to="/404" replace />;
  }

  const loadout = getLoadoutByPhaseAndClass(phase.id as PhaseId, classDef.id as ClassId);

  return (
    <>
      <h1>
        {phase.name} · {classDef.name}
      </h1>
      <p>{phase.description}</p>
      <p>
        This phase ends when: <strong>{phase.triggeredBy}</strong>
      </p>

      <PhaseSelector
        activePhaseId={phase.id}
        classId={classDef.id}
        phases={phases}
      />

      <ClassSelector
        activeClassId={classDef.id}
        classes={classes}
        phaseId={phase.id}
      />

      {loadout ? (
        <>
          <DifficultyToggle difficulty={difficulty} onChange={setDifficulty} />
          <SubclassToggles
            classDef={classDef}
            isAllSelected={isAllSelected}
            isSubclassEnabled={isSubclassEnabled}
            loadout={loadout}
            onClear={clearSubclassFilters}
            onToggle={toggleSubclass}
          />
        </>
      ) : null}

      <PhaseGuide phase={phase} />

      {loadout ? (
        <LoadoutGrid
          difficulty={difficulty}
          loadout={loadout}
          selectedSubclassSet={selectedSubclassSet}
        />
      ) : (
        <section aria-labelledby="phase-loadout-placeholder-heading">
          <h2 id="phase-loadout-placeholder-heading">Loadout</h2>
          <p>Loadout content for this phase and class is coming next.</p>
        </section>
      )}
    </>
  );
}
