import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Product } from '@flex-erp/store/util';

@Component({
  selector: 'fe-product-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-sm"
    >
      <table
        class="min-w-full divide-y divide-ui-border-base text-sm text-ui-fg-base"
      >
        <thead
          class="bg-ui-bg-subtle text-xs font-semibold uppercase tracking-wide text-ui-fg-muted"
        >
          <tr>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Handle</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ui-border-base">
          @for (product of products; track product.id) {
            <tr class="transition-fg hover:bg-ui-bg-base-hover">
              <td class="px-4 py-3 font-medium text-ui-fg-base">
                {{ product.title }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full border px-2 py-0.5 text-xs"
                  [ngClass]="statusClass(product.status)"
                >
                  {{ product.status ?? 'draft' }}
                </span>
              </td>
              <td class="px-4 py-3 text-ui-fg-subtle">
                {{ product.handle ?? '-' }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableComponent {
  @Input({ required: true }) products: Product[] = [];

  statusClass(status?: string | null) {
    switch ((status ?? '').toLowerCase()) {
      case 'active':
        return 'border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color';
      case 'archived':
        return 'border-ui-border-base bg-ui-bg-subtle text-ui-fg-muted';
      default:
        return 'border-ui-border-base bg-ui-bg-base text-ui-fg-subtle';
    }
  }
}
