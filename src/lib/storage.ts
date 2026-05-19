import type { BrandPreset } from '../types';
import { DEFAULT_PRESETS } from '../data/presets';

const PRESETS_KEY = 'docforge_presets';
const LAST_THEME_KEY = 'docforge_last_theme';

export function getStoredPresets(): BrandPreset[] {
  try {
    const saved = localStorage.getItem(PRESETS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

export function savePresets(presets: BrandPreset[]): void {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function getLastTheme(): string {
  return localStorage.getItem(LAST_THEME_KEY) || 'dental-pro';
}

export function saveLastTheme(id: string): void {
  localStorage.setItem(LAST_THEME_KEY, id);
}
