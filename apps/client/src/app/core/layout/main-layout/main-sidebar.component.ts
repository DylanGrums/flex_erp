import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DividerModule } from 'primeng/divider';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';

import { NavItemComponent } from '../nav-item/nav-item.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { ShortcutsService } from '../nav-item/shortcuts.service';

import { SearchService } from './search.service';
import { NavItem } from './nav.models';

import { FlexDividerComponent } from '@flex-erp/shared-ui';

import {
  RdxDropdownMenuTriggerDirective,
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective,
} from '@radix-ng/primitives/dropdown-menu';


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

  readonly coreRoutes = computed<NavItem[]>(() => [
    { icon: 'pi pi-shopping-cart', label: 'Orders', to: '/orders', type: 'core' },

    {
      icon: 'pi pi-tags',
      label: 'Products',
      to: '/products',
      items: [
        { label: 'Collections', to: '/collections' },
        { label: 'Categories', to: '/categories' },
      ],
      type: 'core',
    },

    {
      icon: 'pi pi-building',
      label: 'Inventory',
      to: '/inventory',
      items: [{ label: 'Reservations', to: '/reservations' }],
      type: 'core',
    },

    {
      icon: 'pi pi-users',
      label: 'Customers',
      to: '/customers',
      items: [{ label: 'Customer Groups', to: '/customer-groups' }],
      type: 'core',
    },

    {
      icon: 'pi pi-percentage',
      label: 'Promotions',
      to: '/promotions',
      items: [{ label: 'Campaigns', to: '/campaigns' }],
      type: 'core',
    },

    { icon: 'pi pi-dollar', label: 'Price Lists', to: '/price-lists', type: 'core' },
  ]);


  toggleSearch(): void {
    this.search.toggle();
  }
}
