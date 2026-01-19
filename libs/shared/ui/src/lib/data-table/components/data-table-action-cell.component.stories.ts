import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableActionCellComponent } from './data-table-action-cell.component';
import { expect, within } from 'storybook/test';

const meta: Meta<DataTableActionCellComponent<any>> = {
  component: DataTableActionCellComponent,
  title: 'DataTableActionCellComponent',
};
export default meta;

type Story = StoryObj<DataTableActionCellComponent<any>>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/data-table-action-cell/gi)).toBeTruthy();
  },
};
