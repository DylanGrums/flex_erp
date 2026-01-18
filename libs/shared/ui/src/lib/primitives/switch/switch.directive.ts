import { Directive, Input, booleanAttribute } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Directive({
  selector: '[flexSwitch]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpSwitch,
      inputs: ['ngpSwitchChecked:checked', 'ngpSwitchDisabled:disabled'],
      outputs: ['ngpSwitchCheckedChange:checkedChange'],
    },
  ],
})
export class FlexSwitchDirective {
  @Input({ transform: booleanAttribute }) checked = false;
  @Input({ transform: booleanAttribute }) disabled = false;
}

@Directive({
  selector: '[flexSwitchThumb]',
  standalone: true,
  hostDirectives: [NgpSwitchThumb],
})
export class FlexSwitchThumbDirective {}
