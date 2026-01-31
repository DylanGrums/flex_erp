import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { PromotionsFacade } from '@flex-erp/store/data-access';

@Component({
  selector: 'fe-promotion-detail-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <section class="space-y-6">
      @if (detailLoading()) {
        <div class="medusa-panel p-6 text-sm text-ui-fg-muted">Loading promotion...</div>
      }
      @if (errors()?.detail) {
        <div class="medusa-panel p-6 text-sm text-ui-fg-muted">{{ errors()?.detail }}</div>
      }

      @if (promotion(); as promotion) {
        <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-ui-fg-base">{{ promotion.code }}</h1>
            <p class="mt-1 text-sm text-ui-fg-subtle">Promotion details and rules.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-md border border-ui-border-base px-4 text-sm font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              (click)="editDetails()"
            >
              Edit details
            </button>
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-md border border-ui-border-base px-4 text-sm font-semibold text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              (click)="editRules()"
            >
              Edit rules
            </button>
          </div>
        </header>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,_1fr)_360px]">
          <div class="space-y-4">
            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Summary</div>
              <div class="mt-4 grid gap-4 text-sm text-ui-fg-muted md:grid-cols-2">
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Status</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ promotion.status }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Method</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ promotion.isAutomatic ? 'Automatic' : 'Code' }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Active</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ promotion.isActive ? 'Yes' : 'No' }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Usage limit</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ promotion.usageLimit ?? '—' }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Starts</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ formatDate(promotion.startsAt) }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Ends</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ formatDate(promotion.endsAt) }}</div>
                </div>
              </div>
            </div>

            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Application</div>
              <div class="mt-4 space-y-2 text-sm text-ui-fg-muted">
                @if (promotion.applicationMethod) {
                  <div>Type: <span class="text-ui-fg-base">{{ promotion.applicationMethod.type }}</span></div>
                  <div>Allocation: <span class="text-ui-fg-base">{{ promotion.applicationMethod.allocation }}</span></div>
                  <div>Target: <span class="text-ui-fg-base">{{ promotion.applicationMethod.targetType }}</span></div>
                  <div>Value: <span class="text-ui-fg-base">{{ formatValue(promotion.applicationMethod) }}</span></div>
                  <div>Max quantity: <span class="text-ui-fg-base">{{ promotion.applicationMethod.maxQuantity }}</span></div>
                } @else {
                  <div>No application method configured.</div>
                }
              </div>
            </div>

            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Rules</div>
              <div class="mt-4 space-y-3 text-sm text-ui-fg-muted">
                @if (!promotion.rules?.length) {
                  <div>No rules configured.</div>
                }
                @for (rule of promotion.rules; track rule.id) {
                  <div class="rounded-md border border-ui-border-base px-3 py-2">
                    <div class="text-xs uppercase text-ui-fg-subtle">{{ rule.scope }}</div>
                    <div class="mt-1 text-sm text-ui-fg-base">
                      {{ rule.attribute }} {{ rule.operator }} {{ formatRuleValues(rule.values) }}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Campaigns</div>
              <div class="mt-4 space-y-2 text-sm text-ui-fg-muted">
                @if (!promotion.campaigns?.length) {
                  <div>No campaigns attached.</div>
                } @else {
                  @for (campaign of promotion.campaigns; track campaign.id) {
                    <div class="rounded-md border border-ui-border-base px-3 py-2 text-ui-fg-base">
                      {{ campaign.name }}
                    </div>
                  }
                }
              </div>
            </div>
          </div>
        </div>
      }
    </section>

    <router-outlet></router-outlet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionDetailPageComponent {
  private readonly facade = inject(PromotionsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly promotion = this.facade.selectedDetail;
  readonly detailLoading = this.facade.detailLoading;
  readonly errors = this.facade.errors;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadPromotion(id);
    }
  }

  editDetails() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  editRules() {
    this.router.navigate(['rules', 'edit'], { relativeTo: this.route });
  }

  formatDate(value?: string | Date | null) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  }

  formatValue(method: any) {
    if (!method) return '—';
    const value = method.value ?? 0;
    return method.type === 'PERCENT' ? `${value}%` : `${value} ${method.currency}`;
  }

  formatRuleValues(values: unknown) {
    if (Array.isArray(values)) {
      return values.join(', ');
    }
    return values as any;
  }
}
