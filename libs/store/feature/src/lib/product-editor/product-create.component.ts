import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductsFacade } from '@flex-erp/store/data-access';
import { ProductFormComponent } from '@flex-erp/store/ui';

@Component({
  selector: 'fe-product-create',
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
        <h1 class="text-2xl font-semibold text-ui-fg-base">New product</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">Create a new catalog item.</p>
      </header>

      <div class="medusa-panel p-6">
        @if (error()) {
          <div class="mb-4 text-sm text-ui-fg-muted">{{ error() }}</div>
        }
        <fe-product-form
          [form]="form"
          submitLabel="Create"
          [loading]="loading()"
          (submitted)="onSubmit()"
        ></fe-product-form>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private facade = inject(ProductsFacade);
  private fb = inject(FormBuilder);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

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

  onSubmit() {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    this.facade.createProduct({
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
