import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSelectCellComponent } from './data-table-select-cell.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableSelectCellComponent> = {
  component: DataTableSelectCellComponent,
  title: 'DataTableSelectCellComponent',
};
export default meta;

type Story = StoryObj<DataTableSelectCellComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-select-cell/gi)).toBeTruthy();
  },
};
