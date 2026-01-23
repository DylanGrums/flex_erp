import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input, OnChanges } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { DataTableCommandBarComponent } from './data-table-command-bar.component';
import { DataTablePaginationComponent } from './data-table-pagination.component';
import { DataTableSearchComponent } from './data-table-search.component';
import { DataTableTableComponent } from './data-table-table.component';
import { DataTableToolbarComponent } from './data-table-toolbar.component';
import {
  createStoryTable,
  storyRows,
} from '../storybook/data-table-story-helpers';
import {
  DataTableColumnOrderState,
  DataTableColumnVisibilityState,
  DataTableEmptyStateProps,
  DataTableFilteringState,
  DataTableRowSelectionState,
  DataTableSortingState,
} from '../types';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-data-table',
  standalone: true,
  imports: [
    DataTableComponent,
    DataTableToolbarComponent,
    DataTableSearchComponent,
    DataTableTableComponent,
    DataTablePaginationComponent,
    DataTableCommandBarComponent,
  ],
  template: `
    <flex-data-table [instance]="instance" [className]="className">
      @if (showToolbar) {
        <flex-data-table-toolbar>
          <div class="flex items-center gap-3">
            @if (enableSearch) {
              <flex-data-table-search className="w-64"></flex-data-table-search>
            }
            <button
              type="button"
              class="h-8 rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-xs text-ui-fg-base shadow-borders-base transition-fg hover:bg-ui-bg-base-hover"
            >
              New row
            </button>
          </div>
        </flex-data-table-toolbar>
      }
      <flex-data-table-table [emptyState]="emptyState"></flex-data-table-table>
      @if (enablePagination) {
        <flex-data-table-pagination></flex-data-table-pagination>
      }
      @if (showCommandBar && enableSelection) {
        <flex-data-table-command-bar
          [selectedLabel]="selectedLabel"
        ></flex-data-table-command-bar>
      }
    </flex-data-table>
  `,
})
class StoryDataTableComponent implements OnChanges {
  @Input() className = '';
  @Input() enableSelection = true;
  @Input() enableSorting = true;
  @Input() enableFiltering = true;
  @Input() enableSearch = true;
  @Input() enablePagination = true;
  @Input() enableColumnVisibility = true;
  @Input() enableColumnOrder = true;
  @Input() dataState: 'populated' | 'empty' | 'filtered-empty' = 'populated';
  @Input() isLoading = false;
  @Input() pageSize = 5;
  @Input() rowCount?: number;
  @Input() initialSearch?: string;
  @Input() initialFiltering?: DataTableFilteringState;
  @Input() initialSorting?: DataTableSortingState | null;
  @Input() initialRowSelection?: DataTableRowSelectionState;
  @Input() initialColumnVisibility?: DataTableColumnVisibilityState;
  @Input() initialColumnOrder?: DataTableColumnOrderState;
  @Input() showToolbar = true;
  @Input() showCommandBar = true;

  instance = createStoryTable().instance;
  readonly selectedLabel = (count: number) => `${count} selected`;
  readonly emptyState: DataTableEmptyStateProps = {
    empty: {
      heading: 'No rows yet',
      description: 'Try adding your first entry.',
    },
    filtered: {
      heading: 'No matches',
      description: 'Adjust filters or search terms.',
    },
  };

  ngOnChanges(): void {
    const isFilteredEmpty = this.dataState === 'filtered-empty';
    const data = this.dataState === 'populated' ? storyRows : [];

    this.instance = createStoryTable({
      data,
      pageSize: this.pageSize,
      rowCount: this.rowCount,
      isLoading: this.isLoading,
      initialSearch:
        this.initialSearch ?? (isFilteredEmpty ? 'Ada' : undefined),
      initialFiltering:
        this.initialFiltering ??
        (isFilteredEmpty ? { status: 'Active' } : undefined),
      initialSorting: this.initialSorting ?? null,
      initialRowSelection: this.initialRowSelection,
      initialColumnVisibility: this.initialColumnVisibility,
      initialColumnOrder: this.initialColumnOrder,
      enableSelection: this.enableSelection,
      enableSorting: this.enableSorting,
      enableFiltering: this.enableFiltering,
      enableSearch: this.enableSearch,
      enablePagination: this.enablePagination,
      enableColumnVisibility: this.enableColumnVisibility,
      enableColumnOrder: this.enableColumnOrder,
    }).instance;
  }
}

type DataTableArgs = {
  className: string;
  enableSelection: boolean;
  enableSorting: boolean;
  enableFiltering: boolean;
  enableSearch: boolean;
  enablePagination: boolean;
  enableColumnVisibility: boolean;
  enableColumnOrder: boolean;
  dataState: 'populated' | 'empty' | 'filtered-empty';
  isLoading: boolean;
  pageSize: number;
  rowCount?: number;
  initialSearch?: string;
  initialFiltering?: DataTableFilteringState;
  initialSorting?: DataTableSortingState | null;
  initialRowSelection?: DataTableRowSelectionState;
  initialColumnVisibility?: DataTableColumnVisibilityState;
  initialColumnOrder?: DataTableColumnOrderState;
  showToolbar: boolean;
  showCommandBar: boolean;
};

const meta = {
  component: StoryDataTableComponent,
  title: 'DataTableComponent',
  argTypes: {
    dataState: {
      control: { type: 'select' },
      options: ['populated', 'empty', 'filtered-empty'],
    },
  },
} satisfies Meta<DataTableArgs>;
export default meta;

type Story = StoryObj<DataTableArgs>;

export const Complete: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: true,
    pageSize: 5,
    rowCount: 48,
    showToolbar: true,
    showCommandBar: true,
    initialRowSelection: { '1': true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const searchInput = canvas.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Ada');
    await expect((searchInput as HTMLInputElement).value).toBe('Ada');

    const sortButton = canvas.getByRole('button', { name: /name/i });
    await user.click(sortButton);
    const sortIcon = sortButton.querySelector('svg');
    await expect(Boolean(sortIcon?.classList.contains('opacity-100'))).toBe(
      true,
    );

    const checkboxes = canvasElement.querySelectorAll('button[flexcheckbox]');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1] as HTMLElement);
      await expect(canvas.getByText('Archive')).toBeTruthy();
    }

    const nextButton = canvas.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    await expect(canvas.getByText(/Page 2 of/i)).toBeTruthy();
  },
};

export const Compact: Story = {
  args: {
    className: 'min-h-[320px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoSelection: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: false,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoSorting: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: false,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoFiltering: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: false,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoSearch: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: false,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoPagination: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: false,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoColumnVisibility: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: false,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const NoColumnOrder: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: false,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const EmptyState: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'empty',
    isLoading: false,
    pageSize: 5,
    rowCount: 0,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const FilteredEmptyState: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'filtered-empty',
    isLoading: false,
    pageSize: 5,
    rowCount: 0,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const LoadingSkeleton: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'empty',
    isLoading: true,
    pageSize: 5,
    rowCount: 0,
    showToolbar: true,
    showCommandBar: true,
  },
};

export const PreselectedRows: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
    initialRowSelection: { '1': true, '2': true },
  },
};

export const HiddenColumns: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
    initialColumnVisibility: { email: false, role: false },
  },
};

export const CustomColumnOrder: Story = {
  args: {
    className: 'min-h-[420px]',
    enableSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableColumnOrder: true,
    dataState: 'populated',
    isLoading: false,
    pageSize: 5,
    rowCount: 12,
    showToolbar: true,
    showCommandBar: true,
    initialColumnOrder: [
      'select',
      'status',
      'name',
      'email',
      'role',
      'amount',
      'action',
    ],
  },
};
