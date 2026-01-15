import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RdxTabsModule } from '@radix-ng/primitives/tabs';

export interface CmsTabItem {
  value: string;
  label: string;
}

@Component({
  selector: 'cms-tabs',
  standalone: true,
  imports: [RdxTabsModule],
  template: `
    <div rdxTabsRoot [value]="value" (valueChange)="valueChange.emit($event)" [class]="rootClass">
      <div rdxTabsList class="flex flex-wrap gap-2">
        @for (tab of tabs; track tab.value) {
          <button
            rdxTabsTrigger
            type="button"
            [value]="tab.value"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors data-[state=active]:bg-ui-bg-interactive data-[state=active]:text-ui-fg-on-color bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-subtle-hover"
          >
            {{ tab.label }}
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
