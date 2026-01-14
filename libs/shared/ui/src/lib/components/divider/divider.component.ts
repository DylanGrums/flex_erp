import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'dashed' | 'solid';

@Component({
  selector: 'fe-divider',
  standalone: true,
  templateUrl: './divider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexDividerComponent {
  @Input() orientation: DividerOrientation = 'horizontal';
  @Input() variant: DividerVariant = 'solid';
  @Input() className = '';

  get classes(): string {
    return [
      'border-ui-border-base',
      this.orientation === 'horizontal' && this.variant === 'solid'
        ? 'w-full border-t'
        : '',
      this.orientation === 'vertical' && this.variant === 'solid'
        ? 'h-full border-l'
        : '',
      this.variant === 'dashed'
        ? 'bg-transparent'
        : '',
      this.variant === 'dashed' && this.orientation === 'horizontal'
        ? 'h-px w-full bg-[linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] bg-[length:4px_1px]'
        : '',
      this.variant === 'dashed' && this.orientation === 'vertical'
        ? 'h-full w-px bg-[linear-gradient(0deg,var(--border-strong)_1px,transparent_1px)] bg-[length:1px_4px]'
        : '',
      this.className,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
