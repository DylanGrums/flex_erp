import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'cms-scroll-area',
  standalone: true,
  template: `
    <div [class]="scrollClass">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsScrollAreaComponent {
  @Input() className = '';

  get scrollClass(): string {
    const base = 'h-full w-full min-h-0 min-w-0 overflow-auto';
    return [base, this.className].filter(Boolean).join(' ');
  }
}
