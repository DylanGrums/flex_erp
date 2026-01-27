import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { injectDataTableContext } from '../data-table-context';
import { DataTableInstance } from '../create-data-table';
import {
  DataTableColumn,
  DataTableEmptyState,
  DataTableEmptyStateContent,
  DataTableEmptyStateProps,
  DataTableHeader,
  DataTableHeaderAlignment,
  DataTableHeaderGroup,
  DataTableRow,
  DataTableRowData,
} from '../types';
import { DataTableSortingIconComponent } from './data-table-sorting-icon.component';
import {
  DataTableSortableHeaderCellComponent,
  DataTableNonSortableHeaderCellComponent,
} from './data-table-sortable-header-cell.component';
import { DataTableSkeletonComponent } from '../primitives/data-table-skeleton.component';
import { DataTableRenderOutletComponent } from './data-table-render-outlet.component';

type DataTableDensity = 'default' | 'compact';

@Component({
  selector: 'flex-data-table-table',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    DataTableSortingIconComponent,
    DataTableSortableHeaderCellComponent,
    DataTableNonSortableHeaderCellComponent,
    DataTableSkeletonComponent,
    DataTableRenderOutletComponent,
  ],
  template: `
    <div class="flex w-full flex-1 flex-col overflow-hidden">
      @if (instance.showSkeleton) {
        <div class="flex w-full flex-1 flex-col overflow-hidden">
          <div class="min-h-0 w-full flex-1 overscroll-none border-y border-ui-border-base">
            <div class="flex flex-col divide-y">
              <flex-data-table-skeleton [className]="skeletonRowClass"></flex-data-table-skeleton>
              @for (row of skeletonRows; track row) {
                <flex-data-table-skeleton [className]="skeletonRowClass"></flex-data-table-skeleton>
              }
            </div>
          </div>
        </div>
      } @else {
        @if (instance.emptyState === emptyStateEnum.POPULATED) {
          @if (instance.enableColumnOrder) {
            <div
              #scrollable
              cdkDropList
              [cdkDropListData]="headerIds"
              cdkDropListOrientation="horizontal"
              (cdkDropListDropped)="onDrop($event)"
              (scroll)="onScroll($event)"
              class="min-h-0 w-full flex-1 overflow-auto overscroll-none border-y border-ui-border-base"
            >
              <table [class]="tableClass">
                <thead
                  class="shadow-ui-border-base sticky inset-x-0 top-0 z-[1] w-full border-b-0 border-t-0 bg-ui-bg-subtle text-xs font-semibold text-ui-fg-muted shadow-[0_1px_1px_0]"
                  style="transform: translate3d(0,0,0)"
                >
                  @for (headerGroup of headerGroups; track headerGroup.id) {
                    <tr
                      class="border-b-0"
                      [ngClass]="headerRowClass"
                    >
                      @for (header of headerGroup.headers; track header.id; let idx = $index) {
                        @if (isDraggableHeader(header)) {
                          <flex-data-table-sortable-header-cell
                            [id]="header.id"
                            className="whitespace-nowrap align-middle"
                            [ngClass]="getHeaderCellClassName(header, idx)"
                            [ngStyle]="getHeaderCellStyle(header)"
                            [isFirstColumn]="isFirstColumn(idx)"
                          >
                            <ng-container *ngTemplateOutlet="headerContent; context: { $implicit: header }"></ng-container>
                          </flex-data-table-sortable-header-cell>
                        } @else {
                          <flex-data-table-non-sortable-header-cell
                            [id]="header.id"
                            className="whitespace-nowrap align-middle"
                            [ngClass]="getHeaderCellClassName(header, idx)"
                            [ngStyle]="getHeaderCellStyle(header)"
                          >
                            <ng-container *ngTemplateOutlet="headerContent; context: { $implicit: header }"></ng-container>
                          </flex-data-table-non-sortable-header-cell>
                        }
                      }
                    </tr>
                  }
                </thead>
                <tbody class="border-b-0 border-t-0 bg-ui-bg-base">
                  @for (row of rows; track row.id) {
                    <tr
                      (mouseenter)="hoveredRowId = row.id"
                      (mouseleave)="hoveredRowId = null"
                      (click)="onRowClick($event, row)"
                      class="group/row border-b border-ui-border-base bg-ui-bg-base transition-colors hover:bg-ui-bg-base-hover last-of-type:border-b-0"
                      [class.cursor-pointer]="!!instance.onRowClick"
                    >
                      @for (cell of row.getVisibleCells(); track cell.id; let idx = $index) {
                        <td
                          class="items-stretch truncate whitespace-nowrap align-middle text-ui-fg-base"
                          [ngClass]="getCellClassName(cell.column, idx)"
                          [ngStyle]="getCellStyle(cell.column)"
                        >
                          <flex-data-table-render-outlet
                            [render]="cell.column.columnDef.cell"
                            [context]="cell.getContext()"
                          ></flex-data-table-render-outlet>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div
              #scrollable
              (scroll)="onScroll($event)"
              class="min-h-0 w-full flex-1 overflow-auto overscroll-none border-y border-ui-border-base"
            >
              <table [class]="tableClass">
                <thead
                  class="shadow-ui-border-base sticky inset-x-0 top-0 z-[1] w-full border-b-0 border-t-0 bg-ui-bg-subtle text-xs font-semibold text-ui-fg-muted shadow-[0_1px_1px_0]"
                  style="transform: translate3d(0,0,0)"
                >
                  @for (headerGroup of headerGroups; track headerGroup.id) {
                    <tr
                      class="border-b-0"
                      [ngClass]="headerRowClass"
                    >
                      @for (header of headerGroup.headers; track header.id; let idx = $index) {
                        <th
                          class="whitespace-nowrap align-middle"
                          [ngClass]="getHeaderCellClassName(header, idx)"
                          [ngStyle]="getHeaderCellStyle(header)"
                        >
                          <ng-container *ngTemplateOutlet="headerContent; context: { $implicit: header }"></ng-container>
                        </th>
                      }
                    </tr>
                  }
                </thead>
                <tbody class="border-b-0 border-t-0 bg-ui-bg-base">
                  @for (row of rows; track row.id) {
                    <tr
                      (mouseenter)="hoveredRowId = row.id"
                      (mouseleave)="hoveredRowId = null"
                      (click)="onRowClick($event, row)"
                      class="group/row border-b border-ui-border-base bg-ui-bg-base transition-colors hover:bg-ui-bg-base-hover last-of-type:border-b-0"
                      [class.cursor-pointer]="!!instance.onRowClick"
                    >
                      @for (cell of row.getVisibleCells(); track cell.id; let idx = $index) {
                        <td
                          class="items-stretch truncate whitespace-nowrap align-middle text-ui-fg-base"
                          [ngClass]="getCellClassName(cell.column, idx)"
                          [ngStyle]="getCellStyle(cell.column)"
                        >
                          <flex-data-table-render-outlet
                            [render]="cell.column.columnDef.cell"
                            [context]="cell.getContext()"
                          ></flex-data-table-render-outlet>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <ng-template #headerContent let-header>
          <ng-container *ngIf="header.column.getCanSort(); else nonSortable">
            <button
              type="button"
              (click)="header.column.getToggleSortingHandler()?.()"
              (mousedown)="$event.stopPropagation()"
              class="group flex cursor-default items-center gap-2"
              [ngClass]="getHeaderButtonClasses(header)"
            >
              @if (isRightAligned(header)) {
                <flex-data-table-sorting-icon
                  [direction]="header.column.getIsSorted()"
                ></flex-data-table-sorting-icon>
              }
              <flex-data-table-render-outlet
                [render]="header.column.columnDef.header"
                [context]="header.getContext()"
              ></flex-data-table-render-outlet>
              @if (!isRightAligned(header)) {
                <flex-data-table-sorting-icon
                  [direction]="header.column.getIsSorted()"
                ></flex-data-table-sorting-icon>
              }
            </button>
          </ng-container>
          <ng-template #nonSortable>
            <div
              class="group flex cursor-default items-center gap-2"
              [ngClass]="getHeaderButtonClasses(header)"
            >
              <flex-data-table-render-outlet
                [render]="header.column.columnDef.header"
                [context]="header.getContext()"
              ></flex-data-table-render-outlet>
            </div>
          </ng-template>
        </ng-template>

        @if (instance.emptyState !== emptyStateEnum.POPULATED) {
          <div
            class="flex min-h-[260px] w-full flex-1 flex-col items-center justify-center gap-2 border-y border-ui-border-base bg-ui-bg-subtle px-6 py-6 text-center"
          >
            @if (emptyStateContent?.custom) {
              <flex-data-table-render-outlet
                [render]="emptyStateContent?.custom"
                [context]="{}"
              ></flex-data-table-render-outlet>
            } @else {
              <div class="flex size-full max-w-sm flex-col items-center justify-center gap-1">
                <div class="text-base font-semibold text-ui-fg-base">
                  {{ emptyStateContent?.heading }}
                </div>
                <div class="text-sm text-ui-fg-muted">
                  {{ emptyStateContent?.description }}
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableTableComponent<TData extends DataTableRowData> implements AfterViewInit {
  @Input() emptyState?: DataTableEmptyStateProps;
  @Input() density: DataTableDensity = 'default';

  @ViewChild('scrollable') private scrollableRef?: ElementRef<HTMLDivElement>;

  readonly context = injectDataTableContext<TData>();
  readonly emptyStateEnum = DataTableEmptyState;

  get instance(): DataTableInstance<TData> {
    return this.context.instance;
  }

  private readonly viewReady = signal(false);

  hoveredRowId: string | null = null;
  private isKeyDown = false;
  private readonly showStickyBorder = signal(false);
  private readonly pageIndexEffect = effect(() => {
    const _ = this.instance.pageIndex;
    if (!this.viewReady()) {
      return;
    }

    const element = this.scrollableRef?.nativeElement;
    if (element) {
      element.scroll({ top: 0, left: 0 });
    }
  });

  get headerGroups(): DataTableHeaderGroup<TData>[] {
    return this.instance.getHeaderGroups();
  }

  get rows(): DataTableRow<TData>[] {
    return this.instance.getRowModel().rows;
  }

  get headerIds(): string[] {
    const group = this.headerGroups[0];
    return group ? group.headers.map((header) => header.id) : [];
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.instance.pageSize }, (_, i) => i);
  }

  get isCompact(): boolean {
    return this.density === 'compact';
  }

  get headerPaddingClass(): string {
    return this.isCompact ? 'px-2 py-1' : 'px-3 py-2';
  }

  get cellPaddingClass(): string {
    return this.isCompact ? 'px-2 py-1.5' : 'px-3 py-2';
  }

  get cellTextClass(): string {
    return this.isCompact ? 'text-xs' : 'text-sm';
  }

  get tableClass(): string {
    return this.isCompact
      ? 'relative isolate w-full text-xs text-ui-fg-base'
      : 'relative isolate w-full text-sm text-ui-fg-base';
  }

  get skeletonRowClass(): string {
    return this.isCompact ? 'h-9 w-full rounded-none' : 'h-10 w-full rounded-none';
  }

  get headerRowClass(): string {
    return '';
  }

  get hasSelect(): boolean {
    return this.instance.getAllColumns().some((column) => column.id === 'select');
  }

  get hasActions(): boolean {
    return this.instance.getAllColumns().some((column) => column.id === 'action');
  }

  get emptyStateContent(): DataTableEmptyStateContent | undefined {
    if (this.instance.emptyState === DataTableEmptyState.EMPTY) {
      return this.emptyState?.empty;
    }

    return this.emptyState?.filtered;
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.showStickyBorder.set(target.scrollLeft > 0);
  }

  onRowClick(event: MouseEvent, row: DataTableRow<TData>): void {
    this.instance.onRowClick?.(event, row.original);
  }

  onDrop(event: CdkDragDrop<string[]>): void {
    if (!this.instance.enableColumnOrder) {
      return;
    }

    const activeId = event.item.data as string;
    const overId = event.container.data[event.currentIndex];

    if (!activeId || !overId || activeId === overId) {
      return;
    }

    if (this.isSpecialColumnId(activeId) || this.isSpecialColumnId(overId)) {
      return;
    }

    const columns = this.instance.getAllColumns();
    const currentOrder = this.instance.columnOrder.length
      ? [...this.instance.columnOrder]
      : columns.map((column) => column.id);

    const oldIndex = currentOrder.indexOf(activeId);
    const newIndex = currentOrder.indexOf(overId);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    moveItemInArray(currentOrder, oldIndex, newIndex);
    this.instance.setColumnOrderFromArray(currentOrder);
  }

  isFirstColumn(index: number): boolean {
    return this.hasSelect ? index === 1 : index === 0;
  }

  isSpecialColumnId(id: string): boolean {
    return id === 'select' || id === 'action';
  }

  isDraggableHeader(header: DataTableHeader<TData>): boolean {
    return !this.isSpecialColumnId(header.id);
  }

  getHeaderCellClasses(header: DataTableHeader<TData>, index: number): Record<string, boolean> {
    const isActionHeader = header.id === 'action';
    const isSelectHeader = header.id === 'select';
    const isFirstColumn = this.isFirstColumn(index);
    const align = this.getHeaderAlign(header);

    return {
      'w-[18px] min-w-[18px] max-w-[18px]': isSelectHeader,
      'w-[28px] min-w-[28px] max-w-[28px]': isActionHeader,
      'px-2 text-center': isSelectHeader || isActionHeader,
      "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']":
        isFirstColumn,
      'after:bg-ui-border-base': this.showStickyBorder() && isFirstColumn,
      'bg-ui-bg-subtle sticky z-20': isFirstColumn || isSelectHeader,
      relative: isFirstColumn || isSelectHeader,
      'left-0': isSelectHeader || (isFirstColumn && !this.hasSelect),
      'left-[34px]': isFirstColumn && this.hasSelect,
      'text-right': align === 'right' && !isActionHeader,
      'text-center': align === 'center',
    };
  }

  getHeaderCellStyle(header: DataTableHeader<TData>): Record<string, string | number> | null {
    if (this.isSpecialColumnId(header.id)) {
      return null;
    }

    const def = header.column.columnDef;
    const style: Record<string, string | number> = {};

    if (def.size) {
      style['width'] = def.size;
    }

    if (def.maxSize) {
      style['maxWidth'] = def.maxSize;
    }

    if (def.minSize) {
      style['minWidth'] = def.minSize;
    }

    return style;
  }

  getCellClasses(column: DataTableColumn<TData>, index: number): Record<string, boolean> {
    const isSelectCell = column.id === 'select';
    const isActionCell = column.id === 'action';
    const isFirstColumn = this.isFirstColumn(index);
    const align = this.getCellAlign(column);

    return {
      'w-[18px] min-w-[18px] max-w-[18px]': isSelectCell,
      'w-[28px] min-w-[28px] max-w-[28px]': isActionCell,
      'px-2 text-center': isSelectCell || isActionCell,
      'bg-ui-bg-base group-hover/row:bg-ui-bg-base-hover transition-fg sticky h-full z-10 relative':
        isFirstColumn || isSelectCell,
      "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']":
        isFirstColumn,
      'after:bg-ui-border-base': this.showStickyBorder() && isFirstColumn,
      'left-0': isSelectCell || (isFirstColumn && !this.hasSelect),
      'left-[34px]': isFirstColumn && this.hasSelect,
      'text-right': align === 'right' && !isActionCell,
      'text-center': align === 'center',
    };
  }

  getHeaderCellClassName(header: DataTableHeader<TData>, index: number): string {
    return this.joinClassTokens(this.headerPaddingClass, this.getHeaderCellClasses(header, index));
  }

  getCellClassName(column: DataTableColumn<TData>, index: number): string {
    return this.joinClassTokens(
      this.cellPaddingClass,
      this.cellTextClass,
      this.getCellClasses(column, index)
    );
  }

  getCellStyle(column: DataTableColumn<TData>): Record<string, string | number> | null {
    if (this.isSpecialColumnId(column.id)) {
      return null;
    }

    const def = column.columnDef;
    const style: Record<string, string | number> = {};

    if (def.size) {
      style['width'] = def.size;
    }

    if (def.maxSize) {
      style['maxWidth'] = def.maxSize;
    }

    if (def.minSize) {
      style['minWidth'] = def.minSize;
    }

    return style;
  }

  getHeaderAlign(header: DataTableHeader<TData>): DataTableHeaderAlignment {
    const meta = header.column.columnDef.meta as { ___alignMetaData?: { headerAlign?: DataTableHeaderAlignment } } | undefined;
    return meta?.___alignMetaData?.headerAlign ?? 'left';
  }

  getCellAlign(column: DataTableColumn<TData>): DataTableHeaderAlignment {
    const meta = column.columnDef.meta as { ___alignMetaData?: { headerAlign?: DataTableHeaderAlignment } } | undefined;
    return meta?.___alignMetaData?.headerAlign ?? 'left';
  }

  isRightAligned(header: DataTableHeader<TData>): boolean {
    return this.getHeaderAlign(header) === 'right';
  }

  isCenterAligned(header: DataTableHeader<TData>): boolean {
    return this.getHeaderAlign(header) === 'center';
  }

  getHeaderButtonClasses(header: DataTableHeader<TData>): Record<string, boolean> {
    return {
      'cursor-pointer': header.column.getCanSort(),
      'w-full': this.isRightAligned(header) || this.isCenterAligned(header),
      'w-fit': !this.isRightAligned(header) && !this.isCenterAligned(header),
      'justify-end': this.isRightAligned(header),
      'justify-center': this.isCenterAligned(header),
    };
  }

  private joinClassTokens(
    ...tokens: Array<string | Record<string, boolean> | null | undefined | false>
  ): string {
    const classes: string[] = [];
    for (const token of tokens) {
      if (!token) {
        continue;
      }
      if (typeof token === 'string') {
        if (token.trim()) {
          classes.push(token);
        }
      } else {
        for (const [name, enabled] of Object.entries(token)) {
          if (enabled) {
            classes.push(name);
          }
        }
      }
    }
    return classes.join(' ');
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() !== 'x') {
      return;
    }

    if (this.isKeyDown || this.getIsEditableElementFocused()) {
      return;
    }

    this.isKeyDown = true;

    const hoveredId = this.hoveredRowId;
    if (!hoveredId) {
      return;
    }

    const row = this.rows.find((candidate) => candidate.id === hoveredId);
    if (row && row.getCanSelect()) {
      row.toggleSelected();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'x') {
      this.isKeyDown = false;
    }
  }

  private getIsEditableElementFocused(): boolean {
    const activeElement = document.activeElement as HTMLElement | null;
    return Boolean(
      activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true'
    );
  }
}
