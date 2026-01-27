import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideAngularModule, Info } from 'lucide-angular';
import { ProductDetail } from '@flex-erp/store/util';
import {
  FlexPopoverDirective,
  FlexPopoverTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'fe-product-collections-section',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FlexPopoverTriggerDirective,
    FlexPopoverDirective,
  ],
  template: `
    <div class="medusa-panel divide-y p-0">
      <div class="px-6 py-4">
        <h2 class="text-base font-semibold text-ui-fg-base">Collections</h2>
        <p class="text-xs text-ui-fg-muted">Group this product into collections.</p>
      </div>

      @if (product.collections?.length) {
        <div class="divide-y">
          @for (collection of product.collections; track collection.id) {
            <div class="flex items-center justify-between gap-4 px-6 py-4">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-ui-fg-base">
                  {{ collection.title }}
                </div>
                <div class="text-xs text-ui-fg-muted">
                  {{ collection.handle ? '/' + collection.handle : 'No handle' }}
                </div>
              </div>

              @if (collection.description) {
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover"
                  [flexPopoverTrigger]="popover"
                  side="left"
                  align="center"
                  sideOffset="8"
                  aria-label="Collection description"
                >
                  <i-lucide [img]="Info" class="h-4 w-4"></i-lucide>
                </button>

                <ng-template #popover>
                  <div
                    flexPopover
                    class="max-w-[220px] rounded-md border border-ui-border-base bg-ui-bg-base p-3 text-xs text-ui-fg-base shadow"
                  >
                    {{ collection.description }}
                  </div>
                </ng-template>
              }
            </div>
          }
        </div>
      } @else {
        <div class="px-6 py-6 text-sm text-ui-fg-muted">No collections assigned.</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCollectionsSectionComponent {
  readonly Info = Info;

  @Input({ required: true }) product!: ProductDetail;
}
