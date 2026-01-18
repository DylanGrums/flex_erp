import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FlexSliderDirective,
  FlexSliderRangeDirective,
  FlexSliderThumbDirective,
  FlexSliderTrackDirective,
} from '@flex-erp/shared/ui';

@Component({
  selector: 'cms-slider',
  standalone: true,
  imports: [
    FlexSliderDirective,
    FlexSliderTrackDirective,
    FlexSliderRangeDirective,
    FlexSliderThumbDirective,
  ],
  template: `
    <div
      flexSlider
      [min]="min"
      [max]="max"
      [step]="step"
      [value]="value"
      (valueChange)="valueChange.emit($event)"
      [class]="rootClass"
    >
      <div flexSliderTrack class="relative h-1 w-full rounded-full bg-ui-bg-subtle">
        <div flexSliderRange class="absolute h-full rounded-full bg-ui-bg-interactive"></div>
      </div>
      <div
        flexSliderThumb
        class="block h-4 w-4 rounded-full border border-ui-border-base bg-ui-bg-base shadow"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsSliderComponent {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() className = '';

  @Output() valueChange = new EventEmitter<number>();

  get rootClass(): string {
    const base = 'relative flex h-4 w-full touch-none select-none items-center';
    return [base, this.className].filter(Boolean).join(' ');
  }

}
