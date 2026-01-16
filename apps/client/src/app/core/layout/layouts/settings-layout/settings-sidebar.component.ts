import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { NavItemComponent } from '../../components/nav-item/nav-item.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { NavItem } from '../../types/nav.models';
import { FlexDividerComponent } from '@flex-erp/shared/ui';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DividerModule,
    ButtonModule,
    NavItemComponent,
    UserMenuComponent,
    FlexDividerComponent,
    TranslocoModule,
  ],
  templateUrl: './settings-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply w-full flex;
      }
    `,
  ],
})
export class SettingsSidebarComponent {

  readonly generalOpen = signal(true);
  readonly developerOpen = signal(true);
  readonly accountOpen = signal(true);
  readonly extensionsOpen = signal(true);

  readonly generalRoutes = computed<NavItem[]>(() => [
    { label: 'settings.general.store', to: '/settings/store', type: 'setting' },
    { label: 'settings.general.users', to: '/settings/users', type: 'setting' },
    { label: 'settings.general.regions', to: '/settings/regions', type: 'setting' },
    { label: 'settings.general.taxRegions', to: '/settings/tax-regions', type: 'setting' },
    { label: 'settings.general.returnReasons', to: '/settings/return-reasons', type: 'setting' },
    { label: 'settings.general.refundReasons', to: '/settings/refund-reasons', type: 'setting' },
    { label: 'settings.general.salesChannels', to: '/settings/sales-channels', type: 'setting' },
    { label: 'settings.general.productTypes', to: '/settings/product-types', type: 'setting' },
    { label: 'settings.general.productTags', to: '/settings/product-tags', type: 'setting' },
    { label: 'settings.general.stockLocations', to: '/settings/locations', type: 'setting' },
  ]);

  readonly developerRoutes = computed<NavItem[]>(() => [
    { label: 'settings.developer.publishableApiKeys', to: '/settings/publishable-api-keys', type: 'setting' },
    { label: 'settings.developer.secretApiKeys', to: '/settings/secret-api-keys', type: 'setting' },
    { label: 'settings.developer.workflowExecutions', to: '/settings/workflows', type: 'setting' },
  ]);

  readonly accountRoutes = computed<NavItem[]>(() => [
    { label: 'settings.account.profile', to: '/settings/profile', type: 'setting' },
  ]);

  toggle(which: 'general' | 'developer' | 'account' | 'extensions'): void {
    const map = {
      general: this.generalOpen,
      developer: this.developerOpen,
      account: this.accountOpen,
      extensions: this.extensionsOpen,
    } as const;
    map[which].update((v) => !v);
  }

}
