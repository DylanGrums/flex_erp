import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AdminSelectOption } from '../admin-kit.types';

let nextSelectId = 0;

@Component({
  selector: 'fe-select',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeSelectComponent<T = string> implements OnChanges {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() value: T | null = null;
  @Input() options: AdminSelectOption<T>[] = [];
  @Input() disabled = false;
  @Input() required = false;
  @Input() id?: string;
  @Input() name?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() ariaLabel?: string;

  @Output() valueChange = new EventEmitter<T | null>();

  inputId = `fe-select-${++nextSelectId}`;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.inputId = this.id;
    }
  }

  get describedBy(): string | null {
    if (this.error) {
      return `${this.inputId}-error`;
    }

    if (this.hint) {
      return `${this.inputId}-hint`;
    }

    return null;
  }

  onChange(value: T | null): void {
    this.valueChange.emit(value);
  }
}
