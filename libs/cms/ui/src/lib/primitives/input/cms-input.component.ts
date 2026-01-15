import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'cms-input',
  standalone: true,
  template: `
    <input
      [attr.type]="type"
      [attr.placeholder]="placeholder"
      [value]="value ?? ''"
      [disabled]="disabled"
      [class]="inputClass"
      (input)="onInput($event)"
      (blur)="blurred.emit()"
      (keydown.enter)="enterPressed.emit()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsInputComponent {
  @Input() value: string | null = '';
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'color' = 'text';
  @Input() className = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();
  @Output() enterPressed = new EventEmitter<void>();

  get inputClass(): string {
    const base =
      'flex h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive disabled:opacity-50';
    return [base, this.className].filter(Boolean).join(' ');
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
}
