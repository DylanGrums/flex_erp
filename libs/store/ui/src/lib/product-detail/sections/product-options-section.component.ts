import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ellipsis, LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { ProductDetail } from '@flex-erp/store/util';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuTriggerDirective,
  FlexTooltipDirective,
  FlexTooltipTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'fe-product-options-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexTooltipTriggerDirective,
    FlexTooltipDirective,
  ],
  template: `
    <div class="medusa-panel divide-y p-0">
      <div class="flex items-center justify-between px-6 py-4">
        <h2 class="font-sans font-medium h2-core text-ui-fg-base">Options</h2>
        <a
          class="inline-flex items-center gap-2 rounded-md border border-ui-border-base px-3 py-2 text-ui-fg-base txt-compact-small-plus transition-fg hover:bg-ui-bg-subtle-hover"
          [routerLink]="['options', 'create']"
        >
          <i-lucide [img]="Plus" class="h-3 w-3"></i-lucide>
          Add option
        </a>
      </div>

      @if (product.options?.length) {
        <div class="divide-y">
          @for (option of product.options; track option.id) {
            <div class="flex items-start justify-between gap-4 px-6 py-4">
              <div class="min-w-0">
                <div class="text-ui-fg-base txt-compact-small-plus">{{ option.name }}</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  @for (value of option.values ?? []; track value.id) {
                    <span
                      class="flex min-w-[20px] items-center justify-center"
                      [flexTooltipTrigger]="tooltip"
                    >
                      {{ value.value }}
                    </span>
                    <ng-template #tooltip>
                      <div
                        flexTooltip
                        class="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 txt-compact-xsmall shadow"
                      >
                        {{ value.value }}
                      </div>
                    </ng-template>
                  }
                  @if (!(option.values?.length)) {
                    <span class="text-ui-fg-muted txt-compact-small">No values</span>
                  }
                </div>
              </div>

              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover"
                [flexDropdownMenuTrigger]="menu"
                aria-label="Option actions"
              >
                <i-lucide [img]="Ellipsis" class="h-4 w-4"></i-lucide>
              </button>

              <ng-template #menu>
                <div
                  flexDropdownMenuContent
                  class="min-w-[160px] rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
                >
                  <a
                    flexDropdownMenuItem
                    class="flex items-center gap-2 rounded px-2 py-1.5 txt-compact-small hover:bg-ui-bg-subtle-hover"
                    [routerLink]="['options', option.id, 'edit']"
                  >
                    <i-lucide [img]="Pencil" class="h-4 w-4 text-ui-fg-subtle"></i-lucide>
                    <span>Edit</span>
                  </a>
                </div>
              </ng-template>
            </div>
          }
        </div>
      } @else {
        <div class="px-6 py-6 text-ui-fg-muted txt-compact-small">No options yet.</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductOptionsSectionComponent {
  readonly Ellipsis = Ellipsis;
  readonly Pencil = Pencil;
  readonly Plus = Plus;

  @Input({ required: true }) product!: ProductDetail;
}
