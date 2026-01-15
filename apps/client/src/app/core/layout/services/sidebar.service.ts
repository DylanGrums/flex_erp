import { Injectable, signal } from '@angular/core';

export type SidebarTarget = 'desktop' | 'mobile';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly desktopOpen = signal(true);
  readonly mobileOpen = signal(false);

  toggle(target: SidebarTarget): void {
    if (target === 'desktop') {
      this.desktopOpen.update((v) => !v);
      return;
    }
    this.mobileOpen.update((v) => !v);
  }

  setMobile(open: boolean): void {
    this.mobileOpen.set(open);
  }
}
