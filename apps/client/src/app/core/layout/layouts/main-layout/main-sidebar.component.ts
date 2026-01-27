import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import {
  Check,
  ChevronDown,
  LogOut,
  LucideAngularModule,
  Settings,
  Store,
  CircleX,
} from 'lucide-angular';

import { NavItemComponent } from '../../components/nav-item/nav-item.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { ShortcutsService } from '../../components/nav-item/shortcuts.service';

import { SearchService } from '../../services/search.service';
import { NavItem } from '../../types/nav.models';

import { FlexDividerComponent } from '@flex-erp/shared/ui';
import { TranslocoModule } from '@jsverse/transloco';

import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuTriggerDirective,
} from '@flex-erp/shared/ui';

import { NAV_MANIFESTS } from '@flex-erp/shared/nav';
import { CMS_NAV } from '@flex-erp/cms/manifest';
import { ContextFacade } from '@flex-erp/shared/context/data-access';

@Component({
  selector: 'app-main-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    NavItemComponent,
    UserMenuComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexDividerComponent,
    LucideAngularModule,
    TranslocoModule,
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
  readonly ChevronDown = ChevronDown;
  readonly Store = Store;
  readonly Check = Check;
  readonly CircleX = CircleX;
  readonly LogOut = LogOut;
  readonly Settings = Settings;

  readonly search = inject(SearchService);
  readonly shortcuts = inject(ShortcutsService);
  readonly context = inject(ContextFacade);
  private readonly router = inject(Router);

  private readonly manifests = (() => {
    const injected = inject(NAV_MANIFESTS, { optional: true }) ?? [];
    const merged = [...injected];

    // ✅ Ensure CMS is present (avoid duplicates)
    const cmsManifest = CMS_NAV.nav.manifest;
    if (!merged.some((m) => m.id === cmsManifest.id)) {
      merged.push(cmsManifest);
    }

    return merged;
  })();

  readonly coreSections = computed<
    { label: string; items: NavItem[]; dividerAfter?: boolean }[]
  >(() => {
    const sortedManifests = [...this.manifests].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    return sortedManifests.flatMap((manifest) => {
      const sections = [...manifest.sections].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );

      return sections.map((section) => ({
        label: section.label,
        items: section.items as NavItem[],
        dividerAfter: section.dividerAfter,
      }));
    });
  });

  readonly stores = toSignal(this.context.stores$, { initialValue: [] });
  readonly storeId = toSignal(this.context.storeId$, { initialValue: null });
  readonly storeLabel = computed(() => {
    const id = this.storeId();
    if (!id) {
      return 'Select a store';
    }
    return this.stores().find((store) => store.id === id)?.name ?? id;
  });

  toggleSearch(): void {
    this.search.toggle();
  }

  selectStore(storeId: string | null): void {
    this.context.setStoreId(storeId);
    void this.router.navigateByUrl('/orders');
  }
}
