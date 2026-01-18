import { Directive, Input, booleanAttribute } from '@angular/core';
import {
  NgpSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
} from 'ng-primitives/slider';

@Directive({
  selector: '[flexSlider]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'ngpSliderValue:value',
        'ngpSliderMin:min',
        'ngpSliderMax:max',
        'ngpSliderStep:step',
        'ngpSliderDisabled:disabled',
      ],
      outputs: ['ngpSliderValueChange:valueChange'],
    },
  ],
})
export class FlexSliderDirective {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input({ transform: booleanAttribute }) disabled = false;
}

@Directive({
  selector: '[flexSliderTrack]',
  standalone: true,
  hostDirectives: [NgpSliderTrack],
})
export class FlexSliderTrackDirective {}

@Directive({
  selector: '[flexSliderRange]',
  standalone: true,
  hostDirectives: [NgpSliderRange],
})
export class FlexSliderRangeDirective {}

@Directive({
  selector: '[flexSliderThumb]',
  standalone: true,
  hostDirectives: [NgpSliderThumb],
})
export class FlexSliderThumbDirective {}
