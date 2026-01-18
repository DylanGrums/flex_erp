import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FlexPopoverDirective,
  FlexPopoverTriggerDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'cms-popover',
  standalone: true,
  imports: [FlexPopoverTriggerDirective, FlexPopoverDirective],
  template: `
    <div>
      <span [flexPopoverTrigger]="popoverTemplate">
        <ng-content select="[cmsPopoverTrigger]"></ng-content>
      </span>
      <ng-template #popoverTemplate>
        <div flexPopover [class]="contentClass">
          <ng-content select="[cmsPopoverContent]"></ng-content>
        </div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsPopoverComponent {
  @Input() contentClass = 'z-50 rounded-md border border-ui-border-base bg-ui-bg-base p-3 shadow';
}
