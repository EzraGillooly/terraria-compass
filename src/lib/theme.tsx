import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** @deprecated use resolvedTheme */
  theme: ResolvedTheme;
  /** @deprecated use setMode */
  setTheme: (theme: ResolvedTheme) => void;
  /** @deprecated use setMode */
  toggle: () => void;
}

const STORAGE_KEY = 'tc.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredMode());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [resolvedTheme, mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      theme: resolvedTheme,
      setMode: setModeState,
      setTheme: (t: ResolvedTheme) => setModeState(t),
      toggle: () => {
        setModeState((current) => {
          if (current === 'light') return 'dark';
          if (current === 'dark') return 'system';
          return 'light';
        });
      },
    }),
    [mode, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
