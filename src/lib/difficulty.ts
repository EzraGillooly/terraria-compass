import { useEffect, useState } from 'react';

/* Only Classic and Expert are modeled. The site tracks two worlds - Classic
   ("normal") and Expert - and nothing it lists differs above Expert. */
export type DifficultyFilter = 'normal' | 'expert';

const STORAGE_KEY = 'tc.difficultyFilter';

function readStoredDifficulty(): DifficultyFilter {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  // any retired third-difficulty value lands on Expert, which is what it
  // behaved as for everything this site shows
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
  const isExpertOnly = tags.includes('expert-only');
  return difficulty === 'expert' || !isExpertOnly;
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
  if (difficulty === 'expert') return true;
  return !(
    item.expertOnly === true
    || (item.markers ?? []).includes('expert')
    || (item.tags ?? []).some((t) => t === 'expert-only')
  );
}
