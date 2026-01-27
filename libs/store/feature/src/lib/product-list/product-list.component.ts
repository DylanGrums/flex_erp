import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductsFacade } from '@flex-erp/store/data-access';
import { ProductTableComponent } from '@flex-erp/store/ui';

@Component({
  selector: 'fe-product-list',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ProductTableComponent],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-ui-fg-base">
          {{ 'store.pages.products.title' | transloco }}
        </h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          {{ 'store.pages.products.subtitle' | transloco }}
        </p>
      </header>

      <div class="medusa-panel p-6">
        @if (loading()) {
          <div class="text-sm text-ui-fg-muted">Loading products…</div>
        } @else if (error()) {
          <div class="text-sm text-ui-fg-muted">{{ error() }}</div>
        } @else if (products().length === 0) {
          <div class="text-sm text-ui-fg-muted">No products yet.</div>
        } @else {
          <fe-product-table [products]="products()"></fe-product-table>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private facade = inject(ProductsFacade);

  readonly products = this.facade.items;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

  ngOnInit(): void {
    this.facade.loadAll();
  }
}
