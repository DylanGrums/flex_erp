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
import { InputTextModule } from 'primeng/inputtext';

let nextInputId = 0;

@Component({
  selector: 'fe-input',
  standalone: true,
  imports: [CommonModule, InputTextModule],
  templateUrl: './input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeInputComponent implements OnChanges {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() value: string | null = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() id?: string;
  @Input() name?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() ariaLabel?: string;
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' = 'text';

  @Output() valueChange = new EventEmitter<string>();

  inputId = `fe-input-${++nextInputId}`;

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

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
}
