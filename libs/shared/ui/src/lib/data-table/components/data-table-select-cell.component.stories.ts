import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSelectCellComponent } from './data-table-select-cell.component';
import { expect, within } from 'storybook/test';

const meta: Meta<DataTableSelectCellComponent<any>> = {
  component: DataTableSelectCellComponent,
  title: 'DataTableSelectCellComponent',
};
export default meta;

type Story = StoryObj<DataTableSelectCellComponent<any>>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/data-table-select-cell/gi)).toBeTruthy();
  },
};
