import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

type IconButtonSize = 'small' | 'base';
type IconButtonVariant = 'default' | 'transparent';

@Component({
  selector: 'button[flexDataTableIconButton]',
  standalone: true,
  template: ` <ng-content></ng-content> `,
  host: {
    type: 'button',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableIconButtonComponent {
  @Input() size: IconButtonSize = 'small';
  @Input() variant: IconButtonVariant = 'default';
  @Input() disabled = false;
  @Input() className = '';

  @HostBinding('class')
  get classes(): string {
    const base =
      'inline-flex items-center justify-center rounded-md transition-fg focus-visible:shadow-borders-focus';
    const sizeClass = this.size === 'small' ? 'h-7 w-7' : 'h-8 w-8';
    const variantClass =
      this.variant === 'transparent'
        ? 'bg-transparent hover:bg-ui-bg-base-hover'
        : 'border border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-base-hover';
    const disabledClass = this.disabled ? 'opacity-50 pointer-events-none' : '';

    return [base, sizeClass, variantClass, disabledClass, this.className]
      .filter(Boolean)
      .join(' ');
  }

  @HostBinding('disabled')
  get hostDisabled(): boolean {
    return this.disabled;
  }
}
