import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexSwitchDirective, FlexSwitchThumbDirective } from '@flex-erp/shared/ui';

@Component({
  selector: 'cms-switch',
  standalone: true,
  imports: [FlexSwitchDirective, FlexSwitchThumbDirective],
  template: `
    <button
      flexSwitch
      [checked]="checked"
      (checkedChange)="checkedChange.emit($event ?? false)"
      [class]="rootClass"
      [disabled]="disabled"
    >
      <span flexSwitchThumb [class]="thumbClass"></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsSwitchComponent {
  @Input() checked = false;
  @Input() disabled = false;
  @Input() className = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  get rootClass(): string {
    const base =
      'inline-flex h-5 w-9 items-center rounded-full border border-ui-border-base bg-ui-bg-subtle transition data-[checked]:bg-ui-bg-interactive data-[disabled]:opacity-50';
    return [base, this.className].filter(Boolean).join(' ');
  }

  get thumbClass(): string {
    return 'block h-4 w-4 translate-x-0.5 rounded-full bg-ui-bg-base shadow transition data-[checked]:translate-x-4';
  }
}
