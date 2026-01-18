import { Directive, Input } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Directive({
  selector: '[flexSeparator]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpSeparator,
      inputs: ['ngpSeparatorOrientation:orientation'],
    },
  ],
})
export class FlexSeparatorDirective {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
}
