import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Pencil, Plus } from 'lucide-angular';
import { ProductDetail, ProductOption, ProductVariantDetail } from '@flex-erp/store/util';
import {
  DataTableColumnDef,
  DataTableEmptyStateProps,
  DataTableRowData,
  DataTableTableComponent,
  DataTableComponent,
  createDataTable,
  createDataTableColumnHelper,
} from '@flex-erp/shared/ui';

import { IconPlaceholderCellComponent } from '../variants/icon-placeholder-cell.component';
import { VariantOptionValueCellComponent } from '../variants/variant-option-value-cell.component';

type VariantRow = DataTableRowData & {
  id: string;
  title: string;
  sku: string | null;
  inventoryQuantity: number | null;
  variant: ProductVariantDetail;
};

const columnHelper = createDataTableColumnHelper<VariantRow>();

const sortOptions = (options: ProductOption[]) =>
  [...options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

@Component({
  selector: 'fe-product-variants-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    DataTableComponent,
    DataTableTableComponent,
  ],
  template: `
    <div class="medusa-panel divide-y p-0">
      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <h2 class="font-sans font-medium h2-core text-ui-fg-base">Variants</h2>
        </div>
        <a
          class="inline-flex items-center gap-2 rounded-md border border-ui-border-base px-3 py-2 text-ui-fg-base txt-compact-small-plus transition-fg hover:bg-ui-bg-subtle-hover"
          [routerLink]="['variants', 'create']"
        >
          <i-lucide [img]="Plus" class="h-3 w-3"></i-lucide>
          Create variant
        </a>
      </div>

      <flex-data-table [instance]="table">
        <flex-data-table-table
          density="compact"
          [emptyState]="emptyState"
        ></flex-data-table-table>
      </flex-data-table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariantsSectionComponent {
  readonly Plus = Plus;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly productSignal = signal<ProductDetail | null>(null);

  @Input({ required: true })
  set product(value: ProductDetail) {
    this.productSignal.set(value);
  }

  readonly options = computed(() =>
    sortOptions(this.productSignal()?.options ?? []),
  );

  readonly rows = computed<VariantRow[]>(() => {
    const product = this.productSignal();
    if (!product) {
      return [];
    }

    return (product.variants ?? []).map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku ?? null,
      inventoryQuantity: variant.inventoryQuantity ?? 0,
      variant,
    }));
  });

  readonly columns = computed<DataTableColumnDef<VariantRow, unknown>[]>(() => {
    const optionColumns = this.options().map((option) =>
      columnHelper.display({
        id: `option_${option.id}`,
        header: option.name,
        cell: ({ row }) => ({
          component: VariantOptionValueCellComponent,
          inputs: {
            value: this.getOptionValue(row.original.variant, option),
          },
        }),
      }),
    );

    return [
      columnHelper.display({
        id: 'icon',
        header: '',
        meta: {
          ___alignMetaData: { headerAlign: 'center' },
        },
        size: 48,
        minSize: 48,
        maxSize: 48,
        cell: () => ({
          component: IconPlaceholderCellComponent,
        }),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        enableSorting: false,
        cell: ({ row }) => row.original.title,
      }),
      columnHelper.accessor('sku', {
        header: 'SKU',
        enableSorting: false,
        cell: ({ row }) => row.original.sku ?? '-',
      }),
      ...optionColumns,
      columnHelper.accessor('inventoryQuantity', {
        header: 'Inventory',
        enableSorting: false,
        cell: ({ row }) => row.original.inventoryQuantity ?? 0,
      }),
      columnHelper.action({
        actions: (ctx) => [
          [
            {
              label: 'Edit',
              icon: Pencil,
              onClick: () => this.openVariantEdit(ctx.row.original.id),
            },
          ],
        ],
      }),
    ];
  });

  readonly emptyState: DataTableEmptyStateProps = {
    empty: {
      heading: 'No variants',
      description: 'Create variants to offer sizes, colors, or SKUs.',
    },
    filtered: {
      heading: 'No results',
      description: 'Adjust your filters to see variants.',
    },
  };

  readonly table = createDataTable<VariantRow>({
    data: this.rows,
    columns: this.columns,
    getRowId: (row) => row.id,
    onRowClick: (_event, row) => this.openVariantEdit(row.id),
  });

  private getOptionValue(variant: ProductVariantDetail, option: ProductOption): string | null {
    const match = variant.optionValues?.find((value) => value.optionId === option.id);
    return match?.value ?? null;
  }

  private openVariantEdit(variantId: string) {
    this.router.navigate(['variants', variantId, 'edit'], { relativeTo: this.route });
  }
}
