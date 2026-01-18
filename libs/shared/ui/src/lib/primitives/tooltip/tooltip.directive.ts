import { Directive, Input, booleanAttribute, numberAttribute } from '@angular/core';
import { NgpOffset } from 'ng-primitives/portal';
import {
  NgpTooltip,
  NgpTooltipArrow,
  NgpTooltipPlacement,
  NgpTooltipTrigger,
} from 'ng-primitives/tooltip';

@Directive({
  selector: '[flexTooltipTrigger]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTrigger:flexTooltipTrigger',
        'ngpTooltipTriggerShowDelay:openDelay',
        'ngpTooltipTriggerPlacement:placement',
        'ngpTooltipTriggerOffset:offset',
        'ngpTooltipTriggerDisabled:disabled',
      ],
    },
  ],
})
export class FlexTooltipTriggerDirective {
  @Input() flexTooltipTrigger?: unknown;
  @Input({ alias: 'openDelay', transform: numberAttribute }) openDelay = 0;
  @Input() placement?: NgpTooltipPlacement;
  @Input() offset?: NgpOffset;
  @Input({ transform: booleanAttribute }) disabled = false;
}

@Directive({
  selector: '[flexTooltip]',
  standalone: true,
  hostDirectives: [NgpTooltip],
})
export class FlexTooltipDirective {}

@Directive({
  selector: '[flexTooltipArrow]',
  standalone: true,
  hostDirectives: [NgpTooltipArrow],
})
export class FlexTooltipArrowDirective {}
