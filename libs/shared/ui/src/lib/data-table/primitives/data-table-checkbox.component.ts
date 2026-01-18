import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RdxCheckboxModule } from '@radix-ng/primitives/checkbox';

export type DataTableCheckboxState = boolean | 'indeterminate';

@Component({
  selector: 'flex-data-table-checkbox',
  standalone: true,
  imports: [RdxCheckboxModule],
  template: `
    <div
      rdxCheckboxRoot
      [checked]="checked"
      (checkedChange)="checkedChange.emit($event)"
      [disabled]="disabled"
      [class]="classes"
    >
      <button rdxCheckboxButton type="button" class="flex h-full w-full items-center justify-center">
        <span rdxCheckboxIndicator class="text-ui-fg-on-color">
          @if (checked === true) {
            <i class="pi pi-check text-[10px]"></i>
          } @else if (checked === 'indeterminate') {
            <i class="pi pi-minus text-[10px]"></i>
          }
        </span>
      </button>
      <input rdxCheckboxInput type="checkbox" class="sr-only" />
    </div>
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
}
