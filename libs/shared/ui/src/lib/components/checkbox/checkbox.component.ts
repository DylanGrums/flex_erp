import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Check, LucideAngularModule, Minus } from 'lucide-angular';
import { FlexCheckboxDirective } from '../../primitives/checkbox/checkbox.directive';

export type FlexCheckboxState = boolean | 'indeterminate';

@Component({
  selector: 'fe-checkbox',
  standalone: true,
  imports: [FlexCheckboxDirective, LucideAngularModule],
  template: `
    <button
      flexCheckbox
      type="button"
      [checked]="checked === true"
      [indeterminate]="checked === 'indeterminate'"
      [disabled]="disabled"
      [class]="classes"
      (checkedChange)="onCheckedChange($event)"
      (indeterminateChange)="onIndeterminateChange($event)"
    >
      <span class="text-ui-fg-on-color">
        @if (checked === true) {
          <i-lucide [img]="Check" class="h-3 w-3"></i-lucide>
        } @else if (checked === 'indeterminate') {
          <i-lucide [img]="Minus" class="h-3 w-3"></i-lucide>
        }
      </span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexCheckboxComponent {
  readonly Check = Check;
  readonly Minus = Minus;

  @Input() checked: FlexCheckboxState = false;
  @Input() disabled = false;
  @Input() className = '';

  @Output() checkedChange = new EventEmitter<FlexCheckboxState>();

  get classes(): string {
    const base =
      'flex size-4 items-center justify-center rounded border border-ui-border-base bg-ui-bg-base text-ui-fg-on-color shadow-borders-base transition-fg';
    const stateClass = this.checked
      ? 'bg-ui-bg-interactive border-ui-border-interactive'
      : 'bg-ui-bg-base';
    const disabledClass = this.disabled ? 'opacity-50 pointer-events-none' : '';
    return [base, stateClass, disabledClass, this.className].filter(Boolean).join(' ');
  }

  onCheckedChange(next: boolean): void {
    this.checkedChange.emit(next);
  }

  onIndeterminateChange(next: boolean): void {
    if (next) {
      this.checkedChange.emit('indeterminate');
      return;
    }

    if (this.checked === 'indeterminate') {
      this.checkedChange.emit(false);
    }
  }
}
