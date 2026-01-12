import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const LEGACY_KEY = 'darkMode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _theme = signal<ThemeMode>('light');

  readonly theme = this._theme.asReadonly();
  readonly isDarkMode = computed(() => this._theme() === 'dark');

  init(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const storedTheme = this.readStoredTheme();
    const prefersDark =
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

    this.applyTheme(storedTheme ?? (prefersDark ? 'dark' : 'light'));
  }

  toggle(): void {
    const next = this._theme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    this._theme.set(theme);

    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }

  private readStoredTheme(): ThemeMode | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === 'true' || legacy === 'false') {
      const theme = legacy === 'true' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.removeItem(LEGACY_KEY);
      return theme;
    }

    return null;
  }
}
