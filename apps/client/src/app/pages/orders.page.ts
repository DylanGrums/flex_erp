import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="medusa-panel p-4">
      <div class="text-lg font-semibold">Orders</div>
      <div class="mt-2 text-sm text-ui-fg-subtle">Placeholder page.</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {}
