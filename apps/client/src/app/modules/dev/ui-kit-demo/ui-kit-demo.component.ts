import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AdminPaginationChange,
  AdminSelectOption,
  AdminTableAction,
  AdminTableColumn,
  FeAdminPaginationComponent,
  FeAdminTableComponent,
  FeConfirmDialogComponent,
  FeInputComponent,
  FeSelectComponent,
  FeTextareaComponent,
} from '@flex-erp/shared-ui';

interface DemoRow {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'archived';
  price: number;
}

@Component({
  selector: 'app-ui-kit-demo',
  standalone: true,
  imports: [
    FeAdminTableComponent,
    FeAdminPaginationComponent,
    FeConfirmDialogComponent,
    FeInputComponent,
    FeSelectComponent,
    FeTextareaComponent,
  ],
  templateUrl: './ui-kit-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiKitDemoComponent {
  readonly columns: AdminTableColumn<DemoRow>[] = [
    { key: 'id', header: 'ID', sortable: true, width: '110px' },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      cell: (row: { price: number; }) => `$${row.price.toFixed(2)}`,
    },
  ];

  readonly rowActions: AdminTableAction<DemoRow>[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      onClick: (row: DemoRow) => this.editRow(row),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      variant: 'danger',
      onClick: (row: DemoRow) => this.requestDelete(row),
    },
  ];

  readonly statusOptions: AdminSelectOption<DemoRow['status'] | 'all'>[] = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  rows: DemoRow[] = [
    { id: 'row_1001', title: 'Seasonal menu', status: 'active', price: 24 },
    { id: 'row_1002', title: 'Holiday promo', status: 'draft', price: 18 },
    { id: 'row_1003', title: 'Cafe refresh', status: 'active', price: 29 },
    { id: 'row_1004', title: 'Wellness pack', status: 'archived', price: 42 },
    { id: 'row_1005', title: 'New menu trial', status: 'draft', price: 21 },
    { id: 'row_1006', title: 'Midnight delivery', status: 'active', price: 36 },
    { id: 'row_1007', title: 'Special request', status: 'archived', price: 15 },
    { id: 'row_1008', title: 'Morning prep', status: 'active', price: 12 },
    { id: 'row_1009', title: 'Supplier update', status: 'draft', price: 27 },
    { id: 'row_1010', title: 'Quarterly bundle', status: 'active', price: 55 },
  ];

  searchTerm = '';
  statusFilter: DemoRow['status'] | 'all' = 'all';
  notes = '';

  page = 1;
  pageSize = 5;
  loading = false;

  confirmOpen = false;
  pendingDelete: DemoRow | null = null;

  emptyState = {
    title: 'No records yet',
    description: 'Try clearing filters or add a new row to get started.',
  };

  get filteredRows(): DemoRow[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.rows.filter((row) => {
      const matchesStatus = this.statusFilter === 'all' || row.status === this.statusFilter;
      const matchesTerm =
        !term ||
        row.id.toLowerCase().includes(term) ||
        row.title.toLowerCase().includes(term);

      return matchesStatus && matchesTerm;
    });
  }

  get confirmTitle(): string {
    return this.pendingDelete ? `Delete ${this.pendingDelete.title}?` : 'Delete item?';
  }

  get confirmDescription(): string {
    return this.pendingDelete
      ? `This will permanently remove ${this.pendingDelete.title}.`
      : 'This action cannot be undone.';
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.resetPagination();
  }

  onStatusChange(value: DemoRow['status'] | 'all' | null): void {
    this.statusFilter = value ?? 'all';
    this.resetPagination();
  }

  onPaginationChange(change: Event): void {
    // this.page = change.page;
    // this.pageSize = change.pageSize;
    const paginationChange = change as unknown as AdminPaginationChange;
    this.page = paginationChange.page;
    this.pageSize = paginationChange.pageSize;
  }

  requestDelete(row: DemoRow): void {
    this.pendingDelete = row;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (!this.pendingDelete) {
      return;
    }

    this.rows = this.rows.filter((row) => row.id !== this.pendingDelete?.id);
    this.pendingDelete = null;
    this.confirmOpen = false;
    this.ensurePageInRange();
  }

  cancelDelete(): void {
    this.pendingDelete = null;
    this.confirmOpen = false;
  }

  editRow(row: DemoRow): void {
    this.notes = `Editing ${row.title}`;
  }

  private resetPagination(): void {
    this.page = 1;
  }

  private ensurePageInRange(): void {
    const total = this.filteredRows.length;
    const maxPage = Math.max(Math.ceil(total / this.pageSize), 1);
    this.page = Math.min(this.page, maxPage);
  }
}
