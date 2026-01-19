import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSortingIconComponent } from './data-table-sorting-icon.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableSortingIconComponent> = {
  component: DataTableSortingIconComponent,
  title: 'DataTableSortingIconComponent',
};
export default meta;

type Story = StoryObj<DataTableSortingIconComponent>;

export const Primary: Story = {
  args: {
    direction: false,
  },
};

export const Heading: Story = {
  args: {
    direction: false,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-sorting-icon/gi)).toBeTruthy();
  },
};
