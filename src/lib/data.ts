import preBossesLoadoutsJson from '../data/loadouts/pre-bosses.json';
import preCultistLoadoutsJson from '../data/loadouts/pre-cultist.json';
import endgameLoadoutsJson from '../data/loadouts/endgame.json';
import preGolemLoadoutsJson from '../data/loadouts/pre-golem.json';
import preMechLoadoutsJson from '../data/loadouts/pre-mech.json';
import preMoonlordLoadoutsJson from '../data/loadouts/pre-moonlord.json';
import prePlanteraLoadoutsJson from '../data/loadouts/pre-plantera.json';
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
import { devParse } from '../data/parse';

export const phases = devParse(PhaseCollection, phasesJson);
export const classes = devParse(ClassCollection, classesJson);
export const loadouts = devParse(LoadoutCollection, [
  ...preBossesLoadoutsJson,
  ...preCultistLoadoutsJson,
  ...endgameLoadoutsJson,
  ...preGolemLoadoutsJson,
  ...preMechLoadoutsJson,
  ...preMoonlordLoadoutsJson,
  ...prePlanteraLoadoutsJson,
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
