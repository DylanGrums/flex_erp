import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, X } from 'lucide-angular';
import { Store } from '@ngxs/store';
import {
  CampaignCreatePayload,
  CampaignBudgetType,
  CurrencyCode,
  PromotionCreatePayload,
  PromotionApplicationAllocation,
  PromotionApplicationMethodType,
  PromotionRuleInput,
  PromotionStatus,
  PromotionTargetType,
} from '@flex-erp/store/util';
import {
  CampaignsFacade,
  CampaignsState,
  PromotionsFacade,
  PromotionsState,
} from '@flex-erp/store/data-access';
import { FlexDialogComponent } from '@flex-erp/shared/ui';
import {
  CampaignPickerComponent,
  PromotionApplicationMethodEditorComponent,
  PromotionRulesEditorComponent,
} from '@flex-erp/store/ui';

const templates = [
  {
    id: 'amount_off_products',
    title: 'Amount off products',
    description: 'Fixed amount off each eligible item.',
    defaults: {
      isAutomatic: false,
      status: 'DRAFT',
      applicationMethod: {
        type: 'FIXED',
        allocation: 'EACH',
        targetType: 'ITEMS',
        value: 10,
        currency: 'EUR',
        maxQuantity: 1,
        isTaxInclusive: false,
      },
    },
  },
  {
    id: 'percentage_off_products',
    title: 'Percentage off products',
    description: 'Percentage off each eligible item.',
    defaults: {
      isAutomatic: false,
      status: 'DRAFT',
      applicationMethod: {
        type: 'PERCENT',
        allocation: 'EACH',
        targetType: 'ITEMS',
        value: 15,
        currency: 'EUR',
        maxQuantity: 1,
        isTaxInclusive: false,
      },
    },
  },
];

type PromotionStep = 'template' | 'details' | 'campaign';

type CampaignPickerMode = 'none' | 'existing' | 'new';

@Component({
  selector: 'fe-promotion-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    FlexDialogComponent,
    PromotionApplicationMethodEditorComponent,
    PromotionRulesEditorComponent,
    CampaignPickerComponent,
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
            <div class="text-base font-semibold text-ui-fg-base">Create promotion</div>
            <div class="text-xs text-ui-fg-muted">Configure promotion details and rules.</div>
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

        <div class="flex items-center gap-2 border-b border-ui-border-base px-6 py-3 text-xs font-semibold text-ui-fg-muted">
          <span [class.text-ui-fg-base]="step() === 'template'">Template</span>
          <span>·</span>
          <span [class.text-ui-fg-base]="step() === 'details'">Details</span>
          <span>·</span>
          <span [class.text-ui-fg-base]="step() === 'campaign'">Campaign</span>
        </div>

        <form class="flex-1 overflow-auto px-6 py-4" [formGroup]="form">
          @if (step() === 'template') {
            <div class="space-y-4">
              <div class="text-sm font-semibold text-ui-fg-base">Choose a template</div>
              <div class="grid gap-3">
                @for (template of templates; track template.id) {
                  <button
                    type="button"
                    class="rounded-md border px-4 py-3 text-left"
                    [class.border-ui-border-strong]="templateId() === template.id"
                    [class.border-ui-border-base]="templateId() !== template.id"
                    (click)="selectTemplate(template.id)"
                  >
                    <div class="text-sm font-semibold text-ui-fg-base">{{ template.title }}</div>
                    <div class="mt-1 text-xs text-ui-fg-muted">{{ template.description }}</div>
                  </button>
                }
              </div>
            </div>
          }

          @if (step() === 'details') {
            <div class="space-y-6">
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="text-xs font-semibold text-ui-fg-muted">Code</label>
                  <input
                    formControlName="code"
                    type="text"
                    class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
                    placeholder="SUMMER15"
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
                <fe-promotion-application-method-editor
                  [form]="applicationMethodForm"
                ></fe-promotion-application-method-editor>
              </div>

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
          }

          @if (step() === 'campaign') {
            <fe-campaign-picker
              [campaigns]="campaigns()"
              [mode]="campaignMode()"
              [selectedCampaignId]="selectedCampaignId()"
              [campaignForm]="campaignForm"
              (modeChange)="setCampaignMode($event)"
              (campaignIdChange)="selectedCampaignId.set($event)"
            ></fe-campaign-picker>
          }
        </form>

        <footer class="flex items-center justify-between border-t border-ui-border-base px-6 py-4">
          <button
            type="button"
            class="inline-flex h-9 items-center rounded-md border border-ui-border-base px-4 text-sm font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
            (click)="goBack()"
            [disabled]="stepIndex() === 0"
          >
            Back
          </button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-md border border-ui-border-base px-4 text-sm font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              (click)="close()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-md bg-ui-bg-interactive px-4 text-sm font-semibold text-ui-fg-on-color shadow-sm transition-fg hover:bg-ui-bg-interactive-hover"
              (click)="next()"
              [disabled]="loading()"
            >
              {{ stepIndex() === 2 ? 'Create' : 'Continue' }}
            </button>
          </div>
        </footer>
      </div>
    </flex-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionCreateDialogComponent {
  readonly X = X;
  readonly contentClass =
    'w-full max-w-[640px] h-full overflow-hidden border-l border-ui-border-base bg-ui-bg-base shadow-lg';
  readonly templates = templates;

  private readonly promotionsFacade = inject(PromotionsFacade);
  private readonly campaignsFacade = inject(CampaignsFacade);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.promotionsFacade.mutationLoading;
  readonly campaigns = this.campaignsFacade.items;

  readonly stepIndex = signal(0);
  readonly step = computed<PromotionStep>(() => {
    const index = this.stepIndex();
    return index === 0 ? 'template' : index === 1 ? 'details' : 'campaign';
  });

  readonly templateId = signal(templates[0]?.id ?? 'amount_off_products');
  readonly campaignMode = signal<CampaignPickerMode>('none');
  readonly selectedCampaignId = signal<string | null>(null);

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
      value: this.fb.control(10, { nonNullable: true }),
      currency: this.fb.control('EUR', { nonNullable: true }),
      maxQuantity: this.fb.control(1, { nonNullable: true }),
      isTaxInclusive: this.fb.control(false, { nonNullable: true }),
    }),
    rules: this.fb.array([]),
    targetRules: this.fb.array([]),
  });

  readonly campaignForm = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    description: this.fb.control<string | null>(null),
    startsAt: this.fb.control<string | null>(null),
    endsAt: this.fb.control<string | null>(null),
    budgetType: this.fb.control('NONE', { nonNullable: true }),
    budgetLimitAmount: this.fb.control<number | null>(null),
    budgetCurrency: this.fb.control('EUR', { nonNullable: true }),
    budgetAttribute: this.fb.control<string | null>(null),
  });

  get rulesForm() {
    return this.form.get('rules') as FormArray;
  }

  get targetRulesForm() {
    return this.form.get('targetRules') as FormArray;
  }

  get applicationMethodForm() {
    return this.form.get('applicationMethod') as any;
  }

  constructor() {
    this.campaignsFacade.loadCampaigns({ limit: 100, offset: 0 });

    effect(() => {
      const template = templates.find((item) => item.id === this.templateId());
      if (!template) return;
      this.form.patchValue({
        status: template.defaults.status,
        isAutomatic: template.defaults.isAutomatic,
      });
      this.applicationMethodForm.patchValue(template.defaults.applicationMethod);
    });
  }

  selectTemplate(templateId: string) {
    this.templateId.set(templateId);
  }

  async next() {
    if (this.stepIndex() < 2) {
      this.stepIndex.update((value) => value + 1);
      return;
    }

    if (this.form.invalid) {
      this.stepIndex.set(1);
      return;
    }

    if (this.campaignMode() === 'new' && this.campaignForm.invalid) {
      return;
    }

    const campaignId = await this.resolveCampaignId();
    const payload = this.buildPromotionPayload(campaignId);

    await firstValueFrom(this.promotionsFacade.createPromotion(payload));
    const created = this.store.selectSnapshot(PromotionsState.selectedDetail);

    if (created?.id) {
      this.router.navigate(['..', created.id], { relativeTo: this.route });
      return;
    }

    this.close();
  }

  goBack() {
    this.stepIndex.update((value) => Math.max(0, value - 1));
  }

  onOpenChange(open: boolean) {
    if (!open) {
      this.close();
    }
  }

  close() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  setCampaignMode(mode: CampaignPickerMode) {
    this.campaignMode.set(mode);
  }

  private async resolveCampaignId() {
    if (this.campaignMode() === 'existing') {
      return this.selectedCampaignId();
    }

    if (this.campaignMode() === 'new') {
      const campaignPayload = this.buildCampaignPayload();
      await firstValueFrom(this.campaignsFacade.createCampaign(campaignPayload));
      const created = this.store.selectSnapshot(CampaignsState.selectedDetail);
      return created?.id ?? null;
    }

    return null;
  }

  private buildCampaignPayload(): CampaignCreatePayload {
    const value = this.campaignForm.getRawValue();
    return {
      name: value.name.trim(),
      description: value.description?.trim() || null,
      startsAt: value.startsAt || null,
      endsAt: value.endsAt || null,
      budget: {
        type: value.budgetType as CampaignBudgetType,
        limitAmount: value.budgetLimitAmount ?? null,
        currency: value.budgetCurrency as CurrencyCode,
        attribute: value.budgetAttribute?.trim() || null,
      },
      isActive: true,
    };
  }

  private buildPromotionPayload(campaignId: string | null): PromotionCreatePayload {
    const value = this.form.getRawValue();
    return {
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
      rules: this.buildRulesPayload(this.rulesForm),
      targetRules: this.buildRulesPayload(this.targetRulesForm),
      campaignId: campaignId ?? undefined,
    };
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
}

