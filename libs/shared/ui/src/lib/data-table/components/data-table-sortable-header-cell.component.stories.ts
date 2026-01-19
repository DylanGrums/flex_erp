import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSortableHeaderCellComponent } from './data-table-sortable-header-cell.component';
import { expect, within } from 'storybook/test';

const meta: Meta<DataTableSortableHeaderCellComponent> = {
  component: DataTableSortableHeaderCellComponent,
  title: 'DataTableSortableHeaderCellComponent',
};
export default meta;

type Story = StoryObj<DataTableSortableHeaderCellComponent>;

export const Primary: Story = {
  args: {
    id: 'test-header',
    className: '',
    style: null,
    isFirstColumn: false,
  },
};

export const Heading: Story = {
  args: {
    id: 'test-header-heading',
    className: 'font-bold',
    style: null,
    isFirstColumn: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/data-table-sortable-header-cell/gi),
    ).toBeTruthy();
  },
};
