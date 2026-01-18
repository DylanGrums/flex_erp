import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import { NgpMenu, NgpMenuItem, NgpMenuPlacement, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpSeparator } from 'ng-primitives/separator';

@Directive({
  selector: '[flexDropdownMenuTrigger]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpMenuTrigger,
      inputs: [
        'ngpMenuTrigger:flexDropdownMenuTrigger',
        'ngpMenuTriggerOffset:sideOffset',
        'ngpMenuTriggerPlacement:placement',
        'ngpMenuTriggerScrollBehavior:scrollBehavior',
        'ngpMenuTriggerDisabled:disabled',
      ],
    },
  ],
})
export class FlexDropdownMenuTriggerDirective {
  @Input() flexDropdownMenuTrigger?: unknown;
  @Input({ alias: 'sideOffset', transform: numberAttribute }) sideOffset = 0;
  @Input() placement?: NgpMenuPlacement;
  @Input() scrollBehavior: 'reposition' | 'block' = 'reposition';
  @Input({ transform: booleanAttribute }) disabled = false;
}

@Directive({
  selector: '[flexDropdownMenuContent]',
  standalone: true,
  hostDirectives: [NgpMenu],
  host: {
    'style.display': 'block',
    'style.position': 'fixed',
    'style.z-index': '60',
  },
})
export class FlexDropdownMenuContentDirective {}

@Directive({
  selector: '[flexDropdownMenuItem]',
  standalone: true,
  hostDirectives: [NgpMenuItem],
})
export class FlexDropdownMenuItemDirective {}

@Directive({
  selector: '[flexDropdownMenuSeparator]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpSeparator,
      inputs: ['ngpSeparatorOrientation:orientation'],
    },
  ],
})
export class FlexDropdownMenuSeparatorDirective {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
}

@Directive({
  selector: '[flexDropdownMenuLabel]',
  standalone: true,
})
export class FlexDropdownMenuLabelDirective {
  @HostBinding('attr.role') readonly role = 'presentation';
  @HostBinding('attr.aria-hidden') readonly ariaHidden = 'true';
}

@Directive({
  selector: '[flexDropdownMenuItemRadioGroup]',
  standalone: true,
})
export class FlexDropdownMenuItemRadioGroupDirective {
  @Input() value: string | null | undefined = null;
  @Output() valueChange = new EventEmitter<string>();

  setValue(value: string): void {
    if (this.value === value) {
      return;
    }

    this.value = value;
    this.valueChange.emit(value);
  }
}

@Directive({
  selector: '[flexDropdownMenuItemRadio]',
  standalone: true,
  hostDirectives: [NgpMenuItem],
})
export class FlexDropdownMenuItemRadioDirective {
  private readonly group = inject(FlexDropdownMenuItemRadioGroupDirective, {
    optional: true,
    host: true,
  });

  @Input() value?: string;

  @HostBinding('attr.role') readonly role = 'menuitemradio';
  @HostBinding('attr.data-state') get dataState(): string | null {
    return this.checked ? 'checked' : 'unchecked';
  }
  @HostBinding('attr.aria-checked') get ariaChecked(): string | null {
    if (!this.group) {
      return null;
    }

    return this.checked ? 'true' : 'false';
  }

  get checked(): boolean {
    return !!this.group && this.value !== undefined && this.group.value === this.value;
  }

  @HostListener('click')
  handleClick(): void {
    if (!this.group || this.value === undefined) {
      return;
    }

    this.group.setValue(this.value);
  }
}

@Directive({
  selector: '[flexDropdownMenuItemIndicator]',
  standalone: true,
})
export class FlexDropdownMenuItemIndicatorDirective {
  private readonly item = inject(FlexDropdownMenuItemRadioDirective, {
    optional: true,
    host: true,
  });

  @HostBinding('attr.hidden')
  get hidden(): '' | null {
    if (!this.item) {
      return null;
    }

    return this.item.checked ? null : '';
  }
}
