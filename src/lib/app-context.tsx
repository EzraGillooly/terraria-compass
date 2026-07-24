import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { DifficultyFilter } from './difficulty';
import { DEFAULT_PACK_ID, getPack, type Pack } from '../data/packs';

const PACK_STORAGE_KEY = 'tc.pack';
const CLASS_STORAGE_KEY = 'tc.class';

interface AppState {
  difficulty: DifficultyFilter;
  setDifficulty: (d: DifficultyFilter) => void;
  isDayMode: boolean;
  setIsDayMode: (v: boolean) => void;
  /** active content-pack id (mod selector) */
  packId: string;
  setPackId: (id: string) => void;
  /** active class (header selector); packs share Melee/Ranger/Mage/Summoner,
      Calamity adds Rogue, so this is clamped when the pack changes */
  classId: string;
  setClassId: (id: string) => void;
  /** the resolved active pack — every page reads its data from here */
  pack: Pack;
}

const AppContext = createContext<AppState | null>(null);

function readStoredPack(): string {
  const stored = window.localStorage.getItem(PACK_STORAGE_KEY);
  return stored && getPack(stored).available ? stored : DEFAULT_PACK_ID;
}

function readStoredClass(pack: Pack): string {
  const stored = window.localStorage.getItem(CLASS_STORAGE_KEY);
  return stored && pack.classes.some((c) => c.id === stored)
    ? stored
    : pack.classes[0]?.id ?? 'melee';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('normal');
  const [isDayMode, setIsDayMode] = useState(true);
  const [packId, setPackIdState] = useState<string>(() => readStoredPack());
  const [classId, setClassId] = useState<string>(() => readStoredClass(getPack(readStoredPack())));

  const pack = getPack(packId);

  // Switching packs: clamp a now-invalid difficulty (e.g. Calamity's Revengeance
  // → vanilla) or class (Rogue → vanilla) here rather than in an effect.
  const setPackId = (id: string) => {
    setPackIdState(id);
    const next = getPack(id);
    setDifficulty((cur) =>
      next.difficulties.some((d) => d.value === cur) ? cur : 'normal',
    );
    setClassId((cur) =>
      next.classes.some((c) => c.id === cur) ? cur : next.classes[0]?.id ?? cur,
    );
  };

  useEffect(() => {
    document.documentElement.dataset.difficulty =
      difficulty === 'normal' ? '' : difficulty;
  }, [difficulty]);

  useEffect(() => {
    document.documentElement.dataset.mode = isDayMode ? 'day' : 'dark';
  }, [isDayMode]);

  useEffect(() => {
    window.localStorage.setItem(PACK_STORAGE_KEY, packId);
    document.documentElement.dataset.pack = packId;
  }, [packId]);

  useEffect(() => {
    window.localStorage.setItem(CLASS_STORAGE_KEY, classId);
  }, [classId]);

  return (
    <AppContext.Provider
      value={{
        difficulty, setDifficulty, isDayMode, setIsDayMode,
        packId, setPackId, classId, setClassId, pack,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

/** Convenience accessor for the active content pack. */
export function usePack(): Pack {
  return useAppState().pack;
}
