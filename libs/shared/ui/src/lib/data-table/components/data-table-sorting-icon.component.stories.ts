import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSortingIconComponent } from './data-table-sorting-icon.component';
import { DataTableSortDirection } from '../types';
import { expect } from '@storybook/jest';

type SortingIconArgs = {
  direction: DataTableSortDirection | false;
};

const meta = {
  component: DataTableSortingIconComponent,
  title: 'DataTableSortingIconComponent',
} satisfies Meta<SortingIconArgs>;
export default meta;

type Story = StoryObj<SortingIconArgs>;

export const Primary: Story = {
  args: {
    direction: false,
  },
};

export const Ascending: Story = {
  args: {
    direction: 'asc',
  },
};

export const Descending: Story = {
  args: {
    direction: 'desc',
  },
};

export const RenderCheck: Story = {
  args: {
    direction: 'asc',
  },
  play: async ({ canvasElement }) => {
    await expect(Boolean(canvasElement.querySelector('svg'))).toBe(true);
  },
};
