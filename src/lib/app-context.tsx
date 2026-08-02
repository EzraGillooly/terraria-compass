import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { DifficultyFilter } from './difficulty';
import { DEFAULT_PACK_ID, getPackMeta, isPackAllowedOnPath, loadPack, type Pack, type PackMeta } from '../data/packs';
import { Loading } from '../components/Loading';

const PACK_STORAGE_KEY = 'tc.pack';
const CLASS_STORAGE_KEY = 'tc.class';
const CAL_MODE_STORAGE_KEY = 'tc.calamityMode';
const PROGRESSION_KEY = 'tc.progressionMode';
/* Progression is saved per pack - each mod has its own boss roster, so the
   furthest boss you have reached in Calamity is not the same as in vanilla. */
const progressKey = (pid: string) => `tc.progress.${pid}`;

/* Calamity's own difficulty, which is a separate axis from the world type: it is
   toggled through the Difficulty Indicator on top of an existing world, and
   "Revengeance Mode can only be activated from Expert Mode", with Death reached
   from Revengeance. So it is not two more entries in the World selector - a
   world is Classic or Expert, and this rides on top. */
export type CalamityMode = 'off' | 'revengeance' | 'death';

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
  /** Calamity's Revengeance/Death, layered on top of an Expert world rather
      than being a world type of its own. Always 'off' outside Calamity. */
  calamityMode: CalamityMode;
  setCalamityMode: (m: CalamityMode) => void;
  /** Progression Mode: when on, the boss roadmap locks every boss more than one
      step ahead of your furthest, so you unlock them one at a time. Off by
      default; the toggle lives under the World selector. */
  progressionMode: boolean;
  setProgressionMode: (v: boolean) => void;
  /** the furthest-reached boss id for the active pack (null = none yet). Advance
      it by clicking the next boss; pass null to reset. Persisted per pack. */
  progress: string | null;
  setProgress: (bossId: string | null) => void;
  /** the resolved active pack - every page reads its data from here. Never null
      to a consumer: the provider withholds children until the active pack has
      loaded, so this is always the data for the current packId. */
  pack: Pack;
}

const AppContext = createContext<AppState | null>(null);

function readStoredPack(): string {
  const stored = window.localStorage.getItem(PACK_STORAGE_KEY);
  return stored && getPackMeta(stored).available ? stored : DEFAULT_PACK_ID;
}

function readStoredCalamityMode(): CalamityMode {
  const stored = window.localStorage.getItem(CAL_MODE_STORAGE_KEY);
  return stored === 'revengeance' || stored === 'death' ? stored : 'off';
}

function readStoredClass(meta: PackMeta): string {
  const stored = window.localStorage.getItem(CLASS_STORAGE_KEY);
  return stored && meta.classIds.includes(stored)
    ? stored
    : meta.classIds[0] ?? 'melee';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('normal');
  const [isDayMode, setIsDayMode] = useState(true);
  const [packId, setPackIdState] = useState<string>(() => readStoredPack());
  const [classId, setClassId] = useState<string>(() => readStoredClass(getPackMeta(readStoredPack())));
  const [calamityChoice, setCalamityMode] = useState<CalamityMode>(() => readStoredCalamityMode());
  const [progressionMode, setProgressionMode] = useState<boolean>(
    () => window.localStorage.getItem(PROGRESSION_KEY) === '1',
  );
  const [progress, setProgressState] = useState<string | null>(
    () => window.localStorage.getItem(progressKey(readStoredPack())) || null,
  );
  const setProgress = (bossId: string | null) => {
    setProgressState(bossId);
    if (bossId) window.localStorage.setItem(progressKey(packId), bossId);
    else window.localStorage.removeItem(progressKey(packId));
  };

  /* The active pack's data, loaded lazily. Held in state and swapped only once
     the dynamic import resolves, so `pack` always matches `packId` by the time a
     page reads it - see the gate below. */
  const [pack, setPack] = useState<Pack | null>(null);
  useEffect(() => {
    let stale = false;
    loadPack(packId).then((p) => { if (!stale) setPack(p); });
    return () => { stale = true; };
  }, [packId]);

  /* Revengeance requires an Expert world. Rather than clearing the reader's
     choice when they drop to Classic, it simply does not apply - so switching
     back to Expert restores what they had picked. */
  const calamityMode: CalamityMode = difficulty === 'expert' ? calamityChoice : 'off';

  // Switching packs: clamp a now-invalid difficulty (e.g. Calamity's Revengeance
  // → vanilla) or class (Rogue → vanilla) here rather than in an effect. Uses
  // pack metadata, which is loaded synchronously, so the clamp does not wait on
  // the pack's data.
  const setPackId = (id: string) => {
    setPackIdState(id);
    const next = getPackMeta(id);
    setDifficulty((cur) =>
      next.difficulties.some((d) => d.value === cur) ? cur : 'normal',
    );
    setClassId((cur) =>
      next.classIds.includes(cur) ? cur : next.classIds[0] ?? cur,
    );
    // Revengeance is Calamity's, so leaving the pack turns it off
    if (id !== 'calamity') setCalamityMode('off');
    // Swap in the new pack's saved progression (each pack tracks its own).
    setProgressState(window.localStorage.getItem(progressKey(id)) || null);
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

  // Page-scoped packs (Thorium is Bosses-only): if the active pack is not allowed
  // on the page you land on - by navigating, or by opening a deep link with the
  // pack still stored - fall back to the default so the restricted pages never
  // render it. The header also hides it from the mod menu off its pages.
  const { pathname } = useLocation();
  useEffect(() => {
    // Resetting the pack from an effect is intended: the page changed under us,
    // so a pack that isn't allowed here has to follow it back to the default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isPackAllowedOnPath(packId, pathname)) setPackId(DEFAULT_PACK_ID);
  }, [pathname, packId]);

  useEffect(() => {
    window.localStorage.setItem(CLASS_STORAGE_KEY, classId);
  }, [classId]);

  useEffect(() => {
    window.localStorage.setItem(CAL_MODE_STORAGE_KEY, calamityChoice);
  }, [calamityChoice]);

  useEffect(() => {
    window.localStorage.setItem(PROGRESSION_KEY, progressionMode ? '1' : '0');
  }, [progressionMode]);

  useEffect(() => {
    document.documentElement.dataset.calamityMode =
      calamityMode === 'off' ? '' : calamityMode;
  }, [calamityMode]);

  /* Withhold children until the active pack's data is in hand, so every consumer
     of `pack` sees a non-null value that matches the current packId - no page
     needs to guard against a half-loaded pack or one from the pack it just left.
     The splash shows only the first time each pack is opened; loadPack caches,
     so later switches resolve on the next tick. */
  if (!pack || pack.id !== packId) {
    return <Loading label="Loading data…" />;
  }

  return (
    <AppContext.Provider
      value={{
        difficulty, setDifficulty, isDayMode, setIsDayMode,
        packId, setPackId, classId, setClassId,
        calamityMode, setCalamityMode,
        progressionMode, setProgressionMode, progress, setProgress,
        pack,
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
