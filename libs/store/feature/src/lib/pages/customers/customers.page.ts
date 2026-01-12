import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'fe-store-customers-page',
  standalone: true,
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-ui-fg-base">Customers</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          Manage customer profiles and history.
        </p>
      </header>

      <div class="medusa-panel p-6">
        <p class="text-sm font-medium text-ui-fg-base">Coming soon</p>
        <p class="mt-1 text-xs text-ui-fg-subtle">
          More tools for customer management are on the way.
        </p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreCustomersPageComponent {}
