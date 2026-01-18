import { Directive, Input, booleanAttribute } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Directive({
  selector: '[flexCheckbox]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpCheckbox,
      inputs: [
        'ngpCheckboxChecked:checked',
        'ngpCheckboxIndeterminate:indeterminate',
        'ngpCheckboxDisabled:disabled',
      ],
      outputs: [
        'ngpCheckboxCheckedChange:checkedChange',
        'ngpCheckboxIndeterminateChange:indeterminateChange',
      ],
    },
  ],
})
export class FlexCheckboxDirective {
  @Input({ transform: booleanAttribute }) checked = false;
  @Input({ transform: booleanAttribute }) indeterminate = false;
  @Input({ transform: booleanAttribute }) disabled = false;
}
