import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableActionCellComponent } from './data-table-action-cell.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableActionCellComponent> = {
  component: DataTableActionCellComponent,
  title: 'DataTableActionCellComponent',
};
export default meta;

type Story = StoryObj<DataTableActionCellComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-action-cell/gi)).toBeTruthy();
  },
};
