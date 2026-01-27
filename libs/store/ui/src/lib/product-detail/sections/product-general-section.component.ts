import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ellipsis, LucideAngularModule, Pencil } from 'lucide-angular';
import { ProductDetail } from '@flex-erp/store/util';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'fe-product-general-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
  ],
  template: `
    <div class="medusa-panel divide-y p-0">
      <div class="flex items-center justify-between px-6 py-4">
        <h2 class="font-sans font-medium h2-core text-ui-fg-base">General</h2>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover"
          [flexDropdownMenuTrigger]="menu"
          aria-label="General actions"
        >
          <i-lucide [img]="Ellipsis" class="h-4 w-4"></i-lucide>
        </button>

        <ng-template #menu>
          <div
            flexDropdownMenuContent
            class="min-w-[180px] rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
          >
            <a
              flexDropdownMenuItem
              class="flex items-center gap-2 rounded px-2 py-1.5 txt-compact-small hover:bg-ui-bg-subtle-hover"
              [routerLink]="['edit']"
            >
              <i-lucide [img]="Pencil" class="h-4 w-4 text-ui-fg-subtle"></i-lucide>
              <span>Edit</span>
            </a>
          </div>
        </ng-template>
      </div>

      <div class="grid gap-4 px-6 py-4 md:grid-cols-2">
        <div>
          <div class="text-ui-fg-muted txt-compact-small-plus">Description</div>
          <div class="mt-1 text-ui-fg-base txt-compact-small">
            {{ product.description || 'No description' }}
          </div>
        </div>
        <div>
          <div class="text-ui-fg-muted txt-compact-small-plus">Handle</div>
          <div class="mt-1 text-ui-fg-base txt-compact-small">
            {{ product.handle ? '/' + product.handle : 'No handle set' }}
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGeneralSectionComponent {
  readonly Ellipsis = Ellipsis;
  readonly Pencil = Pencil;

  @Input({ required: true }) product!: ProductDetail;
}
