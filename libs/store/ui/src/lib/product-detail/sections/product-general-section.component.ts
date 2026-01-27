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
        <h1 class="font-sans font-medium h1-core">{{ product.title }}</h1>
        <div class="flex items-center gap-x-4">
          <span
            class="inline-flex items-center rounded-full border px-2 py-1 txt-compact-xsmall-plus"
            [ngClass]="statusClass"
          >
            {{ statusLabel }}
          </span>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover"
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
      </div>

      <div class="px-6 py-4">
        <div class="text-ui-fg-muted txt-compact-small-plus">Description</div>
        <div class="mt-1 text-ui-fg-base txt-compact-small">
          {{ product.description || 'No description' }}
        </div>
      </div>
      <div class="px-6 py-4">
        <div class="text-ui-fg-muted txt-compact-small-plus">Handle</div>
        <div class="mt-1 text-ui-fg-base txt-compact-small">
          {{ product.handle ? '/' + product.handle : 'No handle set' }}
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

  get statusLabel(): string {
    const status = (this.product.status ?? 'DRAFT').toString();
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  get statusClass(): string {
    const status = (this.product.status ?? 'DRAFT').toString().toUpperCase();
    switch (status) {
      case 'ACTIVE':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'ARCHIVED':
        return 'border-ui-border-base bg-ui-bg-subtle text-ui-fg-muted';
      case 'DRAFT':
      default:
        return 'border-ui-border-base bg-ui-bg-subtle text-ui-fg-muted';
    }
  }
}
