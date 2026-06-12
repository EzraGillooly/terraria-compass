import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { DifficultyFilter } from './difficulty';

interface AppState {
  difficulty: DifficultyFilter;
  setDifficulty: (d: DifficultyFilter) => void;
  isDayMode: boolean;
  setIsDayMode: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('normal');
  const [isDayMode, setIsDayMode] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.difficulty =
      difficulty === 'normal' ? '' : difficulty;
  }, [difficulty]);

  return (
    <AppContext.Provider value={{ difficulty, setDifficulty, isDayMode, setIsDayMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
