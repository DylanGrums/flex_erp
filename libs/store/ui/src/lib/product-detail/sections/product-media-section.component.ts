import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ellipsis, LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { ProductDetail } from '@flex-erp/store/util';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'fe-product-media-section',
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
        <h2 class="font-sans font-medium h2-core text-ui-fg-base">Media</h2>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover"
          [flexDropdownMenuTrigger]="menu"
          aria-label="Media actions"
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
              [routerLink]="['media', 'edit']"
            >
              <i-lucide [img]="Pencil" class="h-4 w-4 text-ui-fg-subtle"></i-lucide>
              <span>Edit images</span>
            </a>
          </div>
        </ng-template>
      </div>

      @if (product.images?.length) {
        <div class="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 px-6 py-4">
          @for (image of product.images; track image.id) {
            <div
              class="shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-fg group relative aspect-square size-full cursor-pointer overflow-hidden rounded-[8px]"
            >
              <img
                [src]="image.url"
                [alt]="image.alt || product.title + ' image'"
                class="size-full object-cover"
              />
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center gap-y-4 pb-8 pt-6">
          <div class="flex flex-col items-center">
            <div class="text-ui-fg-subtle txt-compact-small-plus">No media yet</div>
            <div class="text-ui-fg-muted txt-compact-small">
              Add product images to showcase this item.
            </div>
          </div>
          <a
            class="inline-flex items-center gap-2 rounded-md border border-ui-border-base px-3 py-2 text-ui-fg-base txt-compact-small-plus transition-fg hover:bg-ui-bg-subtle-hover"
            [routerLink]="['media', 'edit']"
          >
            <i-lucide [img]="Plus" class="h-3 w-3"></i-lucide>
            Add media
          </a>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductMediaSectionComponent {
  readonly Ellipsis = Ellipsis;
  readonly Pencil = Pencil;
  readonly Plus = Plus;

  @Input({ required: true }) product!: ProductDetail;
}
