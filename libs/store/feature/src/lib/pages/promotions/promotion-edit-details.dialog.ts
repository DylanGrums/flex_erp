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
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, X } from 'lucide-angular';
import { PromotionsFacade } from '@flex-erp/store/data-access';
import {
  CurrencyCode,
  PromotionApplicationAllocation,
  PromotionApplicationMethodType,
  PromotionStatus,
  PromotionTargetType,
} from '@flex-erp/store/util';
import { FlexDialogComponent } from '@flex-erp/shared/ui';
import { PromotionApplicationMethodEditorComponent } from '@flex-erp/store/ui';

@Component({
  selector: 'fe-promotion-edit-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    FlexDialogComponent,
    PromotionApplicationMethodEditorComponent,
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
            <div class="text-base font-semibold text-ui-fg-base">Edit promotion</div>
            <div class="text-xs text-ui-fg-muted">Update promotion details.</div>
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
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-semibold text-ui-fg-muted">Code</label>
                <input
                  formControlName="code"
                  type="text"
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
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="text-xs font-semibold text-ui-fg-muted">Starts at</label>
                <input
                  formControlName="startsAt"
                  type="date"
                  class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                />
              </div>
              <div>
                <label class="text-xs font-semibold text-ui-fg-muted">Ends at</label>
                <input
                  formControlName="endsAt"
                  type="date"
                  class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <div class="flex items-center gap-2">
                <input type="checkbox" formControlName="isAutomatic" class="h-4 w-4 rounded border-ui-border-base" />
                <span class="text-xs text-ui-fg-muted">Automatic</span>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" formControlName="isActive" class="h-4 w-4 rounded border-ui-border-base" />
                <span class="text-xs text-ui-fg-muted">Active</span>
              </div>
              <div>
                <label class="text-xs font-semibold text-ui-fg-muted">Usage limit</label>
                <input
                  formControlName="usageLimit"
                  type="number"
                  min="1"
                  class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                />
              </div>
            </div>

            <div class="rounded-md border border-ui-border-base p-4">
              <fe-promotion-application-method-editor [form]="applicationMethodForm"></fe-promotion-application-method-editor>
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
export class PromotionEditDetailsDialogComponent {
  readonly X = X;
  readonly contentClass =
    'w-full max-w-[640px] h-full overflow-hidden border-l border-ui-border-base bg-ui-bg-base shadow-lg';

  private readonly facade = inject(PromotionsFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly hydrated = signal(false);

  readonly loading = this.facade.mutationLoading;
  readonly promotion = this.facade.selectedDetail;

  readonly form = this.fb.group({
    code: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    status: this.fb.control('DRAFT', { nonNullable: true }),
    isAutomatic: this.fb.control(false, { nonNullable: true }),
    isActive: this.fb.control(true, { nonNullable: true }),
    startsAt: this.fb.control<string | null>(null),
    endsAt: this.fb.control<string | null>(null),
    usageLimit: this.fb.control<number | null>(null),
    applicationMethod: this.fb.group({
      type: this.fb.control('FIXED', { nonNullable: true }),
      allocation: this.fb.control('EACH', { nonNullable: true }),
      targetType: this.fb.control('ITEMS', { nonNullable: true }),
      value: this.fb.control(0, { nonNullable: true }),
      currency: this.fb.control('EUR', { nonNullable: true }),
      maxQuantity: this.fb.control(1, { nonNullable: true }),
      isTaxInclusive: this.fb.control(false, { nonNullable: true }),
    }),
  });

  get applicationMethodForm() {
    return this.form.get('applicationMethod') as any;
  }

  constructor() {
    effect(() => {
      const detail = this.promotion();
      if (!detail || this.hydrated()) return;

      this.form.patchValue({
        code: detail.code,
        status: detail.status,
        isAutomatic: detail.isAutomatic,
        isActive: detail.isActive,
        startsAt: this.toDateInput(detail.startsAt),
        endsAt: this.toDateInput(detail.endsAt),
        usageLimit: detail.usageLimit ?? null,
      });
      if (detail.applicationMethod) {
        this.applicationMethodForm.patchValue({
          type: detail.applicationMethod.type,
          allocation: detail.applicationMethod.allocation,
          targetType: detail.applicationMethod.targetType,
          value: detail.applicationMethod.value,
          currency: detail.applicationMethod.currency,
          maxQuantity: detail.applicationMethod.maxQuantity,
          isTaxInclusive: detail.applicationMethod.isTaxInclusive,
        });
      }
      this.hydrated.set(true);
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const detail = this.promotion();
    if (!detail) return;

    const value = this.form.getRawValue();
    await firstValueFrom(
      this.facade.updatePromotion(detail.id, {
        code: value.code.trim(),
        status: value.status as PromotionStatus,
        isAutomatic: value.isAutomatic,
        isActive: value.isActive,
        startsAt: value.startsAt || null,
        endsAt: value.endsAt || null,
        usageLimit: value.usageLimit ?? null,
        applicationMethod: {
          type: value.applicationMethod.type as PromotionApplicationMethodType,
          allocation: value.applicationMethod.allocation as PromotionApplicationAllocation,
          targetType: value.applicationMethod.targetType as PromotionTargetType,
          value: Number(value.applicationMethod.value) || 0,
          currency: value.applicationMethod.currency as CurrencyCode,
          maxQuantity: Number(value.applicationMethod.maxQuantity) || 1,
          isTaxInclusive: value.applicationMethod.isTaxInclusive,
        },
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

  private toDateInput(value?: string | Date | null) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }
}
