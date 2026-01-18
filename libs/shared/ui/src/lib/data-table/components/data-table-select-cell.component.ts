import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import {
  DataTableCellContext,
  DataTableHeaderContext,
  DataTableRowData,
} from '../types';
import { DataTableCheckboxComponent, DataTableCheckboxState } from '../primitives/data-table-checkbox.component';

@Component({
  selector: 'flex-data-table-select-cell',
  standalone: true,
  imports: [CommonModule, DataTableCheckboxComponent],
  template: `
    <flex-data-table-checkbox
      (click)="$event.stopPropagation()"
      [checked]="checked"
      [disabled]="disabled"
      (checkedChange)="onCheckedChange()"
    ></flex-data-table-checkbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSelectCellComponent<TData extends DataTableRowData> {
  @Input({ required: true }) ctx!: DataTableCellContext<TData, unknown>;

  get checked(): DataTableCheckboxState {
    return this.ctx.row.getIsSelected();
  }

  get disabled(): boolean {
    return !this.ctx.row.getCanSelect();
  }

  onCheckedChange(): void {
    this.ctx.row.toggleSelected();
  }
}

@Component({
  selector: 'flex-data-table-select-header',
  standalone: true,
  imports: [CommonModule, DataTableCheckboxComponent],
  template: `
    <flex-data-table-checkbox
      (click)="$event.stopPropagation()"
      [checked]="checked"
      [disabled]="disabled"
      (checkedChange)="onCheckedChange($event)"
    ></flex-data-table-checkbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSelectHeaderComponent<TData extends DataTableRowData> {
  @Input({ required: true }) ctx!: DataTableHeaderContext<TData, unknown>;

  get checked(): DataTableCheckboxState {
    return this.ctx.table.getIsSomePageRowsSelected()
      ? 'indeterminate'
      : this.ctx.table.getIsAllPageRowsSelected();
  }

  get disabled(): boolean {
    return !this.ctx.table.getRowModel().rows.some((row) => row.getCanSelect());
  }

  onCheckedChange(value: DataTableCheckboxState): void {
    this.ctx.table.toggleAllPageRowsSelected(Boolean(value));
  }
}
