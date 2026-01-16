import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'cms-textarea',
  standalone: true,
  template: `
    <textarea
      [attr.placeholder]="placeholder"
      [rows]="rows"
      [disabled]="disabled"
      [class]="textareaClass"
      [value]="value ?? ''"
      (input)="onInput($event)"
    ></textarea>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsTextareaComponent {
  @Input() value: string | null = '';
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() rows = 3;
  @Input() className = '';

  @Output() valueChange = new EventEmitter<string>();

  get textareaClass(): string {
    const base =
      'flex w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive disabled:opacity-50';
    return [base, this.className].filter(Boolean).join(' ');
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.valueChange.emit(value);
  }
}
