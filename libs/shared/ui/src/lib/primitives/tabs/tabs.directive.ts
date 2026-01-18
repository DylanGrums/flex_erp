import { Directive, HostBinding, Input, inject } from '@angular/core';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';

@Directive({
  selector: '[flexTabsRoot]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpTabset,
      inputs: ['ngpTabsetValue:value'],
      outputs: ['ngpTabsetValueChange:valueChange'],
    },
  ],
})
export class FlexTabsRootDirective {
  @Input() value?: string;
}

@Directive({
  selector: '[flexTabsList]',
  standalone: true,
  hostDirectives: [NgpTabList],
})
export class FlexTabsListDirective {}

@Directive({
  selector: '[flexTabsTrigger]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpTabButton,
      inputs: ['ngpTabButtonValue:value', 'ngpTabButtonDisabled:disabled'],
    },
  ],
})
export class FlexTabsTriggerDirective {
  private readonly tabButton = inject(NgpTabButton);

  @HostBinding('attr.data-state')
  get dataState(): string | null {
    return this.tabButton.active() ? 'active' : null;
  }
}

@Directive({
  selector: '[flexTabsContent]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpTabPanel,
      inputs: ['ngpTabPanelValue:value'],
    },
  ],
})
export class FlexTabsContentDirective {
  @Input() value?: string;
}
