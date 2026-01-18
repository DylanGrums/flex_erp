import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import {
  FlexTabsListDirective,
  FlexTabsRootDirective,
  FlexTabsTriggerDirective,
} from '@flex-erp/shared/ui';

export interface CmsTabItem {
  value: string;
  label: string;
}

@Component({
  selector: 'cms-tabs',
  standalone: true,
  imports: [
    FlexTabsRootDirective,
    FlexTabsListDirective,
    FlexTabsTriggerDirective,
    TranslocoModule,
  ],
  template: `
    <div flexTabsRoot [value]="value" (valueChange)="valueChange.emit($event)" [class]="rootClass">
      <div flexTabsList class="flex flex-wrap gap-2">
        @for (tab of tabs; track tab.value) {
          <button
            flexTabsTrigger
            type="button"
            [value]="tab.value"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors data-[state=active]:bg-ui-bg-interactive data-[state=active]:text-ui-fg-on-color bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-subtle-hover"
          >
            {{ tab.label | transloco }}
          </button>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsTabsComponent {
  @Input() tabs: CmsTabItem[] = [];
  @Input() value = '';
  @Input() className = '';

  @Output() valueChange = new EventEmitter<string>();

  get rootClass(): string {
    return this.className;
  }
}
