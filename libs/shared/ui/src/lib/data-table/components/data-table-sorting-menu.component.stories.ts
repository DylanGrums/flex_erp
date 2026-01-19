import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSortingMenuComponent } from './data-table-sorting-menu.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableSortingMenuComponent> = {
  component: DataTableSortingMenuComponent,
  title: 'DataTableSortingMenuComponent',
};
export default meta;

type Story = StoryObj<DataTableSortingMenuComponent>;

export const Primary: Story = {
  args: {
    tooltip: '',
  },
};

export const Heading: Story = {
  args: {
    tooltip: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-sorting-menu/gi)).toBeTruthy();
  },
};
