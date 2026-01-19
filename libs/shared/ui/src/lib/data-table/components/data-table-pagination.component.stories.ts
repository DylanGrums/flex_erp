import type { Meta, StoryObj } from '@storybook/angular';
import { DataTablePaginationComponent } from './data-table-pagination.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTablePaginationComponent> = {
  component: DataTablePaginationComponent,
  title: 'DataTablePaginationComponent',
};
export default meta;

type Story = StoryObj<DataTablePaginationComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-pagination/gi)).toBeTruthy();
  },
};
