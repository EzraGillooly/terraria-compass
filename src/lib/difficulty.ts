import { useEffect, useState } from 'react';

export type DifficultyFilter = 'normal' | 'expert' | 'master';

const STORAGE_KEY = 'tc.difficultyFilter';

function readStoredDifficulty(): DifficultyFilter {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return storedValue === 'expert' || storedValue === 'master'
    ? storedValue
    : 'normal';
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
  const isMasterOnly = tags.includes('master-only');

  if (difficulty === 'master') {
    return true;
  }

  if (difficulty === 'expert') {
    return !isMasterOnly;
  }

  return !isExpertOnly && !isMasterOnly;
}
