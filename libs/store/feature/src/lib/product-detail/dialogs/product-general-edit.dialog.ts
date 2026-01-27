import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, X } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { ProductsFacade } from '@flex-erp/store/data-access';
import { FlexDialogComponent } from '@flex-erp/shared/ui';
import { buildProductUpsertPayload } from '../product-detail.helpers';

@Component({
  selector: 'fe-product-general-edit-dialog',
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
            <div class="text-base font-semibold text-ui-fg-base">Edit general</div>
            <div class="text-xs text-ui-fg-muted">Update basic product details.</div>
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
              <label class="text-xs font-semibold text-ui-fg-muted">Title</label>
              <input
                formControlName="title"
                type="text"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Handle</label>
              <input
                formControlName="handle"
                type="text"
                placeholder="product-handle"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Description</label>
              <textarea
                formControlName="description"
                rows="4"
                class="mt-2 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base shadow-borders-base"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Status</label>
              <select
                formControlName="status"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </flex-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGeneralEditDialogComponent {
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
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    handle: this.fb.control<string | null>(null),
    description: this.fb.control<string | null>(null),
    status: this.fb.control('DRAFT', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const detail = this.product();
      if (!detail || this.hydrated()) {
        return;
      }
      this.form.patchValue({
        title: detail.title,
        handle: detail.handle ?? null,
        description: detail.description ?? null,
        status: detail.status ?? 'DRAFT',
      });
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

    const payload = this.form.getRawValue();
    const updatePayload = buildProductUpsertPayload(detail, {
      title: payload.title.trim(),
      handle: payload.handle?.trim() || null,
      description: payload.description?.trim() || null,
      status: payload.status,
    });

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
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
