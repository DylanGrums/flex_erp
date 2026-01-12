import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type NavGroup = 'core' | 'utility';

export type StoreAdminNavItem = {
  label: string;
  route: string;
  icon?: string;
  group?: NavGroup;
};

export const STORE_ADMIN_NAV_ITEMS: StoreAdminNavItem[] = [
  {
    label: 'Orders',
    route: '/store/orders',
    icon: 'pi pi-shopping-cart',
    group: 'core',
  },
  {
    label: 'Products',
    route: '/store/products',
    icon: 'pi pi-tags',
    group: 'core',
  },
  {
    label: 'Collections',
    route: '/store/collections',
    icon: 'pi pi-th-large',
    group: 'core',
  },
  {
    label: 'Categories',
    route: '/store/categories',
    icon: 'pi pi-list',
    group: 'core',
  },
  {
    label: 'Inventory',
    route: '/store/inventory',
    icon: 'pi pi-box',
    group: 'core',
  },
  {
    label: 'Customers',
    route: '/store/customers',
    icon: 'pi pi-users',
    group: 'core',
  },
  {
    label: 'Promotions',
    route: '/store/promotions',
    icon: 'pi pi-percentage',
    group: 'core',
  },
  {
    label: 'Price Lists',
    route: '/store/price-lists',
    icon: 'pi pi-dollar',
    group: 'core',
  },
  {
    label: 'Settings',
    route: '/store/settings',
    icon: 'pi pi-cog',
    group: 'utility',
  },
];

@Component({
  selector: 'fe-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
})
export class FeAdminShellComponent {
  @Input() title?: string;

  readonly coreNavItems = STORE_ADMIN_NAV_ITEMS.filter(
    (item) => item.group !== 'utility',
  );
  readonly utilityNavItems = STORE_ADMIN_NAV_ITEMS.filter(
    (item) => item.group === 'utility',
  );
  readonly searchShortcut = 'Ctrl + K';
}
