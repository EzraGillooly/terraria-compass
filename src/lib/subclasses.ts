import { useEffect, useMemo, useState } from 'react';

const STORAGE_PREFIX = 'tc.subclass.';

function parseStoredValue(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

export function useSubclassFilters(classId: string) {
  const storageKey = `${STORAGE_PREFIX}${classId}`;
  const [selectionsByClass, setSelectionsByClass] = useState<
    Record<string, string[]>
  >({});
  const selectedSubclasses =
    selectionsByClass[classId] ??
    parseStoredValue(window.localStorage.getItem(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(selectedSubclasses));
  }, [selectedSubclasses, storageKey]);

  const selectedSubclassSet = useMemo(
    () => new Set(selectedSubclasses),
    [selectedSubclasses],
  );

  // Exclusive select: choosing a subclass turns off every other one.
  // Re-clicking the active subclass clears back to "All".
  function toggleSubclass(subclassId: string) {
    setSelectionsByClass((currentSelections) => {
      const current = currentSelections[classId] ?? selectedSubclasses;
      const isOnlyActive = current.length === 1 && current[0] === subclassId;
      return {
        ...currentSelections,
        [classId]: isOnlyActive ? [] : [subclassId],
      };
    });
  }

  function clearSubclassFilters() {
    setSelectionsByClass((currentSelections) => ({
      ...currentSelections,
      [classId]: [],
    }));
  }

  function isSubclassEnabled(subclassId: string) {
    return selectedSubclassSet.size === 0 || selectedSubclassSet.has(subclassId);
  }

  return {
    clearSubclassFilters,
    isAllSelected: selectedSubclassSet.size === 0,
    isSubclassEnabled,
    selectedSubclassSet,
    toggleSubclass,
  };
}
