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
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Plus, Trash2, X } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { ProductsFacade } from '@flex-erp/store/data-access';
import { FlexDialogComponent } from '@flex-erp/shared/ui';
import { buildProductUpsertPayload } from '../product-detail.helpers';

@Component({
  selector: 'fe-product-media-edit-dialog',
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
            <div class="text-base font-semibold text-ui-fg-base">Edit media</div>
            <div class="text-xs text-ui-fg-muted">Manage product image URLs.</div>
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
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-ui-fg-muted">Images</div>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-ui-border-base px-3 py-2 text-xs font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
                (click)="addImage()"
              >
                <i-lucide [img]="Plus" class="h-3 w-3"></i-lucide>
                Add image
              </button>
            </div>

            <div class="space-y-3">
              @for (control of images.controls; track control; let i = $index) {
                <div class="flex items-center gap-2">
                  <input
                    [formControl]="control"
                    type="url"
                    placeholder="https://"
                    class="h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                  />
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover"
                    (click)="removeImage(i)"
                    [disabled]="images.length === 1"
                    aria-label="Remove image"
                  >
                    <i-lucide [img]="Trash2" class="h-4 w-4"></i-lucide>
                  </button>
                </div>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </flex-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductMediaEditDialogComponent {
  readonly X = X;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
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
    images: this.fb.array<FormControl<string>>(
      [this.fb.control('', { nonNullable: true })],
    ),
  });

  get images() {
    return this.form.get('images') as FormArray<FormControl<string>>;
  }

  constructor() {
    effect(() => {
      const detail = this.product();
      if (!detail || this.hydrated()) {
        return;
      }

      const imageControls =
        detail.images?.length
          ? detail.images.map((image) =>
              this.fb.control(image.url, {
                nonNullable: true,
              }),
            )
          : [this.fb.control('', { nonNullable: true })];

      this.form.setControl('images', this.fb.array(imageControls));
      this.hydrated.set(true);
    });
  }

  addImage() {
    this.images.push(this.fb.control('', { nonNullable: true }));
  }

  removeImage(index: number) {
    if (this.images.length <= 1) {
      return;
    }
    this.images.removeAt(index);
  }

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const detail = this.product();
    if (!detail) {
      return;
    }

    const images = this.images.controls
      .map((control) => control.value.trim())
      .filter(Boolean);

    const updatePayload = buildProductUpsertPayload(detail, { images });

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
