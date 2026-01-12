import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { AuthService } from './auth.service';
import { ThemeService, ThemeMode } from './theme.service';
import { ShortcutsService } from '../nav-item/shortcuts.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, DividerModule, DialogModule, InputTextModule, PopoverModule],
  templateUrl: './user-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly shortcuts = inject(ShortcutsService);

  readonly shortcutsOpen = signal(false);
  readonly searchValue = signal('');

  readonly displayName = computed(() => {
    const u = this.auth.me();
    if (!u) return '…';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.email;
  });

  readonly fallback = computed(() => (this.displayName()?.[0]?.toUpperCase() ?? 'U'));

  readonly filteredShortcuts = computed(() => {
    const q = this.searchValue().trim().toLowerCase();
    if (!q) return this.shortcuts.shortcuts;
    return this.shortcuts.shortcuts.filter((s) => s.label.toLowerCase().includes(q));
  });

  openShortcuts(): void {
    this.shortcutsOpen.set(true);
  }

  closeShortcuts(): void {
    this.shortcutsOpen.set(false);
  }

  setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    window.location.href = '/login';
  }

  isTheme(mode: ThemeMode): boolean {
    return this.theme.mode === mode;
  }
}
