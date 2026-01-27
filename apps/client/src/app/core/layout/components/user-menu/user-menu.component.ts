import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import {
  Book,
  Check,
  Circle,
  Clock,
  Ellipsis,
  Keyboard,
  LogOut,
  LucideAngularModule,
  User,
  X,
} from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { AuthFacade } from '@flex-erp/auth/data-access';
import { ThemeService, ThemeMode } from './theme.service';
import { ShortcutsService } from '../nav-item/shortcuts.service';
import { TranslocoModule } from '@jsverse/transloco';
import {
  FlexDialogComponent,
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuSeparatorDirective,
  FlexDropdownMenuTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FlexDialogComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexDropdownMenuSeparatorDirective,
    LucideAngularModule,
    TranslocoModule,
  ],
  templateUrl: './user-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  readonly User = User;
  readonly Book = Book;
  readonly Clock = Clock;
  readonly Keyboard = Keyboard;
  readonly Check = Check;
  readonly Circle = Circle;
  readonly LogOut = LogOut;
  readonly Ellipsis = Ellipsis;
  readonly X = X;

  private auth = inject(AuthFacade);
  readonly theme = inject(ThemeService);
  readonly shortcuts = inject(ShortcutsService);

  readonly user = toSignal(this.auth.user$, { initialValue: null });
  readonly shortcutsOpen = signal(false);
  readonly searchValue = signal('');

  readonly displayName = computed(() => {
    const u = this.user();
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

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchValue.set(target?.value ?? '');
  }

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
    await firstValueFrom(this.auth.logout());
    window.location.href = '/login';
  }

  isTheme(mode: ThemeMode): boolean {
    return this.theme.mode === mode;
  }
}
