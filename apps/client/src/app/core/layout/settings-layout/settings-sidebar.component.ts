import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { NavItemComponent } from '../nav-item/nav-item.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { ExtensionService } from '../main-layout/extension.service';
import { NavItem } from '../main-layout/nav.models';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, DividerModule, ButtonModule, NavItemComponent, UserMenuComponent],
  templateUrl: './settings-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsSidebarComponent {
  private readonly ext = inject(ExtensionService);

  readonly generalOpen = signal(true);
  readonly developerOpen = signal(true);
  readonly accountOpen = signal(true);
  readonly extensionsOpen = signal(true);

  readonly generalRoutes = computed<NavItem[]>(() => [
    { label: 'Store', to: '/settings/store', type: 'setting' },
    { label: 'Users', to: '/settings/users', type: 'setting' },
    { label: 'Regions', to: '/settings/regions', type: 'setting' },
    { label: 'Tax Regions', to: '/settings/tax-regions', type: 'setting' },
    { label: 'Return Reasons', to: '/settings/return-reasons', type: 'setting' },
    { label: 'Refund Reasons', to: '/settings/refund-reasons', type: 'setting' },
    { label: 'Sales Channels', to: '/settings/sales-channels', type: 'setting' },
    { label: 'Product Types', to: '/settings/product-types', type: 'setting' },
    { label: 'Product Tags', to: '/settings/product-tags', type: 'setting' },
    { label: 'Stock Locations', to: '/settings/locations', type: 'setting' },
  ]);

  readonly developerRoutes = computed<NavItem[]>(() => [
    { label: 'Publishable API Keys', to: '/settings/publishable-api-keys', type: 'setting' },
    { label: 'Secret API Keys', to: '/settings/secret-api-keys', type: 'setting' },
    { label: 'Workflow Executions', to: '/settings/workflows', type: 'setting' },
  ]);

  readonly accountRoutes = computed<NavItem[]>(() => [{ label: 'Profile', to: '/settings/profile', type: 'setting' }]);

  readonly extensionRoutes = computed<NavItem[]>(() => this.ext.getMenu('settingsExtensions'));

  toggle(which: 'general' | 'developer' | 'account' | 'extensions'): void {
    const map = {
      general: this.generalOpen,
      developer: this.developerOpen,
      account: this.accountOpen,
      extensions: this.extensionsOpen,
    } as const;
    map[which].update((v) => !v);
  }

  extensionRoutesWithType(): NavItem[] {
    return this.extensionRoutes().map((r) => ({ ...r, type: 'setting' }));
  }
}
