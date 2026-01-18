import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { injectDataTableContext } from '../data-table-context';
import { DataTableSkeletonComponent } from '../primitives/data-table-skeleton.component';

@Component({
  selector: 'flex-data-table-search',
  standalone: true,
  imports: [CommonModule, DataTableSkeletonComponent],
  template: `
    @if (instance.showSkeleton) {
      <flex-data-table-skeleton className="h-8 w-[160px]"></flex-data-table-skeleton>
    } @else {
      <input
        [attr.autofocus]="autoFocus ? true : null"
        type="search"
        [value]="instance.getSearch()"
        (input)="onSearchInput($event)"
        [placeholder]="placeholder"
        [class]="inputClasses"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSearchComponent {
  @Input() autoFocus = false;
  @Input() className = '';
  @Input() placeholder = 'Search...';

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.instance.onSearchChange(target?.value ?? '');
  }

  get inputClasses(): string {
    const base =
      'h-8 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base shadow-borders-base transition-fg placeholder:text-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-border-interactive';
    const loadingClass = this.instance.isLoading ? 'pr-[calc(15px+2px+8px)]' : '';
    return [base, loadingClass, this.className].filter(Boolean).join(' ');
  }
}
