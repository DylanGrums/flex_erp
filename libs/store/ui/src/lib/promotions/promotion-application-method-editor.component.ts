import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'fe-promotion-application-method-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4" [formGroup]="form">
      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="text-xs font-semibold text-ui-fg-muted">Type</label>
          <select
            formControlName="type"
            class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
          >
            <option value="FIXED">Fixed amount</option>
            <option value="PERCENT">Percentage</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-ui-fg-muted">Allocation</label>
          <select
            formControlName="allocation"
            class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
          >
            <option value="EACH">Each item</option>
            <option value="ACROSS">Across items</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-ui-fg-muted">Target</label>
          <select
            formControlName="targetType"
            class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
          >
            <option value="ITEMS">Items</option>
          </select>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="text-xs font-semibold text-ui-fg-muted">Value</label>
          <input
            formControlName="value"
            type="number"
            min="0"
            class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
            placeholder="10"
          />
        </div>
        @if (form?.get('type')?.value === 'FIXED') {
          <div>
            <label class="text-xs font-semibold text-ui-fg-muted">Currency</label>
            <select
              formControlName="currency"
              class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        }
        <div>
          <label class="text-xs font-semibold text-ui-fg-muted">Max quantity</label>
          <input
            formControlName="maxQuantity"
            type="number"
            min="1"
            class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
            placeholder="1"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <input
          type="checkbox"
          formControlName="isTaxInclusive"
          class="h-4 w-4 rounded border-ui-border-base"
        />
        <span class="text-xs text-ui-fg-muted">Tax inclusive</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionApplicationMethodEditorComponent {
  @Input({ required: true }) form!: FormGroup;
}
