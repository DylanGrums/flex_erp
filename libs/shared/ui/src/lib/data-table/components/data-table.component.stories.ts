import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableComponent> = {
  component: DataTableComponent,
  title: 'DataTableComponent',
};
export default meta;

type Story = StoryObj<DataTableComponent>;

export const Primary: Story = {
  args: {
    instance: EMPTY_DATA_TABLE_INSTANCE as DataTableInstance<TData>,
    className: '',
  },
};

export const Heading: Story = {
  args: {
    instance: EMPTY_DATA_TABLE_INSTANCE as DataTableInstance<TData>,
    className: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table/gi)).toBeTruthy();
  },
};
