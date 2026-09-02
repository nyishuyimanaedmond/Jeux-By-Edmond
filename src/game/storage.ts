import type { GameProgress, GameSettings } from "./types";

const STORAGE_KEY = "jeux_by_edmond_save_v1";

export const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  graphicsQuality: "medium",
  isFullscreen: false,
};

export const DEFAULT_PROGRESS: GameProgress = {
  unlockedLevels: [1],
  completedLevels: [],
  levelResults: {},
  selectedCarId: "rouge",
  settings: { ...DEFAULT_SETTINGS },
};

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      unlockedLevels: parsed.unlockedLevels || [1],
      completedLevels: parsed.completedLevels || [],
      levelResults: parsed.levelResults || {},
      selectedCarId: parsed.selectedCarId || "rouge",
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function resetProgress(): GameProgress {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_PROGRESS };
}
