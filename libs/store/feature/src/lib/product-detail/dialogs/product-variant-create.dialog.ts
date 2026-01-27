import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, X } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { ProductsFacade } from '@flex-erp/store/data-access';
import { ProductOption } from '@flex-erp/store/util';
import { FlexDialogComponent } from '@flex-erp/shared/ui';
import { buildProductUpsertPayload } from '../product-detail.helpers';

const sortOptions = (options: ProductOption[]) =>
  [...options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

@Component({
  selector: 'fe-product-variant-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, FlexDialogComponent],
  template: `
    <flex-dialog
      [open]="true"
      mode="sheet-right"
      [contentClass]="contentClass"
      (openChange)="onOpenChange($event)"
    >
      <div class="flex h-full flex-col">
        <header class="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
          <div>
            <div class="text-base font-semibold text-ui-fg-base">Create variant</div>
            <div class="text-xs text-ui-fg-muted">Add a new variant to this product.</div>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-ui-fg-muted transition-fg hover:bg-ui-bg-subtle-hover"
            (click)="close()"
            aria-label="Close"
          >
            <i-lucide [img]="X" class="h-4 w-4"></i-lucide>
          </button>
        </header>

        <form class="flex-1 overflow-auto px-6 py-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">SKU</label>
              <input
                formControlName="sku"
                type="text"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Price</label>
              <input
                formControlName="price"
                type="number"
                step="0.01"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>

            <div class="space-y-3">
              <div class="text-xs font-semibold text-ui-fg-muted">Option values</div>
              @for (option of options(); track option.id; let i = $index) {
                <div>
                  <label class="text-xs text-ui-fg-muted">{{ option.name }}</label>
                  <input
                    [formControl]="optionValues.at(i)"
                    type="text"
                    class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                  />
                </div>
              }
              @if (!options().length) {
                <div class="text-xs text-ui-fg-muted">No options configured.</div>
              }
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-2 border-t border-ui-border-base pt-4">
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-md border border-ui-border-base px-4 text-sm font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              (click)="close()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex h-9 items-center rounded-md bg-ui-bg-interactive px-4 text-sm font-semibold text-ui-fg-on-color shadow-sm transition-fg hover:bg-ui-bg-interactive-hover"
              [disabled]="form.invalid || loading()"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </flex-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariantCreateDialogComponent {
  readonly X = X;
  readonly contentClass =
    'w-full max-w-[480px] h-full overflow-hidden border-l border-ui-border-base bg-ui-bg-base shadow-lg';

  private readonly facade = inject(ProductsFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly hydrated = signal(false);

  readonly loading = this.facade.loading;
  readonly product = this.facade.selectedProductDetail();

  readonly form = this.fb.group({
    sku: this.fb.control<string | null>(null),
    price: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
    optionValues: this.fb.array<FormControl<string>>([]),
  });

  readonly options = signal<ProductOption[]>([]);

  get optionValues() {
    return this.form.get('optionValues') as FormArray<FormControl<string>>;
  }

  constructor() {
    effect(() => {
      const detail = this.product();
      if (!detail || this.hydrated()) {
        return;
      }

      const ordered = sortOptions(detail.options ?? []);
      this.options.set(ordered);

      const controls = ordered.map((option) =>
        this.fb.control(option.values?.[0]?.value ?? 'Default', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      );
      this.form.setControl('optionValues', this.fb.array(controls));
      this.hydrated.set(true);
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const detail = this.product();
    if (!detail) {
      return;
    }

    const base = buildProductUpsertPayload(detail);
    const payload = this.form.getRawValue();

    const newVariant = {
      sku: payload.sku?.trim() || null,
      price: Number(payload.price) || 0,
      optionValues: payload.optionValues.map((value) => value.trim() || 'Default'),
    };

    const updatePayload = {
      ...base,
      variants: [...base.variants, newVariant],
    };

    await firstValueFrom(this.facade.updateProduct(detail.id, updatePayload));
    this.facade.loadProductDetail(detail.id);
    this.close();
  }

  onOpenChange(open: boolean) {
    if (!open) {
      this.close();
    }
  }

  close() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }
}
