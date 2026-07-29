import { useEffect, useState } from 'react';

/* Master is deliberately absent. Its only exclusive drops are mounts, pets and
   relics, none of which this site lists, so as a filter it was identical to
   Expert and just gave the reader a third button that changed nothing.
 *
 * Calamity's Revengeance and Death are selectable, and both sit *above* Expert:
 * "Revengeance Mode can only be activated from Expert Mode and thus provides
 * (or iterates upon) all the changes that Expert Mode brings", and Death is
 * reached from Revengeance. They therefore obtain everything Expert can.
 */
export type DifficultyFilter = 'normal' | 'expert' | 'revengeance' | 'death';

/* Everything Expert can reach, Revengeance and Death can too. Every gate in
   this file asks this rather than `=== 'expert'`, so selecting Revengeance no
   longer read as Classic - which hid Expert-only drops behind the *harder*
   setting and silently cost the reader a Demon Heart slot. */
const EXPERT_OR_ABOVE = new Set<DifficultyFilter>(['expert', 'revengeance', 'death']);

export function isExpertOrAbove(difficulty: DifficultyFilter) {
  return EXPERT_OR_ABOVE.has(difficulty);
}

const STORAGE_KEY = 'tc.difficultyFilter';

function readStoredDifficulty(): DifficultyFilter {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (storedValue === 'revengeance' || storedValue === 'death') return storedValue;
  // anyone still holding the retired 'master' lands on Expert, which is what
  // Master actually behaved as for everything this site shows
  if (storedValue === 'expert' || storedValue === 'master') return 'expert';
  return 'normal';
}

export function useDifficultyFilter() {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(() =>
    readStoredDifficulty(),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, difficulty);
  }, [difficulty]);

  return {
    difficulty,
    setDifficulty,
  };
}

export function isItemRelevantToDifficulty(
  tags: string[],
  difficulty: DifficultyFilter,
) {
  const isExpertOnly = tags.includes('expert-only') || tags.includes('master-only');
  return isExpertOrAbove(difficulty) || !isExpertOnly;
}

/**
 * Whether a Classic world can obtain the item at all.
 *
 * Drop rates do not vary by world difficulty - the wiki lists one rate per
 * drop - so the only real difference is obtainability: Treasure Bags exist
 * only in Expert and above, so anything dropped solely by a bag is out of
 * reach in Classic. `expertOnly` is set from the item's own drop table.
 */
export function isObtainable(
  item: { tags?: string[]; expertOnly?: boolean; markers?: string[] },
  difficulty: DifficultyFilter,
) {
  if (isExpertOrAbove(difficulty)) return true;
  return !(
    item.expertOnly === true
    || (item.markers ?? []).includes('expert')
    || (item.tags ?? []).some((t) => t === 'expert-only' || t === 'master-only')
  );
}
