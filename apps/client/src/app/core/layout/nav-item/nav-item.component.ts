import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { TooltipModule } from 'primeng/tooltip';

import { NavItem } from '../main-layout/nav.models';
import { ShortcutsService } from './shortcuts.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule],
  templateUrl: './nav-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItemComponent {
  private readonly router = inject(Router);
  private readonly shortcuts = inject(ShortcutsService);

  // ✅ use input() signal so it's always safe + reactive
  readonly item = input.required<NavItem>();

  readonly open = signal(false);
  readonly pathname = signal<string>('/');

  readonly isSetting = computed(() => (this.item().type ?? 'core') === 'setting');

  readonly tooltipHtml = computed(() => {
    const s = this.shortcuts.find(this.item().to);
    if (!s?.keys?.Mac?.length) return null;

    const keys = s.keys.Mac
      .map((k) => `<span class="px-1 py-0.5 rounded border text-xs">${k}</span>`)
      .join(' ');

    return `
      <div class="flex items-center justify-between gap-x-2 whitespace-nowrap">
        <span>${escapeHtml(s.label)}</span>
        <div class="flex items-center gap-x-1">${keys}</div>
      </div>
    `.trim();
  });

  constructor() {
    this.pathname.set(this.router.url);

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.pathname.set(this.router.url);
    });

    // ✅ recompute open whenever route OR input changes
    effect(() => {
      const _ = this.pathname(); // track
      const __ = this.item(); // track
      this.open.set(this.getIsOpen());
    });
  }

  toggleOpen(): void {
    this.open.update((v) => !v);
  }

  private getIsOpen(): boolean {
    const item = this.item();
    const to = item?.to ?? '';
    const items = item?.items ?? [];
    const p = this.pathname();

    return [to, ...items.map((i) => i.to)].filter(Boolean).some((x) => p.startsWith(x));
  }

  isActive(path: string): boolean {
    const type = this.item().type ?? 'core';
    if (type === 'core' || type === 'setting') return this.pathname().startsWith(path);
    return this.pathname() === path;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')
    .replace('"', '&quot;')
    .replace("'", '&#039;');
}
