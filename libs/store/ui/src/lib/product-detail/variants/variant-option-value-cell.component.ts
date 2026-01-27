import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FlexTooltipDirective,
  FlexTooltipTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'fe-variant-option-value-cell',
  standalone: true,
  imports: [CommonModule, FlexTooltipTriggerDirective, FlexTooltipDirective],
  template: `
    @if (value) {
      <div class="flex items-center">
        <span
          class="inline-flex min-w-[20px] max-w-[140px] items-center justify-center overflow-hidden truncate"
          [attr.title]="value"
          [flexTooltipTrigger]="tooltip"
        >
          {{ value }}
        </span>
      </div>
      <ng-template #tooltip>
        <div
          flexTooltip
          class="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 txt-compact-xsmall shadow"
        >
          {{ value }}
        </div>
      </ng-template>
    } @else {
      <span class="text-ui-fg-muted">-</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantOptionValueCellComponent {
  @Input() value: string | null = null;
}
