import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MenuModule, Menu } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import {
  AdminSortDirection,
  AdminTableAction,
  AdminTableColumn,
  AdminTableEmptyState,
  AdminTableSort,
} from '../admin-kit.types';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'fe-admin-table',
  standalone: true,
  imports: [CommonModule, TableModule, MenuModule, ButtonModule, TranslocoModule],
  templateUrl: './admin-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeAdminTableComponent implements OnChanges {
  @Input() columns: AdminTableColumn<any>[] = [];
  @Input() rows: any[] = [];
  @Input() loading = false;
  @Input() emptyState?: AdminTableEmptyState;
  @Input() rowActions: AdminTableAction<any>[] = [];
  @Input() page?: number;
  @Input() pageSize?: number;
  @Input() rowKey?: string;
  @Input() initialSort?: AdminTableSort;

  @Output() sortChange = new EventEmitter<AdminTableSort>();

  @ViewChild('rowMenu') rowMenu?: Menu;

  menuItems: MenuItem[] = [];
  private sortState?: AdminTableSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSort'] && this.initialSort) {
      this.sortState = { ...this.initialSort };
    }
  }

  get dataKey(): string | undefined {
    return this.rowKey ? String(this.rowKey) : undefined;
  }

  get totalColumns(): number {
    return this.columns.length + (this.rowActions?.length ? 1 : 0);
  }

  get displayRows(): any[] {
    const sorted = this.applySorting(this.rows ?? []);
    return this.applyPagination(sorted);
  }

  toggleSort(column: AdminTableColumn<any>): void {
    if (!column.sortable) {
      return;
    }

    const nextDirection = this.getNextSortDirection(column.key);
    this.sortState = {
      key: column.key,
      direction: nextDirection,
    };
    this.sortChange.emit(this.sortState);
  }

  getSortIcon(column: AdminTableColumn<any>): string {
    if (!column.sortable) {
      return 'pi pi-sort-alt';
    }

    if (!this.sortState || this.sortState.key !== column.key) {
      return 'pi pi-sort-alt';
    }

    return this.sortState.direction === 'asc'
      ? 'pi pi-sort-amount-up-alt'
      : 'pi pi-sort-amount-down';
  }

  getAriaSort(column: AdminTableColumn<any>): string | null {
    if (!column.sortable) {
      return null;
    }

    if (!this.sortState || this.sortState.key !== column.key) {
      return 'none';
    }

    return this.sortState.direction === 'asc' ? 'ascending' : 'descending';
  }

  getHeaderClass(column: AdminTableColumn<any>): string {
    const alignClass = this.getAlignClass(column.align);
    return [
      'px-4 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-zinc-400',
      alignClass,
      column.headerClassName,
    ]
      .filter(Boolean)
      .join(' ');
  }

  getCellClass(column: AdminTableColumn<any>): string {
    const alignClass = this.getAlignClass(column.align);
    return [
      'px-4 py-3 text-sm text-gray-700 dark:text-zinc-200',
      alignClass,
      column.className,
    ]
      .filter(Boolean)
      .join(' ');
  }

  getCellValue(row: any, column: AdminTableColumn<any>): string | number | null {
    if (column.cell) {
      const value = column.cell(row);
      return value ?? '';
    }

    const rawValue = (row as Record<string, unknown>)[column.key];
    if (rawValue === null || rawValue === undefined) {
      return '';
    }

    return typeof rawValue === 'string' || typeof rawValue === 'number'
      ? rawValue
      : String(rawValue);
  }

  openRowMenu(event: Event, row: any): void {
    if (!this.rowActions?.length) {
      return;
    }

    this.menuItems = this.rowActions.map((action) => ({
      label: action.label,
      icon: action.icon,
      disabled: action.disabled?.(row),
      styleClass: action.variant === 'danger' ? 'text-red-600' : undefined,
      command: () => action.onClick(row),
    }));

    this.rowMenu?.toggle(event);
  }

  trackByRow = (index: number, row: any): string | number => {
    if (this.rowKey) {
      const value = row?.[this.rowKey];
      if (typeof value === 'string' || typeof value === 'number') {
        return value;
      }
    }

    return index;
  };

  private applySorting(rows: any[]): any[] {
    if (!this.sortState) {
      return rows;
    }

    const column = this.columns.find((col) => col.key === this.sortState?.key);
    if (!column) {
      return rows;
    }

    const direction = this.sortState.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) =>
      direction * this.compareValues(this.resolveValue(a, column), this.resolveValue(b, column))
    );
  }

  private applyPagination(rows: any[]): any[] {
    if (!this.pageSize || !this.page || this.pageSize <= 0) {
      return rows;
    }

    const start = Math.max(this.page - 1, 0) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  private getNextSortDirection(key: string): AdminSortDirection {
    if (!this.sortState || this.sortState.key !== key) {
      return 'asc';
    }

    return this.sortState.direction === 'asc' ? 'desc' : 'asc';
  }

  private getAlignClass(align?: AdminTableColumn<any>['align']): string {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  }

  private resolveValue(row: any, column: AdminTableColumn<any>): unknown {
    if (column.sortValue) {
      return column.sortValue(row);
    }

    return (row as Record<string, unknown>)[column.key];
  }

  private compareValues(a: unknown, b: unknown): number {
    if (a === null || a === undefined) {
      return b === null || b === undefined ? 0 : -1;
    }

    if (b === null || b === undefined) {
      return 1;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }
}
