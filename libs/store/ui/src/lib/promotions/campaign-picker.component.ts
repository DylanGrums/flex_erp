import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CampaignListItem } from '@flex-erp/store/util';

export type CampaignPickerMode = 'none' | 'existing' | 'new';

@Component({
  selector: 'fe-campaign-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <div class="text-sm font-semibold text-ui-fg-base">Campaign</div>
        <p class="mt-1 text-xs text-ui-fg-muted">
          Attach an existing campaign or create a new one.
        </p>
      </div>

      <div class="grid gap-2 md:grid-cols-3">
        <button
          type="button"
          class="rounded-md border px-3 py-2 text-xs font-semibold"
          [class.border-ui-border-strong]="mode === 'none'"
          [class.border-ui-border-base]="mode !== 'none'"
          (click)="setMode('none')"
        >
          No campaign
        </button>
        <button
          type="button"
          class="rounded-md border px-3 py-2 text-xs font-semibold"
          [class.border-ui-border-strong]="mode === 'existing'"
          [class.border-ui-border-base]="mode !== 'existing'"
          (click)="setMode('existing')"
        >
          Existing campaign
        </button>
        <button
          type="button"
          class="rounded-md border px-3 py-2 text-xs font-semibold"
          [class.border-ui-border-strong]="mode === 'new'"
          [class.border-ui-border-base]="mode !== 'new'"
          (click)="setMode('new')"
        >
          New campaign
        </button>
      </div>

      @if (mode === 'existing') {
        <div>
          <label class="text-xs font-semibold text-ui-fg-muted">Select campaign</label>
          <select
            class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
            [ngModel]="selectedCampaignId"
            (ngModelChange)="campaignIdChange.emit($event)"
          >
            <option [ngValue]="null">Choose campaign</option>
            @for (campaign of campaigns; track campaign.id) {
              <option [value]="campaign.id">{{ campaign.name }}</option>
            }
          </select>
        </div>
      }

      @if (mode === 'new' && campaignForm) {
        <div class="space-y-4" [formGroup]="campaignForm">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Name</label>
              <input
                formControlName="name"
                type="text"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Budget type</label>
              <select
                formControlName="budgetType"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              >
                <option value="NONE">None</option>
                <option value="SPEND_LIMIT">Spend limit</option>
                <option value="USE_BY_ATTRIBUTE">Use by attribute</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-ui-fg-muted">Description</label>
            <textarea
              formControlName="description"
              rows="2"
              class="mt-2 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base shadow-borders-base"
            ></textarea>
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
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Budget limit</label>
              <input
                formControlName="budgetLimitAmount"
                type="number"
                min="0"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Currency</label>
              <select
                formControlName="budgetCurrency"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold text-ui-fg-muted">Attribute</label>
              <input
                formControlName="budgetAttribute"
                type="text"
                class="mt-2 h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
              />
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignPickerComponent {
  @Input() campaigns: CampaignListItem[] = [];
  @Input() mode: CampaignPickerMode = 'none';
  @Input() selectedCampaignId: string | null = null;
  @Input() campaignForm?: FormGroup;

  @Output() modeChange = new EventEmitter<CampaignPickerMode>();
  @Output() campaignIdChange = new EventEmitter<string | null>();

  setMode(mode: CampaignPickerMode) {
    this.mode = mode;
    this.modeChange.emit(mode);
    if (mode !== 'existing') {
      this.campaignIdChange.emit(null);
    }
  }
}
