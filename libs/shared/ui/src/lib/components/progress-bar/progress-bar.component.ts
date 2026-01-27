import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'fe-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes flex-progress-indeterminate {
        0% {
          transform: translateX(-100%);
        }
        50% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .flex-progress-bar__bar {
        animation: flex-progress-indeterminate 1.2s ease-in-out infinite;
      }
    `,
  ],
})
export class FlexProgressBarComponent {
  @Input() className = '';
  @Input() barClassName = '';

  get containerClass(): string {
    const base = 'relative h-1 w-full overflow-hidden bg-transparent';
    return [base, this.className].filter(Boolean).join(' ');
  }

  get barClass(): string {
    const base = 'flex-progress-bar__bar absolute inset-y-0 left-0 w-1/2 bg-ui-bg-interactive';
    return [base, this.barClassName].filter(Boolean).join(' ');
  }
}
