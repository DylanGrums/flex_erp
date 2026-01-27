import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'fe-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="space-y-5" [formGroup]="form" (ngSubmit)="submitted.emit()">
      <div>
        <label class="text-xs font-semibold text-ui-fg-muted">Title</label>
        <input
          formControlName="title"
          type="text"
          placeholder="Product title"
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

      <div>
        <label class="text-xs font-semibold text-ui-fg-muted"
          >Options (comma separated)</label
        >
        <input
          formControlName="options"
          type="text"
          placeholder="Size, Color"
          class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
        />
      </div>

      <div>
        <label class="text-xs font-semibold text-ui-fg-muted"
          >Images (one URL per line)</label
        >
        <textarea
          formControlName="images"
          rows="3"
          placeholder="https://..."
          class="mt-2 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base shadow-borders-base"
        ></textarea>
      </div>

      <div class="space-y-3" formArrayName="variants">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-ui-fg-muted">Variants</label>
          <button
            type="button"
            class="text-xs font-semibold text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            (click)="addVariant()"
          >
            Add variant
          </button>
        </div>
        <div class="space-y-3">
          @for (_variant of variants.controls; track _variant; let i = $index) {
            <div
              class="rounded-md border border-ui-border-base bg-ui-bg-subtle p-3"
              [formGroupName]="i"
            >
              <div class="grid gap-3 md:grid-cols-3">
                <div>
                  <label class="text-xs font-semibold text-ui-fg-muted"
                    >SKU</label
                  >
                  <input
                    formControlName="sku"
                    type="text"
                    class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                  />
                </div>
                <div>
                  <label class="text-xs font-semibold text-ui-fg-muted"
                    >Price</label
                  >
                  <input
                    formControlName="price"
                    type="number"
                    step="0.01"
                    class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                  />
                </div>
                <div>
                  <label class="text-xs font-semibold text-ui-fg-muted"
                    >Option values</label
                  >
                  <input
                    formControlName="optionValues"
                    type="text"
                    placeholder="Small, Red"
                    class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                  />
                </div>
              </div>
              <div class="mt-3 text-right">
                <button
                  type="button"
                  class="text-xs text-ui-fg-muted hover:text-ui-fg-subtle"
                  [disabled]="variants.length === 1"
                  (click)="removeVariant(i)"
                >
                  Remove
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        <button
          type="submit"
          class="inline-flex h-9 items-center rounded-md bg-ui-bg-interactive px-4 text-sm font-semibold text-ui-fg-on-color shadow-sm transition-fg hover:bg-ui-bg-interactive-hover"
          [disabled]="loading"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() submitLabel = 'Save';
  @Input() loading = false;
  @Output() submitted = new EventEmitter<void>();

  get variants() {
    return this.form.get('variants') as FormArray<FormGroup>;
  }

  addVariant() {
    this.variants.push(
      new FormGroup({
        sku: new FormControl<string | null>(null),
        price: new FormControl<number>(0, { nonNullable: true }),
        optionValues: new FormControl('', { nonNullable: true }),
      }),
    );
  }

  removeVariant(index: number) {
    if (this.variants.length <= 1) return;
    this.variants.removeAt(index);
  }
}
