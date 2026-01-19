import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableFilterBarComponent } from './data-table-filter-bar.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableFilterBarComponent> = {
  component: DataTableFilterBarComponent,
  title: 'DataTableFilterBarComponent',
};
export default meta;

type Story = StoryObj<DataTableFilterBarComponent>;

export const Primary: Story = {
  args: {
    clearAllFiltersLabel: 'Clear all',
    alwaysShow: false,
    sortingTooltip: '',
    columnsTooltip: '',
  },
};

export const Heading: Story = {
  args: {
    clearAllFiltersLabel: 'Clear all',
    alwaysShow: false,
    sortingTooltip: '',
    columnsTooltip: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-filter-bar/gi)).toBeTruthy();
  },
};
