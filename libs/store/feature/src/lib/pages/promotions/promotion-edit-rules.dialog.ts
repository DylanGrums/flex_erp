import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, X } from 'lucide-angular';
import { PromotionsFacade } from '@flex-erp/store/data-access';
import { FlexDialogComponent } from '@flex-erp/shared/ui';
import { PromotionRulesEditorComponent } from '@flex-erp/store/ui';
import { PromotionRuleInput } from '@flex-erp/store/util';

@Component({
  selector: 'fe-promotion-edit-rules-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    FlexDialogComponent,
    PromotionRulesEditorComponent,
  ],
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
            <div class="text-base font-semibold text-ui-fg-base">Edit rules</div>
            <div class="text-xs text-ui-fg-muted">Update promotion rules and targets.</div>
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
          <div class="space-y-6">
            <fe-promotion-rules-editor
              [rules]="rulesForm"
              title="Promotion rules"
              description="Rules that must match for the promotion to apply."
            ></fe-promotion-rules-editor>

            <fe-promotion-rules-editor
              [rules]="targetRulesForm"
              title="Target rules"
              description="Limit which items receive the discount."
            ></fe-promotion-rules-editor>
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
              [disabled]="loading()"
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
export class PromotionEditRulesDialogComponent {
  readonly X = X;
  readonly contentClass =
    'w-full max-w-[640px] h-full overflow-hidden border-l border-ui-border-base bg-ui-bg-base shadow-lg';

  private readonly facade = inject(PromotionsFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly hydrated = signal(false);

  readonly loading = this.facade.rulesLoading;
  readonly promotion = this.facade.selectedDetail;

  readonly form = this.fb.group({
    rules: this.fb.array([]),
    targetRules: this.fb.array([]),
  });

  get rulesForm() {
    return this.form.get('rules') as FormArray;
  }

  get targetRulesForm() {
    return this.form.get('targetRules') as FormArray;
  }

  constructor() {
    effect(() => {
      const detail = this.promotion();
      if (!detail || this.hydrated()) return;

      this.rulesForm.clear();
      this.targetRulesForm.clear();

      for (const rule of detail.rules ?? []) {
        const group = this.fb.group({
          attribute: this.fb.control(rule.attribute, { nonNullable: true }),
          operator: this.fb.control(rule.operator, { nonNullable: true }),
          values: this.fb.control(this.formatValues(rule.values), { nonNullable: true }),
        });
        if (rule.scope === 'TARGET') {
          this.targetRulesForm.push(group);
        } else if (rule.scope === 'PROMOTION') {
          this.rulesForm.push(group);
        }
      }

      this.hydrated.set(true);
    });
  }

  async onSubmit() {
    const detail = this.promotion();
    if (!detail) return;

    await firstValueFrom(
      this.facade.replacePromotionRules(detail.id, {
        rules: this.buildRulesPayload(this.rulesForm),
        targetRules: this.buildRulesPayload(this.targetRulesForm),
      }),
    );

    this.facade.loadPromotion(detail.id);
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

  private buildRulesPayload(formArray: FormArray): PromotionRuleInput[] {
    const rules: PromotionRuleInput[] = [];
    for (const control of formArray.controls) {
      const value = control.value as { attribute?: string; operator?: string; values?: string };
      if (!value.attribute?.trim()) continue;
      const operator = (value.operator || 'EQ') as PromotionRuleInput['operator'];
      const parsedValues = this.parseRuleValues(value.values ?? '', operator);
      if (parsedValues === null) continue;
      rules.push({
        attribute: value.attribute.trim(),
        operator,
        values: parsedValues,
      });
    }
    return rules;
  }

  private parseRuleValues(raw: string, operator: PromotionRuleInput['operator']) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(',').map((part) => part.trim()).filter(Boolean);
    const normalized = parts.map((part) => {
      const num = Number(part);
      return Number.isFinite(num) ? num : part;
    });
    if (operator === 'IN' || operator === 'NIN') {
      return normalized;
    }
    return normalized[0];
  }

  private formatValues(values: unknown) {
    if (Array.isArray(values)) {
      return values.join(', ');
    }
    return values ?? '';
  }
}
