import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'fe-store-products-page',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-ui-fg-base">{{ 'store.pages.products.title' | transloco }}</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          {{ 'store.pages.products.subtitle' | transloco }}
        </p>
      </header>

      <div class="medusa-panel p-6">
        <p class="text-sm font-medium text-ui-fg-base">{{ 'store.pages.products.comingSoonTitle' | transloco }}</p>
        <p class="mt-1 text-xs text-ui-fg-subtle">
          {{ 'store.pages.products.comingSoonDescription' | transloco }}
        </p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsPageComponent {}
