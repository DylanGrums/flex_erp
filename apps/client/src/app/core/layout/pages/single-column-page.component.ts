import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JsonViewSectionComponent } from './json-view-section.component';
import { MetadataSectionComponent } from './metadata-section.component';

export type WidgetConfig = {
  before: Type<unknown>[];
  after: Type<unknown>[];
};

@Component({
  selector: 'app-single-column-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NgComponentOutlet, JsonViewSectionComponent, MetadataSectionComponent],
  templateUrl: './single-column-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleColumnPageComponent<TData = unknown> {
  @Input({ required: true }) widgets!: WidgetConfig;
  @Input() data?: TData;

  @Input() hasOutlet = true;
  @Input() showJSON = false;
  @Input() showMetadata = false;

  widgetContext: Record<string, unknown> = {};

  ngOnChanges(): void {
    this.widgetContext = { data: this.data };
    if (this.showJSON && !this.data) this.showJSON = false;
    if (this.showMetadata && !this.data) this.showMetadata = false;
  }
}
