import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ProductsFacade } from '@flex-erp/store/data-access';
import {
  ProductCollectionsSectionComponent,
  ProductGeneralSectionComponent,
  ProductMediaSectionComponent,
  ProductOptionsSectionComponent,
  ProductVariantsSectionComponent,
} from '@flex-erp/store/ui';

@Component({
  selector: 'fe-product-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ProductGeneralSectionComponent,
    ProductMediaSectionComponent,
    ProductOptionsSectionComponent,
    ProductVariantsSectionComponent,
    ProductCollectionsSectionComponent,
  ],
  template: `
    <section class="flex w-full flex-col gap-y-3">
      @if (loading()) {
        <div class="medusa-panel p-6 text-sm text-ui-fg-muted">Loading product details...</div>
      }
      @if (error()) {
        <div class="medusa-panel p-6 text-sm text-ui-fg-muted">{{ error() }}</div>
      }

      @if (product(); as detail) {
        <div class="flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,_1fr)_440px]">
          <div class="flex w-full min-w-0 flex-col gap-y-3">
            <fe-product-general-section [product]="detail"></fe-product-general-section>
            <fe-product-media-section [product]="detail"></fe-product-media-section>
            <fe-product-options-section [product]="detail"></fe-product-options-section>
            <fe-product-variants-section [product]="detail"></fe-product-variants-section>
          </div>
          <div class="flex w-full flex-col gap-y-3 xl:mt-0">
            <fe-product-collections-section
              [product]="detail"
            ></fe-product-collections-section>
          </div>
        </div>
      }
    </section>

    <router-outlet></router-outlet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPageComponent {
  private readonly facade = inject(ProductsFacade);
  private readonly route = inject(ActivatedRoute);

  readonly product = this.facade.selectedProductDetail();
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadProductDetail(id);
    }
  }
}
