import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'fe-store-inventory-page',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-ui-fg-base">{{ 'store.pages.inventory.title' | transloco }}</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          {{ 'store.pages.inventory.subtitle' | transloco }}
        </p>
      </header>

      <div class="medusa-panel p-6">
        <p class="text-sm font-medium text-ui-fg-base">{{ 'store.pages.inventory.comingSoonTitle' | transloco }}</p>
        <p class="mt-1 text-xs text-ui-fg-subtle">
          {{ 'store.pages.inventory.comingSoonDescription' | transloco }}
        </p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreInventoryPageComponent {}
