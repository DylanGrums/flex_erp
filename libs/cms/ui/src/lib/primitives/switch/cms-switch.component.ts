import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RdxSwitchModule } from '@radix-ng/primitives/switch';

@Component({
  selector: 'cms-switch',
  standalone: true,
  imports: [RdxSwitchModule],
  template: `
    <button
      rdxSwitchRoot
      [checked]="checked"
      (checkedChange)="checkedChange.emit($event ?? false)"
      [class]="rootClass"
      [disabled]="disabled"
    >
      <span rdxSwitchThumb [class]="thumbClass"></span>
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
      'inline-flex h-5 w-9 items-center rounded-full border border-ui-border-base bg-ui-bg-subtle transition data-[state=checked]:bg-ui-bg-interactive disabled:opacity-50';
    return [base, this.className].filter(Boolean).join(' ');
  }

  get thumbClass(): string {
    return 'block h-4 w-4 translate-x-0.5 rounded-full bg-ui-bg-base shadow transition data-[state=checked]:translate-x-4';
  }
}
