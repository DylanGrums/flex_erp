import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuSeparatorDirective,
  FlexDropdownMenuTriggerDirective,
} from '../../primitives/dropdown-menu/dropdown-menu.directive';

import { DataTableIconButtonComponent } from '../primitives/data-table-icon-button.component';
import {
  DataTableAction,
  DataTableActionColumnDefMeta,
  DataTableCellContext,
  DataTableRowData,
} from '../types';

@Component({
  selector: 'flex-data-table-action-cell',
  standalone: true,
  imports: [
    CommonModule,
    DataTableIconButtonComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexDropdownMenuSeparatorDirective,
  ],
  template: `
    @if (hasActions) {
      <button
        flexDataTableIconButton
        size="small"
        variant="transparent"
        [flexDropdownMenuTrigger]="menu"
        class="mx-auto"
      >
        <i class="pi pi-ellipsis-h text-sm"></i>
      </button>

      <ng-template #menu>
        <div flexDropdownMenuContent class="min-w-[180px] rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow">
          @for (actionOrGroup of resolvedActions; track $index) {
            @if (isGroup(actionOrGroup)) {
              @for (action of actionOrGroup; track action.label) {
                <button
                  type="button"
                  flexDropdownMenuItem
                  class="[&>i]:text-ui-fg-subtle flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-ui-bg-subtle-hover"
                  (click)="onActionClick($event, action)"
                >
                  @if (action.icon) {
                    <ng-container *ngTemplateOutlet="iconTemplate; context: { $implicit: action.icon }"></ng-container>
                  }
                  <span>{{ action.label }}</span>
                </button>
              }
              @if (!isLastGroup($index)) {
                <div flexDropdownMenuSeparator class="my-1 h-px bg-ui-border-base"></div>
              }
            } @else {
              <button
                type="button"
                flexDropdownMenuItem
                class="[&>i]:text-ui-fg-subtle flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-ui-bg-subtle-hover"
                (click)="onActionClick($event, actionOrGroup)"
              >
                @if (actionOrGroup.icon) {
                  <ng-container *ngTemplateOutlet="iconTemplate; context: { $implicit: actionOrGroup.icon }"></ng-container>
                }
                <span>{{ actionOrGroup.label }}</span>
              </button>
            }
          }
        </div>
      </ng-template>

      <ng-template #iconTemplate let-icon>
        @if (isStringIcon(icon)) {
          <i [class]="icon"></i>
        } @else {
          <ng-container *ngTemplateOutlet="icon"></ng-container>
        }
      </ng-template>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableActionCellComponent<TData extends DataTableRowData> {
  @Input({ required: true }) ctx!: DataTableCellContext<TData, unknown>;

  get hasActions(): boolean {
    return this.resolvedActions.length > 0;
  }

  get resolvedActions(): Array<DataTableAction<TData> | DataTableAction<TData>[]> {
    const meta = this.ctx.column.columnDef.meta as DataTableActionColumnDefMeta<TData> | undefined;
    const actions = meta?.___actions;
    if (!actions) {
      return [];
    }

    const resolved = typeof actions === 'function' ? actions(this.ctx) : actions;
    return Array.isArray(resolved) ? resolved : [];
  }

  isGroup(
    item: DataTableAction<TData> | DataTableAction<TData>[]
  ): item is DataTableAction<TData>[] {
    return Array.isArray(item);
  }

  isLastGroup(index: number): boolean {
    return index === this.resolvedActions.length - 1;
  }

  isStringIcon(icon: string | unknown): icon is string {
    return typeof icon === 'string';
  }

  onActionClick(event: MouseEvent, action: DataTableAction<TData>): void {
    event.preventDefault();
    event.stopPropagation();
    action.onClick(this.ctx);
  }
}
