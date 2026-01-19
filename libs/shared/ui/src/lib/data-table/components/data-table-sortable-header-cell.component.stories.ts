import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSortableHeaderCellComponent } from './data-table-sortable-header-cell.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableSortableHeaderCellComponent> = {
  component: DataTableSortableHeaderCellComponent,
  title: 'DataTableSortableHeaderCellComponent',
};
export default meta;

type Story = StoryObj<DataTableSortableHeaderCellComponent>;

export const Primary: Story = {
  args: {
    id: '',
    className: '',
    style: null,
    isFirstColumn: false,
    id: '',
    className: '',
    style: null,
  },
};

export const Heading: Story = {
  args: {
    id: '',
    className: '',
    style: null,
    isFirstColumn: false,
    id: '',
    className: '',
    style: null,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/data-table-sortable-header-cell/gi),
    ).toBeTruthy();
  },
};
