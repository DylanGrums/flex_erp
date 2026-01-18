import { Directive, Input, booleanAttribute } from '@angular/core';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

@Directive({
  selector: '[flexSelect]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: [
        'ngpSelectValue:value',
        'ngpSelectDisabled:disabled',
        'ngpSelectMultiple:multiple',
      ],
      outputs: ['ngpSelectValueChange:valueChange'],
    },
  ],
})
export class FlexSelectDirective {
  @Input() value?: unknown;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) multiple = false;
}

@Directive({
  selector: '[flexSelectPortal]',
  standalone: true,
  hostDirectives: [NgpSelectPortal],
})
export class FlexSelectPortalDirective {}

@Directive({
  selector: '[flexSelectDropdown]',
  standalone: true,
  hostDirectives: [NgpSelectDropdown],
})
export class FlexSelectDropdownDirective {}

@Directive({
  selector: '[flexSelectOption]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpSelectOption,
      inputs: ['ngpSelectOptionValue:flexSelectOptionValue', 'ngpSelectOptionDisabled:disabled'],
    },
  ],
})
export class FlexSelectOptionDirective {
  @Input() flexSelectOptionValue?: unknown;
  @Input({ transform: booleanAttribute }) disabled = false;
}
