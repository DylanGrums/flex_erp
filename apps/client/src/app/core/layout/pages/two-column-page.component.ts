import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JsonViewSectionComponent } from './json-view-section.component';
import { MetadataSectionComponent } from './metadata-section.component';

export type TwoColumnWidgetConfig = {
  before: Type<unknown>[];
  after: Type<unknown>[];
  sideBefore: Type<unknown>[];
  sideAfter: Type<unknown>[];
};

@Component({
  selector: 'app-two-column-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NgComponentOutlet, JsonViewSectionComponent, MetadataSectionComponent],
  templateUrl: './two-column-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoColumnPageComponent<TData = unknown> {
  @Input({ required: true }) widgets!: TwoColumnWidgetConfig;
  @Input() data?: TData;

  @Input() showJSON = false;
  @Input() showMetadata = false;
  @Input() hasOutlet = true;

  widgetContext: Record<string, unknown> = {};

  ngOnChanges(): void {
    this.widgetContext = { data: this.data };
    if (this.showJSON && !this.data) this.showJSON = false;
    if (this.showMetadata && !this.data) this.showMetadata = false;
  }

  get showExtraData(): boolean {
    return !!(this.showJSON || this.showMetadata);
  }
}
