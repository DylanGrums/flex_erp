import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DividerModule } from 'primeng/divider';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';

import { NavItemComponent } from '../../components/nav-item/nav-item.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { ShortcutsService } from '../../components/nav-item/shortcuts.service';

import { SearchService } from '../../services/search.service';
import { NavItem } from '../../types/nav.models';

import { FlexDividerComponent } from '@flex-erp/shared/ui';

import {
  RdxDropdownMenuTriggerDirective,
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective,
} from '@radix-ng/primitives/dropdown-menu';
import { NAV_MANIFESTS } from '@flex-erp/shared/nav';


@Component({
  selector: 'app-main-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    DividerModule,
    PopoverModule,
    ButtonModule,
    NavItemComponent,
    UserMenuComponent,
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective,
    FlexDividerComponent
  ],
  templateUrl: './main-sidebar.component.html',
  styles: [
    `
      :host {
        @apply w-full flex;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidebarComponent {
  readonly search = inject(SearchService);
  readonly shortcuts = inject(ShortcutsService);

  private readonly manifests = inject(NAV_MANIFESTS, { optional: true }) ?? [];

  readonly coreRoutes = computed<NavItem[]>(() => {
    const sorted = [...this.manifests].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return sorted.flatMap((m) => m.items as NavItem[]);
  });


  toggleSearch(): void {
    this.search.toggle();
  }
}
