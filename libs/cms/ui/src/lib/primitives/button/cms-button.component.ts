import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type CmsButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost' | 'destructive';
export type CmsButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'cms-button',
  standalone: true,
  template: `
    <button
      [attr.type]="type"
      [disabled]="disabled"
      [class]="buttonClass"
    >
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsButtonComponent {
  @Input() variant: CmsButtonVariant = 'primary';
  @Input() size: CmsButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() className = '';

  get buttonClass(): string {
    const base =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants: Record<CmsButtonVariant, string> = {
      primary: 'bg-ui-bg-interactive text-ui-fg-on-color hover:bg-ui-bg-interactive/90',
      outline: 'border border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-subtle-hover',
      secondary: 'bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-subtle-hover',
      ghost: 'hover:bg-ui-bg-subtle-hover',
      destructive: 'bg-ui-button-danger text-ui-fg-on-color hover:bg-ui-button-danger-hover',
    };

    const sizes: Record<CmsButtonSize, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4',
      lg: 'h-10 px-6',
      icon: 'h-8 w-8',
    };

    return [base, variants[this.variant], sizes[this.size], this.className].filter(Boolean).join(' ');
  }
}
