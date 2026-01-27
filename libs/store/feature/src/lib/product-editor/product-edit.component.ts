import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductsFacade } from '@flex-erp/store/data-access';
import { ProductFormComponent } from '@flex-erp/store/ui';

@Component({
  selector: 'fe-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    ProductFormComponent,
  ],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-ui-fg-base">Edit product</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          Update title, handle, or status.
        </p>
      </header>

      <div class="medusa-panel p-6">
        @if (loading()) {
          <div class="mb-4 text-sm text-ui-fg-muted">Loading product…</div>
        }
        @if (error()) {
          <div class="mb-4 text-sm text-ui-fg-muted">{{ error() }}</div>
        }
        <fe-product-form
          [form]="form"
          submitLabel="Save"
          [loading]="loading()"
          (submitted)="onSubmit()"
        ></fe-product-form>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent {
  private facade = inject(ProductsFacade);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private readonly hydrated = signal(false);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly product = this.facade.selected;

  readonly form = this.fb.group({
    title: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    handle: this.fb.control<string | null>(null),
    status: this.fb.control('DRAFT', { nonNullable: true }),
    options: this.fb.control('', { nonNullable: true }),
    images: this.fb.control('', { nonNullable: true }),
    variants: this.fb.array([
      this.fb.group({
        sku: this.fb.control<string | null>(null),
        price: this.fb.control(0, { nonNullable: true }),
        optionValues: this.fb.control('', { nonNullable: true }),
      }),
    ]),
  });

  readonly productId = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    if (this.productId) {
      this.facade.loadProduct(this.productId);
      this.facade.selectProduct(this.productId);
    }

    effect(() => {
      const product = this.product();
      if (!product || this.hydrated()) return;
      this.form.patchValue({
        title: product.title,
        handle: product.handle ?? null,
        status: product.status ?? 'DRAFT',
        options: (product.options ?? []).join(', '),
        images: (product.images ?? []).join('\n'),
      });
      const variants = product.variants ?? [];
      const variantControls =
        variants.length > 0
          ? variants
          : [{ sku: null, price: 0, optionValues: [] }];
      const variantsArray = this.fb.array(
        variantControls.map((variant) =>
          this.fb.group({
            sku: this.fb.control<string | null>(variant.sku ?? null),
            price: this.fb.control(variant.price ?? 0, { nonNullable: true }),
            optionValues: this.fb.control(
              (variant.optionValues ?? []).join(', '),
              { nonNullable: true },
            ),
          }),
        ),
      );
      this.form.setControl('variants', variantsArray);
      this.hydrated.set(true);
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.productId) return;
    const payload = this.form.getRawValue();
    this.facade.updateProduct(this.productId, {
      title: payload.title,
      handle: payload.handle?.trim() || null,
      status: payload.status,
      options: payload.options
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      images: payload.images
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean),
      variants: payload.variants.map((variant) => ({
        sku: variant.sku?.trim() || null,
        price: Number(variant.price) || 0,
        optionValues: variant.optionValues
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
      })),
    });
  }
}
