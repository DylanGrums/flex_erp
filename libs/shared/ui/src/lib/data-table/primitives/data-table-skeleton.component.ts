import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'flex-data-table-skeleton',
  standalone: true,
  template: `
    <div [class]="classes"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSkeletonComponent {
  @Input() className = '';

  get classes(): string {
    const base = 'animate-pulse bg-ui-bg-field rounded-md';
    return [base, this.className].filter(Boolean).join(' ');
  }
}
