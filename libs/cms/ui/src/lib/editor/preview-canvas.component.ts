import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DeviceType, NodeId, Section } from '@flex-erp/cms/types';
import { TranslocoModule } from '@jsverse/transloco';

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

@Component({
  selector: 'cms-preview-canvas',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './preview-canvas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply block overflow-auto h-full w-full ;
      }
    `,
  ],
})
export class CmsPreviewCanvasComponent {
  @Input() sections: Section[] = [];
  @Input() viewportMode: DeviceType = 'desktop';
  @Input() selectedSectionId: NodeId | null = null;

  @Output() selectNode = new EventEmitter<NodeId>();

  hoveredId: NodeId | null = null;

  get deviceWidth(): string {
    return DEVICE_WIDTHS[this.viewportMode];
  }

  isSelected(section: Section): boolean {
    return this.selectedSectionId === section.id;
  }

  setHover(sectionId: NodeId | null): void {
    this.hoveredId = sectionId;
  }

  range(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  toNumber(value: unknown, fallback: number): number {
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  }
}
