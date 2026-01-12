import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DividerModule } from 'primeng/divider';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';

import { NavItemComponent } from '../nav-item/nav-item.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';

import { StoreService } from './store.service';
import { ExtensionService } from './extension.service';
import { SearchService } from './search.service';
import { NavItem } from './nav.models';

@Component({
  selector: 'app-main-sidebar',
  imports: [CommonModule, RouterModule, DividerModule, PopoverModule, ButtonModule, NavItemComponent, UserMenuComponent],
  templateUrl: './main-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidebarComponent {
  readonly storeSvc = inject(StoreService);
  readonly ext = inject(ExtensionService);
  readonly search = inject(SearchService);

  readonly extensionsOpen = signal(true);

  readonly coreRoutes = computed<NavItem[]>(() => [
    { icon: 'pi pi-shopping-cart', label: 'Orders', to: '/orders', items: [], type: 'core' },
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

  readonly extensionRoutes = computed<NavItem[]>(() => this.ext.getMenu('coreExtensions').filter((i) => !i.nested));

  toggleSearch(): void {
    this.search.toggle();
  }

  toggleExtensions(): void {
    this.extensionsOpen.update((v) => !v);
  }

  getExtensionNavItems(route: NavItem): NavItem {
    return { ...route, icon: route.icon || 'pi pi-plus', type: 'extension' };
  }
}
