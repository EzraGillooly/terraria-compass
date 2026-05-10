import preBossesLoadoutsJson from '../data/loadouts/pre-bosses.json';
import preMechLoadoutsJson from '../data/loadouts/pre-mech.json';
import preSkeletronLoadoutsJson from '../data/loadouts/pre-skeletron.json';
import preWofLoadoutsJson from '../data/loadouts/pre-wof.json';
import classesJson from '../data/classes.json';
import phasesJson from '../data/phases.json';
import {
  ClassCollection,
  LoadoutCollection,
  type ClassId,
  type PhaseId,
  PhaseCollection,
} from '../data/schema';

export const phases = PhaseCollection.parse(phasesJson);
export const classes = ClassCollection.parse(classesJson);
export const loadouts = LoadoutCollection.parse([
  ...preBossesLoadoutsJson,
  ...preMechLoadoutsJson,
  ...preSkeletronLoadoutsJson,
  ...preWofLoadoutsJson,
]);

export function getPhaseById(phaseId: string) {
  return phases.find((phase) => phase.id === phaseId);
}

export function getClassById(classId: string) {
  return classes.find((classDef) => classDef.id === classId);
}

export function getLoadoutByPhaseAndClass(phaseId: PhaseId, classId: ClassId) {
  return loadouts.find(
    (loadout) => loadout.phase === phaseId && loadout.class === classId,
  );
}
