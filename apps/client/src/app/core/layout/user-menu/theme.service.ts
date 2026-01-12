import { Injectable } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'themeMode';

  get mode(): ThemeMode {
    const v = (localStorage.getItem(this.key) as ThemeMode | null) ?? 'system';
    return v;
  }

  setMode(mode: ThemeMode): void {
    localStorage.setItem(this.key, mode);
    this.apply(mode);
  }

  apply(mode: ThemeMode): void {
    const root = document.documentElement;

    if (mode === 'system') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
      root.classList.toggle('dark', prefersDark);
      return;
    }

    root.classList.toggle('dark', mode === 'dark');
  }
}
