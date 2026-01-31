import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignsFacade } from '@flex-erp/store/data-access';

@Component({
  selector: 'fe-campaign-detail-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      @if (detailLoading()) {
        <div class="medusa-panel p-6 text-sm text-ui-fg-muted">Loading campaign...</div>
      }
      @if (errors()?.detail) {
        <div class="medusa-panel p-6 text-sm text-ui-fg-muted">{{ errors()?.detail }}</div>
      }

      @if (campaign(); as campaign) {
        <header>
          <h1 class="text-2xl font-semibold text-ui-fg-base">{{ campaign.name }}</h1>
          <p class="mt-1 text-sm text-ui-fg-subtle">Campaign details and linked promotions.</p>
        </header>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,_1fr)_360px]">
          <div class="space-y-4">
            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Summary</div>
              <div class="mt-4 grid gap-4 text-sm text-ui-fg-muted md:grid-cols-2">
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Active</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ campaign.isActive ? 'Yes' : 'No' }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Budget type</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ campaign.budget?.type }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Starts</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ formatDate(campaign.startsAt) }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-ui-fg-subtle">Ends</div>
                  <div class="mt-1 text-sm text-ui-fg-base">{{ formatDate(campaign.endsAt) }}</div>
                </div>
              </div>
            </div>

            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Promotions</div>
              <div class="mt-4 space-y-2 text-sm text-ui-fg-muted">
                @if (!campaign.promotions?.length) {
                  <div>No promotions attached.</div>
                } @else {
                  @for (promotion of campaign.promotions; track promotion.id) {
                    <div class="rounded-md border border-ui-border-base px-3 py-2 text-ui-fg-base">
                      {{ promotion.code }}
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="medusa-panel p-6">
              <div class="text-sm font-semibold text-ui-fg-base">Budget</div>
              <div class="mt-4 space-y-2 text-sm text-ui-fg-muted">
                <div>Limit: <span class="text-ui-fg-base">{{ campaign.budget?.limitAmount ?? '—' }}</span></div>
                <div>Currency: <span class="text-ui-fg-base">{{ campaign.budget?.currency }}</span></div>
                <div>Attribute: <span class="text-ui-fg-base">{{ campaign.budget?.attribute ?? '—' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailPageComponent {
  private readonly facade = inject(CampaignsFacade);
  private readonly route = inject(ActivatedRoute);

  readonly campaign = this.facade.selectedDetail;
  readonly detailLoading = this.facade.detailLoading;
  readonly errors = this.facade.errors;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadCampaign(id);
    }
  }

  formatDate(value?: string | Date | null) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  }
}
