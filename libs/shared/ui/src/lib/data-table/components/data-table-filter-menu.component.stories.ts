import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableFilterMenuComponent } from './data-table-filter-menu.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableFilterMenuComponent> = {
  component: DataTableFilterMenuComponent,
  title: 'DataTableFilterMenuComponent',
};
export default meta;

type Story = StoryObj<DataTableFilterMenuComponent>;

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
    await expect(canvas.getByText(/data-table-filter-menu/gi)).toBeTruthy();
  },
};
