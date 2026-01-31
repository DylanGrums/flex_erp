import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'fe-promotion-rules-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold text-ui-fg-base">{{ title }}</div>
          @if (description) {
            <p class="mt-1 text-xs text-ui-fg-muted">{{ description }}</p>
          }
        </div>
        <button
          type="button"
          class="inline-flex h-8 items-center rounded-md border border-ui-border-base px-3 text-xs font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
          (click)="addRule()"
        >
          Add rule
        </button>
      </div>

      @if (!rules?.length) {
        <div class="rounded-md border border-dashed border-ui-border-base p-4 text-xs text-ui-fg-muted">
          No rules yet. Add a rule to define conditions.
        </div>
      }

      <div class="space-y-3">
        @for (rule of rules.controls; track $index) {
          <div class="grid gap-3 rounded-md border border-ui-border-base p-4 md:grid-cols-[minmax(0,_1fr)_160px_minmax(0,_1fr)_auto]">
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Attribute</label>
              <input
                type="text"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                [formControl]="getRuleControl($index, 'attribute')"
                placeholder="e.g. product_id"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Operator</label>
              <select
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                [formControl]="getRuleControl($index, 'operator')"
              >
                <option value="EQ">Equals</option>
                <option value="NE">Not equal</option>
                <option value="IN">In</option>
                <option value="NIN">Not in</option>
                <option value="GT">Greater than</option>
                <option value="GTE">Greater or equal</option>
                <option value="LT">Less than</option>
                <option value="LTE">Less or equal</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Values</label>
              <input
                type="text"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                [formControl]="getRuleControl($index, 'values')"
                placeholder="Comma-separated values"
              />
            </div>
            <div class="flex items-end">
              <button
                type="button"
                class="inline-flex h-9 items-center justify-center rounded-md border border-ui-border-base px-3 text-xs font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
                (click)="removeRule($index)"
              >
                Remove
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionRulesEditorComponent {
  private fb = inject(FormBuilder);

  @Input({ required: true }) rules!: FormArray<FormGroup>;
  @Input() title = 'Rules';
  @Input() description = '';

  addRule() {
    if (!this.rules) return;
    this.rules.push(
      this.fb.group({
        attribute: this.fb.control('', { nonNullable: true }),
        operator: this.fb.control('EQ', { nonNullable: true }),
        values: this.fb.control('', { nonNullable: true }),
      }),
    );
  }

  removeRule(index: number) {
    if (!this.rules) return;
    this.rules.removeAt(index);
  }

  getRuleControl(index: number, controlName: string): FormControl {
    const group = this.rules.at(index) as FormGroup;
    return group.get(controlName) as FormControl;
  }
}
