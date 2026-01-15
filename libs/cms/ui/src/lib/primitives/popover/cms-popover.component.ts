import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RdxPopoverModule } from '@radix-ng/primitives/popover';

@Component({
  selector: 'cms-popover',
  standalone: true,
  imports: [RdxPopoverModule],
  template: `
    <div rdxPopoverRoot>
      <span rdxPopoverTrigger>
        <ng-content select="[cmsPopoverTrigger]"></ng-content>
      </span>
      <ng-template rdxPopoverContent>
        <div rdxPopoverContentAttributes [class]="contentClass">
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
