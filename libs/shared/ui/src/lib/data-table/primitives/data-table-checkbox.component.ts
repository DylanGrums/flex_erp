import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FlexCheckboxDirective } from '../../primitives/checkbox/checkbox.directive';

export type DataTableCheckboxState = boolean | 'indeterminate';

@Component({
  selector: 'flex-data-table-checkbox',
  standalone: true,
  imports: [FlexCheckboxDirective],
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
          <i class="pi pi-check text-[10px]"></i>
        } @else if (checked === 'indeterminate') {
          <i class="pi pi-minus text-[10px]"></i>
        }
      </span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableCheckboxComponent {
  @Input() checked: DataTableCheckboxState = false;
  @Input() disabled = false;
  @Input() className = '';

  @Output() checkedChange = new EventEmitter<DataTableCheckboxState>();

  get classes(): string {
    const base =
      'flex size-[18px] items-center justify-center rounded border border-ui-border-base bg-ui-bg-base text-ui-fg-on-color shadow-borders-base transition-fg';
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
