import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ellipsis, Image, LucideAngularModule, Pencil } from 'lucide-angular';
import { ProductDetail } from '@flex-erp/store/util';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuSeparatorDirective,
  FlexDropdownMenuTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'fe-product-header-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexDropdownMenuSeparatorDirective,
  ],
  template: `
    <div class="medusa-panel divide-y p-0">
      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <h1 class="font-sans font-medium h1-core">
            {{ product.title }}
          </h1>
        </div>

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
            aria-label="Product actions"
          >
            <i-lucide [img]="Ellipsis" class="h-4 w-4"></i-lucide>
          </button>

          <ng-template #menu>
            <div
              flexDropdownMenuContent
              class="min-w-[200px] rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
            >
              <a
                flexDropdownMenuItem
                class="flex items-center gap-2 rounded px-2 py-1.5 txt-compact-small hover:bg-ui-bg-subtle-hover"
                [routerLink]="['edit']"
              >
                <i-lucide [img]="Pencil" class="h-4 w-4 text-ui-fg-subtle"></i-lucide>
                <span>Edit details</span>
              </a>
              <a
                flexDropdownMenuItem
                class="flex items-center gap-2 rounded px-2 py-1.5 txt-compact-small hover:bg-ui-bg-subtle-hover"
                [routerLink]="['media', 'edit']"
              >
                <i-lucide [img]="Image" class="h-4 w-4 text-ui-fg-subtle"></i-lucide>
                <span>Edit media</span>
              </a>
              <div flexDropdownMenuSeparator class="my-1 h-px bg-ui-border-base"></div>
              <a
                flexDropdownMenuItem
                class="flex items-center gap-2 rounded px-2 py-1.5 txt-compact-small hover:bg-ui-bg-subtle-hover"
                [routerLink]="['variants', 'create']"
              >
                <span class="text-ui-fg-subtle">Create variant</span>
              </a>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductHeaderSectionComponent {
  readonly Ellipsis = Ellipsis;
  readonly Pencil = Pencil;
  readonly Image = Image;

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
