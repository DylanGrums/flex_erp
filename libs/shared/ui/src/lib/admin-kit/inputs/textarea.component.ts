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
import { TextareaModule } from 'primeng/textarea';

let nextTextareaId = 0;

@Component({
  selector: 'fe-textarea',
  standalone: true,
  imports: [CommonModule, TextareaModule],
  templateUrl: './textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeTextareaComponent implements OnChanges {
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
  @Input() rows = 3;

  @Output() valueChange = new EventEmitter<string>();

  inputId = `fe-textarea-${++nextTextareaId}`;

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
    const value = (event.target as HTMLTextAreaElement).value;
    this.valueChange.emit(value);
  }
}
