import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <div class="medusa-panel p-4">
      <div class="text-lg font-semibold">{{ 'client.pages.orders.title' | transloco }}</div>
      <div class="mt-2 text-sm text-ui-fg-subtle">{{ 'common.placeholder' | transloco }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {}
