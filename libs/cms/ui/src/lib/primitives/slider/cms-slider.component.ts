import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RdxSliderModule } from '@radix-ng/primitives/slider';

@Component({
  selector: 'cms-slider',
  standalone: true,
  imports: [RdxSliderModule],
  template: `
    <rdx-slider
      [min]="min"
      [max]="max"
      [step]="step"
      [modelValue]="[value]"
      (modelValueChange)="onValueChange($event)"
      [className]="rootClass"
    >
      <rdx-slider-track class="relative h-1 w-full rounded-full bg-ui-bg-subtle">
        <rdx-slider-range class="absolute h-full rounded-full bg-ui-bg-interactive"></rdx-slider-range>
      </rdx-slider-track>
      <rdx-slider-thumb class="block h-4 w-4 rounded-full border border-ui-border-base bg-ui-bg-base shadow"></rdx-slider-thumb>
    </rdx-slider>
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

  onValueChange(values: number[]): void {
    const next = values[0] ?? this.min;
    this.valueChange.emit(next);
  }
}
